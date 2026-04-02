namespace CrossFitWOD.DTOs.AthleteWod;

public record HistoryEntryDto(
    string Date,
    string WodTitle,
    string WodType,
    float  ScaledRepsFactor,
    bool   Completed,
    int?   TimeSeconds,
    float? Rounds,
    int    Rpe
);
