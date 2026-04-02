"use client";

import { useHistory, type HistoryEntry } from "@/hooks/use-history";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { useState, useEffect } from "react";

const WOD_TYPE_LABEL: Record<string, string> = {
  ForTime: "For Time",
  Amrap:   "AMRAP",
  Emom:    "EMOM",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function rpeColor(rpe: number): string {
  if (rpe <= 6)  return "text-emerald-400";
  if (rpe <= 8)  return "text-orange-400";
  return "text-red-400";
}

function Trend({ prev, curr }: { prev: number | null; curr: number }) {
  if (prev === null) return null;
  if (curr > prev)  return <span className="text-xs font-medium text-emerald-400">↑ subió</span>;
  if (curr < prev)  return <span className="text-xs font-medium text-sky-400">↓ bajó</span>;
  return              <span className="text-xs font-medium text-zinc-500">→ igual</span>;
}

function factorLabel(factor: number): string {
  if (factor <= 0.6) return "muy reducido";
  if (factor <= 0.8) return "reducido";
  if (factor <= 1.1) return "estándar";
  if (factor <= 1.3) return "sobre Rx";
  return "alta intensidad";
}

function ResultValue({ entry }: { entry: HistoryEntry }) {
  if (entry.wodType === "ForTime") {
    if (!entry.completed) return <span className="text-zinc-500">No completado</span>;
    if (entry.timeSeconds) return <span>{formatTime(entry.timeSeconds)}</span>;
    return <span className="text-zinc-500">—</span>;
  }
  if (entry.rounds != null) return <span>{entry.rounds} rondas</span>;
  return <span className="text-zinc-500">—</span>;
}

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [skip, setSkip]       = useState(0);
  const [all,  setAll]        = useState<HistoryEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: page = [], isLoading, isFetching } = useHistory(skip);

  useEffect(() => {
    if (page.length === 0) {
      if (skip > 0) setHasMore(false);
      return;
    }
    setAll(prev => skip === 0 ? page : [...prev, ...page]);
    if (page.length < PAGE_SIZE) setHasMore(false);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">

        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-500">CrossFitWOD</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Salir
          </button>
        </header>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Tu historial</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{all.length} WODs registrados</p>
          </div>
          <button
            onClick={() => router.push("/workout")}
            className="text-sm text-orange-400 hover:underline"
          >
            ← Volver
          </button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-zinc-800 bg-zinc-900 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && all.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400">Todavía no registraste ningún resultado.</p>
            <button
              onClick={() => router.push("/workout")}
              className="mt-3 text-sm text-orange-400 hover:underline"
            >
              Ver el WOD de hoy
            </button>
          </div>
        )}

        <div className="space-y-3">
          {all.map((entry, i) => {
            const prevFactor = all[i + 1]?.scaledRepsFactor ?? null;
            return (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-100">{entry.wodTitle}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(entry.date + "T00:00:00").toLocaleDateString("es", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                    {WOD_TYPE_LABEL[entry.wodType] ?? entry.wodType}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-zinc-800/60 px-3 py-2">
                    <p className="text-xs text-zinc-500 mb-0.5">Resultado</p>
                    <p className="text-sm font-medium text-zinc-200">
                      <ResultValue entry={entry} />
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-800/60 px-3 py-2">
                    <p className="text-xs text-zinc-500 mb-0.5">RPE</p>
                    <p className={`text-sm font-bold ${rpeColor(entry.rpe)}`}>
                      {entry.rpe} / 10
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-800/60 px-3 py-2">
                    <p className="text-xs text-zinc-500 mb-0.5">Volumen</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-sm font-bold text-orange-400">
                        {Math.round(entry.scaledRepsFactor * 100)}%
                      </p>
                      <Trend prev={prevFactor} curr={entry.scaledRepsFactor} />
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5">{factorLabel(entry.scaledRepsFactor)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && all.length > 0 && (
          <button
            onClick={() => setSkip(s => s + PAGE_SIZE)}
            disabled={isFetching}
            className="w-full rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-50 transition-colors"
          >
            {isFetching ? "Cargando…" : "Ver más"}
          </button>
        )}

      </div>
    </main>
  );
}
