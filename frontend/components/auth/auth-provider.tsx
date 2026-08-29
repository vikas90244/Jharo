"use client";

import { createContext, useContext, useEffect, ReactNode, useRef } from "react";
import { useCurrentUser, useRefreshToken } from "@/hooks/use-auth";
import type { User } from "@/lib/feature/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error, refetch } = useCurrentUser();
  const refreshMutation = useRefreshToken();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-refresh token every 4 minutes (JWT access token usually expires in 5 minutes)
  useEffect(() => {
    if (!user) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    refreshIntervalRef.current = setInterval(() => {
      refreshMutation.mutate(undefined, {
        onSuccess: () => {
          // Refetch user data after successful token refresh
          refetch();
        },
      });
    }, 4 * 60 * 1000); // 4 minutes

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user, refreshMutation, refetch]);

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
