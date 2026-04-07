namespace CrossFitWOD.DTOs.Wod;

public record AiWodResponseDto(
    int     WodId,
    int     WorkoutSessionId,
    string  Title,
    string  Intensity,
    string  Focus,
    int     DurationMinutes,
    string? WarmUp,
    string? StrengthSkill,
    string? Metcon,
    string? Scaling,
    string? CoolDown,
    string? CoachNotes,
    string? Alert,
    string? NutritionTip
);
