using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("AthleteWorkouts")]
public class AthleteWorkout
{
    [Column("id")]
    public int    Id               { get; set; }
    [Column("athleteid")]
    public int    AthleteId        { get; set; }
    [Column("workoutsessionid")]
    public int    WorkoutSessionId { get; set; }
    [Column("scaledrepsfactor")]
    public float  ScaledRepsFactor { get; set; } = 1.0f;
    [Column("notes")]
    public string? Notes           { get; set; }

    public Athlete        Athlete        { get; set; } = null!;
    public WorkoutSession WorkoutSession { get; set; } = null!;
    public WorkoutResult? Result         { get; set; }
}
