namespace CrossFitWOD.DTOs.WorkoutResult;

public record RegisterResultDto(
    int     AthleteWorkoutId,
    bool    Completed,
    int?    TimeSeconds,
    float?  Rounds,
    int     Rpe,
    int     DurationSeconds,
    string? Notes
);
