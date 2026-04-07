using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

/// <summary>Estado de rendimiento calculado por el sistema (carga aguda/crónica, ratio, readiness)</summary>
[Table("AthleteStatus")]
public class AthleteStatus
{
    [Column("id")]
    [Required]
    public int Id { get; set; }

    [Column("athleteid")]
    public int AthleteId { get; set; }

    /// <summary>Nivel de fitness general (0–100)</summary>
    [Column("fitnesslevel")]
    public float FitnessLevel { get; set; }

    /// <summary>Fatiga acumulada (0–100)</summary>
    [Column("fatiguelevel")]
    public float FatigueLevel { get; set; }

    /// <summary>Score de recuperación (0–100)</summary>
    [Column("recoveryscore")]
    public float RecoveryScore { get; set; }

    /// <summary>Tendencia: "improving" | "stable" | "declining"</summary>
    [Column("performancetrend")]
    public string? PerformanceTrend { get; set; }

    [Column("lastperformancescore")]
    public float LastPerformanceScore { get; set; }

    /// <summary>Carga aguda (promedio 7 días)</summary>
    [Column("acuteload")]
    public float AcuteLoad { get; set; }

    /// <summary>Carga crónica (promedio 28 días)</summary>
    [Column("chronicload")]
    public float ChronicLoad { get; set; }

    /// <summary>Ratio aguda/crónica — ideal entre 0.8 y 1.3</summary>
    [Column("loadratio")]
    public float LoadRatio { get; set; }

    /// <summary>"high" | "moderate" | "low"</summary>
    [Column("readiness")]
    public string? Readiness { get; set; }

    /// <summary>"high" | "moderate" | "low"</summary>
    [Column("injuryrisk")]
    public string? InjuryRisk { get; set; }

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updatedat")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Athlete Athlete { get; set; } = null!;
}
