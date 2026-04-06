using CrossFitWOD.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("Athlete")]
public class Athlete
{
    [Column("id")]
    [Required]
    public int Id        { get; set; }
    [Column("userid")]
    public int UserId    { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    public AthleteLevel Level { get; set; } = AthleteLevel.Beginner;
    public AthleteGoal  Goal  { get; set; } = AthleteGoal.General;
    [Column("weight")]
    public float? Weight    { get; set; }
    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<AthleteWorkout> AthleteWorkouts { get; set; } = [];


    [Column("daysperweek")]
    public int    DaysPerWeek            { get; set; } = 3;
    [Column("sessiondurationminute")]
    public int SessionDurationMinutes { get; set; } = 45;
    [Column("equipment")]
    public string Equipment { get; set; } = string.Empty;
    [Column("weekpoints")]
    public string WeakPoints { get; set; } = string.Empty;

    [Column("boxid")]
    public int  BoxId { get; set; }
    public Box  Box   { get; set; } = null!;
}
