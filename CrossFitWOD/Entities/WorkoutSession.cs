namespace CrossFitWOD.Entities;

public class WorkoutSession
{
    public Guid     Id    { get; set; } = Guid.NewGuid();
    public Guid     BoxId { get; set; }
    public Guid     WodId { get; set; }
    public DateOnly Date  { get; set; }

    public Wod                         Wod             { get; set; } = null!;
    public ICollection<AthleteWorkout> AthleteWorkouts { get; set; } = [];
}
