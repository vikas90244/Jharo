"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyResources, uploadResource, getResourcePages } from "@/lib/feature/library";
import type { UploadResourcePayload } from "@/lib/feature/library";

// QUERY KEYS

export const RESOURCES_QUERY_KEY = ["resources"];
export const RESOURCE_PAGES_QUERY_KEY = (id: string, start: number, end: number) => [
  "resource-pages",
  id,
  start,
  end,
];

// HOOKS

/**
 * Hook to fetch all user's books
 */
export function useMyResources() {
  return useQuery({
    queryKey: RESOURCES_QUERY_KEY,
    queryFn: getMyResources,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to upload a new book
 */
export function useUploadResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadResourcePayload) => uploadResource(payload),
    onSuccess: () => {
      // Invalidate and refetch resources list after successful upload
      queryClient.invalidateQueries({
        queryKey: RESOURCES_QUERY_KEY,
      });
    },
  });
}

/**
 * Hook to fetch pages for a specific resource
 */
export function useResourcePages(resourceId: string, start: number = 0, end: number = 50) {
  return useQuery({
    queryKey: RESOURCE_PAGES_QUERY_KEY(resourceId, start, end),
    queryFn: () => getResourcePages(resourceId, start, end),
    enabled: !!resourceId,
    placeholderData: (previousPages) => previousPages,
    staleTime: 10 * 60 * 1000, 
  });
}

/**
 * Alias for backward compatibility with existing code
 */
export function useGetResourceRange({ id, start = 0, end = 50 }: { id: string; start?: number; end?: number }) {
  return useResourcePages(id, start, end);
}
