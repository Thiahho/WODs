"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AdminPage() {
  const { data: session } = useQuery({
    queryKey: ["today-session"],
    queryFn:  () => api.get<{ id: number; date: string; wod: { title: string } }>("/api/workoutsessions/today"),
    retry:    false,
  });

  const today = new Date().toLocaleDateString("es", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Panel de administración</h1>
        <p className="mt-1 text-sm text-zinc-400 capitalize">{today}</p>
      </div>

      {/* Estado de hoy */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          WOD de hoy
        </p>
        {session ? (
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-zinc-100">{session.wod.title}</p>
            <Link
              href="/admin/session"
              className="text-xs text-orange-400 hover:underline"
            >
              Cambiar
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">No hay WOD asignado para hoy</p>
            <Link
              href="/admin/session"
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
            >
              Asignar WOD
            </Link>
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/admin/wods"
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition-colors"
        >
          <p className="text-sm font-semibold text-zinc-100">WODs</p>
          <p className="mt-1 text-xs text-zinc-500">Crear y gestionar workouts</p>
        </Link>
        <Link
          href="/admin/session"
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition-colors"
        >
          <p className="text-sm font-semibold text-zinc-100">Sesión de hoy</p>
          <p className="mt-1 text-xs text-zinc-500">Asignar el WOD del día</p>
        </Link>
      </div>
    </div>
  );
}
