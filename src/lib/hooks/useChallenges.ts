import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────
export type Challenge = {
  id: string;
  title: string;
  difficulty: string;
  colors: string[];
  defaultCode: string | null;
  targetCode: string | null;
  imageUrl: string | null;
  description: string | null;
  tips: string[];
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DisplayChallenge = Omit<Challenge, "difficulty"> & {
  difficulty: "Easy" | "Medium" | "Hard";
  players: number;
  previewUrl: string;
};

// ─── API Functions ───────────────────────────────────────
const fetchChallenges = async (): Promise<Challenge[]> => {
  const { data } = await api.get("/challenges");
  return data;
};

// ─── Query Keys ──────────────────────────────────────────
export const challengeKeys = {
  all: ["challenges"] as const,
  list: () => [...challengeKeys.all, "list"] as const,
  detail: (id: string) => [...challengeKeys.all, "detail", id] as const,
};

// ─── Hooks ───────────────────────────────────────────────

/**
 * Fetch all visible challenges
 */
export function useChallenges() {
  return useQuery({
    queryKey: challengeKeys.list(),
    queryFn: fetchChallenges,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data): DisplayChallenge[] =>
      data.map((c) => ({
        ...c,
        difficulty: c.difficulty as "Easy" | "Medium" | "Hard",
        players: 0,
        previewUrl: c.imageUrl || `/api/target/${c.id}`,
      })),
  });
}
