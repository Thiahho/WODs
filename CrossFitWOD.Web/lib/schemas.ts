import { z } from "zod";

// ── API response shapes ───────────────────────────────────────────────────────

export const WodExerciseSchema = z.object({
  id:    z.string().uuid(),
  name:  z.string(),
  reps:  z.number(),
  order: z.number(),
});

export const WodSchema = z.object({
  id:              z.string().uuid(),
  title:           z.string(),
  description:     z.string().optional(),
  type:            z.string(),
  durationMinutes: z.number(),
  exercises:       z.array(WodExerciseSchema),
});

export const TodayWorkoutSchema = z.object({
  id:               z.string().uuid(),
  athleteId:        z.string().uuid(),
  workoutSessionId: z.string().uuid(),
  scaledRepsFactor: z.number(),
  workoutSession: z.object({
    id:   z.string().uuid(),
    date: z.string(),
    wod:  WodSchema,
  }),
});

// ── Form schemas ──────────────────────────────────────────────────────────────

export const RegisterResultSchema = z.object({
  completed:   z.boolean(),
  rpe:         z.number().min(1).max(10),
  timeSeconds: z.number().positive().optional(),
  rounds:      z.number().positive().optional(),
});

export const LoginSchema = z.object({
  boxId:  z.string().uuid("Debe ser un UUID válido"),
  secret: z.string().min(1, "El secreto es requerido"),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type TodayWorkout     = z.infer<typeof TodayWorkoutSchema>;
export type RegisterResultForm = z.infer<typeof RegisterResultSchema>;
export type LoginForm        = z.infer<typeof LoginSchema>;
