import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export type Clan = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  image: string | null;
  role: string;
};

export type ClanMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string;
  senderImage?: string;
  isPending?: boolean;
};

export function useClans() {
  const [clans, setClans] = useState<Clan[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["clans"],
    queryFn: async () => {
      const { data } = await api.get("/clans");
      return data;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (data) {
      setClans(data.clans || []);
    }
  }, [data]);

  const createClan = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data } = await api.post("/clans", { name, description });
      return data;
    },
    onSuccess: () => refetch(),
  });

  const joinClan = useMutation({
    mutationFn: async (clanId: string) => {
      const { data } = await api.put("/clans", { clanId, action: "join" });
      return data;
    },
    onSuccess: () => refetch(),
  });

  const leaveClan = useMutation({
    mutationFn: async (clanId: string) => {
      const { data } = await api.put("/clans", { clanId, action: "leave" });
      return data;
    },
    onSuccess: () => refetch(),
  });

  return {
    clans,
    isLoading,
    createClan,
    joinClan,
    leaveClan,
    refetch,
  };
}

export function useClanChat(clanId: string | null, user: any) {
  const [messages, setMessages] = useState<ClanMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!clanId) return;

    const eventSource = new EventSource(`/api/clans/${clanId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "init") {
          setMessages(data.messages || []);
        } else if (data.type === "update") {
          setMessages((prev) => {
             const existingIds = new Set(prev.map(m => m.id));
             const newMsgs = data.messages.filter((m: ClanMessage) => !existingIds.has(m.id));
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
  }, [clanId]);

  const sendMessage = async (content: string) => {
    if (!clanId || !content.trim()) return;

    // 1. Optimistic Update
    const tempId = crypto.randomUUID();
    const optimisticMsg: ClanMessage = {
      id: tempId,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      senderName: user.name,
      senderImage: user.image,
      isPending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 2. Server Request
      const res = await api.post(`/clans/${clanId}`, {
        clanId,
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
