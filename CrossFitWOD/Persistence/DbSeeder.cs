using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Persistence;

public static class DbSeeder
{
    private static readonly Guid TestBoxId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    public static async Task SeedAsync(AppDbContext db)
    {
        // Idempotente: si ya hay WODs, no hacer nada
        if (await db.Wods.IgnoreQueryFilters().AnyAsync())
            return;

        // ── Atleta de prueba ─────────────────────────────────────────────
        var athlete = new Athlete
        {
            Id    = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            BoxId = TestBoxId,
            Name  = "Test Athlete",
            Level = AthleteLevel.Intermediate
        };

        // ── 3 WODs ──────────────────────────────────────────────────────
        var fran = new Wod
        {
            Id              = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            BoxId           = TestBoxId,
            Title           = "Fran",
            Description     = "21-15-9 Thrusters & Pull-ups",
            Type            = WodType.ForTime,
            DurationMinutes = 15,
            Exercises =
            [
                new WodExercise { Name = "Thrusters", Reps = 21, Order = 1 },
                new WodExercise { Name = "Pull-ups",  Reps = 21, Order = 2 },
            ]
        };

        var cindy = new Wod
        {
            Id              = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            BoxId           = TestBoxId,
            Title           = "Cindy",
            Description     = "AMRAP 20 min: 5 Pull-ups, 10 Push-ups, 15 Air Squats",
            Type            = WodType.Amrap,
            DurationMinutes = 20,
            Exercises =
            [
                new WodExercise { Name = "Pull-ups",   Reps = 5,  Order = 1 },
                new WodExercise { Name = "Push-ups",   Reps = 10, Order = 2 },
                new WodExercise { Name = "Air Squats", Reps = 15, Order = 3 },
            ]
        };

        var emomBurpees = new Wod
        {
            Id              = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            BoxId           = TestBoxId,
            Title           = "EMOM Burpees",
            Description     = "Each minute on the minute x10: 10 Burpees",
            Type            = WodType.Emom,
            DurationMinutes = 10,
            Exercises =
            [
                new WodExercise { Name = "Burpees", Reps = 10, Order = 1 },
            ]
        };

        // ── Sesión de hoy con Fran ───────────────────────────────────────
        var todaySession = new WorkoutSession
        {
            BoxId = TestBoxId,
            WodId = fran.Id,
            Date  = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        db.Athletes.Add(athlete);
        db.Wods.AddRange(fran, cindy, emomBurpees);
        db.WorkoutSessions.Add(todaySession);

        await db.SaveChangesAsync();
    }
}
