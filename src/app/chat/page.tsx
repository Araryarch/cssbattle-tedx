"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, User, ArrowLeft, MoreVertical } from "lucide-react";
import { useChat, useConversations } from "@/lib/hooks/useChat";
import { useUser } from "@/components/UserProvider";
import Link from "next/link";

export default function ChatPage() {
  const { user } = useUser();
  const { conversations, refetch } = useConversations();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showConversations, setShowConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage } = useChat(selectedUserId, user);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedUserId) return;
    sendMessage(message);
    setMessage("");
    refetch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Messages</h1>
        <p className="text-white/40">Sign in to view your messages</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 h-[calc(100vh-64px)]">
      <div className="h-full flex rounded-xl border border-white/10 bg-neutral-900 overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/5">
            <h1 className="text-xl font-bold text-white">Messages</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-white/30">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No conversations yet</p>
                <Link href="/socials" className="text-primary text-sm hover:underline mt-2 inline-block">
                  Find users to chat with
                </Link>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedUserId(conv.userId);
                    setSelectedUserName(conv.name);
                    setShowConversations(false);
                  }}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 ${
                    selectedUserId === conv.userId ? "bg-white/5" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {conv.image ? (
                      <img src={conv.image} alt={conv.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-white truncate">{conv.name || "Unnamed User"}</p>
                    <p className="text-xs text-white/40 truncate">{conv.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="md:hidden p-1 hover:bg-white/5 rounded"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <Link href={`/profile/${selectedUserId}`} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                    <User className="w-4 h-4 text-white/30" />
                  </div>
                  <span className="font-medium text-white">{selectedUserName || "Chat"}</span>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isOwn = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
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

              <div className="p-4 border-t border-white/5">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="p-3 bg-primary rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/30">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
