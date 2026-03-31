namespace CrossFitWOD.Entities;

public class WodExercise
{
    public Guid   Id    { get; set; } = Guid.NewGuid();
    public Guid   WodId { get; set; }
    public string Name  { get; set; } = string.Empty;
    public int    Reps  { get; set; }
    public int    Order { get; set; }

    public Wod Wod { get; set; } = null!;
}
