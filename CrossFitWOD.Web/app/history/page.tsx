"use client";

import { useHistory, type HistoryEntry } from "@/hooks/use-history";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatCard } from "@/components/ui/stat-card";
import { Chip } from "@/components/ui/chip";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";

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

function rpeChipVariant(rpe: number): "success" | "moderate" | "high" {
  if (rpe <= 6) return "success";
  if (rpe <= 8) return "moderate";
  return "high";
}

function TrendIcon({ prev, curr }: { prev: number | null; curr: number }) {
  if (prev === null) return null;
  if (curr > prev)  return <TrendingUp  className="h-3.5 w-3.5 text-emerald-400" />;
  if (curr < prev)  return <TrendingDown className="h-3.5 w-3.5 text-sky-400" />;
  return              <Minus className="h-3.5 w-3.5 text-zinc-500" />;
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

  // Compute simple stats from loaded data
  const totalWods   = all.length;
  const avgRpe      = all.length > 0 ? Math.round(all.reduce((s, e) => s + e.rpe, 0) / all.length) : 0;
  const bestFactor  = all.length > 0 ? Math.max(...all.map(e => e.scaledRepsFactor)) : 0;

  return (
    <main className="min-h-screen px-4 pt-6">
      <div className="mx-auto max-w-md space-y-6">

        {/* Header */}
        <header className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Tu progreso</p>
          <h1 className="text-display text-4xl text-zinc-50">Historial</h1>
        </header>

        {/* Stats row */}
        {all.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="WODs" value={totalWods} accent />
            <StatCard label="RPE medio" value={avgRpe || "—"} sub={`sobre ${all.length} WODs`} />
            <StatCard label="Mejor vol." value={bestFactor > 0 ? `${Math.round(bestFactor * 100)}%` : "—"} sub="cargados" />
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-3xl border border-surface-border bg-surface" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && all.length === 0 && (
          <div className="rounded-3xl border border-surface-border bg-surface p-10 text-center space-y-3">
            <p className="text-display text-2xl text-zinc-600">SIN WODS</p>
            <p className="text-sm text-zinc-500">Todavía no registraste ningún resultado.</p>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {all.map((entry, i) => {
            const prevFactor = all[i + 1]?.scaledRepsFactor ?? null;
            const detailHref = `/wod/${entry.wodId}?factor=${entry.scaledRepsFactor}&date=${entry.date}`;
            return (
              <Link
                key={`${entry.wodId}-${entry.date}`}
                href={detailHref}
                className="block rounded-3xl border border-surface-border bg-surface p-4 space-y-4 transition-colors hover:border-zinc-600 active:bg-surface-raised"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-100 truncate">{entry.wodTitle}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                      {new Date(entry.date + "T00:00:00").toLocaleDateString("es", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Chip variant="default">{WOD_TYPE_LABEL[entry.wodType] ?? entry.wodType}</Chip>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-surface-border bg-surface-raised px-3 py-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Resultado</p>
                    <p className="text-sm font-bold text-zinc-200">
                      <ResultValue entry={entry} />
                    </p>
                  </div>

                  <div className="rounded-2xl border border-surface-border bg-surface-raised px-3 py-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">RPE</p>
                    <Chip variant={rpeChipVariant(entry.rpe)} className="text-[10px] px-2 py-0.5">
                      {entry.rpe}/10
                    </Chip>
                  </div>

                  <div className="rounded-2xl border border-surface-border bg-surface-raised px-3 py-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600 mb-1">Volumen</p>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-sm font-bold",
                        entry.scaledRepsFactor > 1 ? "text-brand" : "text-zinc-300"
                      )}>
                        {Math.round(entry.scaledRepsFactor * 100)}%
                      </span>
                      <TrendIcon prev={prevFactor} curr={entry.scaledRepsFactor} />
                    </div>
                    <p className="text-[9px] text-zinc-600 mt-0.5">{factorLabel(entry.scaledRepsFactor)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {hasMore && all.length > 0 && (
          <PrimaryButton
            variant="ghost"
            onClick={() => setSkip(s => s + PAGE_SIZE)}
            disabled={isFetching}
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            {isFetching ? "Cargando…" : "Ver más"}
          </PrimaryButton>
        )}

      </div>
    </main>
  );
}
