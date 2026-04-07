"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { SetupProfileSchema, type SetupProfileForm } from "@/lib/schemas";
import { useState } from "react";

const LEVELS = [
  { value: 1, label: "Principiante" },
  { value: 2, label: "Intermedio"   },
  { value: 3, label: "Avanzado"     },
];
const GOALS = [
  { value: 1, label: "General",        desc: "Mantenerme activo y saludable" },
  { value: 2, label: "Fitness",        desc: "Mejorar mi condición física"   },
  { value: 3, label: "Competencia",    desc: "Entrenar para competir"        },
  { value: 4, label: "Rehabilitación", desc: "Volver al entrenamiento"       },
];
const DAYS      = [2, 3, 4, 5, 6];
const DURATIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
];
const EQUIPMENT = [
  { value: "barbell",    label: "Barra"        },
  { value: "pullup_bar", label: "Barra de pull" },
  { value: "rings",      label: "Anillas"      },
  { value: "box",        label: "Cajón"        },
  { value: "kettlebell", label: "Kettlebell"   },
  { value: "rower",      label: "Remo"         },
];
const WEAK_POINTS = [
  { value: "gymnastics",    label: "Gimnasia"      },
  { value: "weightlifting", label: "Halterofilia"  },
  { value: "cardio",        label: "Cardio"        },
  { value: "strength",      label: "Fuerza"        },
  { value: "flexibility",   label: "Flexibilidad"  },
];

interface AthleteProfile {
  id:                    number;
  name:                  string;
  level:                 number;
  goal:                  number;
  weight:                number | null;
  daysPerWeek:           number;
  sessionDurationMinutes: number;
  equipment:             string;
  weakPoints:            string;
  injuryHistory:         string | null;
  commitmentLevel:       number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [serverError, setServerError]   = useState<string | null>(null);
  const [saved,       setSaved]         = useState(false);

  const { data: profile, isLoading } = useQuery<AthleteProfile>({
    queryKey: ["my-profile"],
    queryFn:  () => api.get<AthleteProfile>("/api/athletes/me"),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupProfileForm>({
    resolver:      zodResolver(SetupProfileSchema),
    values: profile ? {
      name:                   profile.name,
      level:                  profile.level,
      goal:                   profile.goal,
      weight:                 profile.weight ?? undefined,
      daysPerWeek:            profile.daysPerWeek,
      sessionDurationMinutes: profile.sessionDurationMinutes,
      equipment:              profile.equipment ?? "",
      weakPoints:             profile.weakPoints ?? "",
      injuryHistory:          profile.injuryHistory ?? "",
      commitmentLevel:        profile.commitmentLevel ?? 5,
    } : undefined,
  });

  const commitmentValue = watch("commitmentLevel") ?? 5;

  async function onSubmit(data: SetupProfileForm) {
    setServerError(null);
    setSaved(false);
    try {
      await api.put("/api/athletes/me", data);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message);
      else setServerError("Error de conexión");
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-orange-500">Editar perfil</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Tus cambios afectan el WOD generado</p>
          </div>
          <button
            onClick={() => router.push("/workout")}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Volver
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Nombre</label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Nivel</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <label key={l.value} className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-center has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10">
                  <input type="radio" value={l.value} className="sr-only" {...register("level")} />
                  <span className="text-xs font-medium text-zinc-300">{l.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Objetivo</label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <label key={g.value} className="flex cursor-pointer flex-col gap-0.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10">
                  <input type="radio" value={g.value} className="sr-only" {...register("goal")} />
                  <span className="text-xs font-medium text-zinc-200">{g.label}</span>
                  <span className="text-[11px] text-zinc-500">{g.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Peso corporal <span className="text-zinc-500">(kg, opcional)</span></label>
            <input
              type="number"
              step="0.1"
              min="1"
              placeholder="75"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("weight")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Días de entrenamiento por semana</label>
            <div className="flex gap-2">
              {DAYS.map((d) => (
                <label key={d} className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10">
                  <input type="radio" value={d} className="sr-only" {...register("daysPerWeek")} />
                  <span className="text-sm font-medium text-zinc-200">{d}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Duración de sesión</label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <label key={d.value} className="flex cursor-pointer items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10">
                  <input type="radio" value={d.value} className="sr-only" {...register("sessionDurationMinutes")} />
                  <span className="text-xs font-medium text-zinc-200">{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Equipamiento disponible</label>
            <Controller
              name="equipment"
              control={control}
              render={({ field }) => {
                const selected = field.value ? field.value.split(",").filter(Boolean) : [];
                const toggle = (v: string) => {
                  const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
                  field.onChange(next.join(","));
                };
                return (
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT.map((e) => (
                      <button key={e.value} type="button" onClick={() => toggle(e.value)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${selected.includes(e.value) ? "border-orange-500 bg-orange-500/10 text-orange-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                );
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Puntos débiles</label>
            <Controller
              name="weakPoints"
              control={control}
              render={({ field }) => {
                const selected = field.value ? field.value.split(",").filter(Boolean) : [];
                const toggle = (v: string) => {
                  const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
                  field.onChange(next.join(","));
                };
                return (
                  <div className="flex flex-wrap gap-2">
                    {WEAK_POINTS.map((w) => (
                      <button key={w.value} type="button" onClick={() => toggle(w.value)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${selected.includes(w.value) ? "border-orange-500 bg-orange-500/10 text-orange-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                        {w.label}
                      </button>
                    ))}
                  </div>
                );
              }}
            />
          </div>

          {/* Commitment level slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-zinc-300">
                Nivel de compromiso
              </label>
              <span className="font-bold text-orange-400">{commitmentValue}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              className="w-full accent-orange-500"
              {...register("commitmentLevel", { valueAsNumber: true })}
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Casual</span>
              <span>Full commitment</span>
            </div>
            <p className="text-xs text-zinc-600">La IA usa esto para calibrar la intensidad y el volumen.</p>
          </div>

          {/* Historial de lesiones */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">
              Historial de lesiones <span className="text-zinc-500">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="ej: hombro derecho operado en 2022, rodilla izquierda con molestia al correr..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              {...register("injuryHistory")}
            />
            <p className="text-xs text-zinc-600">La IA evita movimientos que puedan agravar lesiones activas.</p>
          </div>

          {saved && (
            <p className="rounded-lg bg-emerald-900/30 border border-emerald-700/40 px-3 py-2 text-sm text-emerald-300">
              Perfil actualizado correctamente.
            </p>
          )}
          {serverError && (
            <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </div>
    </main>
  );
}
