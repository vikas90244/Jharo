"use client";

import { createContext, useContext, useEffect, ReactNode, useRef } from "react";
import { CURRENT_USER_QUERY_KEY, useCurrentUser, useRefreshToken } from "@/hooks/use-auth";
import type { User } from "@/lib/feature/auth";
import { ApiError } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useCurrentUser();
  const { mutate: refreshToken } = useRefreshToken();
  const queryClient = useQueryClient();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    refreshIntervalRef.current = setInterval(() => {
      refreshToken(undefined, {
        onError: (refreshError) => {
          if (refreshError instanceof ApiError && refreshError.status === 401) {
            queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
            queryClient.removeQueries({ queryKey: ["resources"] });
            queryClient.removeQueries({ queryKey: ["resource-pages"] });
          }
        },
      });
    }, 4 * 60 * 1000); // 4 minutes

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [error, isLoading, queryClient, refreshToken, user]);

  const hasUnresolvedAuthError = !!error && user === undefined;

  const value: AuthContextType = {
    user: user || null,
    isLoading: isLoading || hasUnresolvedAuthError,
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
