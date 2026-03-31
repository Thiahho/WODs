using CrossFitWOD.DTOs.WorkoutResult;
using CrossFitWOD.Entities;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Services;

public class WorkoutResultService
{
    private readonly AppDbContext _db;

    public WorkoutResultService(AppDbContext db) => _db = db;

    public async Task<WorkoutResult> RegisterAsync(RegisterResultDto dto)
    {
        var athleteWorkout = await _db.AthleteWorkouts
            .FirstOrDefaultAsync(a => a.Id == dto.AthleteWorkoutId)
            ?? throw new NotFoundException("AthleteWorkout no encontrado");

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
        AdjustNextFactor(athleteWorkout, result);
        await _db.SaveChangesAsync();
        return result;
    }

    private static void AdjustNextFactor(AthleteWorkout aw, WorkoutResult result)
    {
        const float step = 0.1f;
        const float min  = 0.5f;
        const float max  = 1.5f;

        if (!result.Completed || result.Rpe >= 9)
            aw.ScaledRepsFactor -= step;
        else if (result.Rpe <= 6)
            aw.ScaledRepsFactor += step;

        aw.ScaledRepsFactor = Math.Clamp(aw.ScaledRepsFactor, min, max);
    }
}
