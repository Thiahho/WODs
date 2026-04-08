"use client";

import { useState } from "react";
import type { AiWod } from "@/lib/schemas";
import { ResultForm } from "./result-form";
import { Chip } from "@/components/ui/chip";
import { PrimaryButton } from "@/components/ui/primary-button";
import type { WorkoutResultResponse } from "@/hooks/use-register-result";
import {
  Flame, Dumbbell, Zap, BarChart2, Wind, Brain, Salad,
  AlertTriangle, Clock, Target, ChevronRight,
} from "lucide-react";

// ── Types & constants ─────────────────────────────────────────────────────────

type ChipVariant = "high" | "moderate" | "low" | "deload";

const INTENSITY_CHIP: Record<string, ChipVariant> = {
  high: "high", moderate: "moderate", low: "low", deload: "deload",
};

const INTENSITY_LABEL: Record<string, string> = {
  low: "Baja", moderate: "Moderada", high: "Alta", deload: "Deload",
};

// ── ContentLines ──────────────────────────────────────────────────────────────

function ContentLines({ text, accent }: { text: string; accent: boolean }) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const bulletMatch   = line.match(/^[-•*]\s+(.+)/);
        const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)/);

        if (bulletMatch) return (
          <div key={i} className="flex items-start gap-2">
            <span className={`mt-[3px] text-[9px] shrink-0 ${accent ? "text-brand" : "text-zinc-500"}`}>▸</span>
            <span className={`text-sm leading-snug ${accent ? "text-zinc-100" : "text-zinc-300"}`}>
              {bulletMatch[1]}
            </span>
          </div>
        );

        if (numberedMatch) return (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-[10px] font-bold shrink-0 tabular-nums mt-0.5 w-4 text-right ${accent ? "text-brand/70" : "text-zinc-600"}`}>
              {numberedMatch[1]}.
            </span>
            <span className={`text-sm leading-snug ${accent ? "text-zinc-100" : "text-zinc-300"}`}>
              {numberedMatch[2]}
            </span>
          </div>
        );

        if (line.endsWith(":")) return (
          <p key={i} className={`text-[10px] font-bold uppercase tracking-widest pt-2 ${accent ? "text-brand/70" : "text-zinc-500"}`}>
            {line.slice(0, -1)}
          </p>
        );

        return (
          <p key={i} className={`text-sm leading-snug ${accent ? "text-zinc-100" : "text-zinc-300"}`}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

// ── Section (accordion card) ──────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  content,
  accent = false,
  defaultOpen = false,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
  accent?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-2xl overflow-hidden border transition-colors ${
      accent
        ? "border-brand/30 bg-brand/5"
        : "border-surface-border bg-surface"
    }`}>
      {/* Header — siempre visible */}
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
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"} ${accent ? "text-brand/50" : "text-zinc-600"}`}
        />
      </button>

      {/* Contenido — slide con grid trick */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className={`px-4 pb-4 pt-0.5 transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-6"}`}>
            {open && <div className={`mb-3 h-px ${accent ? "bg-brand/20" : "bg-surface-border"}`} />}
            <ContentLines text={content} accent={accent} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── detectWodType ─────────────────────────────────────────────────────────────

function detectWodType(metcon?: string | null): string {
  const text = (metcon ?? "").toUpperCase();
  if (text.includes("FOR TIME") || text.includes("FOR-TIME")) return "ForTime";
  if (text.includes("EMOM"))                                   return "Emom";
  return "Amrap";
}

// ── AiWodCard ─────────────────────────────────────────────────────────────────

interface AiWodCardProps {
  wod: AiWod;
  athleteWorkoutId?: number;
}

export function AiWodCard({ wod, athleteWorkoutId }: AiWodCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [result, setResult]     = useState<WorkoutResultResponse | null>(null);

  const intensityKey = wod.intensity ?? "moderate";
  const chipVariant  = INTENSITY_CHIP[intensityKey] ?? "moderate";
  const wodType      = detectWodType(wod.metcon);

  function handleSuccess(r: WorkoutResultResponse) {
    setResult(r);
    setShowForm(false);
  }

  return (
    <div className="space-y-2.5">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl border border-surface-border bg-surface overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="relative p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">WOD del día</p>
              <h2 className="text-display text-4xl text-zinc-50 leading-none">{wod.title}</h2>
            </div>
            <Chip variant={chipVariant}>{INTENSITY_LABEL[intensityKey] ?? intensityKey}</Chip>
          </div>
          <div className="flex items-center gap-4">
            {wod.durationMinutes && (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{wod.durationMinutes} min</span>
              </div>
            )}
            {wod.focus && (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Target className="h-3.5 w-3.5" />
                <span className="text-xs font-medium capitalize">{wod.focus.toLowerCase()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Alert ───────────────────────────────────────────────────────── */}
      {wod.alert && (
        <div className="flex gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300 leading-relaxed">{wod.alert}</p>
        </div>
      )}

      {/* ── Secciones acordeón ──────────────────────────────────────────── */}
      {wod.warmUp && (
        <Section icon={Flame}    title="Warm-up"           content={wod.warmUp}       />
      )}
      {wod.strengthSkill && (
        <Section icon={Dumbbell} title="Strength / Skill"  content={wod.strengthSkill} />
      )}
      {wod.metcon && (
        <Section icon={Zap}      title="WOD"               content={wod.metcon}        accent defaultOpen />
      )}
      {wod.scaling && (
        <Section icon={BarChart2} title="Escalado · RX · RX+" content={wod.scaling}   />
      )}
      {wod.coolDown && (
        <Section icon={Wind}     title="Cooldown"           content={wod.coolDown}     />
      )}
      {wod.coachNotes && (
        <Section icon={Brain}    title="Análisis del coach" content={wod.coachNotes}   />
      )}

      {/* ── Nutrición ───────────────────────────────────────────────────── */}
      {wod.nutritionTip && (
        <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <Salad className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Nutrición</p>
            <p className="text-xs text-zinc-300">{wod.nutritionTip}</p>
          </div>
        </div>
      )}

      {/* ── Registro de resultado ───────────────────────────────────────── */}
      {athleteWorkoutId && (
        <div className="pt-1">
          {result ? (
            <div className="rounded-3xl border border-brand/25 bg-brand/5 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-brand/20 flex items-center justify-center">
                  <Zap className="h-3 w-3 text-brand" />
                </div>
                <p className="text-sm font-semibold text-zinc-200">Resultado registrado</p>
              </div>
              <p className="text-sm text-zinc-400">{result.factorMessage}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-zinc-500">Próximo WOD:</span>
                <span className="text-display text-3xl text-brand glow-text">
                  {Math.round(result.newScaledRepsFactor * 100)}%
                </span>
                <span className="text-xs text-zinc-500">del volumen base</span>
              </div>
            </div>
          ) : !showForm ? (
            <PrimaryButton variant="outline" onClick={() => setShowForm(true)}>
              Registrar resultado
            </PrimaryButton>
          ) : (
            <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">¿Cómo fue el WOD?</h3>
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
