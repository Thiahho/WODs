# CrossFitWOD — Estado del proyecto

**Última actualización:** 2026-04-02 (rev 7)

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | ASP.NET Core 8, EF Core 8, PostgreSQL |
| Auth | JWT HS256, BCrypt.Net-Next |
| Validación | FluentValidation |
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

**Wods**
- `Id`, `Title`, `Description`, `Type` → `Amrap=1 | ForTime=2 | Emom=3`
- `DurationMinutes`, `IsDeleted` (soft delete), `CreatedAt`

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
- `Completed`, `TimeSeconds`, `Rounds`, `Rpe` (1–10), `CreatedAt`

### Migraciones aplicadas
1. `InitialCreate`
2. `RemoveMultiTenancy`
3. `AddUserTable` (incluye campo `Role`)
4. `LinkAthleteToUser`
5. `AddWodSoftDelete`
6. `AddAthleteGoal`
7. `AddBoxAndExtendedAthleteProfile`

---

## API

### Auth — `/api/auth`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/registro` | No | Crea cuenta + Box personal automático. Acepta `isCoach: bool` → si coach: `IsIndividual=false`, `role="admin"`; si atleta: `IsIndividual=true`, `role="athlete"`. Trial 30 días. |
| POST | `/login` | No | Login → devuelve `{ token, role }`. JWT incluye claims `user_id` y `role` |

### Athletes — `/api/athletes`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | Sí | Lista atletas del box del coach autenticado (filtrado por BoxId) |
| GET | `/me` | Sí | Perfil del usuario autenticado |
| POST | `/me` | Sí | Crear perfil propio: name, level, goal, weight, daysPerWeek, sessionDurationMinutes, equipment, weakPoints |
| PUT | `/me` | Sí | Actualizar perfil propio (mismos campos que POST) |
| POST | `/` | Sí (admin) | Coach crea atleta con cuenta de usuario en su box (ver abajo) |
| PUT | `/{id}` | Sí (admin) | Coach edita atleta de su box (verifica BoxId) |
| GET | `/{id}/history` | Sí | Últimas 20 sesiones del atleta |

**`POST /api/athletes` — Crear atleta como coach:**
```json
{
  "username": "juan",
  "password": "secreto",
  "name": "Juan Pérez",
  "level": 2,
  "goal": 1,
  "weight": 75.5
}
```
Crea un `User` con el `BoxId` del coach (sin crear un nuevo box) y un `Athlete` vinculado a ese usuario. El atleta hereda el box del coach y verá el WOD asignado por el coach (no el generador automático). Devuelve 409 si el `username` ya existe.

### WODs — `/api/wods`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/` | Sí | Lista todos los WODs activos |
| POST | `/` | Sí | Crear WOD con ejercicios |
| PUT | `/{id}` | Sí | Editar WOD (reemplaza ejercicios) |
| DELETE | `/{id}` | Sí | Soft delete si tiene sesiones, hard delete si no |

### Workout Sessions — `/api/workoutsessions`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/today` | Sí | Sesión de hoy del box del usuario |
| POST | `/` | Sí (admin) | Asignar WOD a una fecha (vincula al box del usuario). Si ya existe sesión para esa fecha, reemplaza el WOD. |

### Athlete Workouts — `/api/athlete-workouts`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/today/me` | Sí | WOD de hoy — si box individual y sin sesión, auto-genera el WOD |
| GET | `/history` | Sí | Últimas 10 sesiones del atleta autenticado |

### Workout Results — `/api/workout-results`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/` | Sí | Registrar resultado + ajusta ScaledRepsFactor. Devuelve `WorkoutResultResponseDto` |

**Respuesta `POST /workout-results`:**
```json
{
  "id": 6,
  "athleteWorkoutId": 3,
  "completed": true,
  "timeSeconds": 2700,
  "rounds": null,
  "rpe": 8,
  "createdAt": "2026-04-01T23:45:53Z",
  "newScaledRepsFactor": 1.0,
  "factorChanged": false,
  "factorMessage": "Intensidad mantenida — seguís en tu ritmo."
}
```
El servidor genera `factorMessage` — el frontend lo muestra directamente sin lógica adicional.

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

## Generador de WODs (`WodGeneratorService`)

Se activa cuando el atleta está en un box `IsIndividual=true` y no hay sesión para hoy.

### Inputs del perfil que usa

