import {
  LiveKitRoom,
  VideoConference,
  useTracks,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import { PhoneOff, Loader2 } from "lucide-react";

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
      <MyVideoConference />
      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  );
};

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  
  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100% - var(--lk-control-bar-height))' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
