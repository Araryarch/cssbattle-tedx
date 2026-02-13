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

export function useChat(otherUserId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!otherUserId) return;

    const eventSource = new EventSource(`/api/chat/${otherUserId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "init" || data.type === "update") {
        setMessages(data.messages);
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

    try {
      await api.post("/chat", {
        receiverId: otherUserId,
        content: content.trim(),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return { messages, isConnected, sendMessage };
}
