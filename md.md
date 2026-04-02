Estructura de carpetas — completa
CrossFitWOD/
├── CrossFitWOD.API/                    ← ASP.NET Core
│   ├── Controllers/
│   │   ├── WodsController.cs
│   │   ├── WorkoutSessionsController.cs
│   │   ├── AthletesController.cs
│   │   ├── AthleteWorkoutsController.cs
│   │   └── WorkoutResultsController.cs
│   ├── Middleware/
│   │   ├── TenantMiddleware.cs
│   │   └── ErrorHandlingMiddleware.cs
│   ├── Program.cs
│   └── appsettings.json
│
├── CrossFitWOD.Application/
│   ├── DTOs/
│   │   ├── Athlete/
│   │   ├── Wod/
│   │   ├── WorkoutSession/
│   │   └── WorkoutResult/
│   ├── Services/
│   │   ├── AthleteService.cs
│   │   ├── WodService.cs
│   │   ├── WorkoutSessionService.cs
│   │   ├── AthleteWorkoutService.cs   ← scaling logic
│   │   └── WorkoutResultService.cs   ← adjust logic
│   └── Interfaces/
│       └── IWorkoutAdjustmentService.cs
│
├── CrossFitWOD.Domain/
│   ├── Entities/
│   │   ├── Athlete.cs
│   │   ├── Wod.cs
│   │   ├── WodExercise.cs
│   │   ├── WorkoutSession.cs
│   │   ├── AthleteWorkout.cs
│   │   └── WorkoutResult.cs
│   └── Enums/
│       ├── AthleteLevel.cs
│       └── WodType.cs
│
├── CrossFitWOD.Infrastructure/
│   ├── Persistence/
│   │   ├── AppDbContext.cs
│   │   └── Migrations/
│   └── Repositories/
│
└── CrossFitWOD.Web/                    ← Next.js 14
    ├── app/
    │   ├── coach/
    │   │   ├── page.tsx               ← dashboard coach
    │   │   └── wods/
    │   │       └── new/page.tsx       ← crear WOD
    │   └── athlete/
    │       ├── page.tsx               ← WOD del día
    │       └── result/page.tsx        ← registrar resultado
    ├── components/
    │   ├── wod/
    │   │   ├── WodCard.tsx
    │   │   └── WodExerciseList.tsx
    │   ├── result/
    │   │   └── ResultForm.tsx
    │   └── ui/
    └── lib/
        ├── api.ts                     ← fetch wrapper
        └── types.ts                   ← tipos compartidos

BACKEND
Enums
csharp// Domain/Enums/AthleteLevel.cs
public enum AthleteLevel
{
    Beginner     = 1,
    Intermediate = 2,
    Advanced     = 3
}

// Domain/Enums/WodType.cs
public enum WodType
{
    Amrap   = 1,
    ForTime = 2,
    Emom    = 3
}
Entidades
csharp// Domain/Entities/Athlete.cs
public class Athlete
{
    public int   Id        { get; set; } = int.Newint();
    public int   BoxId     { get; set; }           // tenant
    public string Name      { get; set; } = string.Empty;
    public AthleteLevel Level { get; set; } = AthleteLevel.Beginner;
    public float? Weight    { get; set; }           // opcional
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Nav
    public ICollection<AthleteWorkout> AthleteWorkouts { get; set; } = [];
}

// Domain/Entities/Wod.cs
public class Wod
{
    public int    Id              { get; set; } = int.Newint();
    public int    BoxId           { get; set; }
    public string  Title           { get; set; } = string.Empty;
    public string? Description     { get; set; }
    public WodType Type            { get; set; }
    public int     DurationMinutes { get; set; }
    public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;

    // Nav
    public ICollection<WodExercise>      Exercises        { get; set; } = [];
    public ICollection<WorkoutSession>   WorkoutSessions  { get; set; } = [];
}

// Domain/Entities/WodExercise.cs
public class WodExercise
{
    public int   Id    { get; set; } = int.Newint();
    public int   WodId { get; set; }
    public string Name  { get; set; } = string.Empty;  // "Push-ups"
    public int    Reps  { get; set; }
    public int    Order { get; set; }

    // Nav
    public Wod Wod { get; set; } = null!;
}

// Domain/Entities/WorkoutSession.cs
// Instancia del WOD en un día concreto
public class WorkoutSession
{
    public int     Id    { get; set; } = int.Newint();
    public int     BoxId { get; set; }
    public int     WodId { get; set; }
    public DateOnly Date  { get; set; }

