using CrossFitWOD.Enums;

namespace CrossFitWOD.Entities;

public class Wod
{
    public Guid    Id              { get; set; } = Guid.NewGuid();
    public Guid    BoxId           { get; set; }
    public string  Title           { get; set; } = string.Empty;
    public string? Description     { get; set; }
    public WodType Type            { get; set; }
    public int     DurationMinutes { get; set; }
    public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;

    public ICollection<WodExercise>    Exercises       { get; set; } = [];
    public ICollection<WorkoutSession> WorkoutSessions { get; set; } = [];
}
