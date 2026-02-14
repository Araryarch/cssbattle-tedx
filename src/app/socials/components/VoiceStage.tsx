import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useConnectionState,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, Participant, LocalParticipant, ParticipantEvent, ConnectionState } from "livekit-client";
import { useEffect, useState, memo } from "react";
import { PhoneOff, Loader2, Mic, MessageSquare, Volume2, WifiOff } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

interface VoiceStageProps {
  channelId: string;
  clanId: string;
  user: any;
  onLeave: () => void;
}

export const VoiceStage = ({ channelId, user, onLeave }: VoiceStageProps) => {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit/token?room=${channelId}&username=${user.name}&image=${encodeURIComponent(user.image || "")}`
        );
        const data = await resp.json();
        setToken(data.token);
        setServerUrl(data.serverUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL);
      } catch (e) {
        console.error("Failed to fetch token:", e);
      }
    })();
  }, [channelId, user.name, user.image]);

  if (!token || !serverUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        <span className="text-zinc-500 text-sm">Initializing connection...</span>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false} 
      audio={false}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      connect={true}
      style={{ height: "100%", background: "black" }}
      onDisconnected={onLeave}
      onError={(e) => console.error("LiveKit Error:", e)}
    >
      <CustomVoiceStage channelId={channelId} onLeave={onLeave} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

function CustomVoiceStage({ channelId, onLeave }: { channelId: string; onLeave: () => void }) {
  const participants = useParticipants();
  const connectionState = useConnectionState();
  
  const gridClass = participants.length <= 1 ? "grid-cols-1" : participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-3";

  if (connectionState === ConnectionState.Connecting) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center bg-black text-white gap-4">
           <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
           <p className="font-mono text-zinc-400">Connecting to server...</p>
        </div>
     );
  }

  if (connectionState === ConnectionState.Disconnected) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-black text-white gap-4">
           <WifiOff className="w-8 h-8 text-red-500" />
           <p className="font-mono text-zinc-400">Disconnected</p>
           <button onClick={onLeave} className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">Go Back</button>
        </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col bg-black h-full relative overflow-hidden">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
            <Volume2 className="w-5 h-5 text-white" />
            <span className="font-mono font-bold text-white uppercase tracking-wider">{channelId}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${connectionState === ConnectionState.Connected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {connectionState}
            </span>
            </div>
            {/* ... rest of top bar */}
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

const ParticipantItem = memo(({ participant }: { participant: Participant }) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // Subscribe to track events
  useEffect(() => {
    const updateTracks = () => {
        const aPub = participant.getTrackPublication(Track.Source.Microphone);
        setIsAudioMuted(aPub?.isMuted ?? true);
        
        // Parse metadata for avatar
        if (participant.metadata) {
            try {
                const metadata = JSON.parse(participant.metadata);
                if (metadata.image) setAvatarUrl(metadata.image);
            } catch (e) {
                console.error("Failed to parse metadata", e);
            }
        }
    };

    updateTracks();

    const onTrackChanged = () => updateTracks();
    const onMetadataChanged = () => updateTracks();
    
    // Listen to all relevant events
    participant.on(ParticipantEvent.TrackPublished, onTrackChanged);
    participant.on(ParticipantEvent.TrackUnpublished, onTrackChanged);
    participant.on(ParticipantEvent.TrackSubscribed, onTrackChanged);
    participant.on(ParticipantEvent.TrackUnsubscribed, onTrackChanged);
    participant.on(ParticipantEvent.TrackMuted, onTrackChanged);
    participant.on(ParticipantEvent.TrackUnmuted, onTrackChanged);
    participant.on(ParticipantEvent.ParticipantMetadataChanged, onMetadataChanged); // Listen for metadata updates

    return () => {
        participant.off(ParticipantEvent.TrackPublished, onTrackChanged);
        participant.off(ParticipantEvent.TrackUnpublished, onTrackChanged);
        participant.off(ParticipantEvent.TrackSubscribed, onTrackChanged);
        participant.off(ParticipantEvent.TrackUnsubscribed, onTrackChanged);
        participant.off(ParticipantEvent.TrackMuted, onTrackChanged);
        participant.off(ParticipantEvent.TrackUnmuted, onTrackChanged);
        participant.off(ParticipantEvent.ParticipantMetadataChanged, onMetadataChanged);
    };
  }, [participant, participant.metadata]);

  const isLocal = participant instanceof LocalParticipant;
  const connectionQuality = participant.connectionQuality; 

  return (
    <div className="w-full max-w-5xl h-full mx-auto aspect-video bg-zinc-900 border border-white/10 transition-colors duration-200 relative group flex items-center justify-center overflow-hidden">
        <SpeakingIndicator participant={participant} isAudioMuted={isAudioMuted} />

        {/* Background */}
        <div className="absolute inset-0 bg-zinc-800" />
        
        {/* Fallback Avatar (Always visible now) */}
        <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="relative rounded-full p-1 transition-all duration-200 scale-100">
                    <SpeakingAvatarRing participant={participant} isAudioMuted={isAudioMuted} />
                <UserAvatar src={avatarUrl} name={participant.identity || "User"} className="w-24 h-24 border-4 border-zinc-900 relative z-10" fallbackClassName="text-2xl" />
            </div>
        </div>

        {/* Status Pill */}
        <div className="absolute bottom-4 left-4 z-30 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            {isAudioMuted ? <Mic className="w-3 h-3 text-red-500" /> : <SpeakingMicIcon participant={participant} />}
            <span className="font-mono font-bold text-sm text-white">
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
});

function SpeakingIndicator({ participant, isAudioMuted }: { participant: Participant, isAudioMuted: boolean }) {
    const [isSpeaking, setIsSpeaking] = useState(participant.isSpeaking);
    useEffect(() => {
        const onSpeakingChanged = (speaking: boolean) => setIsSpeaking(speaking);
        participant.on(ParticipantEvent.IsSpeakingChanged, onSpeakingChanged);
        return () => { participant.off(ParticipantEvent.IsSpeakingChanged, onSpeakingChanged); };
    }, [participant]);

    if (!isSpeaking || isAudioMuted) return null;
    return <div className="absolute inset-0 border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] z-30 pointer-events-none" />;
}

function SpeakingAvatarRing({ participant, isAudioMuted }: { participant: Participant, isAudioMuted: boolean }) {
    const [isSpeaking, setIsSpeaking] = useState(participant.isSpeaking);
    useEffect(() => {
        const onSpeakingChanged = (speaking: boolean) => setIsSpeaking(speaking);
        participant.on(ParticipantEvent.IsSpeakingChanged, onSpeakingChanged);
        return () => { participant.off(ParticipantEvent.IsSpeakingChanged, onSpeakingChanged); };
    }, [participant]);

    if (!isSpeaking || isAudioMuted) return null;
    return <div className="absolute inset-0 rounded-full animate-pulse bg-purple-500/50 scale-110 z-0" />;
}

function SpeakingMicIcon({ participant }: { participant: Participant }) {
    const [isSpeaking, setIsSpeaking] = useState(participant.isSpeaking);
    useEffect(() => {
        const onSpeakingChanged = (speaking: boolean) => setIsSpeaking(speaking);
        participant.on(ParticipantEvent.IsSpeakingChanged, onSpeakingChanged);
        return () => { participant.off(ParticipantEvent.IsSpeakingChanged, onSpeakingChanged); };
    }, [participant]);

    return isSpeaking ? <Mic className="w-3 h-3 text-purple-500 animate-pulse" /> : <Mic className="w-3 h-3 text-zinc-500" />;
}

function CustomControlBar({ onLeave }: { onLeave: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (localParticipant) {
      setIsMuted(!localParticipant.isMicrophoneEnabled);
    }
  }, [localParticipant, localParticipant?.isMicrophoneEnabled]);


  const toggleMic = async () => {
    if (!localParticipant) return;
    try {
      const enabled = localParticipant.isMicrophoneEnabled;
      await localParticipant.setMicrophoneEnabled(!enabled);
      setIsMuted(enabled); 
    } catch (e) {
      console.error("Error toggling mic:", e);
    }
  };

  return (
    <div className="h-20 bg-black border-t border-white/10 flex items-center justify-center gap-4 relative z-20">
        <button onClick={toggleMic} className={`p-4 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'} transition-colors`}>
            {isMuted ? <PhoneOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <div className="w-px h-8 bg-zinc-800 mx-2" />
        <button onClick={onLeave} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-mono font-bold uppercase text-sm flex items-center gap-2">
            <PhoneOff className="w-4 h-4" /> Disconnect
        </button>
    </div>
  );  
}
