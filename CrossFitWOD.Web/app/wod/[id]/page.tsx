"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { WodDetailSchema, type WodDetail } from "@/lib/schemas";
import { Chip } from "@/components/ui/chip";
import {
  ArrowLeft, Clock, Target, LayoutList, Bot,
  Flame, Dumbbell, Zap, BarChart2, Wind, Brain, ChevronRight,
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
    <div className={`rounded-2xl overflow-hidden border transition-colors ${accent ? "border-brand/30 bg-brand/5" : "border-surface-border bg-surface"}`}>
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
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WodDetailPage() {
  const router       = useRouter();
  const { id }       = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const factor = parseFloat(searchParams.get("factor") ?? "1");
  const date   = searchParams.get("date");

  const [wod,       setWod]       = useState<WodDetail | null>(null);
  const [isLoading, setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id || id === "undefined") {
        setError("WOD no encontrado.");
        setLoading(false);
        return;
      }
      try {
        const raw = await api.get<unknown>(`/api/wod/${id}`);
        setWod(WodDetailSchema.parse(raw));
      } catch {
        setError("No se pudo cargar el WOD.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const intensityKey = wod?.intensity ?? "";
  const chipVariant  = INTENSITY_CHIP[intensityKey] ?? "moderate";
  const hasExercises = (wod?.exercises?.length ?? 0) > 0;
  const hasSections  = !!(wod?.warmUp || wod?.strengthSkill || wod?.metcon || wod?.scaling || wod?.coolDown || wod?.coachNotes);

  return (
    <main className="min-h-screen px-4 pt-6 pb-12">
      <div className="mx-auto max-w-md space-y-5">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-44 rounded-3xl border border-surface-border bg-surface" />
            <div className="h-14 rounded-2xl border border-surface-border bg-surface" />
            <div className="h-14 rounded-2xl border border-surface-border bg-surface" />
            <div className="h-14 rounded-2xl border border-surface-border bg-surface" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 text-center pt-10">{error}</p>
        )}

        {/* Detalle del WOD */}
        {!isLoading && wod && (
          <>
            {/* Hero */}
            <div className="relative rounded-3xl border border-surface-border bg-surface overflow-hidden">
              <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
              <div className="relative p-5 space-y-3">

                {/* Fecha si viene del historial */}
                {date && (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    {new Date(date + "T00:00:00").toLocaleDateString("es", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                  </p>
                )}

                {/* Título + intensidad */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {wod.isAiGenerated && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand">
                          <Bot className="h-2.5 w-2.5" /> IA
                        </span>
                      )}
                    </div>
                    <h1 className="text-display text-4xl text-zinc-50 leading-none">{wod.title}</h1>
                  </div>
                  {intensityKey && (
                    <Chip variant={chipVariant}>{INTENSITY_LABEL[intensityKey] ?? intensityKey}</Chip>
                  )}
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

                {/* Factor personal (si viene desde el historial) */}
                {factor !== 1 && (
                  <div className="flex items-baseline gap-2 border-t border-surface-border pt-3">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Tu escala</span>
                    <span className="text-display text-2xl text-brand glow-text">{Math.round(factor * 100)}%</span>
                    <span className="text-[10px] text-zinc-500">del Rx</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ejercicios con reps escaladas */}
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
                        <div
                          key={ex.id ?? i}
                          className="flex items-center justify-between rounded-xl bg-zinc-800/50 px-4 py-2.5"
                        >
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
            {hasSections && (
              <>
                {wod.warmUp       && <Section icon={Flame}    title="Warm-up"             content={wod.warmUp}        />}
                {wod.strengthSkill && <Section icon={Dumbbell} title="Strength / Skill"    content={wod.strengthSkill} />}
                {wod.metcon       && <Section icon={Zap}      title="WOD"                 content={wod.metcon}        accent defaultOpen />}
                {wod.scaling      && <Section icon={BarChart2} title="Escalado · RX · RX+" content={wod.scaling}      />}
                {wod.coolDown     && <Section icon={Wind}     title="Cooldown"             content={wod.coolDown}     />}
                {wod.coachNotes   && <Section icon={Brain}    title="Análisis del coach"   content={wod.coachNotes}   />}
              </>
            )}

            {/* Sin contenido */}
            {!hasExercises && !hasSections && (
              <p className="text-sm text-zinc-500 text-center py-6">Este WOD no tiene detalle disponible.</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
