namespace CrossFitWOD.DTOs.WorkoutSession;

public record CreateSessionDto(Guid WodId, DateOnly Date);
