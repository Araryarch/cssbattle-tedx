import React from "react";
import { Mic, Video, VideoOff, Monitor, PhoneOff, MessageSquare, Volume2, Users } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

interface VoiceStageProps {
  channelId: string;
  participants: any[]; // Replace with proper type
  user: any;
  onLeave: () => void;
}

export const VoiceStage: React.FC<VoiceStageProps> = ({ channelId, participants, user, onLeave }) => {
  // Media State
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [localVideoStream, setLocalVideoStream] = React.useState<MediaStream | null>(null);

  // Audio Analysis State
  const [speakingUsers, setSpeakingUsers] = React.useState<Set<string>>(new Set());
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  const userRef = React.useRef(user);
  const participantsRef = React.useRef(participants);
  const isMutedRef = React.useRef(isMuted);

  React.useEffect(() => {
    userRef.current = user;
    participantsRef.current = participants;
    isMutedRef.current = isMuted;
  }, [user, participants, isMuted]);

  React.useEffect(() => {
    // 1. Setup Local Microphone Analysis
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for(let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          // Threshold for "speaking" (only if not muted)
          const isSpeakingLocal = !isMutedRef.current && average > 10;
          
          setSpeakingUsers(prev => {
             const next = new Set(prev);
             const currentUser = userRef.current;
             const currentParticipants = participantsRef.current;

             // Handle Local User
             if (currentUser) {
                if (isSpeakingLocal) next.add(currentUser.id);
                else next.delete(currentUser.id);
             }
             
             // Mock Remote Users (Keep alive for demo)
             currentParticipants.forEach((p: any) => {
               if (p.id !== currentUser?.id) {
                   if (Math.random() > 0.95) next.add(p.userId || p.id);
                   else if (Math.random() > 0.95) next.delete(p.userId || p.id);
               }
             });
             return next;
          });
          
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        
        checkVolume();
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const toggleMic = () => setIsMuted(!isMuted);
  
  const toggleVideo = async () => {
     if (isVideoEnabled) {
        localVideoStream?.getTracks().forEach(t => t.stop());
        setLocalVideoStream(null);
        setIsVideoEnabled(false);
     } else {
        try {
           const stream = await navigator.mediaDevices.getUserMedia({ video: true });
           setLocalVideoStream(stream);
           setIsVideoEnabled(true);
        } catch(e) {
           console.error("Error accessing camera:", e);
           alert("Could not access camera.");
        }
     }
  };

  // Cleanup video on unmount
  React.useEffect(() => {
     return () => {
       localVideoStream?.getTracks().forEach(t => t.stop());
     }
  }, [localVideoStream]);

  // Grid calculation: 1 participant = full, 2 = split vertical, 3+ = grid
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
      <div className={`flex-1 grid ${gridClass} gap-4 p-4 items-center justify-center content-center overflow-y-auto`}>
         {participants.length === 0 && (
            <div className="flex flex-col items-center justify-center text-zinc-500 gap-4 col-span-full">
               <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                 <Users className="w-8 h-8" />
               </div>
               <p className="font-mono text-sm">Waiting for users...</p>
            </div>
         )}
         {participants.map((p: any) => {
           const isSpeaking = speakingUsers.has(p.userId || p.id);
           const isLocal = p.userId === user.id;
           
           return (
             <div key={p.id} className={`w-full max-w-5xl aspect-video bg-zinc-900 border transition-colors duration-200 relative group flex items-center justify-center overflow-hidden ${isSpeaking ? 'border-purple-500' : 'border-white/10'}`}>
                {/* Background/Video Placeholder */}
                <div className="absolute inset-0 bg-zinc-800" />
                
                {/* Local Video Stream */}
                {isLocal && isVideoEnabled && localVideoStream && (
                   <video 
                     className="absolute inset-0 w-full h-full object-cover z-20 transform scale-x-[-1]" // Mirror the local video
                     autoPlay 
                     muted 
                     playsInline
                     ref={video => { 
                       if (video && video.srcObject !== localVideoStream) {
                         video.srcObject = localVideoStream; 
                       }
                     }}
                   />
                )}
                
                {/* Avatar (Hidden if video is on) */}
                {(!isLocal || !isVideoEnabled) && (
                  <div className="relative z-10 flex flex-col items-center gap-4">
                     <div className="relative rounded-full p-1">
                        <UserAvatar src={p.image} name={p.name} className="w-24 h-24 border-4 border-zinc-900" fallbackClassName="text-2xl" />
                     </div>
                  </div>
                )}

                {/* Status Pill */}
                <div className="absolute bottom-4 left-4 z-30 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                   {isSpeaking ? <Mic className="w-3 h-3 text-purple-500" /> : ((isLocal && isMuted) || (!isLocal && false)) ? <Mic className="w-3 h-3 text-red-500" /> : <Mic className="w-3 h-3 text-zinc-500" />}
                   <span className={`font-mono font-bold text-sm ${isSpeaking ? 'text-purple-400' : 'text-white'}`}>{p.name} {isLocal ? "(You)" : ""}</span>
                </div>
             </div>
           );
         })}
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 bg-black border-t border-white/10 flex items-center justify-center gap-4 relative z-20">
         <button 
           onClick={toggleMic}
           className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
         >
            {isMuted ? <PhoneOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
         </button>
         <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${isVideoEnabled ? 'bg-zinc-100 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
         >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
         </button>
         <div className="w-px h-8 bg-zinc-800 mx-2" />
         <button 
           onClick={onLeave}
           className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-mono font-bold uppercase text-sm tracking-wider flex items-center gap-2 transition-colors"
         >
            <PhoneOff className="w-4 h-4" />
            Disconnect
         </button>
      </div>
    </div>
  );
};
