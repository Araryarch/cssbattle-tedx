"use client";

import { createContext, useContext } from "react";
import { useCurrentUser } from "@/lib/hooks/useAuth"; 
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/lib/hooks/useAuth";
import { authClient } from "@/lib/auth-client";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isVerified?: boolean;
  role?: "admin" | "user" | null;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();
  const queryClient = useQueryClient();

  const refreshUser = async () => {
     // Better Auth handles auto-refresh, but we can structure this to match context type 
     // or force a re-fetch if supported by the client in future
  };

  return (
    <UserContext.Provider
      value={{
        user: session?.user ? { 
            ...session.user, 
            role: (session.user as any).role || "user"
        } : null,
        loading: isPending,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
