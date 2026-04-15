"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAiWod } from "@/hooks/use-ai-wod";
import { useDailyLog } from "@/hooks/use-daily-log";
import { WodDetailCard } from "@/components/wod-detail-card";
import { DailyLogForm } from "@/components/daily-log-form";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ApiError, api } from "@/lib/api";
import { TodayWorkoutSchema, type TodayWorkout } from "@/lib/schemas";
import { Zap, BrainCircuit, UserCircle } from "lucide-react";
import Link from "next/link";
import { getRole, getMode } from "@/lib/auth";

export default function WorkoutPage() {
  const router  = useRouter();

  useEffect(() => {
    if (getRole() === "admin" && getMode() !== "athlete") router.replace("/admin");
  }, []);
  const { data, isLoading: wodLoading, error: wodError, fetchToday, generate } = useAiWod();
  const { submitted, isLoading: logLoading, error: logError, submit, checkToday, setSubmitted } = useDailyLog();

<<<<<<< HEAD
  const [hasLog, setHasLog]   = useState<boolean | null>(null);
  const [workout, setWorkout] = useState<TodayWorkout | null>(null);
=======
  const [hasLog,            setHasLog]            = useState<boolean | null>(null);
  const [athleteWorkoutId,  setAthleteWorkoutId]  = useState<number | null>(null);
  const [scaledRepsFactor,  setScaledRepsFactor]  = useState<number>(1);
>>>>>>> claude/crossfit-mobile-design-iMPDq

  async function loadAthleteWorkout() {
    try {
      const raw = await api.get<unknown>("/api/athlete-workouts/today/me");
<<<<<<< HEAD
      setWorkout(TodayWorkoutSchema.parse(raw));
=======
      const aw  = TodayWorkoutSchema.parse(raw);
      setAthleteWorkoutId(aw.id);
      setScaledRepsFactor(aw.scaledRepsFactor);
>>>>>>> claude/crossfit-mobile-design-iMPDq
    } catch {
      // Sin sesión aún — se cargará después de generar
    }
  }

  useEffect(() => {
    async function init() {
      await fetchToday();
      const logged = await checkToday();
      setHasLog(logged);
      if (logged) setSubmitted(true);
      await loadAthleteWorkout();
    }
    init();
  }, []);

  // Tras generar el WOD con IA, cargar el AthleteWorkout completo para mostrarlo
  useEffect(() => {
    if (data && !workout) {
      loadAthleteWorkout();
    }
  }, [data]);

  const isAuthError  = wodError instanceof ApiError && wodError.status === 401;
  const isNoProfile  = wodError instanceof ApiError && wodError.status === 404;
  const isLoading    = wodLoading || logLoading || hasLog === null || (!!data && !workout);
  const showLog      = !workout && hasLog === false && !submitted && !data;
  const showGenerate = !workout && (submitted || hasLog === true) && !data;

  const today = new Date().toLocaleDateString("es", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <main className="min-h-screen px-4 pt-6">
      <div className="mx-auto max-w-md space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {today}
            </p>
            <h1 className="text-display text-3xl text-zinc-50 mt-0.5">WOD del día</h1>
          </div>
          <div className="h-10 w-10 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center">
            <Zap className="h-5 w-5 text-brand" />
          </div>
        </header>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-36 rounded-3xl border border-surface-border bg-surface" />
            <div className="h-24 rounded-3xl border border-surface-border bg-surface" />
            <div className="h-24 rounded-3xl border border-surface-border bg-surface" />
          </div>
        )}

        {/* Sin perfil de atleta */}
        {isNoProfile && (
          <div className="rounded-3xl border border-brand/20 bg-brand/5 p-6 text-center space-y-3 animate-fade-up">
            <UserCircle className="mx-auto h-10 w-10 text-brand/60" />
            <p className="text-sm font-semibold text-zinc-200">Necesitás un perfil de atleta</p>
            <p className="text-xs text-zinc-500">Configurá tu perfil para que la IA pueda generar WODs personalizados.</p>
            <Link href="/profile">
              <PrimaryButton variant="outline" size="sm">Crear perfil</PrimaryButton>
            </Link>
          </div>
        )}

        {/* Auth error */}
        {isAuthError && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-3">
            <p className="text-sm text-red-300">Sesión expirada</p>
            <PrimaryButton variant="outline" size="sm" onClick={() => router.push("/login")}>
              Iniciar sesión
            </PrimaryButton>
          </div>
        )}

        {/* Step 1: Daily log */}
        {!isLoading && !isAuthError && showLog && (
          <div className="animate-fade-up">
            <DailyLogForm onSubmit={submit} isLoading={logLoading} error={logError} />
          </div>
        )}

        {/* Step 2: Generate WOD */}
        {!isLoading && !isAuthError && showGenerate && (
          <div className="animate-fade-up rounded-3xl border border-brand/20 bg-brand/5 p-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 border border-brand/30">
              <BrainCircuit className="h-8 w-8 text-brand" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-zinc-100">Check-in completado</p>
              <p className="text-sm text-zinc-500">
                La IA va a analizar tu estado de hoy y generar un WOD a tu medida.
              </p>
            </div>
            {wodError && !isAuthError && (
              <p className="text-xs text-red-400">{(wodError as Error).message}</p>
            )}
            <PrimaryButton
              onClick={generate}
              disabled={wodLoading}
              size="lg"
            >
              {wodLoading ? "Generando tu WOD…" : "⚡ Generar mi WOD con IA"}
            </PrimaryButton>
          </div>
        )}

        {/* Step 3: WOD display */}
        {!isLoading && workout && (
          <div className="animate-fade-up">
<<<<<<< HEAD
            <WodDetailCard
              workout={workout}
              alert={data?.alert}
              nutritionTip={data?.nutritionTip}
=======
            <AiWodCard
              wod={data}
              athleteWorkoutId={athleteWorkoutId ?? undefined}
              scaledRepsFactor={scaledRepsFactor}
>>>>>>> claude/crossfit-mobile-design-iMPDq
            />
          </div>
        )}

      </div>
    </main>
  );
}
