"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setHasProfile } from "@/lib/auth";
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

const DAYS = [2, 3, 4, 5, 6];
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

export default function SetupPage() {
  const router    = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [attempted, setAttempted]     = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupProfileForm>({
    resolver: zodResolver(SetupProfileSchema),
    defaultValues: { level: 2, goal: 1, daysPerWeek: 3, sessionDurationMinutes: 45 },
  });

  const equipmentValue = watch("equipment") ?? "";
  const noEquipment    = equipmentValue === "" || equipmentValue.split(",").filter(Boolean).length === 0;

  async function onSubmit(data: SetupProfileForm) {
    setAttempted(true);
    setServerError(null);
    try {
      await api.post("/api/athletes/me", data);
      setHasProfile();
      router.push("/workout");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Ya tiene perfil — sincronizar cookie y continuar
        setHasProfile();
        router.push("/workout");
      } else if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Error de conexión");
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-500">CrossFitWOD</h1>
          <p className="mt-1 text-sm text-zinc-400">Completá tu perfil de atleta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Nivel */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">
              Nivel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <label
                  key={l.value}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-center has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10"
                >
                  <input
                    type="radio"
                    value={l.value}
                    className="sr-only"
                    {...register("level")}
                  />
                  <span className="text-xs font-medium text-zinc-300">{l.label}</span>
                </label>
              ))}
            </div>
            {errors.level && (
              <p className="text-xs text-red-400">{errors.level.message}</p>
            )}
          </div>

          {/* Objetivo */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">Objetivo</label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <label
                  key={g.value}
                  className="flex cursor-pointer flex-col gap-0.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10"
                >
                  <input
                    type="radio"
                    value={g.value}
                    className="sr-only"
                    {...register("goal")}
                  />
                  <span className="text-xs font-medium text-zinc-200">{g.label}</span>
                  <span className="text-[11px] text-zinc-500">{g.desc}</span>
                </label>
              ))}
            </div>
            {errors.goal && (
              <p className="text-xs text-red-400">{errors.goal.message}</p>
            )}
          </div>

          {/* Peso (opcional) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="weight">
              Peso corporal <span className="text-zinc-500">(kg, opcional)</span>
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="1"
              placeholder="75"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("weight")}
            />
            {errors.weight && (
              <p className="text-xs text-red-400">{errors.weight.message}</p>
            )}
          </div>

          {/* Días por semana */}
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

          {/* Duración de sesión */}
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

          {/* Equipamiento */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">
              Equipamiento disponible <span className="text-zinc-500">(opcional)</span>
            </label>
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
            {attempted && noEquipment && (
              <p className="rounded-lg bg-amber-900/30 border border-amber-700/40 px-3 py-2 text-xs text-amber-300">
                Sin equipamiento seleccionado tus WODs serán solo con peso corporal (burpees, flexiones, sentadillas).
              </p>
            )}
          </div>

          {/* Puntos débiles */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">
              Puntos débiles <span className="text-zinc-500">(opcional)</span>
            </label>
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

          {serverError && (
            <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Guardando…" : "Crear perfil"}
          </button>
        </form>
      </div>
    </main>
  );
}
