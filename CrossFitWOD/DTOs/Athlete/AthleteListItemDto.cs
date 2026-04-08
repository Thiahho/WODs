namespace CrossFitWOD.DTOs.Athlete;

public record AthleteGroupInfoDto(int Id, string Name);

public record AthleteListItemDto(
    int     Id,
    string  Name,
    string  Level,
    float?  CurrentFactor,
    string? LastWorkoutDate,
    int?    LastRpe,
    bool?   LastCompleted,
    List<AthleteGroupInfoDto> Groups
);
