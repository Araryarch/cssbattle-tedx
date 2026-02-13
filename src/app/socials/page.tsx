"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, Users, Shield, Plus, Search, Send, 
  Hash, Crown, Settings, LogOut, UserPlus, Check, X,
  Menu, X as XIcon
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useFriends } from "@/lib/hooks/useFriends";
import { useClans } from "@/lib/hooks/useClans";
import { useUser } from "@/components/UserProvider";

type GlobalMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string | null;
  senderImage?: string | null;
  senderRank?: string | null;
};

type Friend = {
  id: string;
  userId: string;
  name: string | null;
  image: string | null;
  email: string;
};

type Clan = {
  id: string;
  name: string;
  role: string;
};

type Conversation = {
  id: string;
  userId: string;
  name: string | null;
  image: string | null;
};

export default function SocialsPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const chatUserId = searchParams.get("chat");
  
  const [activeView, setActiveView] = useState<"friends" | "clans" | "global">("global");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(chatUserId);
  const [conversationName, setConversationName] = useState<string | null>(null);
  
  // Messages state
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Modal states
  const [showCreateClan, setShowCreateClan] = useState(false);
  const [newClanName, setNewClanName] = useState("");
  const [newClanDesc, setNewClanDesc] = useState("");
  
  // UI states
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const { friends, pendingRequests, incomingRequests, sendRequest, respondToRequest, refetch: refetchFriends } = useFriends();
  const { clans, createClan, joinClan, leaveClan, refetch: refetchClans } = useClans();

  // SSE for global chat
  useEffect(() => {
    if (!user || activeView !== "global") return;

    const eventSource = new EventSource("/api/global-chat");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "init") {
          setMessages(data.messages || []);
        } else if (data.type === "update") {
          setMessages((prev) => {
            // Don't add duplicate messages - check by content + senderId + approximate time
            const existingContents = prev.map(m => `${m.senderId}-${m.content}-${Math.floor(new Date(m.createdAt).getTime() / 1000)}`);
            const newMsgs = data.messages.filter((m: GlobalMessage) => {
              const msgTime = Math.floor(new Date(m.createdAt).getTime() / 1000);
              const signature = `${m.senderId}-${m.content}-${msgTime}`;
              return !existingContents.includes(signature);
            });
            return [...prev, ...newMsgs];
          });
        }
      } catch (e) {
        console.error("Parse error:", e);
      }
    };

    eventSource.onopen = () => setIsConnected(true);
    eventSource.onerror = () => setIsConnected(false);

    return () => eventSource.close();
  }, [user, activeView]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search users
  useEffect(() => {
    const fetchUsers = async () => {
      if (search.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(search)}`);
        setSearchResults(data.users || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    try {
      await api.post("/global-chat", { content: newMessage.trim() });
      setNewMessage("");
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateClan = () => {
    if (!newClanName.trim()) return;
    createClan.mutate({ name: newClanName, description: newClanDesc });
    setShowCreateClan(false);
    setNewClanName("");
    setNewClanDesc("");
  };

  const isFriend = (userId: string) => friends.some(f => f.userId === userId);
  const isPending = (userId: string) => pendingRequests.some(p => p.userId === userId);
  const isIncoming = (userId: string) => incomingRequests.some(i => i.userId === userId);
  const isMember = (clanId: string) => clans.some(c => c.id === clanId);
  const myClan = clans[0];

  if (!user) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Socials</h1>
          <p className="text-white/40">Sign in to chat with friends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex bg-black">
      {/* Sidebar - Discord style */}
      <div className={`
        fixed md:relative z-30 md:z-0
        w-72 h-full bg-zinc-900 border-r border-white/5 flex flex-col
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-200
      `}>
        {/* Server/Clan List */}
        <div className="p-3 border-b border-white/5">
          <button
            onClick={() => { setActiveView("global"); setSelectedConversation(null); setShowMobileSidebar(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeView === "global" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
            }`}
          >
            <Hash className="w-5 h-5" />
            <span className="font-medium">Global Chat</span>
          </button>
        </div>

        {/* Friends & Clans */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <button
                onClick={() => setActiveView("friends")}
                className={`text-xs font-bold uppercase tracking-wider ${
                  activeView === "friends" ? "text-white" : "text-white/40"
                }`}
              >
                Friends
              </button>
              <UserPlus className="w-4 h-4 text-white/30 cursor-pointer hover:text-white" />
            </div>
            {activeView === "friends" && (
              <div className="space-y-1">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => { setSelectedConversation(friend.userId); setConversationName(friend.name); setShowMobileSidebar(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      {friend.image ? (
                        <img src={friend.image} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <span className="text-white text-sm truncate">{friend.name || "Unknown"}</span>
                  </button>
                ))}
                {friends.length === 0 && (
                  <p className="px-2 text-white/30 text-xs">No friends yet</p>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <button
                onClick={() => setActiveView("clans")}
                className={`text-xs font-bold uppercase tracking-wider ${
                  activeView === "clans" ? "text-white" : "text-white/40"
                }`}
              >
                Clans
              </button>
              <Plus 
                className="w-4 h-4 text-white/30 cursor-pointer hover:text-white"
                onClick={() => setShowCreateClan(true)}
              />
            </div>
            {activeView === "clans" && (
              <div className="space-y-1">
                {clans.map((clan) => (
                  <button
                    key={clan.id}
                    onClick={() => { setSelectedConversation(clan.id); setConversationName(clan.name); setShowMobileSidebar(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white text-sm truncate">{clan.name}</span>
                    {clan.role === "owner" && <Crown className="w-3 h-3 text-yellow-400" />}
                  </button>
                ))}
                {clans.length === 0 && (
                  <p className="px-2 text-white/30 text-xs">No clans yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              {user.image ? (
                <img src={user.image} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-primary text-sm font-bold">{user.name?.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-white/30 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 px-4 border-b border-white/5 flex items-center gap-4 bg-zinc-900/50">
          <button 
            onClick={() => setShowMobileSidebar(true)}
            className="md:hidden p-2 hover:bg-white/5 rounded"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-white/40" />
            <h2 className="text-white font-medium">
              {selectedConversation ? conversationName : "Global Chat"}
            </h2>
          </div>

          <div className="flex-1">
            <div className="relative max-w-md ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        {search.length >= 2 && (
          <div className="absolute top-14 right-4 w-80 max-h-96 overflow-y-auto bg-zinc-800 border border-white/10 rounded-lg shadow-xl z-50">
            {isSearching ? (
              <div className="p-4 text-white/40 text-sm text-center">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-white/40 text-sm text-center">No users found</div>
            ) : (
              <div className="p-2">
                {searchResults.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        {u.image ? (
                          <img src={u.image} className="w-full h-full rounded-full" />
                        ) : (
                          <Users className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm">{u.name || "Unknown"}</p>
                        <p className="text-white/30 text-xs">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {isFriend(u.id) ? (
                        <span className="text-green-400 text-xs">Friend</span>
                      ) : isPending(u.id) ? (
                        <span className="text-white/30 text-xs">Pending</span>
                      ) : isIncoming(u.id) ? (
                        <button
                          onClick={() => {
                            const req = incomingRequests.find(i => i.userId === u.id);
                            if (req) respondToRequest.mutate({ requestId: req.id, action: "accept" });
                          }}
                          className="p-1 bg-green-500/20 text-green-400 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => sendRequest.mutate(u.id)}
                          className="p-1 bg-white/10 text-white rounded hover:bg-white/20"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        href={`/profile/${u.id}`}
                        className="p-1 bg-white/10 text-white rounded hover:bg-white/20"
                      >
                        <Users className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeView === "global" && messages.map((msg) => {
            const isOwn = msg.senderId === (currentUserId || user?.id);
            return (
              <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center">
                  {isOwn ? (
                    user?.image ? (
                      <img src={user.image} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white/60 text-sm font-medium">
                        {(user?.name || "You").charAt(0)}
                      </span>
                    )
                  ) : msg.senderImage ? (
                    <img src={msg.senderImage} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white/60 text-sm font-medium">
                      {(msg.senderName || "?").charAt(0)}
                    </span>
                  )}
                </div>
                <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">
                      {isOwn ? (user?.name || "You") : (msg.senderName || "Unknown")}
                      {msg.senderRank === "dev" && <span className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-bold rounded">DEV</span>}
                      {msg.senderRank && msg.senderRank !== "dev" && <span className="text-primary ml-1">- {msg.senderRank}</span>}
                    </span>
                    <span className="text-white/30 text-xs">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                    msg.senderRank === "dev" 
                      ? "bg-zinc-900 text-white border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                      : isOwn ? "bg-primary text-white" : "bg-white/10 text-white"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          {activeView === "global" && messages.length === 0 && (
            <div className="text-center text-white/30 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${activeView === "global" ? "global-chat" : activeView}...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2.5 bg-primary rounded-full hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Clan Modal */}
      {showCreateClan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Create Clan</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Clan name"
                value={newClanName}
                onChange={(e) => setNewClanName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newClanDesc}
                onChange={(e) => setNewClanDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateClan}
                  disabled={!newClanName.trim()}
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateClan(false)}
                  className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
