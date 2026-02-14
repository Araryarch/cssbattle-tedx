import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, Participant, LocalParticipant, RemoteParticipant } from "livekit-client";
import { useEffect, useState, useMemo } from "react";
import { PhoneOff, Loader2, Mic, Video, VideoOff, MessageSquare, Volume2 } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

interface VoiceStageProps {
  channelId: string;
  clanId: string;
  user: any;
  onLeave: () => void;
}

export const VoiceStage = ({ channelId, user, onLeave }: VoiceStageProps) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit/token?room=${channelId}&username=${user.name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [channelId, user.name]);

  if (token === "") {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100%", background: "black" }}
      onDisconnected={onLeave}
    >
      <CustomVoiceStage channelId={channelId} onLeave={onLeave} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

function CustomVoiceStage({ channelId, onLeave }: { channelId: string; onLeave: () => void }) {
  const participants = useParticipants();
  
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
            {participants.map((p) => (
                <ParticipantItem key={p.sid} participant={p} />
            ))}
        </div>

        {/* Bottom Control Bar */}
        <CustomControlBar onLeave={onLeave} />
    </div>
  );
}

function ParticipantItem({ participant }: { participant: Participant }) {
  // Use useTracks to subscribe to updates for this participant
  const videoTracks = useTracks([Track.Source.Camera]);
  const audioTracks = useTracks([Track.Source.Microphone]);

  const videoTrackRef = useMemo(() => 
    videoTracks.find(t => t.participant.sid === participant.sid), 
  [videoTracks, participant.sid]);

  const audioTrackRef = useMemo(() => 
    audioTracks.find(t => t.participant.sid === participant.sid), 
  [audioTracks, participant.sid]);

  // Force re-render on speaking updates
  const [isSpeaking, setIsSpeaking] = useState(participant.isSpeaking);
  
  useEffect(() => {
    const onSpeakingChanged = (speaking: boolean) => setIsSpeaking(speaking);
    participant.on("speakingChanged", onSpeakingChanged);
    return () => {
        participant.off("speakingChanged", onSpeakingChanged);
    };
  }, [participant]);

  const isVideoActive = !!videoTrackRef && !videoTrackRef.publication.isMuted;
  const isAudioMuted = !audioTrackRef || audioTrackRef.publication.isMuted;
  const isLocal = participant instanceof LocalParticipant;
  const connectionQuality = participant.connectionQuality; 

  return (
    <div className={`w-full max-w-5xl h-full mx-auto aspect-video bg-zinc-900 border transition-colors duration-200 relative group flex items-center justify-center overflow-hidden ${isSpeaking && !isAudioMuted ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-white/10'}`}>
        {/* Background */}
        <div className="absolute inset-0 bg-zinc-800" />
        
        {/* Media Element (Video) */}
        {isVideoActive && videoTrackRef?.publication.track && (
            <video 
                className={`absolute inset-0 w-full h-full object-cover z-20 ${isLocal ? 'transform scale-x-[-1]' : ''}`} 
                ref={el => {
                    if (el) {
                        el.srcObject = new MediaStream([videoTrackRef.publication.track!.mediaStreamTrack]);
                        el.play().catch(e => console.error("Video play error", e));
                    }
                }}
                muted={true} 
                playsInline
            />
        )}
        
        {/* Fallback Avatar */}
        {(!isVideoActive) && (
            <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className={`relative rounded-full p-1 transition-all duration-200 ${isSpeaking && !isAudioMuted ? 'scale-110' : 'scale-100'}`}>
                    <div className={`absolute inset-0 rounded-full animate-pulse ${isSpeaking && !isAudioMuted ? 'bg-purple-500/50' : 'bg-transparent'}`} />
                    <UserAvatar src={undefined} name={participant.identity || "User"} className={`w-24 h-24 border-4 ${isSpeaking && !isAudioMuted ? 'border-purple-500' : 'border-zinc-900'}`} fallbackClassName="text-2xl" />
                </div>
            </div>
        )}

        {/* Status Pill */}
        <div className="absolute bottom-4 left-4 z-30 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            {isAudioMuted ? <Mic className="w-3 h-3 text-red-500" /> : isSpeaking ? <Mic className="w-3 h-3 text-purple-500 animate-pulse" /> : <Mic className="w-3 h-3 text-zinc-500" />}
            <span className={`font-mono font-bold text-sm ${isSpeaking && !isAudioMuted ? 'text-purple-400' : 'text-white'}`}>
                {participant.identity} {isLocal ? "(You)" : ""}
            </span>
        </div>

        {/* Connection Status (Remote Only) */}
        {!isLocal && (
            <div className="absolute top-4 right-4 z-30">
                 <div className={`w-2 h-2 rounded-full shadow-[0_0_10px] ${
                    connectionQuality === 'excellent' ? 'bg-green-500 shadow-green-500' :
                    connectionQuality === 'good' ? 'bg-yellow-500 shadow-yellow-500' : 'bg-red-500 shadow-red-500'
                 }`} />
            </div>
        )}
    </div>
  );
}

function CustomControlBar({ onLeave }: { onLeave: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  useEffect(() => {
    if (localParticipant) {
      setIsMuted(!localParticipant.isMicrophoneEnabled);
      setIsVideoEnabled(localParticipant.isCameraEnabled);
    }
  }, [localParticipant, localParticipant?.isMicrophoneEnabled, localParticipant?.isCameraEnabled]);


  const toggleMic = async () => {
    if (!localParticipant) return;
    const enabled = localParticipant.isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(!enabled);
    setIsMuted(enabled); // Optimistic
  };

  const toggleVideo = async () => {
    if (!localParticipant) return;
    const enabled = localParticipant.isCameraEnabled;
    await localParticipant.setCameraEnabled(!enabled);
    setIsVideoEnabled(!enabled);
  };

  return (
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
  );  
}
