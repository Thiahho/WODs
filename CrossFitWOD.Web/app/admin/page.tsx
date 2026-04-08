"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import {
  Calendar, Dumbbell, Users, ChevronRight,
  CheckCircle2, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle,
} from "lucide-react";

interface TodaySession {
  id: number;
  date: string;
  wod: { title: string };
}

interface AthleteListItem {
  id:              number;
  name:            string;
  level:           string;
  currentFactor:   number | null;
  lastWorkoutDate: string | null;
  lastRpe:         number | null;
  lastCompleted:   boolean | null;
}

function ReadinessIcon({ rpe }: { rpe: number | null }) {
  if (rpe === null) return <Minus className="h-3.5 w-3.5 text-zinc-600" />;
  if (rpe >= 9)    return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />;
  if (rpe <= 6)    return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  return              <TrendingDown className="h-3.5 w-3.5 text-yellow-400" />;
}

export default function AdminPage() {
  const today = new Date().toISOString().split("T")[0];

  const { data: session } = useQuery<TodaySession>({
    queryKey: ["today-session"],
    queryFn:  () => api.get<TodaySession>("/api/workoutsessions/today"),
    retry:    false,
  });

  const { data: athletes = [], isLoading: loadingAthletes } = useQuery<AthleteListItem[]>({
    queryKey: ["athletes"],
    queryFn:  () => api.get<AthleteListItem[]>("/api/athletes"),
  });

  const todayLabel = new Date().toLocaleDateString("es", {
    weekday: "long", day: "numeric", month: "long",
  });

  const doneToday    = athletes.filter(a => a.lastWorkoutDate === today);
  const pendingToday = athletes.filter(a => a.lastWorkoutDate !== today);
  const atRisk       = athletes.filter(a => a.lastRpe !== null && a.lastRpe >= 9);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Panel del coach</p>
        <h1 className="text-display text-4xl text-zinc-50 mt-0.5 capitalize">{todayLabel}</h1>
      </div>

      {/* WOD del día */}
      <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/20 border border-brand/30">
            <Calendar className="h-3.5 w-3.5 text-brand" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">WOD de hoy</p>
        </div>

        {session ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-display text-3xl text-zinc-50">{session.wod.title}</p>
            <Link
              href="/admin/session"
              className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-light transition-colors shrink-0"
            >
              Cambiar <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">No hay WOD asignado para hoy.</p>
            <Link href="/admin/session">
              <PrimaryButton size="sm">Asignar WOD</PrimaryButton>
            </Link>
          </div>
        )}
      </div>

      {/* Completitud del día */}
      {session && athletes.length > 0 && (
        <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-surface-border">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Completitud hoy</p>
            </div>
            <span className="text-display text-2xl text-brand">
              {doneToday.length}<span className="text-zinc-600 text-xl">/{athletes.length}</span>
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="h-1.5 rounded-full bg-surface-border overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: athletes.length > 0 ? `${(doneToday.length / athletes.length) * 100}%` : "0%" }}
            />
          </div>

          {/* Quiénes entrenaron hoy */}
          {doneToday.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Completaron</p>
              {doneToday.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-zinc-200">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.lastRpe !== null && (
                      <Chip variant={a.lastRpe <= 6 ? "success" : a.lastRpe <= 8 ? "moderate" : "high"}>
                        RPE {a.lastRpe}
                      </Chip>
                    )}
                    {a.currentFactor !== null && (
                      <span className={cn("text-xs font-bold", a.currentFactor > 1 ? "text-brand" : "text-zinc-400")}>
                        {Math.round(a.currentFactor * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quiénes faltan */}
          {pendingToday.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Pendientes</p>
              {pendingToday.map(a => (
                <div key={a.id} className="flex items-center gap-2 rounded-2xl border border-surface-border bg-surface-raised px-3 py-2">
                  <Clock className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                  <span className="text-sm text-zinc-400">{a.name}</span>
                  {a.lastWorkoutDate && (
                    <span className="ml-auto text-[10px] text-zinc-600">
                      último: {new Date(a.lastWorkoutDate + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alertas de RPE alto */}
      {atRisk.length > 0 && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Atletas con RPE alto</p>
          </div>
          {atRisk.map(a => (
            <div key={a.id} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{a.name}</span>
              <Chip variant="high">RPE {a.lastRpe}</Chip>
            </div>
          ))}
          <p className="text-[10px] text-zinc-500">Considerá reducir la intensidad en su próxima sesión.</p>
        </div>
      )}

      {/* Resumen atletas — carga rápida */}
      {!loadingAthletes && athletes.length > 0 && (
        <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-surface-border">
                <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Estado del box</p>
            </div>
            <Link href="/admin/athletes" className="text-xs font-semibold text-brand hover:text-brand-light transition-colors">
              Ver todos
            </Link>
          </div>

          <div className="space-y-2">
            {athletes.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ReadinessIcon rpe={a.lastRpe} />
                  <span className="text-sm text-zinc-300 truncate">{a.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.currentFactor !== null && (
                    <span className={cn("text-xs font-bold", a.currentFactor > 1 ? "text-brand" : "text-zinc-500")}>
                      {Math.round(a.currentFactor * 100)}%
                    </span>
                  )}
                  {a.lastCompleted === false && (
                    <span className="text-[10px] text-red-400">DNF</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick access */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/wods">
          <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-3 hover:border-zinc-600 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
              <Dumbbell className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-bold text-zinc-100">WODs</p>
              <p className="text-xs text-zinc-500 mt-0.5">Crear y gestionar</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/athletes">
          <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-3 hover:border-zinc-600 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-800 border border-surface-border">
              <Users className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="font-bold text-zinc-100">Atletas</p>
              <p className="text-xs text-zinc-500 mt-0.5">{athletes.length} registrados</p>
            </div>
          </div>
        </Link>
      </div>

    </div>
  );
}
