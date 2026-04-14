using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Persistence.ViewModels;

/// <summary>
/// Keyless entity mapeado a la vista v_athlete_daily_logs_summary.
/// Una fila por log diario (últimos 7 días), con promedios rolling incluidos.
/// </summary>
public class AthleteDailyLogSummaryView
{
    [Column("athleteid")]     public int     AthleteId    { get; set; }
    [Column("athlete_name")]  public string  AthleteName  { get; set; } = string.Empty;

    [Column("log_id")]        public int      LogId        { get; set; }
    [Column("log_date")]      public DateTime LogDate      { get; set; }
    [Column("energy_level")]  public int      EnergyLevel  { get; set; }
    [Column("fatigue_level")] public int      FatigueLevel { get; set; }
    [Column("sleep_hours")]   public float?   SleepHours   { get; set; }
    [Column("pain_notes")]    public string?  PainNotes    { get; set; }
    [Column("mental_state")]  public string?  MentalState  { get; set; }
    [Column("notes")]         public string?  Notes        { get; set; }

    // Promedios rolling 7 días (calculados en la vista con window functions)
    [Column("avg_energy_7d")]  public double? AvgEnergy7d  { get; set; }
    [Column("avg_fatigue_7d")] public double? AvgFatigue7d { get; set; }
    [Column("avg_sleep_7d")]   public double? AvgSleep7d   { get; set; }

    [Column("checkin_alert")] public string? CheckinAlert { get; set; }

    // ROW_NUMBER() → bigint en PostgreSQL
    [Column("log_rank")] public long LogRank { get; set; }
}
