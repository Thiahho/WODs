namespace CrossFitWOD.Entities;

public class WorkoutResult
{
    public Guid   Id               { get; set; } = Guid.NewGuid();
    public Guid   AthleteWorkoutId { get; set; }
    public Guid   BoxId            { get; set; }
    public bool   Completed        { get; set; }
    public int?   TimeSeconds      { get; set; }
    public float? Rounds           { get; set; }
    public int    Rpe              { get; set; }
    public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;

    public AthleteWorkout AthleteWorkout { get; set; } = null!;
}
