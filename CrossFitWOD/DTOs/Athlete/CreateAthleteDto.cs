using CrossFitWOD.Enums;

namespace CrossFitWOD.DTOs.Athlete;

public record CreateAthleteDto(
    string       Name,
    AthleteLevel Level,
    AthleteGoal  Goal,
    float?        Weight,
    int?          Edad                   = null,
    int           DaysPerWeek            = 3,
    int           SessionDurationMinutes = 45,
    string        Equipment              = "",
    string        WeakPoints             = "",
    string?       InjuryHistory          = null,
    int           CommitmentLevel        = 5
);
