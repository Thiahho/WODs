namespace CrossFitWOD.DTOs.WorkoutResult;

public record RegisterResultDto(
    Guid   AthleteWorkoutId,
    bool   Completed,
    int?   TimeSeconds,
    float? Rounds,
    int    Rpe
);
