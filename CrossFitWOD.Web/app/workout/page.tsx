"use client";

import { useTodayWorkout } from "@/hooks/use-today-workout";
import { WorkoutCard } from "@/components/workout-card";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

const ATHLETE_ID =
  process.env.NEXT_PUBLIC_ATHLETE_ID ?? "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

export default function WorkoutPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useTodayWorkout(ATHLETE_ID);

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
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Salir
          </button>
        </header>

        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            WOD de hoy
          </p>
          <p className="text-zinc-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("es", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 animate-pulse h-48" />
        )}

        {isError && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-center space-y-2">
            <p className="text-sm text-red-300">
              {(error as Error)?.message ?? "Error al cargar el WOD"}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="text-xs text-orange-400 hover:underline"
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {data && <WorkoutCard workout={data} athleteId={ATHLETE_ID} />}
      </div>
    </main>
  );
}
