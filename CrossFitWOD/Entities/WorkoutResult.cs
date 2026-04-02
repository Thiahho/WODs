namespace CrossFitWOD.Entities;

public class WorkoutResult
{
    public int    Id               { get; set; }
    public int    AthleteWorkoutId { get; set; }
    public bool   Completed        { get; set; }
    public int?   TimeSeconds      { get; set; }
    public float? Rounds           { get; set; }
    public int    Rpe              { get; set; }
    public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;

    public AthleteWorkout AthleteWorkout { get; set; } = null!;
}
