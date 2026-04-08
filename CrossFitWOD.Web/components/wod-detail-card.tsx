"use client";

import { useState } from "react";
import Link from "next/link";
import type { TodayWorkout } from "@/lib/schemas";
import { ResultForm } from "./result-form";
import { Chip } from "@/components/ui/chip";
import { PrimaryButton } from "@/components/ui/primary-button";
import type { WorkoutResultResponse } from "@/hooks/use-register-result";
import {
  Flame, Dumbbell, Zap, BarChart2, Wind, Brain, Salad,
  AlertTriangle, Clock, Target, ChevronDown, ChevronRight, Bot, LayoutList,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

type ChipVariant = "high" | "moderate" | "low" | "deload";

const INTENSITY_CHIP: Record<string, ChipVariant> = {
  high: "high", moderate: "moderate", low: "low", deload: "deload",
};
const INTENSITY_LABEL: Record<string, string> = {
  low: "Baja", moderate: "Moderada", high: "Alta", deload: "Deload",
};
const WOD_TYPE_LABEL: Record<string, string> = {
  ForTime: "For Time", Amrap: "AMRAP", Emom: "EMOM",
};

// ── ContentLines ──────────────────────────────────────────────────────────────

function ContentLines({ text, accent }: { text: string; accent: boolean }) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const bullet   = line.match(/^[-•*]\s+(.+)/);
        const numbered = line.match(/^(\d+)[.)]\s+(.+)/);

        if (bullet) return (
          <div key={i} className="flex items-start gap-2">
            <span className={`mt-[3px] text-[9px] shrink-0 ${accent ? "text-brand" : "text-zinc-500"}`}>▸</span>
            <span className={`text-sm leading-snug ${accent ? "text-zinc-100" : "text-zinc-300"}`}>{bullet[1]}</span>
          </div>
        );
        if (numbered) return (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-[10px] font-bold shrink-0 tabular-nums mt-0.5 w-4 text-right ${accent ? "text-brand/70" : "text-zinc-600"}`}>
              {numbered[1]}.
            </span>
            <span className={`text-sm leading-snug ${accent ? "text-zinc-100" : "text-zinc-300"}`}>{numbered[2]}</span>
          </div>
        );
        if (line.endsWith(":")) return (
          <p key={i} className={`text-[10px] font-bold uppercase tracking-widest pt-2 ${accent ? "text-brand/70" : "text-zinc-500"}`}>
            {line.slice(0, -1)}
          </p>
        );
        return (
          <p key={i} className={`text-sm leading-snug ${accent ? "text-zinc-100" : "text-zinc-300"}`}>{line}</p>
        );
      })}
    </div>
  );
}

// ── Section (acordeón) ────────────────────────────────────────────────────────

function Section({ icon: Icon, title, content, accent = false, defaultOpen = false }: {
  icon: React.ElementType;
  title: string;
  content: string;
  accent?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl overflow-hidden border ${accent ? "border-brand/30 bg-brand/5" : "border-surface-border bg-surface"}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${accent ? "bg-brand/20" : "bg-zinc-800"}`}>
            <Icon className={`h-3.5 w-3.5 ${accent ? "text-brand" : "text-zinc-400"}`} strokeWidth={2.5} />
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${accent ? "text-brand" : "text-zinc-400"}`}>
            {title}
          </span>
        </div>
        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? "rotate-90" : ""} ${accent ? "text-brand/50" : "text-zinc-600"}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className={`px-4 pb-4 pt-0.5 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-6"}`}>
            {open && <div className={`mb-3 h-px ${accent ? "bg-brand/20" : "bg-surface-border"}`} />}
            <ContentLines text={content} accent={accent} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ResultSummary ─────────────────────────────────────────────────────────────

function ResultSummary({ factorMessage, nextFactor, label = "Próximo WOD" }: {
  factorMessage: string;
  nextFactor: number;
  label?: string;
}) {
  return (
    <div className="rounded-3xl border border-brand/25 bg-brand/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-brand/20 flex items-center justify-center">
          <Zap className="h-3 w-3 text-brand" />
        </div>
        <p className="text-sm font-semibold text-zinc-200">Resultado registrado</p>
      </div>
      <p className="text-sm text-zinc-400">{factorMessage}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-zinc-500">{label}:</span>
        <span className="text-display text-3xl text-brand glow-text">{Math.round(nextFactor * 100)}%</span>
        <span className="text-xs text-zinc-500">del volumen base</span>
      </div>
    </div>
  );
}

// ── WodDetailCard ─────────────────────────────────────────────────────────────

interface WodDetailCardProps {
  workout: TodayWorkout;
  alert?: string | null;
  nutritionTip?: string | null;
}

