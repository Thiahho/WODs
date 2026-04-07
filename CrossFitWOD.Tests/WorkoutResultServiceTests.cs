using CrossFitWOD.DTOs.WorkoutResult;
using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Persistence;
using CrossFitWOD.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace CrossFitWOD.Tests;

/// <summary>
/// Tests de WorkoutResultService — registro de resultado y ajuste de ScaledRepsFactor.
/// </summary>
public class WorkoutResultServiceTests
{
    private static AppDbContext CreateDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private static async Task<(AppDbContext db, int athleteWorkoutId, int userId)> SeedAthleteWorkoutAsync(
        AthleteGoal goal = AthleteGoal.Fitness,
        AthleteLevel level = AthleteLevel.Intermediate,
        float initialFactor = 1.0f)
    {
        var db = CreateDb();

        var box = new Box { Name = "Test", Slug = "test", IsIndividual = true };
        db.Boxes.Add(box);
        await db.SaveChangesAsync();

        var user = new User { Username = "u", PasswordHash = "x", BoxId = box.Id };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var athlete = new Athlete
        {
            UserId = user.Id, BoxId = box.Id,
            Name = "Atleta", Level = level, Goal = goal,
        };
        db.Athletes.Add(athlete);
        await db.SaveChangesAsync();

        var wod = new Wod { Title = "Fran", Type = WodType.ForTime, DurationMinutes = 15 };
        db.Wods.Add(wod);
        await db.SaveChangesAsync();

        var session = new WorkoutSession
        {
            WodId = wod.Id, BoxId = box.Id, Date = DateOnly.FromDateTime(DateTime.UtcNow),
        };
        db.WorkoutSessions.Add(session);
        await db.SaveChangesAsync();

        var aw = new AthleteWorkout
        {
            AthleteId = athlete.Id, WorkoutSessionId = session.Id,
            ScaledRepsFactor = initialFactor,
        };
        db.AthleteWorkouts.Add(aw);
        await db.SaveChangesAsync();

        return (db, aw.Id, user.Id);
    }

    private static WorkoutResultService CreateService(AppDbContext db)
    {
        var statusSvc = new AthleteStatusService(db);
        return new WorkoutResultService(
            db, statusSvc, NullLogger<WorkoutResultService>.Instance);
    }

    // ── Registro básico ───────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterAsync_SavesResult()
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync();
        var svc = CreateService(db);

        await svc.RegisterAsync(new RegisterResultDto(awId, true, 360, null, 8, 2700, "bien"), userId);

        var result = await db.WorkoutResults.FirstOrDefaultAsync(r => r.AthleteWorkoutId == awId);
        Assert.NotNull(result);
        Assert.Equal(360,  result.TimeSeconds);
        Assert.Equal(8,    result.Rpe);
        Assert.Equal(2700, result.DurationSeconds);
        Assert.Equal("bien", result.Notes);
    }

    [Fact]
    public async Task RegisterAsync_Throws_WhenResultAlreadyExists()
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync();
        var svc = CreateService(db);

        await svc.RegisterAsync(new RegisterResultDto(awId, true, 360, null, 8, 2700, null), userId);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => svc.RegisterAsync(new RegisterResultDto(awId, true, 300, null, 7, 2700, null), userId: 1));
    }

    // ── Ajuste de ScaledRepsFactor ────────────────────────────────────────────

    [Theory]
    [InlineData(true,  7, 1.00f, 1.00f)]  // RPE neutro → sin cambio
    [InlineData(true,  8, 1.00f, 1.00f)]  // RPE neutro → sin cambio
    [InlineData(true,  6, 1.00f, 1.10f)]  // RPE bajo y completado → sube
    [InlineData(true,  1, 1.00f, 1.10f)]  // RPE muy bajo → sube
    [InlineData(true,  9, 1.00f, 0.90f)]  // RPE alto → baja
    [InlineData(true,  10,1.00f, 0.90f)]  // RPE máximo → baja
    [InlineData(false, 5, 1.00f, 0.90f)]  // No completó → baja aunque RPE bajo
    public async Task RegisterAsync_AdjustsFactor_Correctly(
        bool completed, int rpe, float initial, float expectedFactor)
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync(goal: AthleteGoal.Fitness, initialFactor: initial);
        var svc = CreateService(db);

        var dto = new RegisterResultDto(awId, completed, rpe > 6 ? 360 : null, null, rpe, 2700, null);
        var response = await svc.RegisterAsync(dto, userId);

        Assert.Equal(expectedFactor, response.NewScaledRepsFactor, precision: 2);

        var aw = await db.AthleteWorkouts.FindAsync(awId);
        Assert.Equal(expectedFactor, aw!.ScaledRepsFactor, precision: 2);
    }

    [Fact]
    public async Task RegisterAsync_Factor_ClampedAtMinimum()
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync(initialFactor: 0.5f);
        var svc = CreateService(db);

        var response = await svc.RegisterAsync(
            new RegisterResultDto(awId, false, null, null, 10, 0, null), userId);

        Assert.Equal(0.5f, response.NewScaledRepsFactor, precision: 2);
    }

    [Fact]
    public async Task RegisterAsync_Factor_ClampedAtMaximum()
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync(initialFactor: 1.5f);
        var svc = CreateService(db);

        var response = await svc.RegisterAsync(
            new RegisterResultDto(awId, true, null, null, 1, 2700, null), userId);

        Assert.Equal(1.5f, response.NewScaledRepsFactor, precision: 2);
    }

    // ── Pasos por objetivo ────────────────────────────────────────────────────

    [Theory]
    [InlineData(AthleteGoal.General,        1.0f, true, 6, 1.10f)]  // step 0.10
    [InlineData(AthleteGoal.Competition,    1.0f, true, 6, 1.15f)]  // step 0.15
    [InlineData(AthleteGoal.Rehabilitation, 0.9f, true, 6, 0.95f)]  // step 0.05
    public async Task RegisterAsync_StepVariesByGoal(
        AthleteGoal goal, float initial, bool completed, int rpe, float expected)
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync(goal: goal, initialFactor: initial);
        var svc = CreateService(db);

        var response = await svc.RegisterAsync(
            new RegisterResultDto(awId, completed, null, null, rpe, 2700, null), userId);

        Assert.Equal(expected, response.NewScaledRepsFactor, precision: 2);
    }

    [Fact]
    public async Task RegisterAsync_Rehabilitation_CappedAt1()
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync(goal: AthleteGoal.Rehabilitation, initialFactor: 1.0f);
        var svc = CreateService(db);

        var response = await svc.RegisterAsync(
            new RegisterResultDto(awId, true, null, null, 1, 2700, null), userId);

        Assert.Equal(1.0f, response.NewScaledRepsFactor, precision: 2);
    }

    // ── FactorChanged flag ────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterAsync_FactorChanged_IsTrueWhenFactorMoves()
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync(initialFactor: 1.0f);
        var svc = CreateService(db);

        var response = await svc.RegisterAsync(
            new RegisterResultDto(awId, true, null, null, 6, 2700, null), userId);

        Assert.True(response.FactorChanged);
    }

    [Fact]
    public async Task RegisterAsync_FactorChanged_IsFalseOnNeutralRpe()
    {
        var (db, awId, userId) = await SeedAthleteWorkoutAsync(initialFactor: 1.0f);
        var svc = CreateService(db);

        var response = await svc.RegisterAsync(
            new RegisterResultDto(awId, true, 360, null, 7, 2700, null), userId);

        Assert.False(response.FactorChanged);
    }
}
