namespace CrossFitWOD.DTOs.WorkoutResult;

public record WorkoutResultResponseDto(
    int      Id,
    int      AthleteWorkoutId,
    bool     Completed,
    int?     TimeSeconds,
    float?   Rounds,
    int      Rpe,
    DateTime CreatedAt,
    float    NewScaledRepsFactor,
    bool     FactorChanged,
    string   FactorMessage
);
