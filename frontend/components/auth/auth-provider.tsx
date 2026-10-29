"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCurrentUser } from "@/hooks/use-auth";
import type { User } from "@/lib/feature/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useCurrentUser();

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
