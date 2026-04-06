using CrossFitWOD.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace CrossFitWOD.Entities;

[Table("Wod")]
public class Wod
{
    [Column("id")]
    [Required]
    public int     Id              { get; set; }
    [Column("tittle")]
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
    [Column("iddeleted")]
    public bool IsDeleted { get; set; } = false;

    public ICollection<WodExercise>    Exercises       { get; set; } = [];
    public ICollection<WorkoutSession> WorkoutSessions { get; set; } = [];
}
