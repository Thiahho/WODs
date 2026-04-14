using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Persistence.ViewModels;

/// <summary>
/// Keyless entity mapeado a la vista v_athlete_wod_context.
/// Una fila por combinación atleta + sesión del box.
/// </summary>
public class AthleteWodContextView
{
    // ── Identificadores ──────────────────────────────────────────────────────
    [Column("athleteid")]          public int       AthleteId          { get; set; }
    [Column("boxid")]              public int       BoxId              { get; set; }
    [Column("session_id")]         public int?      SessionId          { get; set; }
    [Column("athleteworkout_id")]  public int?      AthleteWorkoutId   { get; set; }
    [Column("result_id")]          public int?      ResultId           { get; set; }
    [Column("wod_id")]             public int?      WodId              { get; set; }

    // ── Perfil del atleta ────────────────────────────────────────────────────
    [Column("athlete_name")]               public string  AthleteName              { get; set; } = string.Empty;
    [Column("athlete_level")]              public int     AthleteLevel             { get; set; }
    [Column("athlete_goal")]               public int     AthleteGoal              { get; set; }
    [Column("athlete_weight")]             public float?  AthleteWeight            { get; set; }
    [Column("days_per_week")]              public int     DaysPerWeek              { get; set; }
    [Column("session_duration_minutes")]   public int     SessionDurationMinutes   { get; set; }
    [Column("equipment")]                  public string  Equipment                { get; set; } = string.Empty;
    [Column("weak_points")]                public string  WeakPoints               { get; set; } = string.Empty;
    [Column("injury_history")]             public string? InjuryHistory            { get; set; }
    [Column("commitment_level")]           public int     CommitmentLevel          { get; set; }
    [Column("athlete_created_at")]         public DateTime AthleteCreatedAt        { get; set; }

    // ── Estado calculado (AthleteStatus) ────────────────────────────────────
    [Column("status_id")]              public int?     StatusId              { get; set; }
    [Column("fitness_level")]          public float?   FitnessLevel          { get; set; }
    [Column("fatigue_level")]          public float?   StatusFatigueLevel    { get; set; }
    [Column("recovery_score")]         public float?   RecoveryScore         { get; set; }
    [Column("performance_trend")]      public string?  PerformanceTrend      { get; set; }
    [Column("last_performance_score")] public float?   LastPerformanceScore  { get; set; }
    [Column("acute_load")]             public float?   AcuteLoad             { get; set; }
    [Column("chronic_load")]           public float?   ChronicLoad           { get; set; }
    [Column("load_ratio")]             public float?   LoadRatio             { get; set; }
    [Column("load_ratio_label")]       public string?  LoadRatioLabel        { get; set; }
    [Column("readiness")]              public string?  Readiness             { get; set; }
    [Column("injury_risk")]            public string?  InjuryRisk            { get; set; }
    [Column("status_updated_at")]      public DateTime? StatusUpdatedAt      { get; set; }

    // ── Sesión + WOD ─────────────────────────────────────────────────────────
    [Column("session_date")]       public DateOnly? SessionDate          { get; set; }
    [Column("wod_title")]          public string?   WodTitle             { get; set; }
    [Column("wod_description")]    public string?   WodDescription       { get; set; }
    [Column("wod_type")]           public int?      WodType              { get; set; }
    [Column("wod_duration_minutes")] public int?    WodDurationMinutes   { get; set; }
    [Column("wod_intensity")]      public string?   WodIntensity         { get; set; }
    [Column("wod_focus")]          public string?   WodFocus             { get; set; }
    [Column("wod_warmup")]         public string?   WodWarmup            { get; set; }
    [Column("wod_strength_skill")] public string?   WodStrengthSkill     { get; set; }
    [Column("wod_metcon")]         public string?   WodMetcon            { get; set; }
    [Column("wod_cooldown")]       public string?   WodCooldown          { get; set; }
    [Column("wod_scaling")]        public string?   WodScaling           { get; set; }
    [Column("wod_coach_notes")]    public string?   WodCoachNotes        { get; set; }
    [Column("wod_is_ai_generated")] public bool?   WodIsAiGenerated     { get; set; }

    // ── Resultado del atleta ──────────────────────────────────────────────────
    [Column("scaled_reps_factor")]     public float?    ScaledRepsFactor     { get; set; }
    [Column("workout_notes")]          public string?   WorkoutNotes         { get; set; }
    [Column("result_completed")]       public bool?     ResultCompleted      { get; set; }
    [Column("result_time_seconds")]    public int?      ResultTimeSeconds    { get; set; }
    [Column("result_rounds")]          public float?    ResultRounds         { get; set; }
    [Column("result_duration_seconds")] public int?    ResultDurationSeconds { get; set; }
    [Column("result_rpe")]             public int?      ResultRpe            { get; set; }
    [Column("result_notes")]           public string?   ResultNotes          { get; set; }
    [Column("result_created_at")]      public DateTime? ResultCreatedAt      { get; set; }
}