    // Nav
    public Wod                         Wod              { get; set; } = null!;
    public ICollection<AthleteWorkout> AthleteWorkouts  { get; set; } = [];
}

// Domain/Entities/AthleteWorkout.cs
// Versión personalizada del WOD para un atleta
public class AthleteWorkout
{
    public int  Id                { get; set; } = int.Newint();
    public int  AthleteId         { get; set; }
    public int  WorkoutSessionId  { get; set; }
    public int  BoxId             { get; set; }
    public float ScaledRepsFactor  { get; set; } = 1.0f;  // 0.8 | 1.0 | 1.2
    public string? Notes           { get; set; }

    // Nav
    public Athlete        Athlete        { get; set; } = null!;
    public WorkoutSession WorkoutSession { get; set; } = null!;
    public WorkoutResult? Result         { get; set; }
}

// Domain/Entities/WorkoutResult.cs
public class WorkoutResult
{
    public int  Id               { get; set; } = int.Newint();
    public int  AthleteWorkoutId { get; set; }
    public int  BoxId            { get; set; }
    public bool  Completed        { get; set; }
    public int?  TimeSeconds      { get; set; }
    public float? Rounds          { get; set; }
    public int   Rpe              { get; set; }   // 1–10
    public DateTime CreatedAt     { get; set; } = DateTime.UtcNow;

    // Nav
    public AthleteWorkout AthleteWorkout { get; set; } = null!;
}
DbContext con Global Query Filters
csharp// Infrastructure/Persistence/AppDbContext.cs
public class AppDbContext : DbContext
{
    private readonly int _boxId;

    public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor accessor)
        : base(options)
    {
        // El boxId viene del JWT — nunca del cliente
        var claim = accessor.HttpContext?.User.FindFirst("box_id")?.Value;
        _boxId = claim is not null ? int.Parse(claim) : int.Empty;
    }

    public DbSet<Athlete>        Athletes        => Set<Athlete>();
    public DbSet<Wod>            Wods            => Set<Wod>();
    public DbSet<WodExercise>    WodExercises    => Set<WodExercise>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<AthleteWorkout> AthleteWorkouts => Set<AthleteWorkout>();
    public DbSet<WorkoutResult>  WorkoutResults  => Set<WorkoutResult>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ── Global Query Filters (multi-tenancy automático) ──────────────
        b.Entity<Athlete>()       .HasQueryFilter(x => x.BoxId == _boxId);
        b.Entity<Wod>()           .HasQueryFilter(x => x.BoxId == _boxId);
        b.Entity<WorkoutSession>().HasQueryFilter(x => x.BoxId == _boxId);
        b.Entity<AthleteWorkout>().HasQueryFilter(x => x.BoxId == _boxId);
        b.Entity<WorkoutResult>() .HasQueryFilter(x => x.BoxId == _boxId);
        // WodExercise no lleva BoxId — acceso siempre vía navegación desde Wod

        // ── Relaciones ───────────────────────────────────────────────────
        b.Entity<Wod>()
            .HasMany(w => w.Exercises)
            .WithOne(e => e.Wod)
            .HasForeignKey(e => e.WodId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<WorkoutSession>()
            .HasMany(s => s.AthleteWorkouts)
            .WithOne(a => a.WorkoutSession)
            .HasForeignKey(a => a.WorkoutSessionId);

        b.Entity<AthleteWorkout>()
            .HasOne(a => a.Result)
            .WithOne(r => r.AthleteWorkout)
            .HasForeignKey<WorkoutResult>(r => r.AthleteWorkoutId);

        // ── Índices ──────────────────────────────────────────────────────
        b.Entity<WorkoutSession>()
            .HasIndex(s => new { s.BoxId, s.Date })
            .IsUnique();   // un solo WOD por día por box

        b.Entity<AthleteWorkout>()
            .HasIndex(a => new { a.AthleteId, a.WorkoutSessionId })
            .IsUnique();   // un atleta, una sesión, una vez

        b.Entity<WorkoutResult>()
            .HasIndex(r => r.AthleteWorkoutId)
            .IsUnique();   // un resultado por AthleteWorkout
    }
}
Servicio de ajuste — el core de la lógica
csharp// Application/Services/WorkoutResultService.cs
public class WorkoutResultService
{
    private readonly AppDbContext _db;

    public WorkoutResultService(AppDbContext db) => _db = db;

