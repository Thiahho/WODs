using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("WodExercises")]
public class WodExercise
{
    [Column("id")]
    public int    Id    { get; set; }
    [Column("wodid")]
    public int    WodId { get; set; }
    [Column("name")]
    public string Name  { get; set; } = string.Empty;
    [Column("reps")]
    public int    Reps  { get; set; }
    [Column("order")]
    public int    Order { get; set; }

    public Wod Wod { get; set; } = null!;
}
