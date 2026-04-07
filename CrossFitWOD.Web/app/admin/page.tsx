"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Calendar, Dumbbell, Users, ChevronRight } from "lucide-react";

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
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Panel</p>
        <h1 className="text-display text-4xl text-zinc-50 mt-0.5 capitalize">{today}</h1>
      </div>

      {/* WOD del día */}
      <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/20 border border-brand/30">
            <Calendar className="h-3.5 w-3.5 text-brand" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">WOD de hoy</p>
        </div>

        {session ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-display text-3xl text-zinc-50">{session.wod.title}</p>
            <Link
              href="/admin/session"
              className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-light transition-colors shrink-0"
            >
              Cambiar <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">No hay WOD asignado para hoy.</p>
            <Link href="/admin/session">
              <PrimaryButton size="sm">Asignar WOD</PrimaryButton>
            </Link>
          </div>
        )}
      </div>

      {/* Quick access grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/wods">
          <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-3 hover:border-zinc-600 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
              <Dumbbell className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-bold text-zinc-100">WODs</p>
              <p className="text-xs text-zinc-500 mt-0.5">Crear y gestionar</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/athletes">
          <div className="rounded-3xl border border-surface-border bg-surface p-5 space-y-3 hover:border-zinc-600 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-800 border border-surface-border">
              <Users className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="font-bold text-zinc-100">Atletas</p>
              <p className="text-xs text-zinc-500 mt-0.5">Ver progreso</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