    public async Task<WorkoutResult> RegisterAsync(RegisterResultDto dto)
    {
        var athleteWorkout = await _db.AthleteWorkouts
            .FirstOrDefaultAsync(a => a.Id == dto.AthleteWorkoutId)
            ?? throw new NotFoundException("AthleteWorkout no encontrado");

        // Guardar resultado
        var result = new WorkoutResult
        {
            AthleteWorkoutId = dto.AthleteWorkoutId,
            BoxId            = athleteWorkout.BoxId,
            Completed        = dto.Completed,
            TimeSeconds      = dto.TimeSeconds,
            Rounds           = dto.Rounds,
            Rpe              = dto.Rpe
        };

        _db.WorkoutResults.Add(result);

        // Ajustar factor para la próxima sesión
        AdjustNextFactor(athleteWorkout, result);

        await _db.SaveChangesAsync();
        return result;
    }

    // ── Reglas de ajuste ─────────────────────────────────────────────────
    // Lógica simple, auditable, sin magia.
    // Cualquier coach puede entender qué hace el sistema.
    private static void AdjustNextFactor(AthleteWorkout aw, WorkoutResult result)
    {
        const float step = 0.1f;
        const float min  = 0.5f;   // nunca bajar más del 50% del volumen base
        const float max  = 1.5f;   // nunca subir más del 150%

        if (!result.Completed || result.Rpe >= 9)
            aw.ScaledRepsFactor -= step;   // bajar dificultad
        else if (result.Rpe <= 6)
            aw.ScaledRepsFactor += step;   // subir dificultad
        // RPE 7–8 y completado → mantener factor

        // Clamp — nunca salir del rango seguro
        aw.ScaledRepsFactor = Math.Clamp(aw.ScaledRepsFactor, min, max);
    }
}
Servicio de WOD del atleta — scaling automático
csharp// Application/Services/AthleteWorkoutService.cs
public class AthleteWorkoutService
{
    private readonly AppDbContext _db;

    public AthleteWorkoutService(AppDbContext db) => _db = db;

    // Obtiene o crea el AthleteWorkout del día con scaling aplicado
    public async Task<AthleteWodResponseDto> GetTodayAsync(int athleteId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var session = await _db.WorkoutSessions
            .Include(s => s.Wod)
                .ThenInclude(w => w.Exercises)
            .FirstOrDefaultAsync(s => s.Date == today)
            ?? throw new NotFoundException("No hay WOD cargado para hoy");

        var athlete = await _db.Athletes
            .FirstOrDefaultAsync(a => a.Id == athleteId)
            ?? throw new NotFoundException("Atleta no encontrado");

        // Buscar o crear AthleteWorkout
        var aw = await _db.AthleteWorkouts
            .FirstOrDefaultAsync(a => a.AthleteId == athleteId
                                   && a.WorkoutSessionId == session.Id);

        if (aw is null)
        {
            aw = new AthleteWorkout
            {
                AthleteId        = athleteId,
                WorkoutSessionId = session.Id,
                BoxId            = athlete.BoxId,
                ScaledRepsFactor = GetInitialFactor(athlete.Level)
            };
            _db.AthleteWorkouts.Add(aw);
            await _db.SaveChangesAsync();
        }

        // Aplicar scaling a los ejercicios y devolver
        return BuildResponse(session, aw);
    }

    // Factor inicial según nivel del atleta
    private static float GetInitialFactor(AthleteLevel level) => level switch
    {
        AthleteLevel.Beginner     => 0.8f,
        AthleteLevel.Intermediate => 1.0f,
        AthleteLevel.Advanced     => 1.2f,
        _ => 1.0f
    };

    private static AthleteWodResponseDto BuildResponse(WorkoutSession session, AthleteWorkout aw)
    {
        var wod = session.Wod;
        return new AthleteWodResponseDto
        {
            AthleteWorkoutId = aw.Id,
            WodTitle         = wod.Title,
            WodType          = wod.Type.ToString(),
            DurationMinutes  = wod.DurationMinutes,
            ScaledRepsFactor = aw.ScaledRepsFactor,
            Exercises = wod.Exercises
                .OrderBy(e => e.Order)
                .Select(e => new ScaledExerciseDto
                {
                    Name         = e.Name,
                    BaseReps     = e.Reps,
                    ScaledReps   = (int)Math.Round(e.Reps * aw.ScaledRepsFactor),
                    ScaleFactor  = aw.ScaledRepsFactor
                })
                .ToList()
        };
    }
}
DTOs
csharp// Application/DTOs/WorkoutResult/RegisterResultDto.cs
public record RegisterResultDto(
    int   AthleteWorkoutId,
    bool   Completed,
    int?   TimeSeconds,
    float? Rounds,
    int    Rpe   // validado 1–10
);

