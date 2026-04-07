"use client";

import { useState } from "react";
import type { AiWod } from "@/lib/schemas";
import { ResultForm } from "./result-form";
import type { WorkoutResultResponse } from "@/hooks/use-register-result";

// ── Helpers ───────────────────────────────────────────────────────────────────

const INTENSITY_COLOR: Record<string, string> = {
  low:      "text-blue-400   border-blue-400/30   bg-blue-400/10",
  moderate: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  high:     "text-red-400    border-red-400/30    bg-red-400/10",
  deload:   "text-zinc-400   border-zinc-400/30   bg-zinc-400/10",
};

const INTENSITY_LABEL: Record<string, string> = {
  low:      "Baja",
  moderate: "Moderada",
  high:     "Alta",
  deload:   "Deload",
};

// ── Sección con icono ─────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  content,
  accent = false,
}: {
  icon: string;
  title: string;
  content: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 space-y-2 ${
        accent
          ? "border border-orange-500/30 bg-orange-500/5"
          : "border border-zinc-800 bg-zinc-800/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {title}
        </h3>
      </div>
      <p className="text-sm text-zinc-200 whitespace-pre-line leading-relaxed">{content}</p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

function detectWodType(metcon?: string | null): string {
  const text = (metcon ?? "").toUpperCase();
  if (text.includes("FOR TIME") || text.includes("FOR-TIME")) return "ForTime";
  if (text.includes("EMOM"))                                   return "Emom";
  return "Amrap"; // default
}

interface AiWodCardProps {
  wod: AiWod;
  athleteWorkoutId?: number;
}

export function AiWodCard({ wod, athleteWorkoutId }: AiWodCardProps) {
  const [showForm, setShowForm]     = useState(false);
  const [result, setResult]         = useState<WorkoutResultResponse | null>(null);
  const intensityKey   = wod.intensity ?? "moderate";
  const intensityClass = INTENSITY_COLOR[intensityKey] ?? INTENSITY_COLOR.moderate;
  const wodType        = detectWodType(wod.metcon);

  function handleSuccess(r: WorkoutResultResponse) {
    setResult(r);
    setShowForm(false);
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p-6 border-b border-zinc-800 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
              📅 WOD del día
            </p>
            <h2 className="text-2xl font-bold text-zinc-50">{wod.title}</h2>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${intensityClass}`}>
              {INTENSITY_LABEL[intensityKey] ?? intensityKey}
            </span>
            <span className="text-xs text-zinc-500">{wod.durationMinutes} min</span>
          </div>
        </div>

        {/* Objetivo */}
        {wod.focus && (
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <span className="text-sm text-zinc-300">
              Foco: <span className="font-semibold text-orange-400">{wod.focus?.toLowerCase()}</span>
            </span>
          </div>
        )}

        {/* Alerta si existe */}
        {wod.alert && (
          <div className="flex gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <span className="text-base shrink-0">⚠️</span>
            <p className="text-xs text-yellow-300 leading-relaxed">{wod.alert}</p>
          </div>
        )}
      </div>

      {/* ── Secciones ──────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-4">

        {wod.warmUp && (
          <Section icon="🔥" title="Warm-up" content={wod.warmUp} />
        )}

        {wod.strengthSkill && (
          <Section icon="🏋️" title="Strength / Skill" content={wod.strengthSkill} />
        )}

        {wod.metcon && (
          <Section icon="⚡" title="WOD" content={wod.metcon} accent />
        )}

        {wod.scaling && (
          <Section icon="📊" title="Escalado · RX · RX+" content={wod.scaling} />
        )}

        {wod.coolDown && (
          <Section icon="🧘" title="Cooldown" content={wod.coolDown} />
        )}

        {wod.coachNotes && (
          <Section icon="🧠" title="Análisis del coach" content={wod.coachNotes} />
        )}

        {wod.nutritionTip && (
          <div className="flex gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <span className="text-lg shrink-0">🥗</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-1">
                Recomendación nutricional
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{wod.nutritionTip}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Registro de resultado ───────────────────────────────────────────── */}
      {athleteWorkoutId && (
        <div className="border-t border-zinc-800 p-6">
          {result ? (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span>💬</span>
                <p className="text-sm font-semibold text-zinc-300">Resultado registrado</p>
              </div>
              <p className="text-sm text-zinc-400">{result.factorMessage}</p>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-xs text-zinc-500">Próximo WOD:</span>
                <span className="text-lg font-bold text-orange-400">
                  {Math.round(result.newScaledRepsFactor * 100)}%
                </span>
                <span className="text-xs text-zinc-500">del volumen base</span>
              </div>
            </div>
          ) : !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-lg border border-orange-500/50 px-4 py-3 text-sm font-semibold text-orange-400 hover:bg-orange-500/10 transition-colors"
            >
              💬 Registrar resultado
            </button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-300">¿Cómo fue el WOD?</h3>
              <ResultForm
                athleteWorkoutId={athleteWorkoutId}
                wodType={wodType}
                onSuccess={handleSuccess}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
