"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export interface DailyLogPayload {
  energyLevel:  number;
  fatigueLevel: number;
  sleepHours:   number | null;
  notes:        string | null;
  painNotes:    string | null;
  mentalState:  string | null;
}

export function useDailyLog() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setLoading]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function checkToday(): Promise<boolean> {
    try {
      const res = await api.get<unknown>("/api/athlete-daily-logs/today");
      return res !== undefined && res !== null;
    } catch {
      return false;
    }
  }

  async function submit(payload: DailyLogPayload) {
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/athlete-daily-logs", payload);
      setSubmitted(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return { submitted, isLoading, error, submit, checkToday, setSubmitted };
}
