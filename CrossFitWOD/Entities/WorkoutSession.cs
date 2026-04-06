using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("WorkoutSession")]
public class WorkoutSession
{
    [Column("id")]
    public int      Id    { get; set; }
    [Column("wodid")]
    public int      WodId { get; set; }
    [Column("boxid")]
    public int      BoxId { get; set; }
    [Column("date")]
    public DateOnly Date  { get; set; }

    public Wod                         Wod             { get; set; } = null!;
    public Box                         Box             { get; set; } = null!;
    public ICollection<AthleteWorkout> AthleteWorkouts { get; set; } = [];
}