| Campo | Efecto |
|---|---|
| `Goal` | Determina el pool de ejercicios (cardio / gymnastics / loaded) |
| `Level` | Multiplicador de reps (×0.6 / ×1.0 / ×1.4) |
| `SessionDurationMinutes` | Duración del WOD generado (fallback a 15/20/30 min por Level si es 0) |
| `Equipment` | Filtra ejercicios que requieren equipo no disponible |
| `WeakPoints` | Ejercicios que entrenan un punto débil tienen peso 3× en la selección |
| `Id` + fecha | Semilla del RNG — determinista (mismo atleta, mismo día = mismo WOD) |

### Tipo de WOD por día

| Lunes / Jueves / Sábado | Martes / Viernes | Miércoles / Domingo |
|---|---|---|
| For Time | AMRAP | EMOM |

### Pools de ejercicios

Cada goal tiene 3 categorías (`cardio`, `gymnastics`, `loaded`). Competition selecciona las 3; el resto elige 2. Dentro de cada categoría, los candidatos se filtran por equipamiento y se seleccionan con peso por puntos débiles.

**Fallback bodyweight** si ningún ejercicio de una categoría es accesible con el equipo disponible: Burpees / Push-ups / Air Squats.

---

## Frontend

> **Estado:** scaffolding completo. Proyecto en `CrossFitWOD.Web/`, Next.js 14, App Router, TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod.

### Protección de rutas (`middleware.ts`)

```
Sin JWT                                         → /login  (excepto /login, /register)
role=admin en /login o /register                → /admin
role≠admin intentando /admin/*                  → /workout
role=admin autenticado                          → acceso libre (no necesita perfil de atleta)
role=athlete sin perfil                         → /setup  (excepto /login, /register, /setup)
role=athlete con perfil en /login|/register|/setup → /workout
```

Cookies: `wod_token` (JWT) + `wod_has_profile` (flag 1) + `wod_role` (`"admin"` | `"athlete"`).

### Páginas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Login. Link a /register |
| `/register` | Público | Crear cuenta (usuario min 3, pass min 6, confirmación) → redirige a /login |
| `/setup` | JWT sin perfil | Nombre, nivel, objetivo, peso, días/semana, duración sesión, equipamiento (chips), puntos débiles (chips) |
| `/workout` | Atleta | WOD del día (auto-generado si box individual), reps escaladas, form de resultado, feedback de factor |
| `/history` | Atleta | Últimas 10 sesiones: resultado, RPE coloreado, tendencia del factor |
| `/admin` | Admin | Dashboard: sesión de hoy y accesos rápidos |
| `/admin/wods` | Admin | CRUD de WODs con edición inline y modal de eliminación |
| `/admin/session` | Admin | Asignar WOD al día de hoy |
| `/admin/athletes` | Admin | Lista de atletas con stats y historial expandible |

### Componentes

- `WorkoutCard` — WOD del día, reps escaladas, badge de factor, form de resultado, feedback post-submit. El mensaje de feedback viene del servidor (`factorMessage`), no se calcula en el cliente
- `ResultForm` — campos dinámicos por tipo (ForTime: tiempo + checkbox; AMRAP: rondas decimal; EMOM: rondas entero). `onSuccess` recibe `WorkoutResultResponse` completo
- `ScalingBadge` — badge visual del factor actual

### Hooks

- `useTodayWorkout()` — GET `/athlete-workouts/today/me`
- `useRegisterResult()` — POST `/workout-results` → devuelve `WorkoutResultResponse` tipado (incluye `newScaledRepsFactor`, `factorChanged`, `factorMessage`)
- `useHistory()` — GET `/athlete-workouts/history`

---

## Infraestructura

- **Rate limiting:** 60 req/min por IP (FixedWindow)
- **CORS:** configurable vía `Cors:Origins` (comma-separated). Dev: `http://localhost:3000`. Prod: variable de entorno `Cors__Origins`
- **Swagger:** `/swagger`
- **Error handling:** middleware global → JSON `{ error: "..." }`
- **JSON cycles:** `ReferenceHandler.IgnoreCycles`

### `lib/api.ts`

Wrapper `fetch` tipado (`api.get / .post / .put / .delete`). Lee `NEXT_PUBLIC_API_URL` (default `http://localhost:5290`). Adjunta `Authorization: Bearer <token>` automáticamente. Lanza `ApiError(status, message)` en respuestas no-ok.

### `lib/auth.ts`

Helpers de cookies (`js-cookie`):
- `wod_token` — JWT, 1 día, `sameSite: strict`
- `wod_has_profile` — flag "1" cuando el atleta completó `/setup`
- `wod_role` — `"admin"` | `"athlete"`
- `setToken / setRole / setHasProfile / removeToken / getToken / getRole / isAuthenticated`

