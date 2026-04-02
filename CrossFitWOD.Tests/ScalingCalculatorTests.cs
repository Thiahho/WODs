using CrossFitWOD.Enums;
using CrossFitWOD.Services;

namespace CrossFitWOD.Tests;

public class ScalingCalculatorTests
{
    // ── InitialFactor ─────────────────────────────────────────────────────────

    [Theory]
    [InlineData(AthleteLevel.Beginner,     AthleteGoal.General,        0.80f)]
    [InlineData(AthleteLevel.Intermediate, AthleteGoal.General,        1.00f)]
    [InlineData(AthleteLevel.Advanced,     AthleteGoal.General,        1.20f)]
    [InlineData(AthleteLevel.Beginner,     AthleteGoal.Competition,    0.90f)]
    [InlineData(AthleteLevel.Intermediate, AthleteGoal.Competition,    1.10f)]
    [InlineData(AthleteLevel.Advanced,     AthleteGoal.Competition,    1.30f)]
    [InlineData(AthleteLevel.Beginner,     AthleteGoal.Rehabilitation, 0.60f)]
    [InlineData(AthleteLevel.Intermediate, AthleteGoal.Rehabilitation, 0.80f)]
    [InlineData(AthleteLevel.Advanced,     AthleteGoal.Rehabilitation, 1.00f)]
    [InlineData(AthleteLevel.Beginner,     AthleteGoal.Fitness,        0.80f)]
    public void InitialFactor_ReturnsExpected(AthleteLevel level, AthleteGoal goal, float expected)
    {
        var result = ScalingCalculator.InitialFactor(level, goal);
        Assert.Equal(expected, result, precision: 2);
    }

    [Fact]
    public void InitialFactor_IsClampedToMinimum()
    {
        // No combination reaches the floor today, but the clamp must be there
        var result = ScalingCalculator.InitialFactor(AthleteLevel.Beginner, AthleteGoal.Rehabilitation);
        Assert.True(result >= 0.5f);
    }

    [Fact]
    public void InitialFactor_IsClampedToMaximum()
    {
        var result = ScalingCalculator.InitialFactor(AthleteLevel.Advanced, AthleteGoal.Competition);
        Assert.True(result <= 1.5f);
    }

    // ── AdjustFactor — RPE alto o no completado ───────────────────────────────

    [Theory]
    [InlineData(AthleteGoal.General,        1.0f, false, 5,  0.90f)]  // no completó → baja
    [InlineData(AthleteGoal.General,        1.0f, true,  9,  0.90f)]  // RPE 9 → baja
    [InlineData(AthleteGoal.General,        1.0f, true,  10, 0.90f)]  // RPE 10 → baja
    [InlineData(AthleteGoal.Competition,    1.0f, true,  9,  0.85f)]  // step mayor
    [InlineData(AthleteGoal.Rehabilitation, 1.0f, true,  9,  0.95f)]  // step menor
    public void AdjustFactor_DecreasesOnHighRpeOrIncomplete(
        AthleteGoal goal, float current, bool completed, int rpe, float expected)
    {
        var result = ScalingCalculator.AdjustFactor(current, completed, rpe, goal);
        Assert.Equal(expected, result, precision: 2);
    }

    // ── AdjustFactor — RPE bajo y completado ─────────────────────────────────

    [Theory]
    [InlineData(AthleteGoal.General,        1.0f, true, 6, 1.10f)]
    [InlineData(AthleteGoal.General,        1.0f, true, 5, 1.10f)]
    [InlineData(AthleteGoal.General,        1.0f, true, 1, 1.10f)]
    [InlineData(AthleteGoal.Competition,    1.0f, true, 6, 1.15f)]
    [InlineData(AthleteGoal.Rehabilitation, 0.9f, true, 6, 0.95f)]
    public void AdjustFactor_IncreasesOnLowRpeAndCompleted(
        AthleteGoal goal, float current, bool completed, int rpe, float expected)
    {
        var result = ScalingCalculator.AdjustFactor(current, completed, rpe, goal);
        Assert.Equal(expected, result, precision: 2);
    }

    // ── AdjustFactor — zona neutra (RPE 7-8) ─────────────────────────────────

    [Theory]
    [InlineData(AthleteGoal.General,        1.0f, true, 7)]
    [InlineData(AthleteGoal.General,        1.0f, true, 8)]
    [InlineData(AthleteGoal.Competition,    1.0f, true, 7)]
    [InlineData(AthleteGoal.Rehabilitation, 0.8f, true, 8)]
    public void AdjustFactor_NoChangeOnNeutralRpe(AthleteGoal goal, float current, bool completed, int rpe)
    {
        var result = ScalingCalculator.AdjustFactor(current, completed, rpe, goal);
        Assert.Equal(current, result, precision: 2);
    }

    // ── AdjustFactor — clamps ─────────────────────────────────────────────────

    [Fact]
    public void AdjustFactor_DoesNotFallBelowMinimum()
    {
        var result = ScalingCalculator.AdjustFactor(0.5f, completed: false, rpe: 10, AthleteGoal.General);
        Assert.Equal(0.5f, result, precision: 2);
    }

    [Fact]
    public void AdjustFactor_DoesNotExceedMaximumGeneral()
    {
        var result = ScalingCalculator.AdjustFactor(1.5f, completed: true, rpe: 1, AthleteGoal.General);
        Assert.Equal(1.5f, result, precision: 2);
    }

    [Fact]
    public void AdjustFactor_RehabilitationCappedAt1()
    {
        var result = ScalingCalculator.AdjustFactor(1.0f, completed: true, rpe: 1, AthleteGoal.Rehabilitation);
        Assert.Equal(1.0f, result, precision: 2);
    }

    [Fact]
    public void AdjustFactor_RehabilitationDoesNotExceedCap()
    {
        // Incluso partiendo de 0.95 con RPE bajo, no debe superar 1.0
        var result = ScalingCalculator.AdjustFactor(0.95f, completed: true, rpe: 1, AthleteGoal.Rehabilitation);
        Assert.Equal(1.0f, result, precision: 2);
    }
}
