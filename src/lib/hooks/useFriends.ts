import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export type Friend = {
  id: string;
  status: "pending" | "accepted" | "rejected";
  userId: string;
  name: string | null;
  image: string | null;
  email: string;
  createdAt: string;
};

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Friend[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const { data } = await api.get("/friends");
      return data;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (data) {
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
      setIncomingRequests(data.incomingRequests || []);
    }
  }, [data]);

  const sendRequest = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post("/friends", { userId });
      return data;
    },
    onSuccess: () => refetch(),
  });

  const respondToRequest = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: "accept" | "reject" }) => {
      const { data } = await api.put("/friends", { requestId, action });
      return data;
    },
    onSuccess: () => refetch(),
  });

  const removeFriend = useMutation({
    mutationFn: async (requestId: string) => {
      const { data } = await api.delete(`/friends?id=${requestId}`);
      return data;
    },
    onSuccess: () => refetch(),
  });

  return {
    friends,
    pendingRequests,
    incomingRequests,
    isLoading,
    sendRequest,
    respondToRequest,
    removeFriend,
    refetch,
  };
}
