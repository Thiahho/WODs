"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterResultSchema, type RegisterResultForm } from "@/lib/schemas";
import { useRegisterResult, type WorkoutResultResponse } from "@/hooks/use-register-result";
import { useState } from "react";

interface ResultFormProps {
  athleteWorkoutId: number;
  wodType: string;
  onSuccess: (result: WorkoutResultResponse) => void;
}

export function ResultForm({ athleteWorkoutId, wodType, onSuccess }: ResultFormProps) {
  const mutation = useRegisterResult();
  const [serverError, setServerError] = useState<string | null>(null);

  const isForTime = wodType === "ForTime";
  const isAmrap   = wodType === "Amrap";
  const isEmom    = wodType === "Emom";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterResultForm>({
    resolver: zodResolver(RegisterResultSchema),
    defaultValues: { rpe: 7, completed: true },
  });

  const rpeValue = watch("rpe");

  async function onSubmit(data: RegisterResultForm) {
    setServerError(null);
    try {
      const result = await mutation.mutateAsync({ ...data, athleteWorkoutId });
      onSuccess(result);
    } catch {
      setServerError("No se pudo registrar el resultado. Intenta de nuevo.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Completed — solo relevante en ForTime */}
      {isForTime && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-500 focus:ring-orange-500"
            {...register("completed")}
          />
          <span className="text-sm font-medium text-zinc-300">WOD completado</span>
        </label>
      )}

      {/* RPE Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="font-medium text-zinc-300">RPE percibido</label>
          <span className="font-bold text-orange-400">{rpeValue}</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          className="w-full accent-orange-500"
          {...register("rpe", { valueAsNumber: true })}
          onChange={(e) => setValue("rpe", parseInt(e.target.value))}
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Fácil</span>
          <span>Máximo</span>
        </div>
        {errors.rpe && (
          <p className="text-xs text-red-400">{errors.rpe.message}</p>
        )}
      </div>

      {/* ForTime → tiempo en segundos */}
      {isForTime && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">
            Tiempo total <span className="text-zinc-500">(segundos)</span>
          </label>
          <input
            type="number"
            min={1}
            placeholder="ej. 360"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register("timeSeconds", { valueAsNumber: true })}
          />
          {errors.timeSeconds && (
            <p className="text-xs text-red-400">{errors.timeSeconds.message}</p>
          )}
        </div>
      )}

      {/* AMRAP → rondas completas */}
      {isAmrap && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">
            Rondas completas
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            placeholder="ej. 8.5"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register("rounds", { valueAsNumber: true })}
          />
          <p className="text-xs text-zinc-500">
            Podés usar decimales para rondas parciales (ej. 8.5 = 8 rondas + mitad)
          </p>
          {errors.rounds && (
            <p className="text-xs text-red-400">{errors.rounds.message}</p>
          )}
        </div>
      )}

      {/* EMOM → rondas completadas sobre el total */}
      {isEmom && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-300">
            Rondas completadas
          </label>
          <input
            type="number"
            min={0}
            step={1}
            placeholder="ej. 9"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            {...register("rounds", { valueAsNumber: true })}
          />
          {errors.rounds && (
            <p className="text-xs text-red-400">{errors.rounds.message}</p>
          )}
        </div>
      )}

      {serverError && (
        <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {mutation.isPending ? "Guardando…" : "Registrar resultado"}
      </button>
    </form>
  );
}
