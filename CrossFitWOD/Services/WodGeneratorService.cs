using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Persistence;

namespace CrossFitWOD.Services;

/// <summary>
/// Genera WODs automáticamente para atletas en boxes individuales (sin coach).
/// Considera Goal, Level, equipamiento disponible y puntos débiles.
/// </summary>
public class WodGeneratorService
{
    private readonly AppDbContext _db;

    public WodGeneratorService(AppDbContext db) => _db = db;

    // ── Definición de ejercicio con metadata ──────────────────────────────────
    private record ExDef(
        string   Name,
        int      BaseReps,
        string[] Equip,    // equipamiento requerido (vacío = solo bodyweight)
        string[] Domains   // dominios que entrena
    );

    // ── Base de ejercicios global ─────────────────────────────────────────────
    // Categorías: "cardio" | "gymnastics" | "loaded"
    // Organizada por Goal → lista de categorías → ejercicios por categoría
    private static readonly Dictionary<AthleteGoal, Dictionary<string, ExDef[]>> Pools = new()
    {
        [AthleteGoal.General] = new()
        {
            ["cardio"] =
            [
                new("Burpees",         10, [],              ["cardio", "gymnastics"]),
                new("Jump Rope",       50, [],              ["cardio"]),
                new("Run 400m",         1, [],              ["cardio"]),
                new("Box Jumps",       20, ["box"],         ["cardio"]),
                new("Row 500m",         1, ["rower"],       ["cardio"]),
            ],
            ["gymnastics"] =
            [
                new("Push-ups",        15, [],              ["gymnastics", "strength"]),
                new("Sit-ups",         20, [],              ["gymnastics"]),
                new("Air Squats",      20, [],              ["gymnastics"]),
                new("Lunges",          20, [],              ["gymnastics", "flexibility"]),
                new("Ring Rows",       10, ["rings"],       ["gymnastics", "strength"]),
            ],
            ["loaded"] =
            [
                new("KB Swings",       15, ["kettlebell"],  ["strength", "weightlifting"]),
                new("Goblet Squats",   15, ["kettlebell"],  ["strength"]),
                new("DB Thrusters",    10, [],              ["strength", "cardio"]),
                new("Wall Balls",      20, [],              ["cardio", "strength"]),
                new("Step-ups",        15, ["box"],         ["gymnastics", "flexibility"]),
            ],
        },

        [AthleteGoal.Fitness] = new()
        {
            ["cardio"] =
            [
                new("Run 400m",         1, [],              ["cardio"]),
                new("Row 500m",         1, ["rower"],       ["cardio"]),
                new("Burpees",         10, [],              ["cardio", "gymnastics"]),
                new("Double-Unders",   50, [],              ["cardio"]),
                new("Box Jumps",       20, ["box"],         ["cardio"]),
            ],
            ["gymnastics"] =
            [
                new("Pull-ups",        10, ["pullup_bar"],  ["gymnastics", "strength"]),
                new("Push-ups",        15, [],              ["gymnastics", "strength"]),
                new("Ring Rows",       10, ["rings"],       ["gymnastics", "strength"]),
                new("Toes-to-Bar",     12, ["pullup_bar"],  ["gymnastics"]),
                new("Dips",            10, ["rings"],       ["gymnastics", "strength"]),
            ],
            ["loaded"] =
            [
                new("KB Swings",       20, ["kettlebell"],  ["strength", "weightlifting"]),
                new("Goblet Squats",   15, ["kettlebell"],  ["strength"]),
                new("Lunges",          20, [],              ["gymnastics", "flexibility"]),
                new("Wall Balls",      20, [],              ["cardio", "strength"]),
                new("Deadlifts",       10, ["barbell"],     ["strength", "weightlifting"]),
            ],
        },

        [AthleteGoal.Competition] = new()
        {
            ["cardio"] =
            [
                new("Run 400m",         1, [],              ["cardio"]),
                new("Row 500m",         1, ["rower"],       ["cardio"]),
                new("Double-Unders",   50, [],              ["cardio"]),
                new("Burpees",         15, [],              ["cardio", "gymnastics"]),
                new("Box Jumps",       24, ["box"],         ["cardio"]),
            ],
            ["gymnastics"] =
            [
                new("Pull-ups",        15, ["pullup_bar"],  ["gymnastics", "strength"]),
                new("Chest-to-Bar",    10, ["pullup_bar"],  ["gymnastics", "strength"]),
                new("Toes-to-Bar",     15, ["pullup_bar"],  ["gymnastics"]),
                new("Dips",            12, ["rings"],       ["gymnastics", "strength"]),
                new("Push-ups",        20, [],              ["gymnastics", "strength"]),
            ],
            ["loaded"] =
            [
                new("Thrusters",       15, ["barbell"],     ["weightlifting", "cardio"]),
                new("Cleans",          10, ["barbell"],     ["weightlifting"]),
                new("Deadlifts",       15, ["barbell"],     ["strength", "weightlifting"]),
                new("KB Swings",       20, ["kettlebell"],  ["strength", "weightlifting"]),
                new("Wall Balls",      20, [],              ["cardio", "strength"]),
            ],
        },

        [AthleteGoal.Rehabilitation] = new()
        {
            ["cardio"] =
            [
                new("Walk 400m",        1, [],              ["cardio"]),
                new("Row 500m easy",    1, ["rower"],       ["cardio"]),
                new("Bike 5min",        1, [],              ["cardio"]),
                new("Jump Rope",       30, [],              ["cardio"]),
            ],
            ["gymnastics"] =
            [
                new("Ring Rows",       10, ["rings"],       ["gymnastics", "strength"]),
                new("Push-ups",        10, [],              ["gymnastics", "strength"]),
                new("Plank 30s",        1, [],              ["gymnastics", "strength"]),
                new("Sit-ups",         15, [],              ["gymnastics", "flexibility"]),
                new("Lunges",          12, [],              ["gymnastics", "flexibility"]),
            ],
            ["loaded"] =
            [
                new("Goblet Squats",   10, ["kettlebell"],  ["strength"]),
                new("KB Deadlifts",    10, ["kettlebell"],  ["strength", "weightlifting"]),
                new("Step-ups",        15, ["box"],         ["gymnastics", "flexibility"]),
                new("Air Squats",      15, [],              ["gymnastics"]),
                new("DB Thrusters",     8, [],              ["strength"]),
            ],
        },
    };

