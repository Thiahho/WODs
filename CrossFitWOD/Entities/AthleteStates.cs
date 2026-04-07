using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

/// <summary>Mediciones físicas del atleta (peso, composición corporal)</summary>
[Table("AthleteStates")]
public class AthleteStates
{
    [Column("id")]
    [Required]
    public int Id { get; set; }

    [Column("athleteid")]
    public int AthleteId { get; set; }

    [Column("weight")]
    public float? Weight { get; set; }

    [Column("bodyfat")]
    public float? BodyFat { get; set; }

    [Column("musclemass")]
    public float? MuscleMass { get; set; }

    [Column("recordedat")]
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    public Athlete Athlete { get; set; } = null!;
}
