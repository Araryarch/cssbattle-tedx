import { useState, useEffect } from "react";
import api from "@/lib/axios";

export type GlobalMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string | null;
  senderImage?: string | null;
  senderRank?: string | null;
};

export function useGlobalChat(user: any) {
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;
    const eventSource = new EventSource("/api/global-chat");
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "init") {
          setMessages(data.messages || []);
        } else if (data.type === "update") {
          setMessages((prev) => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = data.messages.filter((m: GlobalMessage) => !existingIds.has(m.id));
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
  }, [user]);

  const sendMessage = async (content: string) => {
    await api.post("/global-chat", { content });
  };

  return { messages, isConnected, sendMessage };
}
