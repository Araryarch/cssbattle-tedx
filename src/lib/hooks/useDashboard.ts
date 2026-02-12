import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: ["dashboard", "stats"] as const,
};

type DashboardSubmission = {
  id: string;
  challengeId: string;
  score: string;
  accuracy: string;
  createdAt: string;
};

type DashboardContest = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
};

type DashboardData = {
  stats: {
    totalScore: string;
    avgAccuracy: string;
    uniqueChallenges: number;
    totalSubmissions: number;
  };
  recentSubmissions: DashboardSubmission[];
  activeContests: DashboardContest[];
};

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: dashboardKeys.stats,
    queryFn: async () => {
      const { data } = await api.get("/dashboard");
      return data;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}
