using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Persistence;
using CrossFitWOD.Services;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Tests;

/// <summary>
/// Tests de AthleteStatusService usando EF Core InMemory.
/// Cada test tiene su propia DB aislada (Guid como nombre).
/// </summary>
public class AthleteStatusServiceTests
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    private static AppDbContext CreateDb()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(opts);
    }

    /// <summary>Crea box + atleta y devuelve el athleteId.</summary>
    private static async Task<(AppDbContext db, int athleteId)> SeedAthleteAsync()
    {
        var db = CreateDb();

        var box = new Box { Name = "Test Box", Slug = "test", IsIndividual = true };
        db.Boxes.Add(box);
        await db.SaveChangesAsync();

        var user = new User { Username = "testuser", PasswordHash = "x", BoxId = box.Id };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var athlete = new Athlete
        {
            UserId = user.Id,
            BoxId  = box.Id,
            Name   = "Test Athlete",
            Level  = AthleteLevel.Intermediate,
            Goal   = AthleteGoal.Fitness,
        };
        db.Athletes.Add(athlete);
        await db.SaveChangesAsync();

        return (db, athlete.Id);
    }

    /// <summary>Agrega un WorkoutResult con sus navegaciones mínimas.</summary>
    private static async Task AddResultAsync(
        AppDbContext db, int athleteId, int boxId,
        DateOnly date, int rpe, bool completed, int durationSeconds)
    {
        var wod = new Wod
        {
            Title = $"WOD {date}", Type = WodType.ForTime, DurationMinutes = durationSeconds / 60,
        };
        db.Wods.Add(wod);
        await db.SaveChangesAsync();

        var session = new WorkoutSession { WodId = wod.Id, BoxId = boxId, Date = date };
        db.WorkoutSessions.Add(session);
        await db.SaveChangesAsync();

        var aw = new AthleteWorkout
        {
            AthleteId = athleteId, WorkoutSessionId = session.Id, ScaledRepsFactor = 1.0f,
        };
        db.AthleteWorkouts.Add(aw);
        await db.SaveChangesAsync();

        var result = new WorkoutResult
        {
            AthleteWorkoutId = aw.Id,
            Completed        = completed,
            Rpe              = rpe,
            DurationSeconds  = durationSeconds,
        };
        db.WorkoutResults.Add(result);
        await db.SaveChangesAsync();
    }

    private static async Task AddLogAsync(
        AppDbContext db, int athleteId,
        int energy, int fatigue, float? sleepHours = 7f, string? painNotes = null)
    {
        db.AthleteDailyLogs.Add(new AthleteDailyLogs
        {
            AthleteId    = athleteId,
            EnergyLevel  = energy,
            FatigueLevel = fatigue,
            SleepHours   = sleepHours,
            PainNotes    = painNotes,
            CreatedAt    = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
    }

    // ── Sin datos → valores por defecto ───────────────────────────────────────

    [Fact]
    public async Task NoData_CreatesStatus_WithSafeDefaults()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        var svc = new AthleteStatusService(db);

        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal(0f, status.AcuteLoad,   precision: 2);
        Assert.Equal(0f, status.ChronicLoad, precision: 2);
        Assert.Equal(1f, status.LoadRatio,   precision: 2);  // sin crónica → 1 por defecto
        Assert.Equal("high", status.Readiness);
        Assert.Equal("low",  status.InjuryRisk);
        Assert.Equal("insufficient_data", status.PerformanceTrend);
    }

    // ── Carga aguda y crónica ─────────────────────────────────────────────────

    [Fact]
    public async Task AcuteLoad_IsAvgOverLast7Days()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        var athlete = await db.Athletes.FindAsync(athleteId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        // 45 min × RPE 8 = 360 unidades de carga
        await AddResultAsync(db, athleteId, athlete!.BoxId, today.AddDays(-1), rpe: 8, completed: true, durationSeconds: 45 * 60);

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        // AcuteLoad = 360 / 7 ≈ 51.43
        Assert.True(status.AcuteLoad > 0, "AcuteLoad debe ser mayor que 0");
        Assert.True(status.AcuteLoad < 100, "AcuteLoad no debería superar 100 con una sola sesión de 45 min");
    }

    [Fact]
    public async Task ChronicLoad_IgnoresResultsOlderThan28Days()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        var athlete = await db.Athletes.FindAsync(athleteId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        // Resultado de hace 29 días → no debe entrar en chronic
        await AddResultAsync(db, athleteId, athlete!.BoxId, today.AddDays(-29), rpe: 10, completed: true, durationSeconds: 90 * 60);

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal(0f, status.ChronicLoad, precision: 2);
        Assert.Equal(0f, status.AcuteLoad,   precision: 2);
    }

    // ── Readiness ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Readiness_IsLow_WhenPainNotesPresent()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        await AddLogAsync(db, athleteId, energy: 8, fatigue: 3, sleepHours: 8f, painNotes: "hombro derecho");

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal("low", status.Readiness);
    }

    [Fact]
    public async Task Readiness_IsHigh_WhenGoodRecoveryAndNoPain()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        await AddLogAsync(db, athleteId, energy: 9, fatigue: 2, sleepHours: 8f, painNotes: null);

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal("high", status.Readiness);
    }

    // ── InjuryRisk ────────────────────────────────────────────────────────────

    [Fact]
    public async Task InjuryRisk_IsModerate_WhenPainAndNoHighLoad()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        await AddLogAsync(db, athleteId, energy: 5, fatigue: 5, sleepHours: 7f, painNotes: "rodilla");

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal("moderate", status.InjuryRisk);
    }

    [Fact]
    public async Task InjuryRisk_IsLow_WithNoPainGoodSleep()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        await AddLogAsync(db, athleteId, energy: 7, fatigue: 4, sleepHours: 8f, painNotes: null);

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal("low", status.InjuryRisk);
    }

    [Fact]
    public async Task InjuryRisk_Increases_WhenSleepUnder6Hours()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        // pain + mal sueño → moderate o high
        await AddLogAsync(db, athleteId, energy: 5, fatigue: 5, sleepHours: 5f, painNotes: "espalda baja");

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.NotEqual("low", status.InjuryRisk);
    }

    // ── PerformanceTrend ──────────────────────────────────────────────────────

    [Fact]
    public async Task Trend_IsInsufficientData_WhenFewerThan3Results()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        var athlete = await db.Athletes.FindAsync(athleteId);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        await AddResultAsync(db, athleteId, athlete!.BoxId, today.AddDays(-2), rpe: 6, completed: true, durationSeconds: 30 * 60);
        await AddResultAsync(db, athleteId, athlete.BoxId,  today.AddDays(-1), rpe: 6, completed: true, durationSeconds: 30 * 60);

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal("insufficient_data", status.PerformanceTrend);
    }

    [Fact]
    public async Task Trend_IsImproving_WhenMostlyCompletedAndLowRpe()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        var athlete = await db.Athletes.FindAsync(athleteId);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // 5 sesiones completadas con RPE ≤ 7 → improving
        for (var i = 5; i >= 1; i--)
            await AddResultAsync(db, athleteId, athlete!.BoxId, today.AddDays(-i), rpe: 6, completed: true, durationSeconds: 45 * 60);

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal("improving", status.PerformanceTrend);
    }

    [Fact]
    public async Task Trend_IsDeclining_WhenMostlyIncompleteOrHighRpe()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        var athlete = await db.Athletes.FindAsync(athleteId);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // 4 no completados + 1 completado con RPE 9 → declining
        await AddResultAsync(db, athleteId, athlete!.BoxId, today.AddDays(-5), rpe: 9, completed: false, durationSeconds: 45 * 60);
        await AddResultAsync(db, athleteId, athlete.BoxId,  today.AddDays(-4), rpe: 9, completed: false, durationSeconds: 45 * 60);
        await AddResultAsync(db, athleteId, athlete.BoxId,  today.AddDays(-3), rpe: 9, completed: false, durationSeconds: 45 * 60);
        await AddResultAsync(db, athleteId, athlete.BoxId,  today.AddDays(-2), rpe: 9, completed: true,  durationSeconds: 45 * 60);
        await AddResultAsync(db, athleteId, athlete.BoxId,  today.AddDays(-1), rpe: 9, completed: false, durationSeconds: 45 * 60);

        var svc = new AthleteStatusService(db);
        await svc.RecalculateAsync(athleteId);

        var status = await db.AthleteStatuses.FirstAsync(s => s.AthleteId == athleteId);
        Assert.Equal("declining", status.PerformanceTrend);
    }

    // ── Idempotencia ──────────────────────────────────────────────────────────

    [Fact]
    public async Task RecalculateAsync_IsIdempotent_CreatesOnlyOneStatus()
    {
        var (db, athleteId) = await SeedAthleteAsync();
        var svc = new AthleteStatusService(db);

        await svc.RecalculateAsync(athleteId);
        await svc.RecalculateAsync(athleteId);
        await svc.RecalculateAsync(athleteId);

        var count = await db.AthleteStatuses.CountAsync(s => s.AthleteId == athleteId);
        Assert.Equal(1, count);
    }
}
