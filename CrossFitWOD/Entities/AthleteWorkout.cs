namespace CrossFitWOD.Entities;

public class AthleteWorkout
{
    public int    Id               { get; set; }
    public int    AthleteId        { get; set; }
    public int    WorkoutSessionId { get; set; }
    public float  ScaledRepsFactor { get; set; } = 1.0f;
    public string? Notes           { get; set; }

    public Athlete        Athlete        { get; set; } = null!;
    public WorkoutSession WorkoutSession { get; set; } = null!;
    public WorkoutResult? Result         { get; set; }
}
