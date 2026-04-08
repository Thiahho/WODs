"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { setToken, setHasProfile, setRole } from "@/lib/auth";
import { LoginSchema, type LoginForm } from "@/lib/schemas";
import { PrimaryButton } from "@/components/ui/primary-button";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    try {
      const res = await api.post<{ token: string; role: string }>("/api/auth/login", data);
      setToken(res.token);
      setRole(res.role);

      if (res.role === "admin") {
        router.push("/admin");
        return;
      }

      try {
        await api.get("/api/athletes/me");
        setHasProfile();
        router.push("/workout");
      } catch {
        router.push("/setup");
      }
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message);
      else setServerError("Error de conexión");
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-brand-radial" />

      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        {/* Logo */}
        <div className="text-center space-y-1">
          <h1 className="text-display text-5xl text-brand glow-text">CrossFit</h1>
          <h2 className="text-display text-3xl text-zinc-100">WOD</h2>
          <p className="text-sm text-zinc-500 mt-2">Tu WOD del día, escalado para vos</p>
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
            {errors.username && (
              <p className="text-xs text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-surface-border bg-surface px-4 py-3.5 text-sm text-zinc-100 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <PrimaryButton type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Entrando…" : "Entrar al box"}
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-zinc-500">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-semibold text-brand hover:text-brand-light transition-colors">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}
