"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Chip } from "@/components/ui/chip";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
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

const WOD_TYPE_LABEL: Record<string, string> = { ForTime: "For Time", Amrap: "AMRAP", Emom: "EMOM" };

export default function SessionPage() {
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Coach</p>
        <h1 className="text-display text-4xl text-zinc-50 mt-0.5">Sesión de hoy</h1>
        <p className="text-xs text-zinc-500 mt-1">{today}</p>
      </div>

      {/* Current WOD */}
      {session && (
        <div className="rounded-3xl border border-brand/25 bg-brand/5 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand">WOD actual</p>
            <p className="text-sm font-bold text-zinc-100 mt-0.5">{session.wod.title}</p>
            <p className="text-[10px] text-zinc-500">Podés reemplazarlo seleccionando otro abajo</p>
          </div>
        </div>
      )}

      {/* WOD list */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Seleccioná el WOD del día
        </p>

        {wods.length === 0 && (
          <p className="text-sm text-zinc-500 py-4">
            No hay WODs disponibles.{" "}
            <a href="/admin/wods" className="font-semibold text-brand hover:text-brand-light">
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
              className={cn(
                "w-full rounded-2xl border px-4 py-3.5 text-left transition-all",
                selected === wod.id
                  ? "border-brand bg-brand/8 shadow-glow-sm"
                  : "border-surface-border bg-surface hover:border-zinc-600"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-100">{wod.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Chip variant="default">{WOD_TYPE_LABEL[wod.type] ?? wod.type}</Chip>
                  <span className="text-[10px] text-zinc-500">{wod.durationMinutes} min</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <PrimaryButton
        disabled={!selected || mutation.isPending}
        onClick={() => selected && mutation.mutate(selected)}
        size="lg"
      >
        {mutation.isPending ? "Guardando…" : "Asignar WOD a hoy"}
      </PrimaryButton>
    </div>
  );
}
