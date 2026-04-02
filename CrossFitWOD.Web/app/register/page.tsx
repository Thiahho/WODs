"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { RegisterSchema, type RegisterForm } from "@/lib/schemas";
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
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-500">CrossFitWOD</h1>
          <p className="mt-1 text-sm text-zinc-400">Crear cuenta</p>
        </div>

        {/* Selector de rol */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsCoach(false)}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
              !isCoach
                ? "border-orange-500 bg-orange-500/10 text-orange-400"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Soy atleta
          </button>
          <button
            type="button"
            onClick={() => setIsCoach(true)}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
              isCoach
                ? "border-orange-500 bg-orange-500/10 text-orange-400"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Soy coach
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
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
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300" htmlFor="confirm">
              Repetir contraseña
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              {...register("confirm")}
            />
            {errors.confirm && (
              <p className="text-xs text-red-400">{errors.confirm.message}</p>
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
            {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-orange-400 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
