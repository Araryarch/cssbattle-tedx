"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/components/UserProvider";
import api from "@/lib/axios";

// Hooks
import { useFriends } from "@/lib/hooks/useFriends";
import { useClans, useClanChat } from "@/lib/hooks/useClans";
import { useChat, useConversations } from "@/lib/hooks/useChat";
import { useGlobalChat } from "@/lib/hooks/useGlobalChat";

// Components
import { ServerRail } from "./components/ServerRail";
import { ContextSidebar } from "./components/ContextSidebar";
import { FriendsDashboard } from "./components/FriendsDashboard";
import { VoiceStage } from "./components/VoiceStage";
import { ChatInterface } from "./components/ChatInterface";
import { CreateClanModal } from "./components/CreateClanModal";
import { ClanBrowser } from "./components/browser/ClanBrowser";

export default function SocialsPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get("chat");

  // "Server" State
  const [activeServerId, setActiveServerId] = useState<string>("home");
  
  // "Channel" State
  const [activeChannelId, setActiveChannelId] = useState<string>(initialChatId || "friends");
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCreateClanModal, setShowCreateClanModal] = useState(false);

  // Data Hooks
  const { friends, pendingRequests, incomingRequests, sendRequest, respondToRequest } = useFriends();
  const { clans, createClan } = useClans();
  const { conversations } = useConversations();
  
  // Interact
  const globalChat = useGlobalChat(user);
  const clanChat = useClanChat(activeServerId !== "home" ? activeServerId : null, user);
  const dmChat = useChat(activeServerId === "home" && !['friends','pending','add','global'].includes(activeChannelId) ? activeChannelId : null, user);

  const activeClan = clans.find(c => c.id === activeServerId);

  // Voice State
  const [connectedVoiceChannelId, setConnectedVoiceChannelId] = useState<string | null>(null);

  const joinVoice = async (channelId: string) => {
     try {
       setConnectedVoiceChannelId(channelId); // Optimistic active state
       setActiveChannelId(channelId); // Switch view to voice stage
       await api.post('/clans/voice/join', { clanId: activeServerId, channelId });
     } catch (e) { console.error(e); }
  };
  
  const leaveVoice = async () => {
    try {
      setConnectedVoiceChannelId(null);
      if (activeChannelId === connectedVoiceChannelId) {
        setActiveChannelId("general"); // Switch back to text if viewing the voice channel
      }
      await api.post('/clans/voice/leave');
    } catch(e) { console.error(e); }
  }

  const getCurrentChat = () => {
    if (activeServerId === "home") {
      if (activeChannelId === "global") return { 
        messages: globalChat.messages, 
        send: globalChat.sendMessage, 
        title: "GLOBAL_NET",
        description: "Public transmission channel",
        type: "global"
      };
      if (!['friends','pending','add'].includes(activeChannelId)) {
        const friend = friends.find(f => f.userId === activeChannelId);
        const conversation = conversations.find(c => c.userId === activeChannelId);
        const name = friend?.name || conversation?.name || "UNKNOWN_USER";
        return { 
          messages: dmChat.messages, 
          send: dmChat.sendMessage, 
          title: name,
          description: "Encrypted connection",
          type: "dm"
        };
      }
    } else if (activeClan) {
      if (activeChannelId === 'general') {
        return { 
          messages: clanChat.messages, 
          send: clanChat.sendMessage, 
          title: "GENERAL", 
          description: `Main frequency for ${activeClan.name}`,
          type: "clan"
        };
      }
    }
    return null;
  };

  const currentChat = getCurrentChat();

  const handleServerSwitch = (serverId: string) => {
    setActiveServerId(serverId);
    if (serverId === "home") setActiveChannelId("friends");
    else setActiveChannelId("general"); 
    setMobileSidebarOpen(false);
  };

  const handleChannelSwitch = (channelId: string) => {
    // This is a placeholder. I will update useClans.ts first. channel, join it
    if (['General Voice', 'Gaming', 'Lobby'].includes(channelId)) {
        joinVoice(channelId);
    } 
    // Always switch the view
    setActiveChannelId(channelId);
    setMobileSidebarOpen(false);
  };

  const handleCreateClan = (name: string) => {
    createClan.mutate({ name });
    setShowCreateClanModal(false);
  };

  // Friend Search State (moved up for prop drilling or keep inside component? Kept in component for FriendsDashboard)
  // Actually, FriendsDashboard needs these passed down if we want to reset them from here, 
  // but FriendsDashboard manages its own search state mainly.
  // Wait, in previous code `friendSearch` was in page state. Let's move it back to `FriendsDashboard` to isolate it, 
  // unless other components need it. They don't.
  
  // However, I need to pass props to `FriendsDashboard` for the list data.
  const [friendSearch, setFriendSearch] = useState("");
  const [friendSearchResults, setFriendSearchResults] = useState<any[]>([]);

  if (!user) return <div className="flex h-screen items-center justify-center bg-black text-white font-mono">ACCESS DENIED. PLEASE AUTHENTICATE.</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-black font-sans text-zinc-100">
      
      {/* 1. SERVER RAIL (Leftmost) */}
      <ServerRail 
        clans={clans}
        activeServerId={activeServerId}
        onServerSwitch={handleServerSwitch}
        onShowCreateClanModal={() => setShowCreateClanModal(true)}
        onDiscover={() => {
           setActiveServerId("home");
           setActiveChannelId("browser");
           setMobileSidebarOpen(false);
        }}
        mobileSidebarOpen={mobileSidebarOpen}
      />

      {/* 2. CONTEXT SIDEBAR (Middle) */}
      <ContextSidebar 
        activeServerId={activeServerId}
        activeChannelId={activeChannelId}
        activeClan={activeClan}
        handleChannelSwitch={handleChannelSwitch}
        conversations={conversations}
        mobileSidebarOpen={mobileSidebarOpen}
        user={user}
        voiceParticipants={clanChat.participants}
        joinVoice={joinVoice}
        leaveVoice={leaveVoice}
        connectedVoiceChannelId={connectedVoiceChannelId}
      />

      {/* 3. MAIN CONTENT (Right) */}
      <main className={`flex-1 flex flex-col min-w-0 bg-black transition-opacity duration-200 ${mobileSidebarOpen ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Mobile Menu Trigger */}
        <button 
          className="md:hidden fixed top-[80px] left-4 z-50 p-2 bg-white text-black border border-black shadow-none"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {activeServerId === "home" && ['friends', 'pending', 'add'].includes(activeChannelId) ? (
          /* FRIENDS DASHBOARD */
          <FriendsDashboard 
             activeChannelId={activeChannelId}
             setActiveChannelId={setActiveChannelId}
             friendSearch={friendSearch}
             setFriendSearch={setFriendSearch}
             friendSearchResults={friendSearchResults}
             setFriendSearchResults={setFriendSearchResults}
             pendingRequests={pendingRequests}
             incomingRequests={incomingRequests}
             friends={friends}
             sendRequest={sendRequest}
             respondToRequest={respondToRequest}
             handleChannelSwitch={handleChannelSwitch}
           />
        ) : activeServerId === "home" && activeChannelId === "browser" ? (
           /* CLAN BROWSER */
           <ClanBrowser 
              activeChannelId={activeChannelId} 
              setActiveChannelId={setActiveChannelId}
           />
        ) : ['Lobby', 'Gaming', 'General Voice'].includes(activeChannelId) ? (
           /* VOICE STAGE */
           /* VOICE STAGE */
           <VoiceStage 
             channelId={activeChannelId} 
             clanId={activeServerId}
             user={user}
             onLeave={leaveVoice}
           />
        ) : currentChat ? (
          /* CHAT INTERFACE */
          <ChatInterface 
            currentChat={currentChat}
            user={user}
          />
        ) : (
          <div className="flex-1 bg-black flex items-center justify-center text-zinc-500 font-mono">
             CHANNEL NOT FOUND OR ENCRYPTED
          </div>
        )}
      </main>

      {/* Boxy Create Clan Modal */}
      {showCreateClanModal && (
        <CreateClanModal 
          onClose={() => setShowCreateClanModal(false)}
          onCreate={handleCreateClan}
        />
      )}

    </div>
  );
}
