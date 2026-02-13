import React, { useEffect, useRef, useState } from "react";
import { Mic, Video, VideoOff, PhoneOff, MessageSquare, Volume2, Users } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import api from "@/lib/axios";

interface VoiceStageProps {
  channelId: string;
  clanId: string;
  participants: any[];
  user: any;
  onLeave: () => void;
  signals: any[];
  setSignals: React.Dispatch<React.SetStateAction<any[]>>;
}

export const VoiceStage: React.FC<VoiceStageProps> = ({ 
  channelId, 
  clanId, 
  participants, 
  user, 
  onLeave,
  signals,
  setSignals 
}) => {
  // Media State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // WebRTC State
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const processedSignalTimestamps = useRef<Set<number>>(new Set());
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  
  // Audio Analysis
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analysersRef = useRef<Map<string, AnalyserNode>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const isMutedRef = useRef(isMuted);

  // Sync isMutedRef
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Helper to attach analyser to a stream
  const attachAnalyser = (userId: string, stream: MediaStream) => {
    if (!audioContextRef.current) return;
    if (stream.getAudioTracks().length === 0) return;

    try {
      if (analysersRef.current.has(userId)) return; // Already attached
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analysersRef.current.set(userId, analyser);
    } catch (e) {
      console.error("Audio analysis attach error", e);
    }
  };

  // Initialize Audio Logic
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;

    const checkVolume = () => {
       const speaking = new Set<string>();
       
       analysersRef.current.forEach((analyser, userId) => {
          // Skip local user if muted
          if (userId === user.id && isMutedRef.current) return;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((prev, curr) => prev + curr, 0);
          const avg = sum / dataArray.length;
          
          if (avg > 15) { // Threshold
             speaking.add(userId);
          }
       });

       setSpeakingUsers(prev => {
         // Optimization: Only update if changed
         if (prev.size === speaking.size && [...speaking].every(x => prev.has(x))) return prev;
         return speaking;
       });

       animationFrameRef.current = requestAnimationFrame(checkVolume);
    };
    checkVolume();

    return () => {
       if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
       audioContext.close();
    };
  }, []);


  // Initialize Local Media
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        // Attach local analyser
        if (user?.id) attachAnalyser(user.id, stream);
      } catch (e) {
        console.error("Microphone permission denied", e);
      }
    };
    initMedia();

    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      api.post('/clans/voice/leave').catch(() => {});
    };
  }, [user]); // Re-run if user is set (to use user.id)

  // Sync Remote Streams with Analysers
  useEffect(() => {
     remoteStreams.forEach((stream, userId) => {
        attachAnalyser(userId, stream);
     });
  }, [remoteStreams]);

  // Handle Participants (Mesh Networking)
  useEffect(() => {
    if (!localStream) return;

    participants.forEach(p => {
      if (p.userId === user.id) return;
      
      if (!peersRef.current.has(p.userId)) {
         createPeerConnection(p.userId);
      }
    });

    // Cleanup
    const currentIds = new Set(participants.map(p => p.userId));
    peersRef.current.forEach((pc, userId) => {
      if (!currentIds.has(userId)) {
        pc.close();
        peersRef.current.delete(userId);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
        analysersRef.current.delete(userId); // Cleanup analyser
      }
    });
  }, [participants, localStream]);

  // Handle Signals (Serialized with Perfect Negotiation & Error Recovery)
  useEffect(() => {
    if (!localStream) return;

    const processSignals = async () => {
      for (const signalData of signals) {
         if (processedSignalTimestamps.current.has(signalData.timestamp)) continue;
         if (signalData.fromUserId === user.id) continue;

         processedSignalTimestamps.current.add(signalData.timestamp);
         
         const { fromUserId, signal } = signalData;
         
         const handleSignal = async (retry = false) => {
             let pc = peersRef.current.get(fromUserId);
             const polite = user.id > fromUserId; // Polite if my ID > their ID

             if (!pc) {
               pc = createPeerConnection(fromUserId);
             }

             try {
               if (signal.type === 'offer') {
                   const isStable = pc.signalingState === 'stable' || (pc.signalingState === 'have-local-offer' && polite);
                   
                   if (pc.signalingState !== "stable" && !polite) {
                       console.warn("Ignoring offer from polite peer (glare)");
                       return; 
                   }
                   
                   if (pc.signalingState !== "stable") {
                       await pc.setLocalDescription({ type: "rollback" });
                   }

                   await pc.setRemoteDescription(new RTCSessionDescription(signal));
                   const answer = await pc.createAnswer();
                   await pc.setLocalDescription(answer);
                   sendSignal(fromUserId, answer);
                   
                   const queue = pendingCandidates.current.get(fromUserId) || [];
                   for (const c of queue) {
                       await pc.addIceCandidate(new RTCIceCandidate(c));
                   }
                   pendingCandidates.current.set(fromUserId, []);

               } else if (signal.type === 'answer') {
                  if (pc.signalingState === "have-local-offer") {
                      await pc.setRemoteDescription(new RTCSessionDescription(signal));
                      const queue = pendingCandidates.current.get(fromUserId) || [];
                      for (const c of queue) {
                          await pc.addIceCandidate(new RTCIceCandidate(c));
                      }
                      pendingCandidates.current.set(fromUserId, []);
                  } 
               } else if (signal.candidate) {
                  try {
                      await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                  } catch (e) {
                      if (!pc.remoteDescription) {
                          const queue = pendingCandidates.current.get(fromUserId) || [];
                          queue.push(signal.candidate);
                          pendingCandidates.current.set(fromUserId, queue);
                      }
                  }
               }
             } catch (e) {
               console.error("Signaling error", e, signal);
               // Error Recovery for Offer collisions/mismatches (e.g. restart)
               const errStr = String(e).toLowerCase();
               if (!retry && signal.type === 'offer' && (errStr.includes("m-lines") || errStr.includes("state"))) {
                   console.log("Resetting PC and retrying offer from", fromUserId);
                   pc?.close();
                   peersRef.current.delete(fromUserId);
                   // Retry once
                   await handleSignal(true);
               }
             }
         };
         
         await handleSignal();
      }
    };
    
    processSignals();
  }, [signals, localStream]);

  const createPeerConnection = (targetUserId: string) => {
     const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
     });
     
     peersRef.current.set(targetUserId, pc);

     localStream?.getTracks().forEach(track => {
       pc.addTrack(track, localStream);
     });

     pc.onicecandidate = (event) => {
       if (event.candidate) {
         sendSignal(targetUserId, { candidate: event.candidate });
       }
     };

     pc.ontrack = (event) => {
       setRemoteStreams(prev => {
         const newMap = new Map(prev);
         newMap.set(targetUserId, event.streams[0]);
         return newMap;
       });
     };

     // Allow ALL peers to negotiate to support video toggling updates
     pc.onnegotiationneeded = async () => {
         // Avoid race conditions: Only negotiate if stable
         if (pc.signalingState !== 'stable') return;

         try {
           const offer = await pc.createOffer();
           await pc.setLocalDescription(offer);
           sendSignal(targetUserId, offer);
         } catch(e) { console.error("Negotiation error", e); }
     };

     return pc;
  };

  const sendSignal = async (toUserId: string, signal: any) => {
     try {
       await api.post('/clans/voice/signal', {
         clanId,
         toUserId,
         signal
       });
     } catch (e) { console.error(e); }
  };

  const toggleVideo = async () => {
    let newState = isVideoEnabled;
    if (isVideoEnabled) {
       // Stop video track
       const videoTrack = localStream?.getVideoTracks()[0];
       if (videoTrack) {
         videoTrack.stop();
         localStream?.removeTrack(videoTrack);
         peersRef.current.forEach(pc => {
             const sender = pc.getSenders().find(s => s.track?.kind === 'video');
             if (sender) pc.removeTrack(sender);
         });
       }
       newState = false;
       setIsVideoEnabled(false);
    } else {
       // Start video track
       try {
         const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
         const videoTrack = videoStream.getVideoTracks()[0];
         
         if (localStream) {
           localStream.addTrack(videoTrack);
           peersRef.current.forEach(pc => {
             pc.addTrack(videoTrack, localStream);
           });
         }
         newState = true;
         setIsVideoEnabled(true);
       } catch (e) {
         console.error("Camera error", e);
       }
    }
    
    // Sync to DB
    try {
      await api.post('/clans/voice/state', { channelId, isCameraOn: newState }); 
    } catch (e) { console.error(e); }
  };

  const toggleMic = async () => {
     let newState = isMuted;
     if (localStream) {
       localStream.getAudioTracks().forEach(t => t.enabled = !(!isMuted));
       newState = !isMuted;
       setIsMuted(newState);
     }
     
     // Sync to DB
     try {
       await api.post('/clans/voice/state', { channelId, isMuted: newState });
     } catch (e) { console.error(e); }
  };

  const gridClass = participants.length <= 1 ? "grid-cols-1" : participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-3";

  return (
    <div className="flex-1 flex flex-col bg-black h-full relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
           <Volume2 className="w-5 h-5 text-white" />
           <span className="font-mono font-bold text-white uppercase tracking-wider">{channelId}</span>
        </div>
        <div className="pointer-events-auto">
           <button className="p-2 bg-black/50 border border-white/10 text-white rounded hover:bg-white/10">
              <MessageSquare className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className={`flex-1 grid ${gridClass} gap-4 p-4 items-center justify-items-center justify-center content-center overflow-y-auto`}>
         {participants.length === 0 && <div className="text-zinc-500 font-mono">Waiting for users...</div>}
         {participants.map((p: any) => {
           const isLocal = p.userId === user.id;
           const stream = isLocal ? localStream : remoteStreams.get(p.userId);
           const isSpeaking = speakingUsers.has(p.userId || p.id);
           
           // Check if video is truly active
           const isVideoActive = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].readyState === 'live' && (isLocal ? isVideoEnabled : true);

           // Determine Mute Status
           const isUserMuted = isLocal ? isMuted : p.isMuted;
           
           return (
             <div key={p.id} className={`w-full max-w-5xl h-full mx-auto aspect-video bg-zinc-900 border transition-colors duration-200 relative group flex items-center justify-center overflow-hidden ${isSpeaking && !isUserMuted ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-white/10'}`}>
                {/* Background */}
                <div className="absolute inset-0 bg-zinc-800" />
                
                {/* Media Element (Audio/Video) */}
                {stream && (
                   <video 
                     className={`absolute inset-0 w-full h-full object-cover z-20 ${isLocal ? 'transform scale-x-[-1]' : ''} ${isVideoActive ? 'opacity-100' : 'opacity-0'}`} 
                     autoPlay
                     muted={isLocal} 
                     playsInline
                     ref={video => { if (video && video.srcObject !== stream) video.srcObject = stream; }}
                   />
                )}
                
                {/* Fallback Avatar (Visible if Video is NOT active) */}
                {(!isVideoActive) && (
                  <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                     <div className={`relative rounded-full p-1 transition-all duration-200 ${isSpeaking && !isUserMuted ? 'scale-110' : 'scale-100'}`}>
                        <div className={`absolute inset-0 rounded-full animate-pulse ${isSpeaking && !isUserMuted ? 'bg-purple-500/50' : 'bg-transparent'}`} />
                        <UserAvatar src={p.image} name={p.name} className={`w-24 h-24 border-4 ${isSpeaking && !isUserMuted ? 'border-purple-500' : 'border-zinc-900'}`} fallbackClassName="text-2xl" />
                     </div>
                  </div>
                )}

                {/* Status Pill */}
                <div className="absolute bottom-4 left-4 z-30 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                   {isUserMuted ? <Mic className="w-3 h-3 text-red-500" /> : isSpeaking ? <Mic className="w-3 h-3 text-purple-500 animate-pulse" /> : <Mic className="w-3 h-3 text-zinc-500" />}
                   <span className={`font-mono font-bold text-sm ${isSpeaking && !isUserMuted ? 'text-purple-400' : 'text-white'}`}>{p.name} {isLocal ? "(You)" : ""}</span>
                </div>
             </div>
           );
         })}
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 bg-black border-t border-white/10 flex items-center justify-center gap-4 relative z-20">
         <button onClick={toggleMic} className={`p-4 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'} transition-colors`}>
            {isMuted ? <PhoneOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
         </button>
         <button onClick={toggleVideo} className={`p-4 rounded-full ${isVideoEnabled ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'} transition-colors`}>
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
         </button>
         <div className="w-px h-8 bg-zinc-800 mx-2" />
         <button onClick={onLeave} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-mono font-bold uppercase text-sm flex items-center gap-2">
            <PhoneOff className="w-4 h-4" /> Disconnect
         </button>
      </div>
    </div>
  );
};
