"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAiWod } from "@/hooks/use-ai-wod";
import { useDailyLog } from "@/hooks/use-daily-log";
import { AiWodCard } from "@/components/ai-wod-card";
import { DailyLogForm } from "@/components/daily-log-form";
import { ApiError, api } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import { TodayWorkoutSchema } from "@/lib/schemas";

export default function WorkoutPage() {
  const router  = useRouter();
  const { data, isLoading: wodLoading, error: wodError, fetchToday, generate } = useAiWod();
  const { submitted, isLoading: logLoading, error: logError, submit, checkToday, setSubmitted } = useDailyLog();

  const [hasLog,           setHasLog]           = useState<boolean | null>(null);
  const [athleteWorkoutId, setAthleteWorkoutId] = useState<number | null>(null);

  async function loadAthleteWorkout() {
    try {
      const raw = await api.get<unknown>("/api/athlete-workouts/today/me");
      const aw  = TodayWorkoutSchema.parse(raw);
      setAthleteWorkoutId(aw.id);
    } catch {
      // Sin sesión aún — se intentará después de generar
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

  // Cuando el WOD queda disponible, asegurar que tenemos el athleteWorkoutId
  useEffect(() => {
    if (data && !athleteWorkoutId) {
      loadAthleteWorkout();
    }
  }, [data]);

  const isAuthError  = wodError instanceof ApiError && wodError.status === 401;
  const isLoading    = wodLoading || logLoading || hasLog === null;
  const showLog      = hasLog === false && !submitted && !data;
  const showGenerate = (submitted || hasLog === true) && !data;

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">

        {/* Nav */}
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-orange-500">CrossFitWOD</h1>
          <div className="flex items-center gap-4">
            <Link href="/history" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Historial</Link>
            <Link href="/profile" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Perfil</Link>
            <button onClick={handleLogout} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Salir</button>
          </div>
        </header>

        {/* Fecha */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">WOD de hoy</p>
          <p className="text-zinc-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 animate-pulse h-20" />
            ))}
          </div>
        )}

        {/* Auth error */}
        {isAuthError && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-center space-y-2">
            <p className="text-sm text-red-300">Sesión expirada</p>
            <button onClick={() => router.push("/login")} className="text-xs text-orange-400 hover:underline">Iniciar sesión</button>
          </div>
        )}

        {/* Paso 1: Daily log */}
        {!isLoading && !isAuthError && showLog && (
          <DailyLogForm onSubmit={submit} isLoading={logLoading} error={logError} />
        )}

        {/* Paso 2: Generar WOD */}
        {!isLoading && !isAuthError && showGenerate && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-4">
            <p className="text-3xl">🏋️</p>
            <p className="text-zinc-200 font-semibold">Todo listo</p>
            <p className="text-sm text-zinc-500">
              La IA analizará tu estado de hoy y generará un WOD personalizado.
            </p>
            {wodError && !isAuthError && (
              <p className="text-xs text-red-400">{(wodError as Error).message}</p>
            )}
            <button
              onClick={generate}
              disabled={wodLoading}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {wodLoading ? "Generando tu WOD..." : "⚡ Generar mi WOD con IA"}
            </button>
          </div>
        )}

        {/* Paso 3: WOD + registro de resultado */}
        {!isLoading && data && (
          <AiWodCard
            wod={data}
            athleteWorkoutId={athleteWorkoutId ?? undefined}
          />
        )}

      </div>
    </main>
  );
}