// Application/DTOs/AthleteWod/AthleteWodResponseDto.cs
public class AthleteWodResponseDto
{
    public int   AthleteWorkoutId { get; set; }
    public string WodTitle         { get; set; } = string.Empty;
    public string WodType          { get; set; } = string.Empty;
    public int    DurationMinutes  { get; set; }
    public float  ScaledRepsFactor { get; set; }
    public List<ScaledExerciseDto> Exercises { get; set; } = [];
}

public class ScaledExerciseDto
{
    public string Name        { get; set; } = string.Empty;
    public int    BaseReps    { get; set; }
    public int    ScaledReps  { get; set; }
    public float  ScaleFactor { get; set; }
}
Controllers
csharp// Controllers/AthleteWorkoutsController.cs
[ApiController]
[Route("api/athlete-workouts")]
public class AthleteWorkoutsController : ControllerBase
{
    private readonly AthleteWorkoutService _service;
    public AthleteWorkoutsController(AthleteWorkoutService service) => _service = service;

    [HttpGet("today/{athleteId:int}")]
    public async Task<IActionResult> GetToday(int athleteId)
    {
        var result = await _service.GetTodayAsync(athleteId);
        return Ok(result);
    }
}

// Controllers/WorkoutResultsController.cs
[ApiController]
[Route("api/workout-results")]
public class WorkoutResultsController : ControllerBase
{
    private readonly WorkoutResultService _service;
    public WorkoutResultsController(WorkoutResultService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterResultDto dto)
    {
        if (dto.Rpe is < 1 or > 10)
            return BadRequest("RPE debe estar entre 1 y 10");

        var result = await _service.RegisterAsync(dto);
        return CreatedAtAction(nameof(Register), new { id = result.Id }, result);
    }
}

