"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RegisterResultForm } from "@/lib/schemas";

interface RegisterResultPayload extends RegisterResultForm {
  athleteWorkoutId: string;
}

export function useRegisterResult(athleteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterResultPayload) =>
      api.post("/api/workout-results", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-workout", athleteId] });
    },
  });
}
