"use client";

import { useTodayWorkout } from "@/hooks/use-today-workout";
import { WorkoutCard } from "@/components/workout-card";
import { useRouter } from "next/navigation";
import { removeToken, getRole } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import Link from "next/link";

export default function WorkoutPage() {
  const router  = useRouter();
  const isAdmin = getRole() === "admin";
  const { data, isLoading, isError, error } = useTodayWorkout();

  const isNoWod     = isError && error instanceof ApiError && error.status === 404;
  const isAuthError = isError && error instanceof ApiError && error.status === 401;

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
            <Link href="/history" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Historial
            </Link>
            <Link href="/profile" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Salir
            </button>
          </div>
        </header>

        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">WOD de hoy</p>
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

        {isNoWod && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-3">
            <p className="text-zinc-300 font-medium">No hay WOD para hoy</p>
            {isAdmin ? (
              <>
                <p className="text-sm text-zinc-500">
                  Todavía no asignaste el workout del día.
                </p>
                <button
                  onClick={() => router.push("/admin/session")}
                  className="mt-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Asignar WOD de hoy
                </button>
              </>
            ) : (
              <p className="text-sm text-zinc-500">
                Tu coach todavía no cargó el workout de hoy. Volvé más tarde.
              </p>
            )}
          </div>
        )}

        {isAuthError && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-center space-y-2">
            <p className="text-sm text-red-300">Sesión expirada</p>
            <button
              onClick={() => router.push("/login")}
              className="text-xs text-orange-400 hover:underline"
            >
              Iniciar sesión
            </button>
          </div>
        )}

        {isError && !isNoWod && !isAuthError && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6 text-center">
            <p className="text-sm text-red-300">
              {(error as Error)?.message ?? "Error al cargar el WOD"}
            </p>
          </div>
        )}

        {data && <WorkoutCard workout={data} />}
      </div>
    </main>
  );
}
