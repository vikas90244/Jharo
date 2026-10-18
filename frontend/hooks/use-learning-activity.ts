"use client";

import { useQuery } from "@tanstack/react-query";
import { getLearningActivity, getLearningActivityDay, localDateString } from "@/lib/feature/activity";

export const LEARNING_ACTIVITY_QUERY_KEY = (year: number) => ["learning-activity", year];

export function useLearningActivity(year: number) {
  return useQuery({
    queryKey: LEARNING_ACTIVITY_QUERY_KEY(year),
    queryFn: () => getLearningActivity(year, localDateString()),
  });
}

export function useLearningActivityDay(day: string | null) {
  return useQuery({
    queryKey: ["learning-activity-day", day],
    queryFn: () => getLearningActivityDay(day as string),
    enabled: Boolean(day),
  });
}
