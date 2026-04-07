namespace CrossFitWOD.DTOs.AthleteDailyLog;

public record DailyLogResponseDto(
    int     Id,
    int     AthleteId,
    int     EnergyLevel,
    int     FatigueLevel,
    float?  SleepHours,
    string? Notes,
    string? PainNotes,
    string? MentalState,
    DateTime CreatedAt
);
