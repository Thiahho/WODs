"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import {
  SetupProfileSchema, type SetupProfileForm,
  ChangePasswordSchema, type ChangePasswordForm,
} from "@/lib/schemas";
import { PrimaryButton } from "@/components/ui/primary-button";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeToken, getRole, setMode, getMode } from "@/lib/auth";
import { User, CheckCircle2, LogOut, KeyRound, ChevronDown, Zap } from "lucide-react";

const LEVELS = [
  { value: 1, label: "Principiante", icon: "🌱" },
  { value: 2, label: "Intermedio",   icon: "⚡" },
  { value: 3, label: "Avanzado",     icon: "🔥" },
];
const GOALS = [
  { value: 1, label: "General",        desc: "Mantenerme activo y saludable" },
  { value: 2, label: "Fitness",        desc: "Mejorar mi condición física"   },
  { value: 3, label: "Competencia",    desc: "Entrenar para competir"        },
  { value: 4, label: "Rehabilitación", desc: "Volver al entrenamiento"       },
];
const DAYS      = [2, 3, 4, 5, 6];
const DURATIONS = [
  { value: 30, label: "30m" },
  { value: 45, label: "45m" },
  { value: 60, label: "60m" },
  { value: 90, label: "90m" },
];
const EQUIPMENT = [
  { value: "barbell",    label: "Barra"      },
  { value: "pullup_bar", label: "Barra Pull" },
  { value: "rings",      label: "Anillas"    },
  { value: "box",        label: "Cajón"      },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "rower",      label: "Remo"       },
];
const WEAK_POINTS = [
  { value: "gymnastics",    label: "Gimnasia"     },
  { value: "weightlifting", label: "Halterofilia" },
  { value: "cardio",        label: "Cardio"       },
  { value: "strength",      label: "Fuerza"       },
  { value: "flexibility",   label: "Flexibilidad" },
];

interface AthleteProfile {
  id: number; name: string; level: number; goal: number;
  weight: number | null; daysPerWeek: number;
  sessionDurationMinutes: number; equipment: string;
  weakPoints: string; injuryHistory: string | null;
  commitmentLevel: number;
  edad: number;
}

const inputClass  = "w-full rounded-2xl border border-surface-border bg-surface-raised px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30";
const labelClass  = "text-[10px] font-semibold uppercase tracking-widest text-zinc-500";
const sectionClass = "rounded-3xl border border-surface-border bg-surface p-4 space-y-4";

