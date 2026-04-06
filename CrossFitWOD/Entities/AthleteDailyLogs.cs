using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("AtheleteDailyLogs")]
public class AthleteDailyLogs
{
    [Column("id")]
    [Required]
    public int Id { get; set; }
    [Column("atheletid")]
    public int AthleteId { get; set; }
    [Column("energylevel")]
    public int EnergyLevel { get; set; }
    [Column("fatiguelevel")]
    public int FatigueLevel { get; set; }
    [Column("sleephours")]
    public string? SleepHours { get; set; }
    [Column("notes")]
    public string? Notes { get; set; }
    [Column("createdat")]
    public DateTime CreatedAt { get; set; }

}
