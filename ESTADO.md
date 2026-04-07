# CrossFitWOD — Estado del proyecto

**Última actualización:** 2026-04-07 (rev 8)

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core 8, EF Core 8, PostgreSQL |
| Auth | JWT HS256, BCrypt.Net-Next |
| Validación | FluentValidation |
| IA | OpenAI API (gpt-4o) via HttpClient |
| Frontend | Next.js 14, App Router, TypeScript |
| Estado servidor | TanStack Query (React Query) |
| Formularios | React Hook Form + Zod |

---

## Base de datos

### Entidades

**Boxes**
- `Id`, `Name`, `Slug`, `IsIndividual` (bool)
- `SubscriptionStatus` (default: `"trial"`), `TrialEndsAt`, `SubscriptionEndsAt`
- `Active`, `CreatedAt`

**Users**
- `Id`, `Username` (unique), `PasswordHash`
- `Role` (string: `"admin"` | `"athlete"`, default `"athlete"`)
- `BoxId` (FK → Boxes)

**Athletes**
- `Id`, `UserId` (FK 1:1 → Users), `BoxId` (FK → Boxes)
- `Name`, `Weight` (nullable), `CreatedAt`
- `Level` → `Beginner=1 | Intermediate=2 | Advanced=3`
- `Goal`  → `General=1 | Fitness=2 | Competition=3 | Rehabilitation=4`
- `DaysPerWeek` (default 3), `SessionDurationMinutes` (default 45)
- `Equipment` (string, comma-separated: `barbell,pullup_bar,rings,box,kettlebell,rower`)
- `WeakPoints` (string, comma-separated: `gymnastics,weightlifting,cardio,strength,flexibility`)
- `InjuryHistory` (nullable) — historial de lesiones declarado
- `CommitmentLevel` (int 1–10, default 5) — nivel de compromiso del atleta

**Wods**
- `Id`, `Title`, `Description`, `Type` → `Amrap=1 | ForTime=2 | Emom=3`
- `DurationMinutes`, `IsDeleted` (soft delete), `CreatedAt`
- `Intensity` (`"low"` | `"moderate"` | `"high"` | `"deload"`)
- `Focus` (string libre: fuerza, resistencia, etc.)
- `WarmUp`, `StrengthSkill`, `Metcon`, `CoolDown`, `Scaling`, `CoachNotes` — secciones generadas por IA
- `IsAiGenerated` (bool, default false)

**WodExercises**
- `Id`, `WodId` (FK cascade), `Name`, `Reps`, `Order`

**WorkoutSessions**
- `Id`, `WodId` (FK), `BoxId` (FK → Boxes), `Date`
- Unique: `(BoxId, Date)` — una sesión por box por día

**AthleteWorkouts**
- `Id`, `AthleteId` (FK), `WorkoutSessionId` (FK)
- `ScaledRepsFactor`, `Notes`
- Unique: `(AthleteId, WorkoutSessionId)`

**WorkoutResults**
- `Id`, `AthleteWorkoutId` (FK 1:1)
- `Completed`, `TimeSeconds`, `Rounds`, `Rpe` (1–10)
- `DurationSeconds` — duración real de la sesión (base para cálculo de carga)
- `Notes` — feedback post-WOD del atleta (la IA lo usa al día siguiente)
- `CreatedAt`

**AthleteDailyLogs** *(nuevo)*
- `Id`, `AthleteId` (FK → Athletes)
- `EnergyLevel` (1–10), `FatigueLevel` (1–10)
- `SleepHours` (float, nullable)
- `Notes`, `PainNotes`, `MentalState` (todos nullable)
- `CreatedAt`

**AthleteStates** *(nuevo — mediciones físicas)*
- `Id`, `AthleteId` (FK → Athletes)
- `Weight`, `BodyFat`, `MuscleMass` (todos float nullable)
- `RecordedAt`

