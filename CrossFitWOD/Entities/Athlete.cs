using CrossFitWOD.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("Athletes")]
public class Athlete
{
    [Column("id")]
    [Required]
    public int Id        { get; set; }
    [Column("userid")]
    public int UserId    { get; set; }
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    [Column("level")]
    public AthleteLevel Level { get; set; } = AthleteLevel.Beginner;
    [Column("goal")]
    public AthleteGoal Goal  { get; set; }
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
    [Column("weakpoints")]
    public string WeakPoints { get; set; } = string.Empty;

    [Column("injuryhistory")]
    public string? InjuryHistory { get; set; }

    /// <summary>Nivel de compromiso declarado (1–10)</summary>
    [Column("commitmentlevel")]
    public int CommitmentLevel { get; set; } = 5;

    [Column("boxid")]
    public int  BoxId { get; set; }
   
    [Column("edad")]
    public int  Edad { get; set; }
    public Box  Box   { get; set; } = null!;

    public ICollection<AthleteGroup>      AthleteGroups { get; set; } = [];
    public ICollection<AthleteDailyLogs> DailyLogs     { get; set; } = [];
    public ICollection<AthleteStates>    PhysicalLogs  { get; set; } = [];
    public ICollection<AthleteStatus>    Statuses      { get; set; } = [];
}
