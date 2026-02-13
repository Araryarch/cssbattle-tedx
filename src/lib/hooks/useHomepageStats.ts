import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────
type HomepageStats = {
  activeContest: {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    isActive: boolean;
  } | null;
  topScore: number;
};

// ─── API Functions ───────────────────────────────────────
const fetchHomepageStats = async (): Promise<HomepageStats> => {
  const { data } = await api.get("/homepage-stats");
  return data;
};

// ─── Query Keys ──────────────────────────────────────────
export const homepageKeys = {
  stats: ["homepage", "stats"] as const,
};

// ─── Hooks ───────────────────────────────────────────────

/**
 * Fetch homepage stats (active contest + top score)
 */
export function useHomepageStats() {
  return useQuery({
    queryKey: homepageKeys.stats,
    queryFn: fetchHomepageStats,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
