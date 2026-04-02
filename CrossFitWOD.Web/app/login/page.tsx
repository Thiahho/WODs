"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { setToken, setHasProfile, setRole } from "@/lib/auth";
import { LoginSchema, type LoginForm } from "@/lib/schemas";
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

      // Atleta: verificar si ya tiene perfil
      try {
        await api.get("/api/athletes/me");
        setHasProfile();
        router.push("/workout");
      } catch {
        router.push("/setup");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Error de conexión");
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-500">CrossFitWOD</h1>
          <p className="mt-1 text-sm text-zinc-400">Accede a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-orange-400 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}
