"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { HistoryEntry } from "@/hooks/use-history";

interface AthleteListItem {
  id:              number;
  name:            string;
  level:           string;
  currentFactor:   number | null;
  lastWorkoutDate: string | null;
  lastRpe:         number | null;
  lastCompleted:   boolean | null;
}

const LEVEL_LABEL: Record<string, string> = {
  Beginner:     "Principiante",
  Intermediate: "Intermedio",
  Advanced:     "Avanzado",
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
  if (rpe <= 8) return "text-orange-400";
  return "text-red-400";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AthleteHistory({ athleteId }: { athleteId: number }) {
  const { data: entries = [], isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ["athlete-history", athleteId],
    queryFn:  () => api.get<HistoryEntry[]>(`/api/athletes/${athleteId}/history`),
  });

  if (isLoading) return <div className="py-4 animate-pulse text-xs text-zinc-500">Cargando...</div>;
  if (entries.length === 0) return <p className="py-3 text-xs text-zinc-500">Sin resultados registrados.</p>;

  return (
    <div className="mt-3 space-y-2">
      {entries.map((entry, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 rounded-lg bg-zinc-800/50 px-3 py-2 text-xs">
          <div>
            <p className="text-zinc-500">Fecha</p>
            <p className="text-zinc-300 mt-0.5">
              {new Date(entry.date + "T00:00:00").toLocaleDateString("es", {
                day: "numeric", month: "short",
              })}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">WOD</p>
            <p className="text-zinc-300 mt-0.5 truncate">{entry.wodTitle}</p>
          </div>
          <div>
            <p className="text-zinc-500">Resultado</p>
            <p className="text-zinc-300 mt-0.5">
              {entry.wodType === "ForTime"
                ? entry.timeSeconds ? formatTime(entry.timeSeconds) : (entry.completed ? "—" : "DNF")
                : entry.rounds != null ? `${entry.rounds} rondas` : "—"}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">RPE / Vol.</p>
            <p className="mt-0.5">
              <span className={`font-bold ${rpeColor(entry.rpe)}`}>{entry.rpe}</span>
              <span className="text-zinc-500"> · {Math.round(entry.scaledRepsFactor * 100)}%</span>
            </p>
          </div>
        </div>
      ))}
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
        setServerError("No se pudo crear el atleta. Intenta de nuevo.");
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 space-y-5">
        <h2 className="text-lg font-bold text-zinc-100">Agregar atleta</h2>
        <form onSubmit={handleSubmit((d) => { setServerError(null); mutation.mutate(d); })} className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Usuario</label>
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="usuario"
                {...register("username", { required: "Requerido", minLength: { value: 3, message: "Mín. 3 chars" } })}
              />
              {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Contraseña</label>
              <input
                type="password"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••"
                {...register("password", { required: "Requerido", minLength: { value: 6, message: "Mín. 6 chars" } })}
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Nombre completo</label>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Juan Pérez"
              {...register("name", { required: "Requerido" })}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Nivel</label>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                {...register("level")}
              >
                <option value={1}>Principiante</option>
                <option value={2}>Intermedio</option>
                <option value={3}>Avanzado</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Objetivo</label>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                {...register("goal")}
              >
                <option value={1}>General</option>
                <option value={2}>Fitness</option>
                <option value={3}>Competición</option>
                <option value={4}>Rehabilitación</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Peso (kg, opcional)</label>
            <input
              type="number"
              step="0.1"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="70"
              {...register("weight")}
            />
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">{serverError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? "Creando…" : "Crear atleta"}
            </button>
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
          <h1 className="text-2xl font-bold text-zinc-100">Atletas</h1>
          <p className="mt-1 text-sm text-zinc-400">{athletes.length} registrados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          + Agregar atleta
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl border border-zinc-800 bg-zinc-900 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && athletes.length === 0 && (
        <p className="text-sm text-zinc-500 py-8 text-center">No hay atletas registrados todavía.</p>
      )}

      <div className="space-y-3">
        {athletes.map((athlete) => (
          <div key={athlete.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            {/* Fila principal */}
            <button
              onClick={() => setExpanded(expanded === athlete.id ? null : athlete.id)}
              className="w-full px-4 py-4 text-left hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-400">
                      {athlete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-100 truncate">{athlete.name}</p>
                    <p className="text-xs text-zinc-500">{LEVEL_LABEL[athlete.level] ?? athlete.level}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Factor actual */}
                  {athlete.currentFactor != null && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-400">
                        {Math.round(athlete.currentFactor * 100)}%
                      </p>
                      <p className="text-xs text-zinc-500">{factorLabel(athlete.currentFactor)}</p>
                    </div>
                  )}

                  {/* Último RPE */}
                  {athlete.lastRpe != null && (
                    <div className="text-right">
                      <p className={`text-sm font-bold ${rpeColor(athlete.lastRpe)}`}>
                        RPE {athlete.lastRpe}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {athlete.lastWorkoutDate
                          ? new Date(athlete.lastWorkoutDate + "T00:00:00").toLocaleDateString("es", {
                              day: "numeric", month: "short",
                            })
                          : "—"}
                      </p>
                    </div>
                  )}

                  <span className="text-zinc-500 text-xs">
                    {expanded === athlete.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>
            </button>

            {/* Historial expandible */}
            {expanded === athlete.id && (
              <div className="border-t border-zinc-800 px-4 pb-4">
                <AthleteHistory athleteId={athlete.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
