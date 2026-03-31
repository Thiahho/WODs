using CrossFitWOD.DTOs.AthleteWod;
using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Services;

public class AthleteWorkoutService
{
    private readonly AppDbContext _db;

    public AthleteWorkoutService(AppDbContext db) => _db = db;

    public async Task<AthleteWodResponseDto> GetTodayAsync(Guid athleteId)
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

        return BuildResponse(session, aw);
    }

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
                    Name        = e.Name,
                    BaseReps    = e.Reps,
                    ScaledReps  = (int)Math.Round(e.Reps * aw.ScaledRepsFactor),
                    ScaleFactor = aw.ScaledRepsFactor
                })
                .ToList()
        };
    }
}
