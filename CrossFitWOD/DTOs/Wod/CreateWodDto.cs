using CrossFitWOD.Enums;

namespace CrossFitWOD.DTOs.Wod;

public record CreateWodDto(
    string  Title,
    string? Description,
    WodType Type,
    int     DurationMinutes,
    List<CreateWodExerciseDto> Exercises
);

public record CreateWodExerciseDto(string Name, int Reps, int Order);
