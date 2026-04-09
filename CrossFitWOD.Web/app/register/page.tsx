"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { RegisterSchema, type RegisterForm } from "@/lib/schemas";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Dumbbell, Shield } from "lucide-react";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCoach, setIsCoach]         = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setServerError(null);
    try {
      await api.post("/api/auth/registro", {
        username: data.username,
        password: data.password,
        isCoach,
      });
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError("Ese usuario ya existe. Probá con otro nombre.");
      } else if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Error de conexión");
      }
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-brand-radial" />

      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Cross-Pro" style={{ width: 120, height: 120, objectFit: "contain" }} />
          <p className="text-sm text-zinc-500">Crear cuenta</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsCoach(false)}
            className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-sm font-semibold transition-all ${
              !isCoach
                ? "border-brand bg-brand/10 text-brand shadow-glow-sm"
                : "border-surface-border bg-surface text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <Dumbbell className="h-5 w-5" />
            Soy atleta
          </button>
          <button
            type="button"
            onClick={() => setIsCoach(true)}
            className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-sm font-semibold transition-all ${
              isCoach
                ? "border-brand bg-brand/10 text-brand shadow-glow-sm"
                : "border-surface-border bg-surface text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <Shield className="h-5 w-5" />
            Soy coach
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-2xl border border-surface-border bg-surface px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
              placeholder="tu_usuario"
              {...register("username")}
            />
            {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-surface-border bg-surface px-4 py-3.5 text-sm text-zinc-100 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400" htmlFor="confirm">
              Repetir contraseña
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-surface-border bg-surface px-4 py-3.5 text-sm text-zinc-100 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
              {...register("confirm")}
            />
            {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <PrimaryButton type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-zinc-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand hover:text-brand-light transition-colors">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
