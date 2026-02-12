import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────
export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isVerified?: boolean;
  role?: "admin" | "user" | null;
};

// ─── API Functions ───────────────────────────────────────
const fetchCurrentUser = async (): Promise<User | null> => {
  const { data } = await api.get("/auth/me");
  return data.user ?? null;
};

const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<any> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<any> => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

// ─── Query Keys ──────────────────────────────────────────
export const authKeys = {
  user: ["auth", "user"] as const,
};

// ─── Hooks ───────────────────────────────────────────────

/**
 * Fetch currently authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user, null);
      queryClient.clear();
    },
  });
}
