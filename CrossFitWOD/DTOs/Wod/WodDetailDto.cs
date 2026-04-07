namespace CrossFitWOD.DTOs.Wod;

public record WodDetailDto(
    int     WodId,
    int?    SessionId,
    string  Title,
    string? Description,
    string  Type,
    string? Intensity,
    string? Focus,
    int     DurationMinutes,
    bool    IsAiGenerated,
    string? WarmUp,
    string? StrengthSkill,
    string? Metcon,
    string? Scaling,
    string? CoolDown,
    string? CoachNotes,
    List<WodExerciseDto> Exercises
);

public record WodExerciseDto(string Name, int Reps, int Order);
