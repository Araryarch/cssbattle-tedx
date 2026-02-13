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
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
