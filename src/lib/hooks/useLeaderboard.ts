import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
};

type LeaderboardEntry = {
  userId: string;
  name: string | null;
  image: string | null;
  totalScore: number;
  battlesPlayed: number;
};

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: leaderboardKeys.all,
    queryFn: async () => {
      const { data } = await api.get("/leaderboard");
      return data.leaderboard;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refresh every 30s for near-realtime
  });
}
