"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setHasProfile } from "@/lib/auth";
import { SetupProfileSchema, type SetupProfileForm } from "@/lib/schemas";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useState } from "react";
import { cn } from "@/lib/cn";

const LEVELS = [
  { value: 1, label: "Begginer", icon: "🌱" },
  { value: 2, label: "Amateur",   icon: "⚡" },
  { value: 3, label: "Scaled",   icon: "⚡" },
  { value: 4, label: "Rx",     icon: "🔥" },
  { value: 5, label: "Elite",     icon: "🔥" },
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
  { value: "pullup_bar", label: "Barra Pull"   },
  { value: "rings",      label: "Anillas"      },
  { value: "box",        label: "Cajón"        },
  { value: "kettlebell", label: "Kettlebell"   },
  { value: "rower",      label: "Remo"         },
];
const WEAK_POINTS = [
  { value: "gymnastics",    label: "Gimnasia"     },
  { value: "weightlifting", label: "Halterofilia" },
  { value: "cardio",        label: "Cardio"       },
  { value: "strength",      label: "Fuerza"       },
  { value: "flexibility",   label: "Flexibilidad" },
];

const inputClass = "w-full rounded-2xl border border-surface-border bg-surface px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30";
const labelClass = "text-xs font-semibold uppercase tracking-widest text-zinc-400";

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
    <main className="relative min-h-screen px-6 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-brand-radial" />

      <div className="mx-auto w-full max-w-sm space-y-8 animate-fade-up">
        <div className="text-center space-y-1">
          <h1 className="text-display text-5xl text-brand glow-text">Tu perfil</h1>
          <p className="text-sm text-zinc-500">La IA usa esto para personalizar cada WOD</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Nombre */}
          <div className="space-y-2">
            <label className={labelClass} htmlFor="name">Nombre</label>
            <input id="name" type="text" placeholder="Tu nombre" className={inputClass} {...register("name")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          {/* Nivel */}
          <div className="space-y-2">
            <label className={labelClass}>Nivel CrossFit</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <label key={l.value} className="cursor-pointer flex flex-col items-center gap-1.5 rounded-2xl border border-surface-border bg-surface px-3 py-3 text-center transition-all has-[input:checked]:border-brand has-[input:checked]:bg-brand/10 has-[input:checked]:shadow-glow-sm">
                  <input type="radio" value={l.value} className="sr-only" {...register("level")} />
                  <span className="text-xl">{l.icon}</span>
                  <span className="text-xs font-semibold text-zinc-300">{l.label}</span>
                </label>
              ))}
            </div>
            {errors.level && <p className="text-xs text-red-400">{errors.level.message}</p>}
          </div>

          {/* Objetivo */}
          <div className="space-y-2">
            <label className={labelClass}>Objetivo</label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <label key={g.value} className="cursor-pointer flex flex-col gap-0.5 rounded-2xl border border-surface-border bg-surface px-3 py-3 transition-all has-[input:checked]:border-brand has-[input:checked]:bg-brand/10 has-[input:checked]:shadow-glow-sm">
                  <input type="radio" value={g.value} className="sr-only" {...register("goal")} />
                  <span className="text-xs font-semibold text-zinc-200">{g.label}</span>
                  <span className="text-[11px] text-zinc-500">{g.desc}</span>
                </label>
              ))}
            </div>
            {errors.goal && <p className="text-xs text-red-400">{errors.goal.message}</p>}
          </div>

          {/* Peso */}
          <div className="space-y-2">
            <label className={labelClass} htmlFor="weight">
              Peso corporal <span className="normal-case font-normal text-zinc-600">(kg, opcional)</span>
            </label>
            <input id="weight" type="number" step="0.1" min="1" placeholder="75" className={inputClass} {...register("weight")} />
          </div>

          {/* Días */}
          <div className="space-y-2">
            <label className={labelClass}>Días de entrenamiento / semana</label>
            <div className="flex gap-2">
              {DAYS.map((d) => (
                <label key={d} className="flex-1 cursor-pointer flex items-center justify-center rounded-2xl border border-surface-border bg-surface py-2.5 transition-all has-[input:checked]:border-brand has-[input:checked]:bg-brand/10 has-[input:checked]:shadow-glow-sm">
                  <input type="radio" value={d} className="sr-only" {...register("daysPerWeek")} />
                  <span className="text-sm font-bold text-zinc-200">{d}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duración 
          <div className="space-y-2">
            <label className={labelClass}>Duración de sesión</label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <label key={d.value} className="cursor-pointer flex items-center justify-center rounded-2xl border border-surface-border bg-surface py-2.5 transition-all has-[input:checked]:border-brand has-[input:checked]:bg-brand/10">
                  <input type="radio" value={d.value} className="sr-only" {...register("sessionDurationMinutes")} />
                  <span className="text-xs font-semibold text-zinc-200">{d.label}</span>
                </label>
              ))}
            </div>
          </div>
            */}
          {/* Equipamiento */}
          <div className="space-y-2">
            <label className={labelClass}>Equipamiento <span className="normal-case font-normal text-zinc-600">(opcional)</span></label>
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
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                          selected.includes(e.value)
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-surface-border text-zinc-500 hover:border-zinc-600"
                        )}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                );
              }}
            />
            {attempted && noEquipment && (
              <p className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
                Sin equipamiento: WODs solo con peso corporal (burpees, flexiones, sentadillas).
              </p>
            )}
          </div>

          {/* Puntos débiles */}
          <div className="space-y-2">
            <label className={labelClass}>Puntos débiles <span className="normal-case font-normal text-zinc-600">(opcional)</span></label>
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
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                          selected.includes(w.value)
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-surface-border text-zinc-500 hover:border-zinc-600"
                        )}>
                        {w.label}
                      </button>
                    ))}
                  </div>
                );
              }}
            />
          </div>

          {serverError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <PrimaryButton type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Guardando…" : "Comenzar a entrenar →"}
          </PrimaryButton>
        </form>
      </div>
    </main>
  );
}
