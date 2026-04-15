import { z } from "zod";

// ── AI WOD ────────────────────────────────────────────────────────────────────

// Cubre tanto AiWodResponseDto (POST /generate) como WodDetailDto (GET /today)
export const AiWodSchema = z.object({
  wodId:            z.number(),
  workoutSessionId: z.number().optional(),   // POST /generate
  sessionId:        z.number().nullable().optional(), // GET /today
  title:            z.string(),
  intensity:        z.string().nullable().optional(),
  focus:            z.string().nullable().optional(),
  durationMinutes:  z.number(),
  warmUp:           z.string().nullable().optional(),
  strengthSkill:    z.string().nullable().optional(),
  metcon:           z.string().nullable().optional(),
  scaling:          z.string().nullable().optional(),
  coolDown:         z.string().nullable().optional(),
  coachNotes:       z.string().nullable().optional(),
  alert:            z.string().nullable().optional(),
  nutritionTip:     z.string().nullable().optional(),
  // Ejercicios tradicionales (WODs no generados por IA)
  exercises: z.array(z.object({
    name:  z.string(),
    reps:  z.number(),
    order: z.number(),
  })).optional(),
});

export type AiWod = z.infer<typeof AiWodSchema>;

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
  description:     z.string().nullable().optional(),
  type:            z.string(),
  durationMinutes: z.number(),
  intensity:       z.string().nullable().optional(),
  focus:           z.string().nullable().optional(),
  isAiGenerated:   z.boolean().default(false),
  warmUp:          z.string().nullable().optional(),
  strengthSkill:   z.string().nullable().optional(),
  metcon:          z.string().nullable().optional(),
  scaling:         z.string().nullable().optional(),
  coolDown:        z.string().nullable().optional(),
  coachNotes:      z.string().nullable().optional(),
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
  result: z.object({
    completed:     z.boolean(),
    timeSeconds:   z.number().nullable().optional(),
    rounds:        z.number().nullable().optional(),
    rpe:           z.number(),
    factorMessage: z.string(),
  }).nullable().optional(),
});

// ── Form schemas ──────────────────────────────────────────────────────────────

export const RegisterResultSchema = z.object({
  completed:       z.boolean(),
  rpe:             z.number().min(1).max(10),
  timeSeconds:     z.number().positive().optional(),
  rounds:          z.number().positive().optional(),
  durationSeconds: z.number().min(0).default(0),
  notes:           z.string().optional(),
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
<<<<<<< HEAD
  name:                   z.string().min(1, "El nombre es requerido"),
  edad:                   z.coerce.number().int().min(1).max(120).optional(),
  level:                  z.coerce.number().int().min(1).max(3),
  goal:                   z.coerce.number().int().min(1).max(4),
  weight:                 z.coerce.number().positive().optional(),
  daysPerWeek:            z.coerce.number().int().min(1).max(7).default(3),
=======
  name:                  z.string().min(1, "El nombre es requerido"),
  level:                 z.coerce.number().int().min(1).max(5),
  goal:                  z.coerce.number().int().min(1).max(4),
  weight:                z.coerce.number().positive().optional(),
  daysPerWeek:           z.coerce.number().int().min(1).max(7).default(3),
>>>>>>> claude/crossfit-mobile-design-iMPDq
  sessionDurationMinutes: z.coerce.number().int().default(45),
  equipment:              z.string().default(""),
  weakPoints:             z.string().default(""),
  injuryHistory:          z.string().optional(),
  commitmentLevel:        z.coerce.number().int().min(1).max(10).default(5),
});

export const ChangePasswordSchema = z.object({
  currentPassword:    z.string().min(1, "Requerido"),
  newPassword:        z.string().min(6, "Mínimo 6 caracteres"),
  confirmNewPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmNewPassword"],
});

export type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;

// ── WOD Detail (GET /api/wod/:id) ─────────────────────────────────────────────

export const WodDetailExerciseSchema = z.object({
  id:    z.number().optional(),
  name:  z.string(),
  reps:  z.number(),
  order: z.number(),
});

export const WodDetailSchema = z.object({
  wodId:           z.number(),
  sessionId:       z.number().nullable().optional(),
  title:           z.string(),
  description:     z.string().nullable().optional(),
  type:            z.string(),
  intensity:       z.string().nullable().optional(),
  focus:           z.string().nullable().optional(),
  durationMinutes: z.number(),
  isAiGenerated:   z.boolean(),
  warmUp:          z.string().nullable().optional(),
  strengthSkill:   z.string().nullable().optional(),
  metcon:          z.string().nullable().optional(),
  scaling:         z.string().nullable().optional(),
  coolDown:        z.string().nullable().optional(),
  coachNotes:      z.string().nullable().optional(),
  exercises:       z.array(WodDetailExerciseSchema),
});

export type WodDetail = z.infer<typeof WodDetailSchema>;

// ── Inferred types ────────────────────────────────────────────────────────────

export type TodayWorkout       = z.infer<typeof TodayWorkoutSchema>;
export type RegisterResultForm = z.infer<typeof RegisterResultSchema>;
export type LoginForm          = z.infer<typeof LoginSchema>;
export type RegisterForm       = z.infer<typeof RegisterSchema>;
export type SetupProfileForm   = z.infer<typeof SetupProfileSchema>;