export function WodDetailCard({ workout, alert, nutritionTip }: WodDetailCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [liveResult, setLiveResult] = useState<WorkoutResultResponse | null>(null);

  const { wod }      = workout.workoutSession;
  const factor       = workout.scaledRepsFactor;
  const hasExercises = wod.exercises.length > 0;
  const hasSections  = !!(wod.warmUp || wod.strengthSkill || wod.metcon || wod.scaling || wod.coolDown || wod.coachNotes);
  const hasDetail    = hasExercises || hasSections;
  const intensityKey = wod.intensity ?? "";
  const chipVariant  = INTENSITY_CHIP[intensityKey] ?? "moderate";

  function handleSuccess(r: WorkoutResultResponse) {
    setLiveResult(r);
    setShowForm(false);
    setDetailOpen(false); // colapsa el detalle al registrar
  }

  return (
    <div className="space-y-2.5">

      {/* ── Card principal — tappeable para expandir ───────────────────────── */}
      <button
        type="button"
        onClick={() => hasDetail && setDetailOpen(v => !v)}
        className={`w-full text-left relative rounded-3xl border bg-surface overflow-hidden transition-colors ${
          detailOpen ? "border-brand/40" : "border-surface-border"
        } ${hasDetail ? "active:bg-surface-raised" : ""}`}
      >
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="relative p-5 space-y-3">

          {/* Título */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">WOD del día</p>
                {wod.isAiGenerated && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand">
                    <Bot className="h-2.5 w-2.5" /> IA
                  </span>
                )}
              </div>
              <h2 className="text-display text-4xl text-zinc-50 leading-none">{wod.title}</h2>
            </div>

            {/* Chevron expansión + intensidad */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {intensityKey && (
                <Chip variant={chipVariant}>{INTENSITY_LABEL[intensityKey] ?? intensityKey}</Chip>
              )}
              {hasDetail && (
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform duration-300 ${detailOpen ? "rotate-180" : ""}`}
                />
              )}
            </div>
          </div>

          {/* Datos clave */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{wod.durationMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <LayoutList className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{WOD_TYPE_LABEL[wod.type] ?? wod.type}</span>
            </div>
            {wod.focus && (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Target className="h-3.5 w-3.5" />
                <span className="text-xs font-medium capitalize">{wod.focus.toLowerCase()}</span>
              </div>
            )}
          </div>

          {/* Escala personal + hint tap */}
          <div className="flex items-center justify-between border-t border-surface-border pt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Tu escala</span>
              <span className="text-display text-2xl text-brand glow-text">{Math.round(factor * 100)}%</span>
              <span className="text-[10px] text-zinc-500">del Rx</span>
            </div>
            {hasDetail && (
              <span className="text-[10px] text-zinc-600">
                {detailOpen ? "Cerrar detalle" : "Ver detalle"}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* ── Detalle expandible ─────────────────────────────────────────────── */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${detailOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="space-y-2.5 pt-0.5">

            {/* Alert */}
            {alert && (
              <div className="flex gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300 leading-relaxed">{alert}</p>
              </div>
            )}

            {/* Ejercicios */}
            {hasExercises && (
              <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-2.5 border-b border-surface-border">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                    <Dumbbell className="h-3.5 w-3.5 text-zinc-400" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Ejercicios</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {wod.exercises
                    .sort((a, b) => a.order - b.order)
                    .map((ex, i) => {
                      const scaledReps = Math.round(ex.reps * factor);
                      return (
                        <div key={ex.id} className="flex items-center justify-between rounded-xl bg-zinc-800/50 px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-zinc-600 w-4 text-right tabular-nums">{i + 1}.</span>
                            <span className="text-sm font-medium text-zinc-200">{ex.name}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-brand">{scaledReps}</span>
                            {factor !== 1 && (
                              <span className="text-xs text-zinc-600 line-through ml-1">{ex.reps}</span>
                            )}
                            <span className="text-xs text-zinc-500 ml-0.5">reps</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Secciones acordeón */}
            {wod.warmUp       && <Section icon={Flame}    title="Warm-up"             content={wod.warmUp}        />}
            {wod.strengthSkill && <Section icon={Dumbbell} title="Strength / Skill"    content={wod.strengthSkill} />}
            {wod.metcon       && <Section icon={Zap}      title="WOD"                 content={wod.metcon}        accent defaultOpen />}
            {wod.scaling      && <Section icon={BarChart2} title="Escalado · RX · RX+" content={wod.scaling}      />}
            {wod.coolDown     && <Section icon={Wind}     title="Cooldown"             content={wod.coolDown}     />}
            {wod.coachNotes   && <Section icon={Brain}    title="Análisis del coach"   content={wod.coachNotes}   />}

            {/* Nutrición */}
            {nutritionTip && (
              <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <Salad className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Nutrición</p>
                  <p className="text-xs text-zinc-300">{nutritionTip}</p>
                </div>
              </div>
            )}

            {/* Link página completa */}
            <Link
              href={`/wod/${wod.id}?factor=${factor}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-surface-border bg-surface py-3 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Ver página completa
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>

          </div>
        </div>
      </div>

      {/* ── Resultado — siempre visible ────────────────────────────────────── */}
      <div className="pt-1">
        {liveResult ? (
          <ResultSummary
            factorMessage={liveResult.factorMessage}
            nextFactor={liveResult.newScaledRepsFactor}
          />
        ) : workout.result ? (
          <ResultSummary
            factorMessage={workout.result.factorMessage}
            nextFactor={factor}
            label="Tu escala actual"
          />
        ) : !showForm ? (
          <PrimaryButton variant="outline" onClick={() => setShowForm(true)}>
            Registrar resultado
          </PrimaryButton>
        ) : (
          <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">¿Cómo fue el WOD?</h3>
            <ResultForm
              athleteWorkoutId={workout.id}
              wodType={wod.type}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>

    </div>
  );
}
