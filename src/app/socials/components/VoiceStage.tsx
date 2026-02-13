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
  
  // Audio Analysis for Visuals
  const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Local Media (Audio Only initially)
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        setupAudioAnalysis(stream);
      } catch (e) {
        console.error("Microphone permission denied", e);
      }
    };
    initMedia();

    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      api.post('/clans/voice/leave').catch(() => {});
    };
  }, []);

  // Handle Participants (Mesh Networking)
  useEffect(() => {
    if (!localStream) return;

    participants.forEach(p => {
      if (p.userId === user.id) return;
      
      // If we don't have a peer connection yet, create one
      if (!peersRef.current.has(p.userId)) {
         createPeerConnection(p.userId);
      }
    });

    // Cleanup left users
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
      }
    });

  }, [participants, localStream]);

  // Handle Signals
  useEffect(() => {
    if (!localStream) return;

    signals.forEach(async (signalData) => {
       // Skip if already processed or from self
       if (processedSignalTimestamps.current.has(signalData.timestamp)) return;
       if (signalData.fromUserId === user.id) return;

       processedSignalTimestamps.current.add(signalData.timestamp);
       
       const { fromUserId, signal } = signalData;
       let pc = peersRef.current.get(fromUserId);

       if (!pc) {
         // Received signal from unknown peer (likely they initiated)
         pc = createPeerConnection(fromUserId);
       }

       try {
         if (signal.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal(fromUserId, answer);
         } else if (signal.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
         } else if (signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
         }
       } catch (e) {
         console.error("Signaling error", e);
       }
    });
  }, [signals, localStream]);

  const createPeerConnection = (targetUserId: string) => {
     const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
     });
     
     peersRef.current.set(targetUserId, pc);

     // Add local tracks
     localStream?.getTracks().forEach(track => {
       pc.addTrack(track, localStream);
     });

     // Handle ICE candidates
     pc.onicecandidate = (event) => {
       if (event.candidate) {
         sendSignal(targetUserId, { candidate: event.candidate });
       }
     };

     // Handle Remote Stream
     pc.ontrack = (event) => {
       setRemoteStreams(prev => {
         const newMap = new Map(prev);
         newMap.set(targetUserId, event.streams[0]);
         return newMap;
       });
     };

     // Tie-breaker: If my ID < their ID, I offer
     if (user.id < targetUserId) {
        pc.onnegotiationneeded = async () => {
           try {
             const offer = await pc.createOffer();
             await pc.setLocalDescription(offer);
             sendSignal(targetUserId, offer);
           } catch(e) { console.error(e); }
        };
     }

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
    if (isVideoEnabled) {
       // Stop video track
       const videoTrack = localStream?.getVideoTracks()[0];
       if (videoTrack) {
         videoTrack.stop();
         localStream?.removeTrack(videoTrack);
         // Update all peers
         // Remove track from PC is tricky in WebRTC, usually we replaceTrack(null) or simple renegotiation
         // But `removeTrack` triggers negotiation
         peersRef.current.forEach(pc => {
             const sender = pc.getSenders().find(s => s.track?.kind === 'video');
             if (sender) pc.removeTrack(sender);
         });
       }
       setIsVideoEnabled(false);
    } else {
       // Start video track
       try {
         const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
         const videoTrack = videoStream.getVideoTracks()[0];
         
         if (localStream) {
           localStream.addTrack(videoTrack);
           // Add to all peers
           peersRef.current.forEach(pc => {
             pc.addTrack(videoTrack, localStream);
           });
         }
         setIsVideoEnabled(true);
       } catch (e) {
         console.error("Camera error", e);
       }
    }
  };

  const toggleMic = () => {
     if (localStream) {
       localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
       setIsMuted(!isMuted);
     }
  };

  // Setup Audio Analysis for Visualizer
  const setupAudioAnalysis = (stream: MediaStream) => {
    // Re-use logic from previous implementation...
    // For brevity, using simplified version
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const checkVolume = () => {
       const dataArray = new Uint8Array(analyser.frequencyBinCount);
       analyser.getByteFrequencyData(dataArray);
       const sum = dataArray.reduce((prev, curr) => prev + curr, 0);
       const avg = sum / dataArray.length;
       if (avg > 10) setSpeakingUsers(prev => new Set(prev).add(user.id));
       else setSpeakingUsers(prev => { const n = new Set(prev); n.delete(user.id); return n; });
       animationFrameRef.current = requestAnimationFrame(checkVolume);
    };
    checkVolume();
  };
  
  // Render
  const gridClass = participants.length <= 1 ? "grid-cols-1" : participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-3";

  return (
    <div className="flex-1 flex flex-col bg-black h-full relative overflow-hidden">
        {/* Same Layout UI as before... */}
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

       <div className={`flex-1 grid ${gridClass} gap-4 p-4 items-center justify-items-center justify-center content-center overflow-y-auto`}>
          {participants.length === 0 && <div className="text-zinc-500 font-mono">Waiting for users...</div>}
          {participants.map((p: any) => {
            const isLocal = p.userId === user.id;
            const stream = isLocal ? localStream : remoteStreams.get(p.userId);
            const isVideoActive = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].readyState === 'live' && stream.getVideoTracks()[0].enabled;
            // Hacky check for video
            
            return (
              <div key={p.id} className="w-full max-w-5xl h-full mx-auto aspect-video bg-zinc-900 border border-white/10 relative group flex items-center justify-center overflow-hidden">
                 {/* Video */}
                 {stream && (
                    <video 
                      className={`absolute inset-0 w-full h-full object-cover z-20 ${isLocal ? 'transform scale-x-[-1]' : ''}`}
                      autoPlay
                      muted={isLocal} // Mute self, unmute others
                      playsInline
                      ref={video => { if (video && video.srcObject !== stream) video.srcObject = stream; }}
                    />
                 )}
                 {/* Fallback Avatar */}
                 {(!stream) && (
                   <div className="relative z-10">
                      <UserAvatar src={p.image} name={p.name} className="w-24 h-24 border-4 border-zinc-900" />
                   </div>
                 )}
                 {/* Name Tag */}
                 <div className="absolute bottom-4 left-4 z-30 bg-black/60 px-3 py-1 rounded-full border border-white/10 text-white font-mono text-sm font-bold">
                    {p.name} {isLocal ? "(You)" : ""}
                 </div>
              </div>
            );
          })}
       </div>

       <div className="h-20 bg-black border-t border-white/10 flex items-center justify-center gap-4 relative z-20">
         <button onClick={toggleMic} className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-zinc-800 hover:bg-zinc-700'} text-white transition-colors`}>
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
