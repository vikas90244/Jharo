"use client"

import { useMutation, useQuery, useQueryClient,
} from "@tanstack/react-query"

import { login, getCurrentUser, register, verifyEmail, refreshToken, logout
} from "@/lib/feature/auth"

import type { LoginPayload, RegisterPayload , VerifyEmailPayload} from "@/lib/feature/auth"
import { useRouter } from "next/navigation"
import { ApiError } from "@/lib/api"

export const CURRENT_USER_QUERY_KEY = [
  "current-user",
];

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginPayload) =>
      login(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
      });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,

    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        // api() has already attempted one refresh and retried the request.
        // A remaining 401 means the session is no longer valid.
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },

    retry: false,
    
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterPayload) =>
      register(data),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: VerifyEmailPayload) =>
      verifyEmail(data),
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: refreshToken,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: ["resources"] });
      queryClient.removeQueries({ queryKey: ["resource-pages"] });
      router.replace("/login");
    },
  });
}