**AthleteStatus** *(nuevo — estado calculado por el sistema)*
- `Id`, `AthleteId` (FK → Athletes)
- `FitnessLevel`, `FatigueLevel`, `RecoveryScore` (float 0–100)
- `AcuteLoad` — carga promedio 7 días (Foster Session-RPE: duración_min × RPE)
- `ChronicLoad` — carga promedio 28 días
- `LoadRatio` — acute/chronic (ideal 0.8–1.3)
- `LastPerformanceScore`, `PerformanceTrend` (`"improving"` | `"stable"` | `"declining"` | `"insufficient_data"`)
- `Readiness` (`"high"` | `"moderate"` | `"low"`)
- `InjuryRisk` (`"high"` | `"moderate"` | `"low"`)
- `CreatedAt`, `UpdatedAt`

### Migraciones aplicadas
1. `InitialCreate`
2. `RemoveMultiTenancy`
3. `AddUserTable` (incluye campo `Role`)
4. `LinkAthleteToUser`
5. `AddWodSoftDelete`
6. `AddAthleteGoal`
7. `AddBoxAndExtendedAthleteProfile`
8. `AddDailyLogsAndStatus` — marcada como aplicada, tablas y columnas nuevas ejecutadas manualmente en SQL

---

## API

### Auth — `/api/auth`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/registro` | No | Crea cuenta + Box personal automático. `isCoach: bool` → coach: `IsIndividual=false`, `role="admin"`; atleta: `IsIndividual=true`, `role="athlete"`. Trial 30 días. |
| POST | `/login` | No | Login → devuelve `{ token, role }`. JWT incluye claims `user_id` y `role` |

### Athletes — `/api/athletes`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | Sí | Lista atletas del box del coach autenticado |
| GET | `/me` | Sí | Perfil del usuario autenticado |
| POST | `/me` | Sí | Crear perfil: name, level, goal, weight, daysPerWeek, sessionDurationMinutes, equipment, weakPoints |
| PUT | `/me` | Sí | Actualizar perfil |
| POST | `/` | Sí (admin) | Coach crea atleta con cuenta de usuario en su box |
| PUT | `/{id}` | Sí (admin) | Coach edita atleta de su box |
| GET | `/{id}/history` | Sí | Últimas 20 sesiones del atleta |

### WODs — `/api/wods`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | Sí | Lista todos los WODs activos |
| POST | `/` | Sí (admin) | Crear WOD con ejercicios |
| PUT | `/{id}` | Sí (admin) | Editar WOD |
| DELETE | `/{id}` | Sí (admin) | Soft delete si tiene sesiones, hard delete si no |

### WOD IA — `/api/wod` *(nuevo)*

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/generate` | Sí | Genera WOD del día con IA para el atleta autenticado. Si ya existe sesión hoy, la devuelve sin regenerar |
| POST | `/generate/{athleteId}` | Sí (admin) | Genera WOD para un atleta específico del mismo box |
| GET | `/today` | Sí | WOD del día sin regenerar |
| GET | `/{wodId}` | Sí | Detalle completo de un WOD |

**Respuesta `POST /api/wod/generate`:**
```json
{
  "wodId": 11,
  "workoutSessionId": 9,
  "title": "CrossFit Essentials",
  "intensity": "moderate",
  "focus": "fuerza y resistencia",
  "durationMinutes": 45,
  "warmUp": "3 rounds: 400m Row, 10 Air Squats...",
  "strengthSkill": "Back Squat: 3 sets of 8 reps al 70% 1RM",
  "metcon": "AMRAP 15: 10 KB Swings, 15 Box Jumps, 20 Calorie Row",
  "scaling": "RX: como se indica. RX+: KB 32kg. Scaled: KB 16kg, step-ups",
  "coolDown": "5 min fácil + estiramientos",
  "coachNotes": "Foco en mantener ritmo constante...",
  "alert": null,
  "nutritionTip": null
}
```

### Workout Sessions — `/api/workoutsessions`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/today` | Sí | Sesión de hoy del box del usuario |
| POST | `/` | Sí (admin) | Asignar WOD a una fecha |