export default function ProfilePage() {
  const router      = useRouter();
  const queryClient = useQueryClient();

  const isCoach        = getRole() === "admin";
  const inAthleteMode  = getMode() === "athlete";

  const [profileError,  setProfileError]  = useState<string | null>(null);
  const [profileSaved,  setProfileSaved]  = useState(false);
  const [pwError,       setPwError]       = useState<string | null>(null);
  const [pwSaved,       setPwSaved]       = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);

  // ── Athlete profile ──────────────────────────────────────────────────────────
  const { data: profile, isLoading, error: queryError } = useQuery<AthleteProfile, ApiError>({
    queryKey: ["my-profile"],
    queryFn:  () => api.get<AthleteProfile>("/api/athletes/me"),
    retry:    false,
  });

  const noProfile = queryError instanceof ApiError && queryError.status === 404;

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<SetupProfileForm>({
    resolver: zodResolver(SetupProfileSchema),
    defaultValues: {
      level:                  2,
      goal:                   1,
      daysPerWeek:            3,
      sessionDurationMinutes: 45,
      equipment:              "",
      weakPoints:             "",
      commitmentLevel:        5,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
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
      });
    }
  }, [profile]);

  const commitmentValue = watch("commitmentLevel") ?? 5;

  async function onSubmitProfile(data: SetupProfileForm) {
    setProfileError(null);
    setProfileSaved(false);
    try {
      if (noProfile) {
        await api.post("/api/athletes/me", data);
      } else {
        await api.put("/api/athletes/me", data);
      }
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setProfileSaved(true);
    } catch (err) {
      if (err instanceof ApiError) setProfileError(err.message);
      else setProfileError("Error de conexión");
    }
  }

  // ── Password change ──────────────────────────────────────────────────────────
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  async function onSubmitPassword(data: ChangePasswordForm) {
    setPwError(null);
    setPwSaved(false);
    try {
      await api.put("/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      });
      resetPw();
      setPwSaved(true);
    } catch (err) {
      if (err instanceof ApiError) setPwError(err.message);
      else setPwError("Error de conexión");
    }
  }

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  function handleToggleAthleteMode() {
    if (inAthleteMode) {
      setMode("coach");
      router.push("/admin");
    } else {
      setMode("athlete");
      router.push("/workout");
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-brand/20 border border-brand/30" />
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-6">
      <div className="mx-auto max-w-md space-y-6">

        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-brand/10 shadow-glow-sm">
            <User className="h-6 w-6 text-brand" />
          </div>
          <div className="flex-1">
            <h1 className="text-display text-3xl text-zinc-50">{profile?.name ?? "Atleta"}</h1>
            <p className="text-xs text-zinc-500">{noProfile ? "Configurar perfil de atleta" : "Editar perfil"}</p>
          </div>
          <div className="flex items-center gap-2">
            {isCoach && (
              <button
                type="button"
                onClick={handleToggleAthleteMode}
                className={cn(
                  "flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors",
                  inAthleteMode
                    ? "border-zinc-600 bg-surface text-zinc-400 hover:border-zinc-500"
                    : "border-brand/40 bg-brand/10 text-brand hover:bg-brand/20 shadow-glow-sm"
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                {inAthleteMode ? "Panel coach" : "Entrenar"}
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </header>

        {/* Sin perfil de atleta — banner informativo */}
        {noProfile && (
          <div className="rounded-3xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-zinc-300">
            Todavía no tenés perfil de atleta. Completá el formulario para que la IA pueda generar WODs personalizados para vos.
          </div>
        )}

        {/* Perfil form */}
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">

          <div className={sectionClass}>
            <label className={labelClass}>Nombre</label>
            <input type="text" className={inputClass} {...register("name")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>Nivel CrossFit</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <label key={l.value} className="cursor-pointer">
                  <div className="flex flex-col items-center gap-1 rounded-2xl border border-surface-border bg-surface-raised py-2.5 text-center transition-all has-[input:checked]:border-brand has-[input:checked]:bg-brand/10 has-[input:checked]:shadow-glow-sm">
                    <input type="radio" value={l.value} className="sr-only" {...register("level")} />
                    <span className="text-lg">{l.icon}</span>
                    <span className="text-[11px] font-semibold text-zinc-300">{l.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>Objetivo</label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <label key={g.value} className="cursor-pointer">
                  <div className="flex flex-col gap-0.5 rounded-2xl border border-surface-border bg-surface-raised px-3 py-2.5 transition-all has-[input:checked]:border-brand has-[input:checked]:bg-brand/10 has-[input:checked]:shadow-glow-sm">
                    <input type="radio" value={g.value} className="sr-only" {...register("goal")} />
                    <span className="text-xs font-semibold text-zinc-200">{g.label}</span>
                    <span className="text-[10px] text-zinc-500">{g.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>
              Peso corporal <span className="normal-case font-normal text-zinc-600">(kg, opcional)</span>
            </label>
            <input type="number" step="0.1" min="1" placeholder="75" className={inputClass} {...register("weight")} />
          </div>

          <div className={sectionClass}>
            <div className="space-y-3">
              <label className={labelClass}>Días / semana</label>
              <div className="flex gap-2">
                {DAYS.map((d) => (
                  <label key={d} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center rounded-2xl border border-surface-border bg-surface-raised py-2 transition-all has-[input:checked]:border-brand has-[input:checked]:bg-brand/10">
                      <input type="radio" value={d} className="sr-only" {...register("daysPerWeek")} />
                      <span className="text-sm font-bold text-zinc-200">{d}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className={labelClass}>Duración de sesión</label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map((d) => (
                  <label key={d.value} className="cursor-pointer">
                    <div className="flex items-center justify-center rounded-2xl border border-surface-border bg-surface-raised py-2 transition-all has-[input:checked]:border-brand has-[input:checked]:bg-brand/10">
                      <input type="radio" value={d.value} className="sr-only" {...register("sessionDurationMinutes")} />
                      <span className="text-xs font-semibold text-zinc-200">{d.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>Equipamiento</label>
            <Controller
              name="equipment" control={control}
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
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>Puntos débiles</label>
            <Controller
              name="weakPoints" control={control}
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

          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <label className={labelClass}>Nivel de compromiso</label>
              <span className="text-display text-3xl text-brand">{commitmentValue}/10</span>
            </div>
            <input type="range" min={1} max={10} step={1} {...register("commitmentLevel", { valueAsNumber: true })} />
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              <span>Casual</span>
              <span>Full commitment</span>
            </div>
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>
              Historial de lesiones <span className="normal-case font-normal text-zinc-600">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="ej: hombro derecho operado en 2022…"
              className={`${inputClass} resize-none`}
              {...register("injuryHistory")}
            />
          </div>

          {profileSaved && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">
                {noProfile ? "Perfil creado correctamente." : "Perfil actualizado correctamente."}
              </p>
            </div>
          )}
          {profileError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {profileError}
            </div>
          )}

          <PrimaryButton type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Guardando…" : noProfile ? "Crear perfil" : "Guardar cambios"}
          </PrimaryButton>
        </form>

        {/* Cambiar contraseña */}
        <div className="rounded-3xl border border-surface-border bg-surface overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPwSection((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-300">Cambiar contraseña</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform", showPwSection && "rotate-180")} />
          </button>

          {showPwSection && (
            <form onSubmit={handleSubmitPw(onSubmitPassword)} className="space-y-3 px-4 pb-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Contraseña actual</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  {...registerPw("currentPassword")}
                />
                {pwErrors.currentPassword && <p className="text-xs text-red-400">{pwErrors.currentPassword.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Nueva contraseña</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputClass}
                  {...registerPw("newPassword")}
                />
                {pwErrors.newPassword && <p className="text-xs text-red-400">{pwErrors.newPassword.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Repetir nueva contraseña</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputClass}
                  {...registerPw("confirmNewPassword")}
                />
                {pwErrors.confirmNewPassword && <p className="text-xs text-red-400">{pwErrors.confirmNewPassword.message}</p>}
              </div>

              {pwSaved && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-300">Contraseña actualizada.</p>
                </div>
              )}
              {pwError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {pwError}
                </div>
              )}

              <PrimaryButton type="submit" disabled={pwSubmitting} size="md">
                {pwSubmitting ? "Actualizando…" : "Actualizar contraseña"}
              </PrimaryButton>
            </form>
          )}
        </div>

        <div className="pb-safe" />
      </div>
    </main>
  );
}