    // ── Fallback bodyweight por categoría ─────────────────────────────────────
    private static readonly Dictionary<string, ExDef> Fallback = new()
    {
        ["cardio"]     = new("Burpees",    10, [], ["cardio", "gymnastics"]),
        ["gymnastics"] = new("Push-ups",   15, [], ["gymnastics", "strength"]),
        ["loaded"]     = new("Air Squats", 20, [], ["gymnastics"]),
    };

    // ── Multiplicador de reps por nivel ───────────────────────────────────────
    private static float RepMultiplier(AthleteLevel level) => level switch
    {
        AthleteLevel.Beginner     => 0.6f,
        AthleteLevel.Intermediate => 1.0f,
        AthleteLevel.Advanced     => 1.4f,
        _ => 1.0f
    };

    // Usa la duración preferida del atleta; si es 0 (default no seteado), cae al default por nivel
    private static int Duration(Athlete athlete) =>
        athlete.SessionDurationMinutes > 0
            ? athlete.SessionDurationMinutes
            : athlete.Level switch
            {
                AthleteLevel.Beginner     => 15,
                AthleteLevel.Intermediate => 20,
                AthleteLevel.Advanced     => 30,
                _ => 20
            };

    private static WodType WodTypeForDay(DateOnly date) => date.DayOfWeek switch
    {
        DayOfWeek.Monday    => WodType.ForTime,
        DayOfWeek.Tuesday   => WodType.Amrap,
        DayOfWeek.Wednesday => WodType.Emom,
        DayOfWeek.Thursday  => WodType.ForTime,
        DayOfWeek.Friday    => WodType.Amrap,
        DayOfWeek.Saturday  => WodType.ForTime,
        _                   => WodType.Emom,
    };

    // ── Selección ponderada por puntos débiles ────────────────────────────────
    private static ExDef PickWeighted(IList<ExDef> candidates, IReadOnlySet<string> weakDomains, Random rng)
    {
        // Ejercicios que entrenan un punto débil pesan 3x
        var weights = candidates.Select(e => weakDomains.Overlaps(e.Domains) ? 3 : 1).ToList();
        var roll    = rng.Next(weights.Sum());
        var acc     = 0;
        for (var i = 0; i < candidates.Count; i++)
        {
            acc += weights[i];
            if (roll < acc) return candidates[i];
        }
        return candidates[^1];
    }

    // ── Punto de entrada ──────────────────────────────────────────────────────
    public async Task<WorkoutSession> GenerateForAthleteAsync(Athlete athlete, DateOnly date)
    {
        var rng  = new Random(athlete.Id + date.DayNumber); // determinista por atleta + día
        var mult = RepMultiplier(athlete.Level);

        // Parsear equipamiento y puntos débiles del atleta
        var equip = athlete.Equipment
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToHashSet();

        var weakDomains = athlete.WeakPoints
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToHashSet();

        var goalPool      = Pools[athlete.Goal];
        var categoryCount = athlete.Goal == AthleteGoal.Competition ? 3 : 2;
        var categories    = goalPool.Keys.OrderBy(_ => rng.Next()).Take(categoryCount).ToList();

        var exercises = categories.Select((cat, i) =>
        {
            // Filtrar por equipamiento disponible
            var available = goalPool[cat]
                .Where(e => e.Equip.All(req => equip.Contains(req)))
                .ToList();

            // Fallback a bodyweight si no hay ejercicios con el equipo disponible
            var ex = available.Count > 0
                ? PickWeighted(available, weakDomains, rng)
                : Fallback[cat];

            var reps = Math.Max(1, (int)Math.Round(ex.BaseReps * mult));
            return new WodExercise { Name = ex.Name, Reps = reps, Order = i + 1 };
        }).ToList();

        var wodType   = WodTypeForDay(date);
        var typeLabel = wodType switch
        {
            WodType.ForTime => "For Time",
            WodType.Amrap   => "AMRAP",
            WodType.Emom    => "EMOM",
            _               => wodType.ToString()
        };

        var wod = new Wod
        {
            Title           = $"{typeLabel} — {date:dd/MM}",
            Description     = $"WOD generado para {athlete.Name}",
            Type            = wodType,
            DurationMinutes = Duration(athlete),
            Exercises       = exercises
        };

        _db.Wods.Add(wod);
        await _db.SaveChangesAsync();

        var session = new WorkoutSession
        {
            WodId = wod.Id,
            BoxId = athlete.BoxId,
            Date  = date
        };

        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();

        return session;
    }
}