### Athlete Workouts — `/api/athlete-workouts`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/today/me` | Sí | WOD de hoy — si box individual y sin sesión, auto-genera con `WodGeneratorService` (rule-based) |
| GET | `/history` | Sí | Últimas 10 sesiones del atleta autenticado |

### Workout Results — `/api/workout-results`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | Sí | Registrar resultado + ajusta ScaledRepsFactor + dispara recálculo de AthleteStatus |

**Body `POST /workout-results`:**
```json
{
  "athleteWorkoutId": 3,
  "completed": true,
  "timeSeconds": 360,
  "rounds": null,
  "rpe": 8,
  "durationSeconds": 2700,
  "notes": "me costó el metcon, hombro bien, quiero más peso la próxima"
}
```

### Daily Logs — `/api/athlete-daily-logs` *(nuevo)*

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | Sí | Registra estado diario del atleta + dispara recálculo de AthleteStatus |
| GET | `/{athleteId}` | Sí | Historial de logs (últimos 30, paginado con `?skip=`) |
| GET | `/today` | Sí | Log de hoy del atleta autenticado (204 si no existe) |

### Athlete Status — `/api/athlete-status` *(nuevo)*

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/me` | Sí | Estado calculado más reciente del atleta autenticado |
| GET | `/{athleteId}` | Sí (admin) | Estado de un atleta del mismo box |

---

## Algoritmo de escalado

### Factor inicial

| Nivel | Base | + Competition | + Rehabilitation |
|---|---|---|---|
| Beginner | 0.80 | 0.90 | 0.60 |
| Intermediate | 1.00 | 1.10 | 0.80 |
| Advanced | 1.20 | 1.30 | 1.00 |

Rango clampeado a `[0.5, 1.5]`.

### Ajuste después de resultado

| Goal | Step | Techo |
|---|---|---|
| General / Fitness | 0.10 | 1.5 |
| Competition | 0.15 | 1.5 |
| Rehabilitation | 0.05 | 1.0 |

- RPE ≥ 9 ó no completó → `factor − step`
- RPE ≤ 6 y completó → `factor + step`
- RPE 7–8 y completó → sin cambio

---

## AthleteStatusService *(nuevo)*

Se dispara automáticamente al:
- Registrar un `WorkoutResult` (via `WorkoutResultService`)
- Registrar un `AthleteDailyLog` (via `AthleteDailyLogsController`)

### Cálculos

| Campo | Fórmula |
|---|---|
| `AcuteLoad` | Promedio diario de carga (Foster RPE × duración_min) — últimos 7 días |
| `ChronicLoad` | Promedio diario de carga — últimos 28 días |
| `LoadRatio` | AcuteLoad / ChronicLoad (ideal 0.8–1.3) |
| `FatigueLevel` | 40% carga objetiva + 40% fatiga subjetiva (logs) + 20% penalización por sueño < 6h |
| `RecoveryScore` | 40% energía + 40% inverso fatiga + 20% calidad de sueño |
| `FitnessLevel` | ChronicLoad / 500 × 100 (proxy) |
| `PerformanceTrend` | ≥4 completados y RPE≤7 → improving; ≤2 completados o RPE≥9 → declining; resto → stable |
| `Readiness` | high/moderate/low según ratio, recoveryScore y presencia de dolor |
| `InjuryRisk` | high/moderate/low según ratio > 1.3/1.5, dolor en logs, sueño < 6h |

---

## AiWodService — Generación con IA *(nuevo)*

Llama a OpenAI `gpt-4o` con contexto completo del atleta. Configurado en `appsettings.Development.json` bajo `OpenAI:ApiKey`.

### Contexto enviado a la IA

1. **Perfil completo:** nivel, objetivo, días/semana, duración sesión, equipamiento, puntos débiles, historial lesiones, compromiso
2. **AthleteStatus:** readiness, fatiga, recoveryScore, loadRatio, performanceTrend, injuryRisk
3. **Últimos 5 daily logs:** energía, fatiga, sueño, dolor, estado mental, notas
4. **Últimos 5 resultados:** fecha, WOD, completado, RPE, tiempo, rounds, notas post-WOD

### Reglas del sistema prompt

- Idioma: español rioplatense (vos, hacé, etc.)
- NUNCA usar equipamiento no disponible
- Ajustar intensidad según readiness y logs
- Deload si LoadRatio > 1.3 o fatiga alta
- Evitar zonas con lesiones declaradas
- Responde en JSON estructurado

### Output guardado en `Wods`

`WarmUp`, `StrengthSkill`, `Metcon`, `Scaling`, `CoolDown`, `CoachNotes`, `Intensity`, `Focus`, `IsAiGenerated=true`

---

## Generador rule-based (`WodGeneratorService`)

Sigue activo como fallback cuando `AthleteWorkoutService.GetTodayAsync` detecta box individual sin sesión (ruta legacy `/api/athlete-workouts/today/me`). La ruta principal para atletas individuales ahora es `POST /api/wod/generate`.

---

## Frontend

### Flujo principal del atleta en `/workout`

```
1. Verifica si hay log de hoy (GET /api/athlete-daily-logs/today)
2. Si no hay log → muestra DailyLogForm (energía, fatiga, sueño, dolor, mental, notas)
3. Al enviar log → muestra botón "⚡ Generar mi WOD con IA"
4. Al generar → POST /api/wod/generate → muestra AiWodCard
5. Al pie del WOD → "💬 Registrar resultado" → ResultForm
6. Al registrar → se ajusta ScaledRepsFactor + se recalcula AthleteStatus
```

Si ya tiene log y WOD del día → va directo al WOD.

### Páginas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Login |
| `/register` | Público | Crear cuenta |
| `/setup` | JWT sin perfil | Nombre, nivel, objetivo, peso, días/semana, duración, equipamiento (chips), puntos débiles (chips) |
| `/workout` | Atleta | Daily log → generar WOD con IA → registrar resultado |
| `/history` | Atleta | Últimas 10 sesiones |
| `/admin` | Admin | Dashboard |
| `/admin/wods` | Admin | CRUD de WODs |
| `/admin/session` | Admin | Asignar WOD del día |
| `/admin/athletes` | Admin | Lista de atletas con stats |

### Componentes

- `AiWodCard` — WOD generado por IA con secciones: WarmUp 🔥, Strength/Skill 🏋️, WOD ⚡ (destacado naranja), Escalado 📊, Cooldown 🧘, Análisis del coach 🧠, alerta ⚠️ (amarillo), nutrición 🥗 (verde). Detecta tipo (AMRAP/EMOM/ForTime) del texto del metcon para el form de resultado
- `DailyLogForm` — sliders de energía y fatiga (1–10), sueño (horas), dolor, estado mental, notas libres
- `ResultForm` — campos dinámicos: ForTime (tiempo + checkbox completado), AMRAP (rondas decimal), EMOM (rondas entero). Agrega duración total (min) y notas post-WOD. La IA usa las notas al día siguiente
- `WorkoutCard` — card legacy para WODs rule-based (reps escaladas, badge de factor)
- `ScalingBadge` — badge visual del factor actual

### Hooks

- `useAiWod()` — `fetchToday()` GET `/api/wod/today`, `generate()` POST `/api/wod/generate`
- `useDailyLog()` — `checkToday()`, `submit(payload)`
- `useTodayWorkout()` — GET `/api/athlete-workouts/today/me`
- `useRegisterResult()` — POST `/api/workout-results`
- `useHistory()` — GET `/api/athlete-workouts/history`

---

## Protección de rutas (`middleware.ts`)

```
Sin JWT                                         → /login  (excepto /login, /register)
role=admin en /login o /register                → /admin
role≠admin intentando /admin/*                  → /workout
role=admin autenticado                          → acceso libre
role=athlete sin perfil                         → /setup
role=athlete con perfil en /login|/register|/setup → /workout
```

Cookies: `wod_token` (JWT) + `wod_has_profile` (flag 1) + `wod_role` (`"admin"` | `"athlete"`)

---

## Infraestructura

- **Rate limiting:** 60 req/min por IP (FixedWindow)
- **CORS:** configurable vía `Cors:Origins`. Dev: `http://localhost:3000`
- **Swagger:** `/swagger`
- **Error handling:** middleware global → JSON `{ error: "..." }`
- **JSON cycles:** `ReferenceHandler.IgnoreCycles`

### Variables de entorno en producción

**Backend:**

| Variable | Descripción |
|---|---|
| `ConnectionStrings__Default` | Connection string PostgreSQL |
| `Jwt__Secret` | Clave JWT (mínimo 32 chars) |
| `Jwt__Issuer` | Default: `"CrossFitWOD"` |
| `Jwt__Audience` | Default: `"CrossFitWOD"` |
| `Cors__Origins` | Ej: `https://tu-app.vercel.app` |
| `OpenAI__ApiKey` | API key de OpenAI (sk-proj-...) |

**Frontend (`.env.local`):**

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (default: `http://localhost:5290`) |

---

## Flujo coach

### Camino A: coach crea atleta

1. Coach se registra → `isCoach: true` → box con `IsIndividual=false`, `role="admin"`
2. Coach va a `/admin/athletes` → agrega atleta con usuario y contraseña
3. `POST /api/athletes` crea `User` en el box del coach + `Athlete` vinculado
4. Atleta se loguea → ve el WOD asignado por el coach
5. Atleta registra resultado → factor ajusta → coach ve stats

### Camino B: atleta individual

1. Atleta se registra → box propio `IsIndividual=true`
2. Completa perfil en `/setup`
3. En `/workout`: carga daily log → genera WOD con IA → entrena → registra resultado
4. El sistema recalcula `AthleteStatus` → el próximo WOD ya tiene el contexto actualizado

---

## Seguridad

| Endpoint | Auth | Rol |
|---|---|---|
| `POST /api/auth/*` | No | — |
| `GET /api/athletes` | Sí | any |
| `POST/PUT /api/athletes` | Sí | admin |
| `GET/PUT /api/athletes/me` | Sí | any |
| `POST/PUT/DELETE /api/wods` | Sí | admin |
| `POST /api/wod/generate` | Sí | any |
| `GET /api/wod/today` | Sí | any |
| `POST /api/athlete-daily-logs` | Sí | any |
| `GET /api/athlete-status/me` | Sí | any |
| `GET /api/athlete-status/{id}` | Sí | admin |
| `POST /api/workout-results` | Sí | any |

---

## Deuda técnica

- [ ] No hay refresh tokens (access token dura 24h)
- [ ] `Equipment` y `WeakPoints` almacenados como string CSV
- [ ] `DaysPerWeek` no afecta al generador de IA (podría usarse para variar volumen semanal)
- [ ] Sin paginación en historial ni lista de atletas
- [ ] Sin tests automatizados
- [ ] Páginas admin (`/admin/*`) scaffoldeadas pero pendientes de implementación completa
- [ ] Página `/profile` scaffoldeada pero no implementada (faltan `InjuryHistory`, `CommitmentLevel` en el form de setup)
- [x] ~~`AthleteStatusService` corre en `Task.Run` sin manejo de errores~~ — resuelto: `try/catch` con `ILogger.LogError` en `WorkoutResultService` y `AthleteDailyLogsController`
- [x] ~~`AiWodService` no tiene retry ante fallos de OpenAI API~~ — resuelto: retry con backoff exponencial (1s, 2s, 4s), 3 intentos, loguea cada reintento
- [x] ~~El WOD generado siempre tiene `Type = WodType.Amrap`~~ — resuelto: `DetermineWodType()` parsea el metcon
- [ ] Sin página de error 404 en el frontend
