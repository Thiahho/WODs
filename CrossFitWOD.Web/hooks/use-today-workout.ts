"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TodayWorkout } from "@/lib/schemas";

export function useTodayWorkout(athleteId: string) {
  return useQuery<TodayWorkout>({
    queryKey: ["today-workout", athleteId],
    queryFn:  () => api.get<TodayWorkout>(`/api/athlete-workouts/today/${athleteId}`),
    enabled:  !!athleteId,
    retry:    false,
  });
}
