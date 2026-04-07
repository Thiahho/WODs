using CrossFitWOD.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace CrossFitWOD.Entities;

[Table("Wods")]
public class Wod
{
    [Column("id")]
    [Required]
    public int     Id              { get; set; }
    [Column("title")]
    public string Title           { get; set; } = string.Empty;
    [Column("description")]
    public string? Description { get; set; }
    [Column("type")]
    public WodType Type { get; set; }
    [Column("durationminutes")]
    public int     DurationMinutes { get; set; }
    [Column("intensity")]
    public string? Intensity { get; set; }
    [Column("focus")]
    public string? Focus { get; set; }
    [Column("createdat")]
    public DateTime CreatedAt      { get; set; } = DateTime.UtcNow;
    [Column("isdeleted")]
    public bool IsDeleted { get; set; } = false;

    // ── Secciones generadas por IA ───────────────────────────────────────────
    [Column("warmup")]
    public string? WarmUp        { get; set; }
    [Column("strengthskill")]
    public string? StrengthSkill { get; set; }
    [Column("metcon")]
    public string? Metcon        { get; set; }
    [Column("cooldown")]
    public string? CoolDown      { get; set; }
    [Column("scaling")]
    public string? Scaling       { get; set; }
    [Column("coachnotes")]
    public string? CoachNotes    { get; set; }
    [Column("isaigenerated")]
    public bool IsAiGenerated    { get; set; } = false;

    public ICollection<WodExercise>    Exercises       { get; set; } = [];
    public ICollection<WorkoutSession> WorkoutSessions { get; set; } = [];
}
