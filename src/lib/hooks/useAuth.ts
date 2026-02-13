import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

// ─── Types ───────────────────────────────────────────────
export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isVerified?: boolean;
  role?: "admin" | "user" | null;
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
  const { data: session, isPending, error } = authClient.useSession();
  
  return {
    data: session?.user ? { 
        ...session.user, 
        role: (session.user as any).role || "user" 
    } : null,
    isLoading: isPending,
    error,
    refetch: async () => {}, // Better Auth handles revalidation
  };
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
        const { data, error } = await authClient.signIn.email({
            email: credentials.email,
            password: credentials.password,
        });
        if (error) throw error;
        return data;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: authKeys.user }); // Not needed with useSession
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (userData: { name: string; email: string; password: string }) => {
        const { data, error } = await authClient.signUp.email({
            email: userData.email,
            password: userData.password,
            name: userData.name,
        });
        if (error) throw error;
        return data;
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
        await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user, null);
      queryClient.clear();
      // Force reload or redirect might be needed
      window.location.href = "/login";
    },
  });
}
