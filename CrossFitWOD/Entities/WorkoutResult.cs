
using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("workoutresult")]
public class WorkoutResult
{
    [Column("id")]
    public int Id { get; set; }
    [Column("athleteworkoutid")]
    public int AthleteWorkoutId { get; set; }
    [Column("completed")]
    public bool Completed { get; set; }
    [Column("timesecords")]
    public int? TimeSeconds { get; set; }
    [Column("rounds")]
    public float? Rounds { get; set; }
    [Column("durationsecords")]
    public int  DurationSeconds { get; set; }
    [Column("rpe")]
    public int  Rpe { get; set; }
    [Column("notes")]
    public string? Notes { get; set; }
    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AthleteWorkout AthleteWorkout { get; set; } = null!;
}
