import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
  senderImage?: string;
  isPending?: boolean;
};

export type Conversation = {
  id: string;
  userId: string;
  name: string | null;
  image: string | null;
  email: string;
  lastMessageAt: string;
};

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/chat");
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, isLoading, refetch: fetchConversations };
}

export function useChat(otherUserId: string | null, user: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!otherUserId) return;

    const eventSource = new EventSource(`/api/chat/${otherUserId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "init") {
          setMessages(data.messages || []);
        } else if (data.type === "update") {
          setMessages((prev) => {
             const existingIds = new Set(prev.map(m => m.id));
             const newMsgs = data.messages.filter((m: Message) => !existingIds.has(m.id));
             if (newMsgs.length === 0) return prev;
             return [...prev, ...newMsgs];
          });
        }
      } catch (e) {
        console.error("SSE Parse error", e);
      }
    };

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [otherUserId]);

  const sendMessage = async (content: string) => {
    if (!otherUserId || !content.trim()) return;

    // 1. Optimistic Update
    const tempId = crypto.randomUUID();
    const optimisticMsg: Message = {
      id: tempId,
      senderId: user.id,
      receiverId: otherUserId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      senderName: user.name,
      senderImage: user.image,
      isPending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 2. Server Request
      const res = await api.post("/chat", {
        receiverId: otherUserId,
        content: content.trim(),
      });
      const realMsg = res.data.message;

      // 3. Reconciliation
      setMessages((prev) => {
         const alreadyExists = prev.some((m) => m.id === realMsg.id);
         if (alreadyExists) {
             return prev.filter((m) => m.id !== tempId);
         }
         return prev.map((m) => 
            m.id === tempId 
             ? { ...realMsg, senderName: user.name, senderImage: user.image }
             : m
         );
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return { messages, isConnected, sendMessage };
}
