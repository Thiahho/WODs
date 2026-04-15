"use client";

import { useState } from "react";
import type { TodayWorkout } from "@/lib/schemas";
import type { WorkoutResultResponse } from "@/hooks/use-register-result";
import { ScalingBadge } from "./scaling-badge";
import { ResultForm } from "./result-form";

const WOD_TYPE_LABEL: Record<string, string> = {
  ForTime: "For Time",
  Amrap:   "AMRAP",
  Emom:    "EMOM",
};

function factorLabel(factor: number): string {
  if (factor <= 0.6) return "muy reducido";
  if (factor <= 0.8) return "reducido";
  if (factor <= 1.1) return "estándar (Rx)";
  if (factor <= 1.3) return "por encima del Rx";
  return "alta intensidad";
}

interface WorkoutCardProps {
  workout: TodayWorkout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const [showForm, setShowForm]   = useState(false);
  const [nextFactor, setNextFactor] = useState<number | null>(null);
  const [reason, setReason]       = useState<string>("");

  const { wod } = workout.workoutSession;
  const factor  = workout.scaledRepsFactor;

  function handleSuccess(result: WorkoutResultResponse) {
    setNextFactor(result.newScaledRepsFactor);
    setReason(result.factorMessage);
    setShowForm(false);
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-50">{wod.title}</h2>
          <p className="mt-0.5 text-sm text-zinc-400">{wod.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
          {WOD_TYPE_LABEL[wod.type] ?? wod.type} · {wod.durationMinutes} min
        </span>
      </div>

      {/* Scaling factor */}
      <ScalingBadge factor={nextFactor ?? factor} />

      {/* Exercises */}
      <ul className="space-y-2">
        {wod.exercises
          .sort((a, b) => a.order - b.order)
          .map((ex) => {
            const scaledReps = Math.round(ex.reps * factor);
            return (
              <li
                key={ex.id}
                className="flex items-center justify-between rounded-lg bg-zinc-800/60 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-zinc-200">{ex.name}</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-orange-400">{scaledReps}</span>
                  {factor !== 1 && (
                    <span className="ml-1.5 text-xs text-zinc-500 line-through">{ex.reps}</span>
                  )}
                  <span className="ml-1 text-xs text-zinc-500">reps</span>
                </div>
              </li>
            );
          })}
      </ul>

      {/* Estados del resultado */}
      {nextFactor !== null ? (
        <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-3">
          <p className="text-sm text-zinc-300">{reason}</p>
          <div className="border-t border-zinc-700 pt-3 flex items-baseline justify-between">
            <span className="text-xs text-zinc-500">Tu próximo WOD</span>
            <div className="text-right">
              <span className="text-lg font-bold text-orange-400">
                {Math.round(nextFactor * 100)}%
              </span>
              <span className="ml-1.5 text-sm text-zinc-400">del volumen base</span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 capitalize">{factorLabel(nextFactor)}</p>
        </div>
      ) : !showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border border-orange-500/50 px-4 py-3.5 text-sm font-semibold text-orange-400 hover:bg-orange-500/10 active:bg-orange-500/10 transition-colors"
        >
          Registrar resultado
        </button>
      ) : (
        <div className="border-t border-zinc-800 pt-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">¿Cómo fue el WOD?</h3>
          <ResultForm
            athleteWorkoutId={workout.id}
            wodType={wod.type}
            onSuccess={handleSuccess}
          />
        </div>
      )}
    </div>
  );
}
