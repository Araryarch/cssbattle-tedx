import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────
export type Contest = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContestWithChallenges = Contest & {
  challenges: ContestChallenge[];
};

export type ContestChallenge = {
  id: string;
  title: string;
  difficulty: string;
  imageUrl: string | null;
  targetCode: string | null;
  description: string | null;
  colors: string[];
  defaultCode: string | null;
  tips: string[];
  order: number;
};

// ─── API Functions ───────────────────────────────────────
const fetchActiveContests = async (): Promise<Contest[]> => {
  const { data } = await api.get("/contests");
  return data;
};

const fetchContestById = async (id: string): Promise<ContestWithChallenges> => {
  const { data } = await api.get(`/contests/${id}`);
  return data;
};

// ─── Query Keys ──────────────────────────────────────────
export const contestKeys = {
  all: ["contests"] as const,
  active: () => [...contestKeys.all, "active"] as const,
  detail: (id: string) => [...contestKeys.all, "detail", id] as const,
};

// ─── Hooks ───────────────────────────────────────────────

/**
 * Fetch all active contests
 */
export function useActiveContests() {
  return useQuery({
    queryKey: contestKeys.active(),
    queryFn: fetchActiveContests,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });
}

/**
 * Fetch a single contest by ID with its challenges
 */
export function useContest(id: string) {
  return useQuery({
    queryKey: contestKeys.detail(id),
    queryFn: () => fetchContestById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });
}
