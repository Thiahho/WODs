using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CrossFitWOD.Enums;

namespace CrossFitWOD.Entities;

[Table("AthleteStates")]
public class AthleteStates
{
    [Column("id")]
    [Required]
    public int Id { get; set; }
    [Column("athleteid")]
    public int AthleteId { get; set; }
    [Column("weight")]
    public string Weight{ get; set; } = string.Empty;
    [Column("bodyfast")]
    public string BodyFat { get; set; } = string.Empty;
    [Column("musclemass")]
    public string MuscleMass { get; set; } = string.Empty;
    [Column("recordedats")]
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

}
