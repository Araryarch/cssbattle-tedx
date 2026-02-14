"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, User, Users, Plus, Check, X as XIcon, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat, useConversations } from "@/lib/hooks/useChat";
import { useFriends } from "@/lib/hooks/useFriends";
import { useClans, useClanChat } from "@/lib/hooks/useClans";
import { useUser } from "@/components/UserProvider";
import Link from "next/link";

type ChatProps = {
  receiverId?: string;
  receiverName?: string;
};

type Tab = "chat" | "friends" | "clans";

export default function Chat({ receiverId, receiverName }: ChatProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(receiverId || null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(receiverName || null);
  const [selectedClanId, setSelectedClanId] = useState<string | null>(null);
  const [selectedClanName, setSelectedClanName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showConversations, setShowConversations] = useState(false);
  const [showCreateClan, setShowCreateClan] = useState(false);
  const [newClanName, setNewClanName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, refetch: refetchConvos } = useConversations();
  const { messages, sendMessage } = useChat(selectedUserId, user);
  const { friends, pendingRequests, incomingRequests, sendRequest, respondToRequest, refetch: refetchFriends } = useFriends();
  const { clans, createClan, joinClan, leaveClan, refetch: refetchClans } = useClans();
  const { messages: clanMessages, sendMessage: sendClanMessage } = useClanChat(selectedClanId, user);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, clanMessages]);

  useEffect(() => {
    if (receiverId && receiverName) {
      setSelectedUserId(receiverId);
      setSelectedUserName(receiverName);
      setIsOpen(true);
      setActiveTab("chat");
    }
  }, [receiverId, receiverName]);

  const handleSend = () => {
    if (!message.trim()) return;
    if (selectedUserId) {
      sendMessage(message);
    } else if (selectedClanId) {
      sendClanMessage(message);
    }
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateClan = () => {
    if (!newClanName.trim()) return;
    createClan.mutate({ name: newClanName });
    setNewClanName("");
    setShowCreateClan(false);
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-80 h-[500px] bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-2 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-1">
                {(["chat", "friends", "clans"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSelectedUserId(null);
                      setSelectedClanId(null);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-primary text-white"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab === "chat" ? "Chat" : tab === "friends" ? "Friends" : "Clans"}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2">
                <X className="w-4 h-4 text-white/40 hover:text-white" />
              </button>
            </div>

            {activeTab === "chat" && (
              <>
                <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    {selectedUserId ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedUserId(null);
                            setSelectedUserName(null);
                          }}
                          className="text-white/40 hover:text-white"
                        >
                          ←
                        </button>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                          <User className="w-3 h-3 text-white/40" />
                        </div>
                        <span className="font-medium text-white text-sm">{selectedUserName || "Chat"}</span>
                      </>
                    ) : (
                      <span className="font-medium text-white text-sm">Messages</span>
                    )}
                  </div>
                </div>

                {selectedUserId ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] px-2 py-1.5 rounded-lg text-xs ${
                                isOwn
                                  ? "bg-primary text-white rounded-br-none"
                                  : "bg-white/10 text-white/80 rounded-bl-none"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-2 border-t border-white/5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!message.trim()}
                          className="p-1.5 bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                          <Send className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : conversations.length > 0 ? (
                  <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setSelectedUserId(conv.userId);
                          setSelectedUserName(conv.name);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                          {conv.image ? (
                            <img src={conv.image} alt={conv.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white text-xs truncate">{conv.name || "Unnamed"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4 text-center">
                    <p className="text-white/30 text-xs">No conversations yet</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "friends" && (
              <>
                {incomingRequests.length > 0 && (
                  <div className="p-2 border-b border-white/5">
                    <p className="text-xs text-white/40 mb-2">Incoming Requests</p>
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-white/40" />
                          </div>
                          <span className="text-xs text-white">{req.name || "User"}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => respondToRequest.mutate({ requestId: req.id, action: "accept" })}
                            className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => respondToRequest.mutate({ requestId: req.id, action: "reject" })}
                            className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto">
                  {friends.length === 0 ? (
                    <div className="p-4 text-center text-white/30 text-xs">
                      No friends yet
                    </div>
                  ) : (
                    friends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => {
                          setSelectedUserId(friend.userId);
                          setSelectedUserName(friend.name || null);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                          {friend.image ? (
                            <img src={friend.image} alt={friend.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white text-xs truncate">{friend.name || "Unnamed"}</p>
                          <p className="text-[10px] text-white/40 truncate">{friend.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "clans" && (
              <>
                <div className="p-2 border-b border-white/5">
                  <button
                    onClick={() => setShowCreateClan(!showCreateClan)}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-primary/20 text-primary rounded-lg text-xs hover:bg-primary/30 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Create Clan
                  </button>
                  {showCreateClan && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newClanName}
                        onChange={(e) => setNewClanName(e.target.value)}
                        placeholder="Clan name..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleCreateClan}
                        disabled={!newClanName.trim()}
                        className="px-2 py-1 bg-primary rounded text-xs text-white disabled:opacity-50"
                      >
                        Create
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {clans.length === 0 ? (
                    <div className="p-4 text-center text-white/30 text-xs">
                      No clans yet
                    </div>
                  ) : (
                    clans.map((clan) => (
                      <button
                        key={clan.id}
                        onClick={() => {
                          setSelectedClanId(clan.id);
                          setSelectedClanName(clan.name);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white text-xs truncate">{clan.name}</p>
                          <p className="text-[10px] text-white/40">{clan.role}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                {selectedClanId && (
                  <div className="border-t border-white/5 p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/40">{selectedClanName}</span>
                      <button
                        onClick={() => leaveClan.mutate(selectedClanId)}
                        className="text-[10px] text-red-400 hover:underline"
                      >
                        Leave
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-32 mb-2 space-y-1">
                      {clanMessages.map((msg) => {
                        const isOwn = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[85%] px-2 py-1 rounded text-[10px] ${
                                isOwn ? "bg-purple-500/30 text-white" : "bg-white/10 text-white/70"
                              }`}
                            >
                              <span className="text-purple-300 mr-1">{msg.senderName}:</span>
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="p-1 bg-purple-500 rounded disabled:opacity-50"
                      >
                        <Send className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
