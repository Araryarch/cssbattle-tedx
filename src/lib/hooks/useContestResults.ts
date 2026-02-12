import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const contestResultsKeys = {
  results: (id: string) => ["contest", id, "results"] as const,
};

type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  userImage: string | null;
  totalScore: number;
  challengesCompleted: number;
  lastSubmissionTime: string;
};

type ContestResultsData = {
  contest: {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    isActive: boolean;
  };
  totalChallenges: number;
  leaderboard: LeaderboardEntry[];
};

export function useContestResults(contestId: string) {
  return useQuery<ContestResultsData>({
    queryKey: contestResultsKeys.results(contestId),
    queryFn: async () => {
      const { data } = await api.get(`/contests/${contestId}/results`);
      return data;
    },
    enabled: !!contestId,
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 15, // Refetch every 15s for live results
  });
}
