import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { UserAvatar } from "./UserAvatar";

interface ChatMessageProps {
  msg: {
    id: string;
    senderId: string;
    senderName?: string | null;
    senderImage?: string | null;
    senderRank?: string | null;
    content: string;
    createdAt?: string;
  };
  isOwn: boolean;
  user: any; // Ideally replace with proper User type
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ msg, isOwn, user }) => (
  <div className={`group flex gap-4 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0`}>
    <div className="mt-0.5 cursor-pointer">
      <UserAvatar src={msg.senderImage} name={msg.senderName} className="w-10 h-10" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-zinc-200 font-bold font-mono hover:underline cursor-pointer">
          {msg.senderName || "Unknown"}
        </span>
        {msg.senderRank === "dev" && (
          <span className="px-1 py-0.5 bg-primary text-white text-[10px] font-bold font-mono uppercase tracking-wider">
            DEV
          </span>
        )}
        <span className="text-zinc-600 text-xs font-mono">
          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
        </span>
      </div>
      <div className={`text-zinc-300 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words ${
        msg.senderRank === "dev" ? "text-primary-foreground" : ""
      }`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />,
            a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
            code: ({node, inline, className, children, ...props}: any) => {
               return inline ? 
                <code className="bg-white/5 px-1 py-0.5 text-xs font-mono text-primary border border-primary/20" {...props}>{children}</code> :
                <code className="block bg-black p-3 text-xs font-mono text-zinc-300 overflow-x-auto my-2 border border-white/10" {...props}>{children}</code>
            }
          }}
        >
          {msg.content}
        </ReactMarkdown>
      </div>
    </div>
  </div>
);
