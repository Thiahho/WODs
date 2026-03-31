namespace CrossFitWOD.Entities;

public class AthleteWorkout
{
    public Guid  Id               { get; set; } = Guid.NewGuid();
    public Guid  AthleteId        { get; set; }
    public Guid  WorkoutSessionId { get; set; }
    public Guid  BoxId            { get; set; }
    public float ScaledRepsFactor { get; set; } = 1.0f;
    public string? Notes          { get; set; }

    public Athlete        Athlete        { get; set; } = null!;
    public WorkoutSession WorkoutSession { get; set; } = null!;
    public WorkoutResult? Result         { get; set; }
}
