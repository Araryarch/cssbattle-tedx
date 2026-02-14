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
  isPending?: boolean;
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
            if (newMsgs.length === 0) return prev;
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
    // 1. Optimistic Update
    const tempId = crypto.randomUUID();
    const optimisticMsg: GlobalMessage = {
      id: tempId,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      senderName: user.name,
      senderImage: user.image,
      senderRank: user.rank,
      isPending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 2. Server Request
      const res = await api.post("/global-chat", { content });
      const realMsg = res.data.message;

      // 3. Reconciliation (Swap tempId -> realId)
      setMessages((prev) => {
        // Check if the real message already arrived via SSE (race condition)
        const alreadyExists = prev.some((m) => m.id === realMsg.id);
        
        if (alreadyExists) {
          // If SSE beat us to it, just remove the pending message
          return prev.filter((m) => m.id !== tempId);
        }

        // Otherwise, swap the pending message with the real one
        return prev.map((m) => 
          m.id === tempId 
            ? { ...realMsg, senderName: user.name, senderImage: user.image, senderRank: user.rank } // Merge sender info as API might strictly return DB message
            : m
        );
      });
    } catch (e) {
      console.error("Failed to send:", e);
      // Revert optimistic update on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return { messages, isConnected, sendMessage };
}
