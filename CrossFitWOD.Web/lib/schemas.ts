import { z } from "zod";

// ── API response shapes ───────────────────────────────────────────────────────

export const WodExerciseSchema = z.object({
  id:    z.number().int(),
  name:  z.string(),
  reps:  z.number(),
  order: z.number(),
});

export const WodSchema = z.object({
  id:              z.number().int(),
  title:           z.string(),
  description:     z.string().optional(),
  type:            z.string(),
  durationMinutes: z.number(),
  exercises:       z.array(WodExerciseSchema),
});

export const TodayWorkoutSchema = z.object({
  id:               z.number().int(),
  athleteId:        z.number().int(),
  workoutSessionId: z.number().int(),
  scaledRepsFactor: z.number(),
  workoutSession: z.object({
    id:   z.number().int(),
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
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Las contraseñas no coinciden",
  path: ["confirm"],
});

export const SetupProfileSchema = z.object({
  name:                  z.string().min(1, "El nombre es requerido"),
  level:                 z.coerce.number().int().min(1).max(3),
  goal:                  z.coerce.number().int().min(1).max(4),
  weight:                z.coerce.number().positive().optional(),
  daysPerWeek:           z.coerce.number().int().min(1).max(7).default(3),
  sessionDurationMinutes: z.coerce.number().int().default(45),
  equipment:             z.string().default(""),
  weakPoints:            z.string().default(""),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type TodayWorkout       = z.infer<typeof TodayWorkoutSchema>;
export type RegisterResultForm = z.infer<typeof RegisterResultSchema>;
export type LoginForm          = z.infer<typeof LoginSchema>;
export type RegisterForm       = z.infer<typeof RegisterSchema>;
export type SetupProfileForm   = z.infer<typeof SetupProfileSchema>;
