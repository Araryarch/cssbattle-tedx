import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────
export type LiveUser = {
  id: string;
  name: string;
  avatar: string;
  currentChallenge: string;
  status: "coding" | "idle" | "submitted";
  lastActive: Date;
};

// ─── API Functions ───────────────────────────────────────
const fetchLiveUsers = async (): Promise<LiveUser[]> => {
  const { data } = await api.get("/admin/live");
  return data.users;
};

// ─── Query Keys ──────────────────────────────────────────
export const liveKeys = {
  users: ["live", "users"] as const,
};

// ─── Hooks ───────────────────────────────────────────────

/**
 * Fetch live/active users with auto-refresh every 5 seconds
 */
export function useLiveUsers() {
  return useQuery({
    queryKey: liveKeys.users,
    queryFn: fetchLiveUsers,
    refetchInterval: 5000, // Auto-refetch every 5 seconds
    staleTime: 3000,
  });
}
