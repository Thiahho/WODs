using CrossFitWOD.Enums;

namespace CrossFitWOD.DTOs.Athlete;

public record CreateAthleteByCoachDto(
    string       Username,
    string       Password,
    string       Name,
    AthleteLevel Level,
    AthleteGoal  Goal  = AthleteGoal.General,
    float?       Weight = null
);
