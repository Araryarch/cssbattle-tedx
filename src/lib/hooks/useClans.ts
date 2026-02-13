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

export function useClanChat(clanId: string | null) {
  const [messages, setMessages] = useState<ClanMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!clanId) return;

    const eventSource = new EventSource(`/api/clans/${clanId}`);

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
  }, [clanId]);

  const sendMessage = async (content: string) => {
    if (!clanId || !content.trim()) return;

    try {
      await api.post(`/clans/${clanId}`, {
        clanId,
        content: content.trim(),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return { messages, isConnected, sendMessage };
}
