using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("AthleteDailyLogs")]
public class AthleteDailyLogs
{
    [Column("id")]
    [Required]
    public int Id { get; set; }

    [Column("athleteid")]
    public int AthleteId { get; set; }

    /// <summary>1–10</summary>
    [Column("energylevel")]
    public int EnergyLevel { get; set; }

    /// <summary>1–10</summary>
    [Column("fatiguelevel")]
    public int FatigueLevel { get; set; }

    [Column("sleephours")]
    public float? SleepHours { get; set; }

    /// <summary>Texto libre / transcripción de audio</summary>
    [Column("notes")]
    public string? Notes { get; set; }

    /// <summary>Dolores o molestias físicas</summary>
    [Column("painnotes")]
    public string? PainNotes { get; set; }

    /// <summary>Estado mental / motivación</summary>
    [Column("mentalstate")]
    public string? MentalState { get; set; }

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Athlete Athlete { get; set; } = null!;
}
