import React, { FormEvent, useRef, useState, useEffect } from "react";
import { Hash, Bell, Search, Plus, Send } from "lucide-react";
import { ChatMessage } from "./ChatMessage";

interface ChatInterfaceProps {
  currentChat: {
    messages: any[];
    send: (content: string) => Promise<void>;
    title: string;
    description?: string;
  };
  user: any;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentChat, user }) => {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || !currentChat) return;
    const content = messageInput;
    setMessageInput(""); // Optimistic clear
    await currentChat.send(content);
  };

  return (
    <>
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-950 z-10 w-full flex-shrink-0">
        <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-zinc-500" />
            <div>
              <div className="font-bold font-mono text-white text-sm uppercase tracking-wide">
                {currentChat?.title || "Unknown_Signal"}
              </div>
              {currentChat?.description && <div className="text-[10px] font-mono text-zinc-500 hidden md:block">{currentChat.description}</div>}
            </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
            <Bell className="w-4 h-4 cursor-pointer hover:text-white" />
            <div className="w-px h-4 bg-zinc-800" />
            <Search className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-zinc-950 pb-4">
        {(!currentChat?.messages || currentChat.messages.length === 0) ? (
          <div className="mt-auto px-8 mb-8">
            <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center mb-4 bg-black">
              <Hash className="w-8 h-8 text-zinc-500" />
            </div>
            <h1 className="text-2xl font-bold font-mono text-white mb-2 uppercase">Welcome to {currentChat?.title}</h1>
            <p className="text-zinc-500 font-mono text-sm max-w-md">This is the start of your encrypted transmission history.</p>
          </div>
        ) : (
          <div className="mt-auto flex flex-col justify-end min-h-0">
            {currentChat?.messages.map((msg: any, i: number) => (
              <ChatMessage key={msg.id || i} msg={msg} isOwn={msg.senderId === user.id} user={user} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-950 border-t border-white/10 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="relative bg-zinc-900 border border-white/10 focus-within:border-primary transition-colors">
          <div className="flex items-center px-4 py-2 border-b border-white/5 gap-2">
            <button type="button" className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <div className="flex-1" />
          </div>

          <textarea
            autoFocus
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              e.target.style.height = 'auto'; // Reset height
              e.target.style.height = e.target.scrollHeight + 'px'; // Set to scrollHeight
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Message ${currentChat?.title}`}
            rows={1}
            className="w-full bg-transparent text-white font-mono text-sm px-4 py-3 focus:outline-none placeholder:text-zinc-600 resize-none overflow-hidden min-h-[44px] max-h-[300px]"
          />
          
          <div className="absolute right-3 bottom-3">
            {messageInput.trim().length > 0 && (
              <button type="submit" className="p-2 bg-primary text-white rounded-full hover:bg-red-600 transition-colors">
                <Send className="w-3 h-3" />
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};