// Controllers/WorkoutSessionsController.cs
[ApiController]
[Route("api/workoutsessions")]
public class WorkoutSessionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public WorkoutSessionsController(AppDbContext db) => _db = db;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSessionDto dto)
    {
        var session = new WorkoutSession
        {
            WodId = dto.WodId,
            Date  = dto.Date,
            BoxId = int.Parse(User.FindFirst("box_id")!.Value)
        };
        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetToday), new { }, session);
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var session = await _db.WorkoutSessions
            .Include(s => s.Wod).ThenInclude(w => w.Exercises)
            .FirstOrDefaultAsync(s => s.Date == today);

        return session is null ? NotFound("No hay WOD para hoy") : Ok(session);
    }
}
Program.cs
csharpvar builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<AthleteWorkoutService>();
builder.Services.AddScoped<WorkoutResultService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS para Next.js en dev
builder.Services.AddCors(opt => opt.AddPolicy("dev", p =>
    p.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

app.UseCors("dev");
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();

FRONTEND — Next.js 14
Tipos compartidos
typescript// lib/types.ts
export type AthleteLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type WodType = 'Amrap' | 'ForTime' | 'Emom'

export interface ScaledExercise {
  name: string
  baseReps: number
  scaledReps: number
  scaleFactor: number
}

export interface AthleteWod {
  athleteWorkoutId: string
  wodTitle: string
  wodType: WodType
  durationMinutes: number
  scaledRepsFactor: number
  exercises: ScaledExercise[]
}

export interface RegisterResultPayload {
  athleteWorkoutId: string
  completed: boolean
  timeSeconds?: number
  rounds?: number
  rpe: number
}
API client
typescript// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  getTodayWod: (athleteId: string) =>
    request<AthleteWod>(`/api/athlete-workouts/today/${athleteId}`),

  registerResult: (payload: RegisterResultPayload) =>
    request('/api/workout-results', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
Vista del atleta — WOD del día
tsx// app/athlete/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { AthleteWod } from '@/lib/types'
import WodCard from '@/components/wod/WodCard'

// En V1 el athleteId viene de una constante / sesión simple
const ATHLETE_ID = process.env.NEXT_PUBLIC_ATHLETE_ID ?? ''

export default function AthletePage() {
  const [wod, setWod]       = useState<AthleteWod | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTodayWod(ATHLETE_ID)
      .then(setWod)
      .catch(() => setError('No hay WOD cargado para hoy'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-8 text-center">Cargando WOD...</p>
  if (error)   return <p className="p-8 text-center text-red-500">{error}</p>
  if (!wod)    return null

  return (
    <main className="max-w-lg mx-auto p-6">
      <WodCard wod={wod} />
    </main>
  )
}
WodCard
tsx// components/wod/WodCard.tsx
import { AthleteWod } from '@/lib/types'
import Link from 'next/link'

export default function WodCard({ wod }: { wod: AthleteWod }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{wod.wodTitle}</h1>
        <span className="bg-black text-white text-xs px-3 py-1 rounded-full uppercase tracking-wide">
          {wod.wodType}
        </span>
      </div>

      <p className="text-gray-500 text-sm">{wod.durationMinutes} minutos</p>

      {/* Nivel del atleta */}
      <div className="text-sm text-gray-400">
        Factor de escala: <span className="font-semibold text-black">
          {(wod.scaledRepsFactor * 100).toFixed(0)}%
        </span>
      </div>

      {/* Ejercicios */}
      <ul className="divide-y">
        {wod.exercises.map((ex, i) => (
          <li key={i} className="py-3 flex items-center justify-between">
            <span className="font-medium">{ex.name}</span>
            <div className="text-right">
              <span className="text-2xl font-bold">{ex.scaledReps}</span>
              <span className="text-xs text-gray-400 ml-1">reps</span>
              {ex.scaleFactor !== 1 && (
                <p className="text-xs text-gray-400">base: {ex.baseReps}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={`/athlete/result?awId=${wod.athleteWorkoutId}`}
        className="block w-full text-center bg-black text-white py-3 rounded-xl font-semibold mt-2"
      >
        Registrar resultado
      </Link>
    </div>
  )
}
Formulario de resultado
tsx// app/athlete/result/page.tsx
'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

function ResultForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const awId         = params.get('awId') ?? ''

  const [rpe,       setRpe]       = useState(7)
  const [completed, setCompleted] = useState(true)
  const [time,      setTime]      = useState('')
  const [rounds,    setRounds]    = useState('')
  const [saving,    setSaving]    = useState(false)

  async function submit() {
    setSaving(true)
    try {
      await api.registerResult({
        athleteWorkoutId: awId,
        completed,
        timeSeconds: time   ? parseInt(time)   : undefined,
        rounds:      rounds ? parseFloat(rounds) : undefined,
        rpe,
      })
      router.push('/athlete?success=1')
    } catch {
      alert('Error al guardar. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">¿Cómo te fue?</h1>

      {/* Completado */}
      <div className="flex gap-3">
        {[true, false].map(v => (
          <button
            key={String(v)}
            onClick={() => setCompleted(v)}
            className={`flex-1 py-3 rounded-xl font-semibold border-2 transition
              ${completed === v
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200'}`}
          >
            {v ? '✅ Completé' : '❌ No completé'}
          </button>
        ))}
      </div>

      {/* RPE — lo más importante, primero */}
      <div className="space-y-2">
        <label className="font-semibold">
          RPE: <span className="text-2xl">{rpe}</span>
          <span className="text-gray-400 text-sm ml-2">
            ({rpe <= 4 ? 'Fácil' : rpe <= 6 ? 'Moderado' : rpe <= 8 ? 'Duro' : 'Máximo'})
          </span>
        </label>
        <input
          type="range" min={1} max={10} value={rpe}
          onChange={e => setRpe(Number(e.target.value))}
          className="w-full accent-black"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1 - Fácil</span><span>10 - Máximo</span>
        </div>
      </div>

      {/* Tiempo (opcional) */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600">
          Tiempo (segundos) — opcional
        </label>
        <input
          type="number" value={time} onChange={e => setTime(e.target.value)}
          placeholder="ej: 720"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* Rounds (opcional) */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600">
          Rounds completados — opcional
        </label>
        <input
          type="number" step="0.1" value={rounds}
          onChange={e => setRounds(e.target.value)}
          placeholder="ej: 5.5"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <button
        onClick={submit}
        disabled={saving}
        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar resultado'}
      </button>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultForm />
    </Suspense>
  )
}
Dashboard del coach — crear WOD del día
tsx// app/coach/page.tsx
'use client'
import Link from 'next/link'

export default function CoachDashboard() {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Coach</h1>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/coach/wods/new"
          className="bg-black text-white rounded-2xl p-6 text-center font-semibold">
          + Nuevo WOD
        </Link>
        <Link href="/coach/sessions/new"
          className="border-2 border-black rounded-2xl p-6 text-center font-semibold">
          Programar día
        </Link>
      </div>
    </main>
  )
}

Orden de ejecución esta semana
Día 1: Crear solución, correr schema, migration inicial, seed de 3 WODs de prueba
Día 2: AthleteWorkoutService + WorkoutResultService funcionando con tests manuales en Swagger
Día 3: Frontend atleta — ver WOD del día y registrar resultado end-to-end
Día 4: Dashboard coach básico — crear WOD + asignar sesión del día
Día 5: Deploy Render + Vercel, URL pública para mostrar al cliente