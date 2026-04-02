"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TodayWorkout } from "@/lib/schemas";

export function useTodayWorkout() {
  return useQuery<TodayWorkout>({
    queryKey: ["today-workout"],
    queryFn:  () => api.get<TodayWorkout>("/api/athlete-workouts/today/me"),
    retry:    false,
  });
}
