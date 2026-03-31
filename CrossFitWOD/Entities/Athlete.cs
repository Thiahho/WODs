using CrossFitWOD.Enums;

namespace CrossFitWOD.Entities;

public class Athlete
{
    public Guid   Id        { get; set; } = Guid.NewGuid();
    public Guid   BoxId     { get; set; }
    public string Name      { get; set; } = string.Empty;
    public AthleteLevel Level { get; set; } = AthleteLevel.Beginner;
    public float? Weight    { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AthleteWorkout> AthleteWorkouts { get; set; } = [];
}
