using CrossFitWOD.Entities;
using CrossFitWOD.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Services;

/// <summary>
/// Calcula y persiste el AthleteStatus después de cada resultado o daily log.
/// Métricas: carga aguda (7d), crónica (28d), ratio, readiness, fatiga, riesgo de lesión.
/// </summary>
public class AthleteStatusService
{
    private readonly AppDbContext _db;

    public AthleteStatusService(AppDbContext db) => _db = db;

    public async Task RecalculateAsync(int athleteId)
    {
        var now   = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);

        // ── 1. Cargas por sesión (últimos 28 días) ────────────────────────────
        // Carga = DurationSeconds * RPE  (fórmula de Foster Session-RPE)
        var cutoff28 = today.AddDays(-28);
        var cutoff7  = today.AddDays(-7);

        var results = await _db.AthleteWorkouts
            .Where(aw => aw.AthleteId == athleteId && aw.Result != null)
            .Include(aw => aw.Result)
            .Include(aw => aw.WorkoutSession)
            .Where(aw => aw.WorkoutSession.Date >= cutoff28)
            .ToListAsync();

        // Agrupar por día (puede haber más de una sesión por día en el futuro)
        var loadsByDay = results
            .GroupBy(aw => aw.WorkoutSession.Date)
            .ToDictionary(
                g => g.Key,
                g => g.Sum(aw => SessionLoad(aw.Result!)));

        var acuteLoad  = AverageLoad(loadsByDay, cutoff7,  today);
        var chronicLoad = AverageLoad(loadsByDay, cutoff28, today);
        var loadRatio  = chronicLoad > 0 ? acuteLoad / chronicLoad : 1f;

        // ── 2. Métricas de daily logs (últimos 7 días) ────────────────────────
        var recentLogs = await _db.AthleteDailyLogs
            .Where(l => l.AthleteId == athleteId && l.CreatedAt >= now.AddDays(-7))
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        var avgEnergy  = recentLogs.Count > 0 ? (float)recentLogs.Average(l => l.EnergyLevel)  : 5f;
        var avgFatigue = recentLogs.Count > 0 ? (float)recentLogs.Average(l => l.FatigueLevel) : 5f;
        var avgSleep   = recentLogs.Count > 0 && recentLogs.Any(l => l.SleepHours.HasValue)
            ? (float)recentLogs.Where(l => l.SleepHours.HasValue).Average(l => l.SleepHours!.Value)
            : 7f;
        var hasPain    = recentLogs.Any(l => !string.IsNullOrWhiteSpace(l.PainNotes));

        // ── 3. Tendencia de rendimiento ───────────────────────────────────────
        var last5 = results
            .OrderByDescending(aw => aw.WorkoutSession.Date)
            .Take(5)
            .ToList();

        var performanceTrend = CalcTrend(last5);

        // ── 4. Scores derivados ───────────────────────────────────────────────
        // FatigueLevel (0–100): mezcla carga aguda + fatiga subjetiva
        var fatigueScore = Math.Min(100f,
            (acuteLoad / 1000f * 40f) +          // 40% carga objetiva
            (avgFatigue / 10f * 40f) +            // 40% fatiga subjetiva
            ((float)avgSleep < 6f ? 20f : 0f));    // 20% penalización por mal sueño

        // RecoveryScore (0–100): inverso de fatiga + energía + sueño
        var recoveryScore = Math.Clamp(
            (avgEnergy / 10f * 40f) +
            ((10f - avgFatigue) / 10f * 40f) +
            (Math.Min((float)avgSleep, 9f) / 9f * 20f),
            0f, 100f);

        // FitnessLevel (0–100): proxy de carga crónica normalizada
        var fitnessLevel = Math.Min(100f, chronicLoad / 500f * 100f);

        // LastPerformanceScore: promedio de RPE de últimas 5 sesiones completadas
        var lastPerfScore = last5.Count > 0
            ? (float)last5.Average(aw => aw.Result!.Rpe)
            : 5f;

        // ── 5. Readiness ──────────────────────────────────────────────────────
        var readiness = CalcReadiness(loadRatio, recoveryScore, hasPain);

        // ── 6. Injury risk ────────────────────────────────────────────────────
        var injuryRisk = CalcInjuryRisk(loadRatio, hasPain, (float)avgSleep);

        // ── 7. Guardar / actualizar ───────────────────────────────────────────
        var status = await _db.AthleteStatuses
            .FirstOrDefaultAsync(s => s.AthleteId == athleteId);

        if (status is null)
        {
            status = new AthleteStatus { AthleteId = athleteId, CreatedAt = now };
            _db.AthleteStatuses.Add(status);
        }

        status.AcuteLoad             = acuteLoad;
        status.ChronicLoad           = chronicLoad;
        status.LoadRatio             = loadRatio;
        status.FatigueLevel          = fatigueScore;
        status.RecoveryScore         = recoveryScore;
        status.FitnessLevel          = fitnessLevel;
        status.LastPerformanceScore  = lastPerfScore;
        status.PerformanceTrend      = performanceTrend;
        status.Readiness             = readiness;
        status.InjuryRisk            = injuryRisk;
        status.UpdatedAt             = now;

        await _db.SaveChangesAsync();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>Foster Session-RPE: carga = duración (min) × RPE</summary>
    private static float SessionLoad(WorkoutResult r) =>
        (r.DurationSeconds / 60f) * r.Rpe;

    private static float AverageLoad(
        Dictionary<DateOnly, float> loadsByDay,
        DateOnly from, DateOnly to)
    {
        var days  = (to.DayNumber - from.DayNumber);
        if (days <= 0) return 0f;
        var total = loadsByDay
            .Where(kv => kv.Key >= from && kv.Key <= to)
            .Sum(kv => kv.Value);
        return total / days;
    }

    private static string CalcTrend(List<AthleteWorkout> last5)
    {
        if (last5.Count < 3) return "insufficient_data";

        // Mejora si: completados y RPE bajando (mismo esfuerzo, mejor resultado)
        var completed = last5.Count(aw => aw.Result!.Completed);
        var avgRpe    = last5.Average(aw => aw.Result!.Rpe);

        if (completed >= 4 && avgRpe <= 7) return "improving";
        if (completed <= 2 || avgRpe >= 9)  return "declining";
        return "stable";
    }

    private static string CalcReadiness(float loadRatio, float recoveryScore, bool hasPain)
    {
        if (hasPain || loadRatio > 1.5f || recoveryScore < 30f) return "low";
        if (loadRatio > 1.3f || recoveryScore < 50f)             return "moderate";
        return "high";
    }

    private static string CalcInjuryRisk(float loadRatio, bool hasPain, float avgSleep)
    {
        var score = 0;
        if (loadRatio > 1.5f) score += 3;
        else if (loadRatio > 1.3f) score += 1;
        if (hasPain)    score += 2;
        if (avgSleep < 6) score += 1;

        return score >= 4 ? "high" : score >= 2 ? "moderate" : "low";
    }
}
