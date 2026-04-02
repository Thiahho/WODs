namespace CrossFitWOD.Entities;

public class WorkoutSession
{
    public int      Id    { get; set; }
    public int      WodId { get; set; }
    public int      BoxId { get; set; }
    public DateOnly Date  { get; set; }

    public Wod                         Wod             { get; set; } = null!;
    public Box                         Box             { get; set; } = null!;
    public ICollection<AthleteWorkout> AthleteWorkouts { get; set; } = [];
}
