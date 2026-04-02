using CrossFitWOD.Enums;

namespace CrossFitWOD.Entities;

public class Athlete
{
    public int    Id        { get; set; }
    public int    UserId    { get; set; }
    public string Name      { get; set; } = string.Empty;
    public AthleteLevel Level { get; set; } = AthleteLevel.Beginner;
    public AthleteGoal  Goal  { get; set; } = AthleteGoal.General;
    public float? Weight    { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<AthleteWorkout> AthleteWorkouts { get; set; } = [];

        
    public int    DaysPerWeek            { get; set; } = 3;
    public int    SessionDurationMinutes { get; set; } = 45;
    public string Equipment              { get; set; } = string.Empty;
    public string WeakPoints             { get; set; } = string.Empty;

    public int  BoxId { get; set; }
    public Box  Box   { get; set; } = null!;
}
