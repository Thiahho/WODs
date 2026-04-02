"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface HistoryEntry {
  date:             string;
  wodTitle:         string;
  wodType:          string;
  scaledRepsFactor: number;
  completed:        boolean;
  timeSeconds:      number | null;
  rounds:           number | null;
  rpe:              number;
}

export function useHistory(skip = 0) {
  return useQuery<HistoryEntry[]>({
    queryKey: ["history", skip],
    queryFn:  () => api.get<HistoryEntry[]>(`/api/athlete-workouts/history?skip=${skip}`),
    retry:    false,
  });
}
