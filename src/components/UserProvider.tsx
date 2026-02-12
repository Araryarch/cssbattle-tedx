"use client";

import { createContext, useContext } from "react";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/lib/hooks/useAuth";

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
  const { data: user, isLoading, refetch } = useCurrentUser();
  const queryClient = useQueryClient();

  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.user });
  };

  return (
    <UserContext.Provider
      value={{
        user: user ?? null,
        loading: isLoading,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
