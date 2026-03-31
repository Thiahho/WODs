namespace CrossFitWOD.DTOs.AthleteWod;

public class AthleteWodResponseDto
{
    public Guid   AthleteWorkoutId { get; set; }
    public string WodTitle         { get; set; } = string.Empty;
    public string WodType          { get; set; } = string.Empty;
    public int    DurationMinutes  { get; set; }
    public float  ScaledRepsFactor { get; set; }
    public List<ScaledExerciseDto> Exercises { get; set; } = [];
}

public class ScaledExerciseDto
{
    public string Name        { get; set; } = string.Empty;
    public int    BaseReps    { get; set; }
    public int    ScaledReps  { get; set; }
    public float  ScaleFactor { get; set; }
}
