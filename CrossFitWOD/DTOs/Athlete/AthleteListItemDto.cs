namespace CrossFitWOD.DTOs.Athlete;

public record AthleteListItemDto(
    int     Id,
    string  Name,
    string  Level,
    float?  CurrentFactor,
    string? LastWorkoutDate,
    int?    LastRpe,
    bool?   LastCompleted
);
