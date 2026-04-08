# CLAUDE.md

This file provides intance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CrossFitWOD** — Multi-tenant web app for managing CrossFit Workouts of the Day (WODs) with automatic rep scaling per athlete based on RPE feedback.

The full architectural design is documented in `md.md`. The backend (Día 1) está implementado. El frontend (`CrossFitWOD.Web`) aún no existe.

**Product focus:** El sistema está orientado al atleta — darle control e información para mejorar sus resultados. El dashboard de coach es secundario.

## Stack

- **Backend:** ASP.NET Core 8 (`CrossFitWOD.API`) + EF Core 8 + PostgreSQL (net8.0 LTS)
- **Frontend:** Next.js 14 (`CrossFitWOD.Web`) — TypeScript, App Router (pendiente)
- **Auth:** JWT con claim `box_id` para multi-tenancy (pendiente de implementar)

## Commands

Todos los comandos se ejecutan desde `CrossFitWOD/`.

### Backend
```bash
dotnet build
dotnet run                        # arranca en http://localhost:5290, Swagger en /swagger
dotnet ef migrations add <Name>   # proyecto único, no hacen falta flags --project
dotnet ef database update
```

### Frontend (pendiente — carpeta CrossFitWOD.Web no creada aún)
```bash
npm install
npm run dev
npm run build
npm run lint
```

## Architecture

### Solution structure
```
CrossFitWOD/                    — proyecto único (CrossFitWOD.API.csproj)
├── Controllers/
├── DTOs/
├── Entities/
├── Enums/
├── Exceptions/
├── Middleware/
├── Migrations/
├── Persistence/                — AppDbContext, DbSeeder, DesignTimeDbContextFactory
├── Services/
├── Program.cs
└── CrossFitWOD.Web/            — Next.js 14 (pendiente)
```

### Multi-tenancy
Tenant isolation is enforced via EF Core **Global Query Filters** in `AppDbContext`. The `box_id` claim from the JWT is injected via `IHttpContextAccessor` at DbContext construction time — every query is automatically scoped to the current box. `WodExercise` is the only entity without a `BoxId`; it's always accessed through navigation from `Wod`.

### Scaling algorithm (core business logic)
Each `AthleteWorkout` has a `ScaledRepsFactor` (range `[0.5, 1.5]`):
- Initial factor: Beginner → 0.8, Intermediate → 1.0, Advanced → 1.2
- After result: RPE ≥ 9 or incomplete → −0.1; RPE ≤ 6 and completed → +0.1; RPE 7–8 and completed → no change

Logic lives in `WorkoutResultService.AdjustNextFactor()` and `AthleteWorkoutService.GetInitialFactor()`.

### Key constraints (enforced by DB indexes)
- One `WorkoutSession` per box per day (`BoxId + Date` unique)
- One `AthleteWorkout` per athlete per session (`AthleteId + WorkoutSessionId` unique)
- One `WorkoutResult` per `AthleteWorkout`

### IHttpContextAccessor
`AppDbContext` depende de `IHttpContextAccessor` para extraer el `box_id` del JWT. La `DesignTimeDbContextFactory` en `Persistence/` usa una implementación inline `NullHttpContextAccessor` (HttpContext = null → boxId = int.Empty) para que `dotnet ef migrations add` funcione sin HTTP context.

### Seed de desarrollo
`DbSeeder.SeedAsync()` corre en Program.cs solo en `Development`. Es idempotente (verifica con `IgnoreQueryFilters().AnyAsync()`). Crea:
- BoxId de test: `11111111-1111-1111-1111-111111111111`
- 1 atleta ("Test Athlete", Intermediate) — Id: `aaaa...`
- 3 WODs: Fran (`bbbb...`), Cindy (`cccc...`), EMOM Burpees (`dddd...`)
- 1 WorkoutSession de hoy con Fran

### Frontend env vars (cuando se cree CrossFitWOD.Web)
- `NEXT_PUBLIC_API_URL` — backend base URL (default `http://localhost:5290`)
- `NEXT_PUBLIC_ATHLETE_ID` — V1 usa ID fijo del env (sin auth aún)

### API routes implementadas
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/athlete-workouts/today/{athleteId}` | Obtiene/crea AthleteWorkout del día con reps escaladas |
| POST | `/api/workout-results` | Registra resultado + ajusta ScaledRepsFactor |
| GET | `/api/workoutsessions/today` | Sesión de hoy (usa IgnoreQueryFilters — sin JWT aún) |
| POST | `/api/workoutsessions` | Crea sesión del día (coach, requiere JWT con box_id) |
| GET | `/api/wods` | Lista todos los WODs (IgnoreQueryFilters, para Swagger/dev) |
| GET | `/api/athletes` | Lista todos los atletas (IgnoreQueryFilters, para Swagger/dev) |
