using CrossFitWOD.DTOs.WorkoutResult;
using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CrossFitWOD.Services;

public class WorkoutResultService
{
    private readonly AppDbContext          _db;
    private readonly AthleteStatusService  _statusService;
    private readonly ILogger<WorkoutResultService> _logger;

    public WorkoutResultService(AppDbContext db, AthleteStatusService statusService, ILogger<WorkoutResultService> logger)
    {
        _db            = db;
        _statusService = statusService;
        _logger        = logger;
    }

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
            Rpe              = dto.Rpe,
            DurationSeconds  = dto.DurationSeconds,
            Notes            = dto.Notes
        };

        _db.WorkoutResults.Add(result);

        var previousFactor = athleteWorkout.ScaledRepsFactor;
        var goal           = athleteWorkout.Athlete.Goal;
        AdjustNextFactor(athleteWorkout, result, goal);
        var newFactor      = athleteWorkout.ScaledRepsFactor;

        await _db.SaveChangesAsync();

        // Recalcular estado del atleta en background (no bloquea la respuesta)
        var athleteId = athleteWorkout.Athlete.Id;
        _ = Task.Run(async () =>
        {
            try   { await _statusService.RecalculateAsync(athleteId); }
            catch (Exception ex) { _logger.LogError(ex, "Error recalculando AthleteStatus para atleta {AthleteId}", athleteId); }
        });

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
