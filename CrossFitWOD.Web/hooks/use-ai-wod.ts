"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { AiWodSchema, type AiWod } from "@/lib/schemas";

export function useAiWod() {
  const [data, setData]         = useState<AiWod | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<Error | null>(null);

  async function fetchToday() {
    setLoading(true);
    setError(null);
    try {
      const raw = await api.get<unknown>("/api/wod/today");
      if (raw) {
        setData(AiWodSchema.parse(raw));
      } else {
        setData(null);
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const raw = await api.post<unknown>("/api/wod/generate", {});
      setData(AiWodSchema.parse(raw));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  return { data, isLoading, error, fetchToday, generate };
}