---

### Variables de entorno en producción (Render)

**Backend:**

| Variable | Descripción |
|---|---|
| `ConnectionStrings__Default` | Connection string de PostgreSQL (Render la provee al crear la DB) |
| `Jwt__Secret` | Clave secreta para firmar JWT (mínimo 32 chars, aleatoria) |
| `Jwt__Issuer` | Emisor del token (default: `"CrossFitWOD"`) |
| `Jwt__Audience` | Audiencia del token (default: `"CrossFitWOD"`) |
| `Jwt__ExpiryMinutes` | Duración del token en minutos (default: `1440` = 24h) |
| `Cors__Origins` | Orígenes permitidos, ej. `https://tu-app.vercel.app` |

**Frontend (`CrossFitWOD.Web/.env.local`):**

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend (default: `http://localhost:5290`) |

La connection string de desarrollo está solo en `appsettings.Development.json` (no se sube a producción). El `Jwt:Secret` de producción nunca va al repositorio.

---

## Flujo coach — estado actual

### Camino A: coach crea atleta

1. Coach se registra en `/register` → selecciona "Soy coach" → se crea su box con `IsIndividual=false`, `role="admin"`
2. Coach va a `/admin/athletes` → botón "Agregar atleta" → abre modal
3. Completa: usuario, contraseña, nombre, nivel, objetivo, peso (opcional)
4. `POST /api/athletes` crea `User` en el box del coach + `Athlete` vinculado
5. Atleta se loguea → ve el WOD asignado por el coach (no el generador)
6. Atleta registra resultado → factor ajusta → coach ve stats en `/admin/athletes`

### Camino B: atleta individual

1. Atleta se registra → box propio se crea (`IsIndividual=true`)
2. Atleta completa perfil en `/setup` (nivel, objetivo, equipo, puntos débiles, etc.)
3. `GET /athlete-workouts/today/me` detecta box individual sin sesión → genera WOD automático
4. Atleta entrena, registra resultado, factor se ajusta al siguiente WOD

---

## Seguridad — estado

| Endpoint | Auth | Rol requerido | Notas |
|---|---|---|---|
| `POST /api/auth/login` | No | — | público |
| `POST /api/auth/registro` | No | — | público |
| `GET /api/athletes` | Sí | any | filtra por BoxId del usuario |
| `GET /api/athletes/me` | Sí | any | — |
| `POST /api/athletes/me` | Sí | any | — |
| `PUT /api/athletes/me` | Sí | any | — |
| `POST /api/athletes` | Sí | **admin** | `[Authorize(Roles="admin")]` |
| `PUT /api/athletes/{id}` | Sí | **admin** | verifica BoxId del coach |
| `GET /api/athletes/{id}/history` | Sí | any | verifica BoxId |
| `GET /api/wods` | Sí | any | — |
| `POST /api/wods` | Sí | **admin** | `[Authorize(Roles="admin")]` |
| `PUT /api/wods/{id}` | Sí | **admin** | `[Authorize(Roles="admin")]` |
| `DELETE /api/wods/{id}` | Sí | **admin** | `[Authorize(Roles="admin")]` |
| `GET /api/workoutsessions/today` | Sí | any | — |
| `POST /api/workoutsessions` | Sí | **admin** | `[Authorize(Roles="admin")]` |
| `GET /api/athlete-workouts/today/me` | Sí | any | — |
| `GET /api/athlete-workouts/history` | Sí | any | — |
| `POST /api/workout-results` | Sí | any | — |

> Los coaches se crean vía `/registro` con `isCoach: true`. No es necesario modificar la DB manualmente.

---

## Deuda técnica

- [ ] No hay refresh tokens (access token dura 24h)
- [ ] `Equipment` y `WeakPoints` almacenados como string CSV — candidato a tabla normalizada a futuro
- [ ] `DaysPerWeek` no afecta al generador — podría usarse para limitar días de entreno o variar volumen
- [ ] Sin paginación en historial ni lista de atletas
- [ ] Sin tests automatizados
- [ ] Las páginas de admin (`/admin/*`) están scaffoldeadas pero pendientes de implementación completa (CRUD de WODs, asignación de sesión, lista de atletas con historial expandible)
- [ ] La página `/profile` está scaffoldeada pero no implementada
- [ ] No hay página de error 404 ni manejo de rutas inexistentes en el frontend
