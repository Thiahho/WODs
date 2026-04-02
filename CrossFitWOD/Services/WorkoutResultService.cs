using CrossFitWOD.DTOs.WorkoutResult;
using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Services;

public class WorkoutResultService
{
    private readonly AppDbContext _db;

    public WorkoutResultService(AppDbContext db) => _db = db;

    public async Task<WorkoutResultResponseDto> RegisterAsync(RegisterResultDto dto, int userId)
    {
        var athleteWorkout = await _db.AthleteWorkouts
            .IgnoreQueryFilters()
            .Include(aw => aw.Athlete)
            .FirstOrDefaultAsync(a => a.Id == dto.AthleteWorkoutId)
            ?? throw new NotFoundException("AthleteWorkout no encontrado");

        if (athleteWorkout.Athlete.UserId != userId)
            throw new ForbiddenException("No tenés permiso para registrar este resultado.");

        var alreadyExists = await _db.WorkoutResults
            .IgnoreQueryFilters()
            .AnyAsync(r => r.AthleteWorkoutId == dto.AthleteWorkoutId);

        if (alreadyExists)
            throw new InvalidOperationException("Ya existe un resultado para este workout.");

        var result = new WorkoutResult
        {
            AthleteWorkoutId = dto.AthleteWorkoutId,
            Completed        = dto.Completed,
            TimeSeconds      = dto.TimeSeconds,
            Rounds           = dto.Rounds,
            Rpe              = dto.Rpe
        };

        _db.WorkoutResults.Add(result);

        var previousFactor = athleteWorkout.ScaledRepsFactor;
        var goal           = athleteWorkout.Athlete.Goal;
        AdjustNextFactor(athleteWorkout, result, goal);
        var newFactor      = athleteWorkout.ScaledRepsFactor;

        await _db.SaveChangesAsync();

        return new WorkoutResultResponseDto(
            Id:                  result.Id,
            AthleteWorkoutId:    result.AthleteWorkoutId,
            Completed:           result.Completed,
            TimeSeconds:         result.TimeSeconds,
            Rounds:              result.Rounds,
            Rpe:                 result.Rpe,
            CreatedAt:           result.CreatedAt,
            NewScaledRepsFactor: newFactor,
            FactorChanged:       Math.Abs(newFactor - previousFactor) > 0.001f,
            FactorMessage:       BuildFactorMessage(result, previousFactor, newFactor)
        );
    }

    private static string BuildFactorMessage(WorkoutResult result, float previous, float next)
    {
        if (!result.Completed)
            return "No completaste el WOD — bajamos la carga para la próxima.";

        if (result.Rpe >= 9)
            return $"RPE {result.Rpe} — esfuerzo muy alto. Bajamos un poco la carga.";

        if (result.Rpe <= 6)
            return next > previous
                ? $"RPE {result.Rpe} — te quedó cómodo. Subimos la carga para el próximo."
                : $"RPE {result.Rpe} — ya estás en el techo para tu objetivo. Buen trabajo.";

        return "Intensidad mantenida — seguís en tu ritmo.";
    }

    private static void AdjustNextFactor(AthleteWorkout aw, WorkoutResult result, AthleteGoal goal)
    {
        aw.ScaledRepsFactor = ScalingCalculator.AdjustFactor(
            aw.ScaledRepsFactor, result.Completed, result.Rpe, goal);
    }
}
