"use client";

import { useState } from "react";
import type { DailyLogPayload } from "@/hooks/use-daily-log";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Zap, Moon, AlertCircle, Brain, StickyNote } from "lucide-react";

interface Props {
  onSubmit: (payload: DailyLogPayload) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function SliderField({
  label, Icon, value, onChange, low, high, colorClass,
}: {
  label: string;
  Icon: React.ElementType;
  value: number;
  onChange: (v: number) => void;
  low: string;
  high: string;
  colorClass?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised border border-surface-border">
            <Icon className="h-3 w-3 text-zinc-400" strokeWidth={2} />
          </div>
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            {label}
          </label>
        </div>
        <span className={`text-display text-2xl ${colorClass ?? "text-brand"}`}>{value}</span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-2xl border border-surface-border bg-surface-raised px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30";

export function DailyLogForm({ onSubmit, isLoading, error }: Props) {
  const [energy,  setEnergy]  = useState(7);
  const [fatigue, setFatigue] = useState(3);
  const [sleep,   setSleep]   = useState("");
  const [pain,    setPain]    = useState("");
  const [mental,  setMental]  = useState("");
  const [notes,   setNotes]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      energyLevel:  energy,
      fatigueLevel: fatigue,
      sleepHours:   sleep ? parseFloat(sleep) : null,
      painNotes:    pain   || null,
      mentalState:  mental || null,
      notes:        notes  || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-surface-border bg-surface overflow-hidden">

      {/* Header */}
      <div className="bg-hero-gradient px-5 pt-5 pb-4 border-b border-surface-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
          Antes de entrenar
        </p>
        <h2 className="text-display text-3xl text-zinc-50">¿Cómo estás hoy?</h2>
        <p className="text-xs text-zinc-500 mt-1.5">
          La IA usa esto para personalizar tu WOD.
        </p>
      </div>

      <div className="px-5 py-5 space-y-6">

        <SliderField
          label="Energía" Icon={Zap} value={energy} onChange={setEnergy}
          low="Sin energía" high="Al 100%"
        />
        <SliderField
          label="Fatiga" Icon={AlertCircle} value={fatigue} onChange={setFatigue}
          low="Descansado" high="Agotado"
          colorClass={fatigue >= 8 ? "text-red-400" : fatigue >= 5 ? "text-yellow-400" : "text-emerald-400"}
        />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised border border-surface-border">
              <Moon className="h-3 w-3 text-zinc-400" strokeWidth={2} />
            </div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Horas de sueño
            </label>
          </div>
          <input
            type="number" min={0} max={12} step={0.5}
            value={sleep} onChange={e => setSleep(e.target.value)}
            placeholder="ej: 7.5"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised border border-surface-border">
              <AlertCircle className="h-3 w-3 text-zinc-400" strokeWidth={2} />
            </div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Dolor o molestias <span className="normal-case font-normal text-zinc-600">(opcional)</span>
            </label>
          </div>
          <input
            type="text" value={pain} onChange={e => setPain(e.target.value)}
            placeholder="ej: molestia en el hombro derecho"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised border border-surface-border">
              <Brain className="h-3 w-3 text-zinc-400" strokeWidth={2} />
            </div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Estado mental <span className="normal-case font-normal text-zinc-600">(opcional)</span>
            </label>
          </div>
          <input
            type="text" value={mental} onChange={e => setMental(e.target.value)}
            placeholder="ej: motivado, estresado, concentrado"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised border border-surface-border">
              <StickyNote className="h-3 w-3 text-zinc-400" strokeWidth={2} />
            </div>
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Notas libres <span className="normal-case font-normal text-zinc-600">(opcional)</span>
            </label>
          </div>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Lo que quieras contarle a tu coach IA…"
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <PrimaryButton type="submit" disabled={isLoading} size="lg">
          {isLoading ? "Guardando…" : "Listo, generá mi WOD →"}
        </PrimaryButton>
      </div>
    </form>
  );
}
