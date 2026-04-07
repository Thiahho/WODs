namespace CrossFitWOD.DTOs.AthleteStatus;

public record AthleteStatusResponseDto(
    int     Id,
    int     AthleteId,
    float   FitnessLevel,
    float   FatigueLevel,
    float   RecoveryScore,
    string? PerformanceTrend,
    float   LastPerformanceScore,
    float   AcuteLoad,
    float   ChronicLoad,
    float   LoadRatio,
    string? Readiness,
    string? InjuryRisk,
    DateTime UpdatedAt
);
