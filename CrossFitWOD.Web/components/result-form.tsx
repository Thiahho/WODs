"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterResultSchema, type RegisterResultForm } from "@/lib/schemas";
import { useRegisterResult, type WorkoutResultResponse } from "@/hooks/use-register-result";
import { PrimaryButton } from "@/components/ui/primary-button";
import { cn } from "@/lib/cn";
import { useState } from "react";

interface ResultFormProps {
  athleteWorkoutId: number;
  wodType: string;
  onSuccess: (result: WorkoutResultResponse) => void;
}

const inputClass = "w-full rounded-2xl border border-surface-border bg-surface-raised px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30";
const labelClass = "text-[10px] font-semibold uppercase tracking-widest text-zinc-500";

function rpeColor(rpe: number): string {
  if (rpe <= 5) return "text-emerald-400";
  if (rpe <= 7) return "text-yellow-400";
  if (rpe <= 8) return "text-orange-400";
  return "text-red-400";
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
      setServerError("No se pudo registrar el resultado. Intentá de nuevo.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Completed checkbox — ForTime only */}
      {isForTime && (
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl border border-surface-border bg-surface-raised hover:border-zinc-600 transition-colors">
          <input
            type="checkbox"
            className="h-4 w-4 rounded"
            {...register("completed")}
          />
          <span className="text-sm font-semibold text-zinc-200">WOD completado</span>
        </label>
      )}

      {/* RPE Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>RPE percibido</label>
          <span className={cn("text-display text-3xl", rpeColor(rpeValue))}>{rpeValue}</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          {...register("rpe", { valueAsNumber: true })}
          onChange={(e) => setValue("rpe", parseInt(e.target.value))}
        />
        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          <span>Fácil</span>
          <span>Máximo</span>
        </div>
        {errors.rpe && <p className="text-xs text-red-400">{errors.rpe.message}</p>}
      </div>

      {/* ForTime: time in seconds */}
      {isForTime && (
        <div className="space-y-2">
          <label className={labelClass}>
            Tiempo total <span className="normal-case font-normal text-zinc-600">(segundos)</span>
          </label>
          <input
            type="number" min={1} placeholder="ej. 360"
            className={inputClass}
            {...register("timeSeconds", { valueAsNumber: true })}
          />
          {errors.timeSeconds && <p className="text-xs text-red-400">{errors.timeSeconds.message}</p>}
        </div>
      )}

      {/* AMRAP: rounds */}
      {isAmrap && (
        <div className="space-y-2">
          <label className={labelClass}>Rondas completas</label>
          <input
            type="number" min={0} step={0.1} placeholder="ej. 8.5"
            className={inputClass}
            {...register("rounds", { valueAsNumber: true })}
          />
          <p className="text-[10px] text-zinc-600">Usá decimales para rondas parciales (8.5 = 8 rondas + mitad)</p>
          {errors.rounds && <p className="text-xs text-red-400">{errors.rounds.message}</p>}
        </div>
      )}

      {/* EMOM: rounds */}
      {isEmom && (
        <div className="space-y-2">
          <label className={labelClass}>Rondas completadas</label>
          <input
            type="number" min={0} step={1} placeholder="ej. 9"
            className={inputClass}
            {...register("rounds", { valueAsNumber: true })}
          />
          {errors.rounds && <p className="text-xs text-red-400">{errors.rounds.message}</p>}
        </div>
      )}

      {/* Duration */}
      <div className="space-y-2">
        <label className={labelClass}>
          Duración total <span className="normal-case font-normal text-zinc-600">(minutos)</span>
        </label>
        <input
          type="number" min={1} placeholder="ej. 45"
          className={inputClass}
          onChange={e => setValue("durationSeconds", Math.round(parseFloat(e.target.value || "0") * 60))}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className={labelClass}>
          ¿Cómo te fue? <span className="normal-case font-normal text-zinc-600">(opcional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="ej: me costó el metcon, el hombro bien, quiero más peso la próxima"
          className={`${inputClass} resize-none`}
          {...register("notes")}
        />
        <p className="text-[10px] text-zinc-600">La IA usa esto para el próximo WOD.</p>
      </div>

      {serverError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      <PrimaryButton
        type="submit"
        disabled={isSubmitting || mutation.isPending}
      >
        {mutation.isPending ? "Guardando…" : "Registrar resultado"}
      </PrimaryButton>
    </form>
  );
}
