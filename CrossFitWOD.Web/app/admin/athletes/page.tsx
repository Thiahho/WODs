"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { HistoryEntry } from "@/hooks/use-history";
import { ChevronDown, ChevronUp, UserPlus, X } from "lucide-react";

interface AthleteListItem {
  id:              number;
  name:            string;
  level:           string;
  currentFactor:   number | null;
  lastWorkoutDate: string | null;
  lastRpe:         number | null;
  lastCompleted:   boolean | null;
  groups:          { id: number; name: string }[];
}

const LEVEL_LABEL: Record<string, string> = {
  Beginner:     "Begginer",
  Amateur:"Amateur",
  Scaled: "Scaled",
  Rx:"Rx",
  Elite: "Elite",
};

function factorLabel(factor: number): string {
  if (factor <= 0.6) return "muy reducido";
  if (factor <= 0.8) return "reducido";
  if (factor <= 1.1) return "estándar";
  if (factor <= 1.3) return "sobre Rx";
  return "alta intensidad";
}

function rpeColor(rpe: number): string {
  if (rpe <= 6) return "text-emerald-400";
  if (rpe <= 8) return "text-yellow-400";
  return "text-red-400";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const HISTORY_PAGE = 20;

function AthleteHistory({ athleteId }: { athleteId: number }) {
  const [skip,    setSkip]    = useState(0);
  const [all,     setAll]     = useState<HistoryEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data: page = [], isLoading, isFetching } = useQuery<HistoryEntry[]>({
    queryKey: ["athlete-history", athleteId, skip],
    queryFn:  () => api.get<HistoryEntry[]>(`/api/athletes/${athleteId}/history?skip=${skip}`),
  });

  useEffect(() => {
    if (page.length === 0) {
      if (skip > 0) setHasMore(false);
      return;
    }
    setAll(prev => skip === 0 ? page : [...prev, ...page]);
    if (page.length < HISTORY_PAGE) setHasMore(false);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading && all.length === 0) return (
    <div className="py-4 animate-pulse text-xs text-zinc-500">Cargando historial…</div>
  );
  if (!isLoading && all.length === 0) return (
    <p className="py-3 text-xs text-zinc-500">Sin resultados registrados.</p>
  );

  return (
    <div className="mt-3 space-y-2">
      {all.map((entry, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 rounded-2xl border border-surface-border bg-surface-raised px-3 py-2.5 text-xs">
          <div>
            <p className="text-zinc-600">Fecha</p>
            <p className="text-zinc-300 mt-0.5 font-medium">
              {new Date(entry.date + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "short" })}
            </p>
          </div>
          <div>
            <p className="text-zinc-600">WOD</p>
            <p className="text-zinc-300 mt-0.5 truncate font-medium">{entry.wodTitle}</p>
          </div>
          <div>
            <p className="text-zinc-600">Resultado</p>
            <p className="text-zinc-300 mt-0.5 font-medium">
              {entry.wodType === "ForTime"
                ? entry.timeSeconds ? formatTime(entry.timeSeconds) : (entry.completed ? "—" : "DNF")
                : entry.rounds != null ? `${entry.rounds}r` : "—"}
            </p>
          </div>
          <div>
            <p className="text-zinc-600">RPE / Vol.</p>
            <p className="mt-0.5">
              <span className={`font-bold ${rpeColor(entry.rpe)}`}>{entry.rpe}</span>
              <span className="text-zinc-500"> · {Math.round(entry.scaledRepsFactor * 100)}%</span>
            </p>
          </div>
        </div>
      ))}
      {hasMore && (
        <PrimaryButton
          variant="ghost"
          size="sm"
          onClick={() => setSkip(s => s + HISTORY_PAGE)}
          disabled={isFetching}
        >
          {isFetching ? "Cargando…" : "Ver más"}
        </PrimaryButton>
      )}
    </div>
  );
}

interface CreateAthleteForm {
  username: string;
  password: string;
  name:     string;
  level:    number;
  goal:     number;
  weight:   string;
}

const inputClass = "w-full rounded-2xl border border-surface-border bg-surface px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30";
const selectClass = "w-full rounded-2xl border border-surface-border bg-surface px-4 py-3 text-sm text-zinc-100 outline-none transition-colors focus:border-brand";

function CreateAthleteModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<CreateAthleteForm>({ defaultValues: { level: 2, goal: 1 } });

  const mutation = useMutation({
    mutationFn: (data: CreateAthleteForm) =>
      api.post("/api/athletes", {
        ...data,
        level:  Number(data.level),
        goal:   Number(data.goal),
        weight: data.weight ? Number(data.weight) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athletes"] });
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 409) {
        setServerError("El nombre de usuario ya está en uso.");
      } else {
        setServerError("No se pudo crear el atleta. Intentá de nuevo.");
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-display text-2xl text-zinc-50">Agregar atleta</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => { setServerError(null); mutation.mutate(d); })} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Usuario</label>
              <input className={inputClass} placeholder="usuario"
                {...register("username", { required: "Requerido", minLength: { value: 3, message: "Mín. 3 chars" } })} />
              {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Contraseña</label>
              <input type="password" className={inputClass} placeholder="••••••"
                {...register("password", { required: "Requerido", minLength: { value: 6, message: "Mín. 6 chars" } })} />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Nombre completo</label>
            <input className={inputClass} placeholder="Juan Pérez"
              {...register("name", { required: "Requerido" })} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Nivel</label>
              <select className={selectClass} {...register("level")}>
                <option value={1}>Principiante</option>
                <option value={2}>Intermedio</option>
                <option value={3}>Avanzado</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Objetivo</label>
              <select className={selectClass} {...register("goal")}>
                <option value={1}>General</option>
                <option value={2}>Fitness</option>
                <option value={3}>Competición</option>
                <option value={4}>Rehabilitación</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Peso (kg, opcional)</label>
            <input type="number" step="0.1" className={inputClass} placeholder="70" {...register("weight")} />
          </div>

          {serverError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <PrimaryButton type="button" variant="ghost" onClick={onClose}>Cancelar</PrimaryButton>
            <PrimaryButton type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? "Creando…" : "Crear atleta"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAthletesPage() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: athletes = [], isLoading } = useQuery<AthleteListItem[]>({
    queryKey: ["athletes"],
    queryFn:  () => api.get<AthleteListItem[]>("/api/athletes"),
  });

  return (
    <div className="space-y-6">
      {showCreate && <CreateAthleteModal onClose={() => setShowCreate(false)} />}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Coach</p>
          <h1 className="text-display text-4xl text-zinc-50 mt-0.5">Atletas</h1>
          <p className="text-xs text-zinc-500 mt-1">{athletes.length} registrados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-2xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/20 shadow-glow-sm transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Agregar
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-3xl border border-surface-border bg-surface" />
          ))}
        </div>
      )}

      {!isLoading && athletes.length === 0 && (
        <div className="rounded-3xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-display text-2xl text-zinc-600">SIN ATLETAS</p>
          <p className="text-sm text-zinc-500 mt-2">No hay atletas registrados todavía.</p>
        </div>
      )}

      <div className="space-y-3">
        {athletes.map((athlete) => (
          <div key={athlete.id} className="rounded-3xl border border-surface-border bg-surface overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === athlete.id ? null : athlete.id)}
              className="w-full px-4 py-4 text-left hover:bg-surface-raised transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand">
                      {athlete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-100 truncate">{athlete.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {LEVEL_LABEL[athlete.level] ?? athlete.level}
                      {athlete.groups?.length > 0 && (
                        <span className="ml-1.5 text-zinc-600">· {athlete.groups.map(g => g.name).join(", ")}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {athlete.currentFactor != null && (
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", athlete.currentFactor > 1 ? "text-brand" : "text-zinc-300")}>
                        {Math.round(athlete.currentFactor * 100)}%
                      </p>
                      <p className="text-[9px] text-zinc-600">{factorLabel(athlete.currentFactor)}</p>
                    </div>
                  )}
                  {athlete.lastRpe != null && (
                    <Chip variant={athlete.lastRpe <= 6 ? "success" : athlete.lastRpe <= 8 ? "moderate" : "high"}>
                      RPE {athlete.lastRpe}
                    </Chip>
                  )}
                  {expanded === athlete.id
                    ? <ChevronUp className="h-4 w-4 text-zinc-500" />
                    : <ChevronDown className="h-4 w-4 text-zinc-500" />
                  }
                </div>
              </div>
            </button>

            {expanded === athlete.id && (
              <div className="border-t border-surface-border px-4 pb-4">
                <AthleteHistory athleteId={athlete.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
