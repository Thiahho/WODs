"use client";

import { useState } from "react";
import type { DailyLogPayload } from "@/hooks/use-daily-log";

interface Props {
  onSubmit: (payload: DailyLogPayload) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function SliderField({
  label, icon, value, onChange, low, high,
}: {
  label: string; icon: string; value: number;
  onChange: (v: number) => void; low: string; high: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <span>{icon}</span>{label}
        </label>
        <span className="text-lg font-bold text-orange-400">{value}</span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-orange-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{low}</span><span>{high}</span>
      </div>
    </div>
  );
}

export function DailyLogForm({ onSubmit, isLoading, error }: Props) {
  const [energy,  setEnergy]  = useState(7);
  const [fatigue, setFatigue] = useState(3);
  const [sleep,   setSleep]   = useState<string>("");
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
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Antes de entrenar</p>
        <h2 className="text-lg font-bold text-zinc-100">¿Cómo estás hoy?</h2>
        <p className="text-xs text-zinc-500 mt-1">
          La IA usa esto para personalizar tu WOD del día.
        </p>
      </div>

      <div className="px-6 py-5 space-y-6">

        {/* Sliders */}
        <SliderField
          label="Energía" icon="⚡" value={energy} onChange={setEnergy}
          low="Sin energía" high="Al 100%"
        />
        <SliderField
          label="Fatiga" icon="😮‍💨" value={fatigue} onChange={setFatigue}
          low="Descansado" high="Agotado"
        />

        {/* Sueño */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <span>🌙</span> Horas de sueño
          </label>
          <input
            type="number" min={0} max={12} step={0.5}
            value={sleep} onChange={e => setSleep(e.target.value)}
            placeholder="ej: 7.5"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Dolor */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <span>🤕</span> Dolor o molestias <span className="normal-case text-zinc-600 font-normal">(opcional)</span>
          </label>
          <input
            type="text" value={pain} onChange={e => setPain(e.target.value)}
            placeholder="ej: molestia en el hombro derecho"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Estado mental */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <span>🧠</span> Estado mental <span className="normal-case text-zinc-600 font-normal">(opcional)</span>
          </label>
          <input
            type="text" value={mental} onChange={e => setMental(e.target.value)}
            placeholder="ej: motivado, estresado, concentrado"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Notas libres */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <span>📝</span> Notas libres <span className="normal-case text-zinc-600 font-normal">(opcional)</span>
          </label>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Lo que quieras contarle a tu coach IA..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-orange-500 focus:outline-none resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit" disabled={isLoading}
          className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Guardando..." : "Listo, generá mi WOD →"}
        </button>
      </div>
    </form>
  );
}
