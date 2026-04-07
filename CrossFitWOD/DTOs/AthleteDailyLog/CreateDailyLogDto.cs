namespace CrossFitWOD.DTOs.AthleteDailyLog;

public record CreateDailyLogDto(
    /// <summary>1–10</summary>
    int     EnergyLevel,
    /// <summary>1–10</summary>
    int     FatigueLevel,
    float?  SleepHours,
    string? Notes,
    string? PainNotes,
    string? MentalState
);
