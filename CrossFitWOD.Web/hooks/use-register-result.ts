"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RegisterResultForm } from "@/lib/schemas";

interface RegisterResultPayload extends RegisterResultForm {
  athleteWorkoutId: number;
}

export interface WorkoutResultResponse {
  id:                  number;
  athleteWorkoutId:    number;
  completed:           boolean;
  timeSeconds:         number | null;
  rounds:              number | null;
  rpe:                 number;
  createdAt:           string;
  newScaledRepsFactor: number;
  factorChanged:       boolean;
  factorMessage:       string;
}

export function useRegisterResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterResultPayload) =>
      api.post<WorkoutResultResponse>("/api/workout-results", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-workout"] });
    },
  });
}
