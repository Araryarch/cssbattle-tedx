import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export const adminKeys = {
  contests: ["admin", "contests"] as const,
  challenges: ["admin", "challenges"] as const,
};

// Admin contests
export function useAdminContests() {
  return useQuery({
    queryKey: adminKeys.contests,
    queryFn: async () => {
      const { data } = await api.get("/admin/contests");
      return data.contests;
    },
    staleTime: 1000 * 30,
  });
}

// Admin challenges (including hidden)
export function useAdminChallenges() {
  return useQuery({
    queryKey: adminKeys.challenges,
    queryFn: async () => {
      const { data } = await api.get("/admin/challenges");
      return data.challenges;
    },
    staleTime: 1000 * 30,
  });
}

// Delete challenge 
export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: string) => {
      const { data } = await api.delete(`/admin/challenges/${challengeId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.challenges });
    },
  });
}

// Delete contest
export function useDeleteContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contestId: string) => {
      const { data } = await api.delete(`/admin/contests/${contestId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.contests });
    },
  });
}
