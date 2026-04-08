namespace CrossFitWOD.DTOs.AthleteWod;

public class AthleteWodResponseDto
{
    public int    Id               { get; set; }
    public int    AthleteId        { get; set; }
    public int    WorkoutSessionId { get; set; }
    public float  ScaledRepsFactor { get; set; }
    public WorkoutSessionDto  WorkoutSession { get; set; } = null!;
    public ResultSummaryDto?  Result         { get; set; }
}

public class ResultSummaryDto
{
    public bool   Completed     { get; set; }
    public int?   TimeSeconds   { get; set; }
    public float? Rounds        { get; set; }
    public int    Rpe           { get; set; }
    public string FactorMessage { get; set; } = string.Empty;
}

public class WorkoutSessionDto
{
    public int    Id   { get; set; }
    public string Date { get; set; } = string.Empty;
    public WodDto Wod  { get; set; } = null!;
}

public class WodDto
{
    public int     Id              { get; set; }
    public string  Title           { get; set; } = string.Empty;
    public string? Description     { get; set; }
    public string  Type            { get; set; } = string.Empty;
    public int     DurationMinutes { get; set; }
    public string? Intensity       { get; set; }
    public string? Focus           { get; set; }
    public bool    IsAiGenerated   { get; set; }
    public string? WarmUp          { get; set; }
    public string? StrengthSkill   { get; set; }
    public string? Metcon          { get; set; }
    public string? Scaling         { get; set; }
    public string? CoolDown        { get; set; }
    public string? CoachNotes      { get; set; }
    public List<WodExerciseDto> Exercises { get; set; } = [];
}

public class WodExerciseDto
{
    public int    Id    { get; set; }
    public string Name  { get; set; } = string.Empty;
    public int    Reps  { get; set; }
    public int    Order { get; set; }
}
