using CrossFitWOD.DTOs.AthleteWod;
using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Services;

public class AthleteWorkoutService
{
    private readonly AppDbContext        _db;
    private readonly WodGeneratorService _generator;

    public AthleteWorkoutService(AppDbContext db, WodGeneratorService generator)
    {
        _db        = db;
        _generator = generator;
    }

    public async Task<AthleteWodResponseDto> GetTodayAsync(int athleteId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var athlete = await _db.Athletes
            .IgnoreQueryFilters()
            .Include(a => a.Box)
            .FirstOrDefaultAsync(a => a.Id == athleteId)
            ?? throw new NotFoundException("Atleta no encontrado");

        var session = await _db.WorkoutSessions
            .IgnoreQueryFilters()
            .Include(s => s.Wod)
                .ThenInclude(w => w.Exercises)
            .FirstOrDefaultAsync(s => s.BoxId == athlete.BoxId && s.Date == today);

        if (session is null)
        {
            if (!athlete.Box.IsIndividual)
                throw new NotFoundException("No hay WOD cargado para hoy");

            session = await _generator.GenerateForAthleteAsync(athlete, today);
            session = await _db.WorkoutSessions
                .IgnoreQueryFilters()
                .Include(s => s.Wod)
                    .ThenInclude(w => w.Exercises)
                .FirstAsync(s => s.Id == session.Id);
        }

        var aw = await _db.AthleteWorkouts
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.AthleteId == athleteId
                                   && a.WorkoutSessionId == session.Id);

        if (aw is null)
        {
            aw = new AthleteWorkout
            {
                AthleteId        = athlete.Id,
                WorkoutSessionId = session.Id,
                ScaledRepsFactor = GetInitialFactor(athlete.Level, athlete.Goal)
            };
            _db.AthleteWorkouts.Add(aw);
            await _db.SaveChangesAsync();
        }

        return BuildResponse(session, aw);
    }

    private static float GetInitialFactor(AthleteLevel level, AthleteGoal goal)
        => ScalingCalculator.InitialFactor(level, goal);

    private static AthleteWodResponseDto BuildResponse(WorkoutSession session, AthleteWorkout aw)
    {
        var wod = session.Wod;
        return new AthleteWodResponseDto
        {
            Id               = aw.Id,
            AthleteId        = aw.AthleteId,
            WorkoutSessionId = aw.WorkoutSessionId,
            ScaledRepsFactor = aw.ScaledRepsFactor,
            WorkoutSession   = new WorkoutSessionDto
            {
                Id   = session.Id,
                Date = session.Date.ToString("yyyy-MM-dd"),
                Wod  = new WodDto
                {
                    Id              = wod.Id,
                    Title           = wod.Title,
                    Description     = wod.Description,
                    Type            = wod.Type.ToString(),
                    DurationMinutes = wod.DurationMinutes,
                    Exercises       = wod.Exercises
                        .OrderBy(e => e.Order)
                        .Select(e => new WodExerciseDto
                        {
                            Id    = e.Id,
                            Name  = e.Name,
                            Reps  = e.Reps,
                            Order = e.Order
                        })
                        .ToList()
                }
            }
        };
    }
}
