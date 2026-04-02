"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useState } from "react";

interface Wod {
  id: number;
  title: string;
  type: string;
  durationMinutes: number;
}

interface TodaySession {
  id: number;
  date: string;
  wod: { id: number; title: string };
}

export default function SessionPage() {
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd

  const { data: wods = [] } = useQuery<Wod[]>({
    queryKey: ["wods"],
    queryFn:  () => api.get<Wod[]>("/api/wods"),
  });

  const { data: session } = useQuery<TodaySession>({
    queryKey: ["today-session"],
    queryFn:  () => api.get<TodaySession>("/api/workoutsessions/today"),
    retry:    false,
  });

  const mutation = useMutation({
    mutationFn: (wodId: number) =>
      api.post("/api/workoutsessions", { wodId, date: today }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-session"] });
      queryClient.invalidateQueries({ queryKey: ["today-workout"] });
      router.push("/admin");
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Error al crear la sesión");
    },
  });

  const WOD_TYPE_LABEL: Record<string, string> = { ForTime: "For Time", Amrap: "AMRAP", Emom: "EMOM" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Sesión de hoy</h1>
        <p className="mt-1 text-sm text-zinc-400">{today}</p>
      </div>

      {session && (
        <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
            WOD actual
          </p>
          <p className="mt-1 text-lg font-bold text-zinc-100">{session.wod.title}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Podés reemplazarlo seleccionando otro abajo</p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">Seleccioná el WOD del día</p>

        {wods.length === 0 && (
          <p className="text-sm text-zinc-500">
            No hay WODs disponibles.{" "}
            <a href="/admin/wods" className="text-orange-400 hover:underline">
              Creá uno primero.
            </a>
          </p>
        )}

        <div className="space-y-2">
          {wods.map((wod) => (
            <button
              key={wod.id}
              type="button"
              onClick={() => setSelected(wod.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                selected === wod.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-100">{wod.title}</span>
                <span className="text-xs text-zinc-500">
                  {WOD_TYPE_LABEL[wod.type] ?? wod.type} · {wod.durationMinutes} min
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      <button
        disabled={!selected || mutation.isPending}
        onClick={() => selected && mutation.mutate(selected)}
        className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
      >
        {mutation.isPending ? "Guardando…" : "Asignar WOD a hoy"}
      </button>
    </div>
  );
}
