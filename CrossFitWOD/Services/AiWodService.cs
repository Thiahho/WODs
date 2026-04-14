using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CrossFitWOD.DTOs.Wod;
using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using CrossFitWOD.Persistence.ViewModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CrossFitWOD.Services;

public class AiWodService
{
    private readonly AppDbContext          _db;
    private readonly HttpClient            _http;
    private readonly string                _apiKey;
    private readonly ILogger<AiWodService> _logger;
    private const    string                Model  = "gpt-4o";
    private const    string                ApiUrl = "https://api.openai.com/v1/chat/completions";

    public AiWodService(AppDbContext db, IHttpClientFactory factory, IConfiguration config, ILogger<AiWodService> logger)
    {
        _db     = db;
        _http   = factory.CreateClient("openai");
        _logger = logger;
        _apiKey = config["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI:ApiKey no configurada.");
    }

    // ── Punto de entrada ──────────────────────────────────────────────────────
    public async Task<AiWodResponseDto> GenerateForAthleteAsync(int athleteId)
    {
        var today     = DateOnly.FromDateTime(DateTime.UtcNow);
        var weekStart = today.AddDays(-(int)today.DayOfWeek == 0 ? 6 : (int)today.DayOfWeek - 1);

        // ── Query 1: perfil + estado + sesiones recientes (vista) ─────────────
        var contextRows = await _db.AthleteWodContexts
            .Where(r => r.AthleteId == athleteId &&
                        (r.SessionDate == null || r.SessionDate >= today.AddDays(-30)))
            .OrderByDescending(r => r.SessionDate)
            .ToListAsync();

        if (contextRows.Count == 0)
            throw new NotFoundException("Atleta no encontrado.");

        var profile = contextRows.First();

        // Verificar si ya existe sesión hoy para este box
        var todayRow = contextRows.FirstOrDefault(r => r.SessionDate == today && r.SessionId.HasValue);
        if (todayRow is not null)
            return MapViewToDto(todayRow);

        // ── Query 2: logs diarios con promedios (vista) ───────────────────────
        var logRows = await _db.AthleteDailyLogSummaries
            .Where(r => r.AthleteId == athleteId)
            .OrderBy(r => r.LogRank)
            .ToListAsync();

        // Derivar datos del contexto
        var recentResults    = contextRows.Where(r => r.ResultId.HasValue).Take(5).ToList();
        var sessionsThisWeek = contextRows.Count(r => r.SessionDate >= weekStart &&
                                                      r.SessionDate <= today &&
                                                      r.AthleteWorkoutId.HasValue);

        // ── Llamar AI ─────────────────────────────────────────────────────────
        var userMessage = BuildUserMessage(profile, logRows, recentResults, today, sessionsThisWeek);
        var rawResponse = await CallOpenAiWithRetryAsync(userMessage);

        // ── Parsear y guardar ─────────────────────────────────────────────────
        var parsed  = ParseResponse(rawResponse);
        var wod     = await SaveWodAsync(parsed, profile, today);
        var session = await SaveSessionAsync(wod, profile.BoxId, today);

        return new AiWodResponseDto(
            WodId:             wod.Id,
            WorkoutSessionId:  session.Id,
            Title:             wod.Title,
            Intensity:         wod.Intensity ?? "moderate",
            Focus:             wod.Focus     ?? "general",
            DurationMinutes:   wod.DurationMinutes,
            WarmUp:            wod.WarmUp,
            StrengthSkill:     wod.StrengthSkill,
            Metcon:            wod.Metcon,
            Scaling:           wod.Scaling,
            CoolDown:          wod.CoolDown,
            CoachNotes:        wod.CoachNotes,
            Alert:             parsed.Alert,
            NutritionTip:      parsed.NutritionTip
        );
    }

    // ── Construcción del mensaje ──────────────────────────────────────────────
    private static string BuildUserMessage(
        AthleteWodContextView            profile,
        List<AthleteDailyLogSummaryView> logs,
        List<AthleteWodContextView>      recentResults,
        DateOnly                         today,
        int                              sessionsThisWeek)
    {
        var signals = ComputeSignals(profile, logs, recentResults);
        var sb      = new StringBuilder();

        sb.AppendLine($"Hoy es {today:dddd dd/MM/yyyy}.");
        sb.AppendLine();

        // ── 1. PERFIL ─────────────────────────────────────────────────────────
        sb.AppendLine("## PERFIL DEL ATLETA");
        sb.AppendLine($"- Nombre: {profile.AthleteName}");
        sb.AppendLine($"- Nivel CrossFit: {LevelLabel(profile.AthleteLevel)}");
        sb.AppendLine($"- Objetivo: {GoalLabel(profile.AthleteGoal)}");
        sb.AppendLine($"- Días de entrenamiento por semana: {profile.DaysPerWeek}");
        sb.AppendLine($"- Duración preferida de sesión: {profile.SessionDurationMinutes} min");
        sb.AppendLine($"- Equipamiento disponible: {(string.IsNullOrWhiteSpace(profile.Equipment) ? "SOLO BODYWEIGHT (sin ningún equipo)" : profile.Equipment)}");
        sb.AppendLine($"- Puntos débiles a desarrollar: {(string.IsNullOrWhiteSpace(profile.WeakPoints) ? "ninguno declarado" : profile.WeakPoints)}");
        sb.AppendLine($"- Historial de lesiones: {(string.IsNullOrWhiteSpace(profile.InjuryHistory) ? "ninguna" : profile.InjuryHistory)}");
        sb.AppendLine($"- Nivel de compromiso: {profile.CommitmentLevel}/10");
        sb.AppendLine();

        // ── 2. SEÑALES PRE-CALCULADAS (análisis del sistema) ─────────────────
        sb.AppendLine("## SEÑALES DEL SISTEMA");
        sb.AppendLine($"- Deload obligatorio: {(signals.DeloadNeeded ? "SÍ ⚠️" : "NO")}");
        if (signals.DeloadNeeded)
            sb.AppendLine($"  → Motivo: {signals.DeloadReason}");
        sb.AppendLine($"- Estado subjetivo hoy vs promedio 7d: {signals.SubjectiveStateSummary}");
        if (signals.AvgRpe.HasValue)
            sb.AppendLine($"- RPE promedio últimas {recentResults.Count} sesiones: {signals.AvgRpe:F1}/10" +
                          (signals.AvgRpe > 8.5 ? " → SOBRECARGA percibida" :
                           signals.AvgRpe < 6   ? " → Carga muy baja, podés intensificar" : " → Zona normal"));
        if (signals.CompletionRate.HasValue)
            sb.AppendLine($"- Tasa de finalización reciente: {signals.CompletionRate:P0}" +
                          (signals.CompletionRate < 0.6 ? " → WODs muy exigentes, reducí volumen" : ""));
        sb.AppendLine($"- Patrones musculares dominantes recientes: {signals.RecentMovementPattern}");
        sb.AppendLine($"  → El WOD de hoy DEBE trabajar principalmente: {signals.SuggestedPattern}");
        sb.AppendLine();

        // ── 3. ESTADO CALCULADO (AthleteStatus) ──────────────────────────────
        sb.AppendLine("## ESTADO FISIOLÓGICO CALCULADO");
        if (profile.StatusId.HasValue)
        {
            sb.AppendLine($"- Readiness: {profile.Readiness ?? "desconocido"}");
            sb.AppendLine($"- Fatiga acumulada: {profile.StatusFatigueLevel:F1}/100");
            sb.AppendLine($"- Score de recuperación: {profile.RecoveryScore:F1}/100");
            sb.AppendLine($"- Ratio carga aguda/crónica: {profile.LoadRatio:F2} — {profile.LoadRatioLabel}");
            sb.AppendLine($"- Tendencia de rendimiento: {profile.PerformanceTrend ?? "sin datos"}");
            sb.AppendLine($"- Riesgo de lesión: {profile.InjuryRisk ?? "desconocido"}");
        }
        else
        {
            sb.AppendLine("- Sin datos calculados aún (atleta nuevo).");
        }
        sb.AppendLine();

        // ── 4. ESTADO SUBJETIVO HOY ───────────────────────────────────────────
        sb.AppendLine("## ESTADO SUBJETIVO (check-ins diarios, últimos 7 días)");
        if (logs.Count == 0)
        {
            sb.AppendLine("- No hizo check-in hoy. Usá el estado fisiológico calculado como referencia.");
        }
        else
        {
            var latest = logs.First();
            sb.AppendLine($"- HOY: energía={latest.EnergyLevel}/10, fatiga={latest.FatigueLevel}/10, " +
                          $"sueño={latest.SleepHours?.ToString("F1") ?? "?"}h" +
                          (string.IsNullOrWhiteSpace(latest.PainNotes)   ? "" : $" | DOLOR: {latest.PainNotes}") +
                          (string.IsNullOrWhiteSpace(latest.MentalState) ? "" : $" | mental: {latest.MentalState}") +
                          (string.IsNullOrWhiteSpace(latest.Notes)       ? "" : $" | notas: {latest.Notes}"));
            if (latest.AvgEnergy7d.HasValue)
                sb.AppendLine($"- Promedios 7d: energía={latest.AvgEnergy7d:F1}/10, " +
                              $"fatiga={latest.AvgFatigue7d:F1}/10, sueño={latest.AvgSleep7d?.ToString("F1") ?? "?"}h");
            foreach (var log in logs.Skip(1))
                sb.AppendLine($"  {log.LogDate:dd/MM}: E={log.EnergyLevel} F={log.FatigueLevel}" +
                              (string.IsNullOrWhiteSpace(log.CheckinAlert) ? "" : $" [{log.CheckinAlert}]"));
        }
        sb.AppendLine();

        // ── 5. CONTEXTO SEMANAL ───────────────────────────────────────────────
        sb.AppendLine("## CONTEXTO SEMANAL");
        var remaining = Math.Max(0, profile.DaysPerWeek - sessionsThisWeek);
        sb.AppendLine($"- Plan: {profile.DaysPerWeek} días/semana | Completados: {sessionsThisWeek} | Restantes: {remaining}");
        sb.AppendLine(sessionsThisWeek switch
        {
            0                                              => "- PRIMER sesión de la semana → mayor intensidad posible según readiness.",
            _ when remaining == 0                          => "- ÚLTIMA sesión de la semana → enfocá en técnica, movilidad o metcon corto.",
            _ when sessionsThisWeek >= profile.DaysPerWeek - 1 => "- Penúltima sesión → moderá el volumen para llegar bien al último día.",
            _                                              => "- Sesión intermedia → balanceá fuerza y metcon según el patrón muscular pendiente."
        });
        sb.AppendLine();

        // ── 6. HISTORIAL DE ENTRENAMIENTOS ───────────────────────────────────
        sb.AppendLine("## HISTORIAL RECIENTE (últimas sesiones con resultado)");
        if (recentResults.Count == 0)
        {
            sb.AppendLine("- Sin historial. Empezá con carga moderada y evaluá la respuesta.");
        }
        else
        {
            foreach (var r in recentResults)
            {
                sb.AppendLine($"### {r.SessionDate:dd/MM} — {r.WodTitle} ({r.WodFocus ?? "general"})");
                sb.AppendLine($"  Resultado: completado={r.ResultCompleted} | RPE={r.ResultRpe}/10" +
                              (r.ResultTimeSeconds.HasValue ? $" | tiempo={r.ResultTimeSeconds}s" : "") +
                              (r.ResultRounds.HasValue      ? $" | rondas={r.ResultRounds}"       : "") +
                              (string.IsNullOrWhiteSpace(r.ResultNotes) ? "" : $"\n  Nota: \"{r.ResultNotes}\""));
                // Incluir el WOD real para que la IA evite repetir movimientos
                if (!string.IsNullOrWhiteSpace(r.WodMetcon))
                {
                    var metconPreview = r.WodMetcon.Length > 300 ? r.WodMetcon[..300] + "…" : r.WodMetcon;
                    sb.AppendLine($"  WOD: {metconPreview}");
                }
            }
        }
        sb.AppendLine();

        // ── 7. INSTRUCCIÓN FINAL ──────────────────────────────────────────────
        sb.AppendLine("## INSTRUCCIÓN");
        if (signals.DeloadNeeded)
            sb.AppendLine($"⚠️ DELOAD OBLIGATORIO: {signals.DeloadReason}. Intensidad = low, volumen reducido al 50%.");
        sb.AppendLine($"Generá el WOD de hoy para {profile.AthleteName} usando SOLO el equipamiento declarado.");
        sb.AppendLine($"Duracion objetivo: {profile.SessionDurationMinutes} minutos totales.");
        sb.AppendLine("En coach_notes explicá POR QUÉ tomaste cada decisión citando datos concretos del atleta.");
        sb.AppendLine("Devolvé SOLO el siguiente JSON (sin markdown, sin texto extra):");
        sb.AppendLine("""
{
  "title": "string — nombre creativo del WOD",
  "intensity": "low|moderate|high|deload",
  "focus": "string — ej: fuerza posterior, gimnasia empuje, metcon aeróbico",
  "duration_minutes": number,
  "warm_up": "string — calentamiento específico para los movimientos del WOD (5-10 min)",
  "strength_skill": "string — parte de fuerza o skill con sets×reps y % o RPE sugerido",
  "metcon": "string — WOD principal con formato (AMRAP X min / For Time / EMOM X), ejercicios, reps exactas y pesos sugeridos por nivel",
  "scaling": "string — 3 versiones: RX+ | RX | Escalado, con las modificaciones concretas",
  "cool_down": "string — vuelta a la calma con movilidad específica (5 min)",
  "coach_notes": "string — análisis personalizado: qué datos del atleta determinaron este WOD, qué progreso se detecta y qué debe enfocarse",
  "alert": "string|null — alerta si hay señal de sobreentrenamiento, lesión latente o estancamiento",
  "nutrition_tip": "string|null — recomendación nutricional concreta para hoy (pre/post entreno)"
}
""");

        return sb.ToString();
    }

    // ── Pre-análisis de señales ───────────────────────────────────────────────
    private static CoachSignals ComputeSignals(
        AthleteWodContextView            profile,
        List<AthleteDailyLogSummaryView> logs,
        List<AthleteWodContextView>      results)
    {
        // RPE y completion rate
        var rpeSamples      = results.Where(r => r.ResultRpe.HasValue).Select(r => r.ResultRpe!.Value).ToList();
        var avgRpe          = rpeSamples.Count > 0 ? rpeSamples.Average() : (double?)null;
        var completionRate  = results.Count > 0
            ? (double)results.Count(r => r.ResultCompleted == true) / results.Count
            : (double?)null;

        // Estado subjetivo hoy vs promedio
        var todayLog = logs.FirstOrDefault();
        string subjectiveSummary;
        if (todayLog is null)
        {
            subjectiveSummary = "sin check-in hoy";
        }
        else
        {
            var energyDelta = todayLog.AvgEnergy7d.HasValue
                ? todayLog.EnergyLevel - todayLog.AvgEnergy7d.Value
                : 0;
            var label = energyDelta >= 1  ? "MEJOR que su promedio" :
                        energyDelta <= -2 ? "PEOR que su promedio — reducir volumen" :
                                           "similar a su promedio";
            subjectiveSummary = $"energía hoy={todayLog.EnergyLevel}/10, fatiga={todayLog.FatigueLevel}/10 ({label})";
        }

        // Señal de deload
        var deloadReasons = new List<string>();
        if (profile.LoadRatio > 1.3f)       deloadReasons.Add($"ratio carga {profile.LoadRatio:F2} > 1.3");
        if (profile.Readiness == "low")      deloadReasons.Add("readiness = low");
        if (avgRpe > 8.5)                    deloadReasons.Add($"RPE promedio {avgRpe:F1} > 8.5");
        if (completionRate < 0.5)            deloadReasons.Add($"tasa de finalización {completionRate:P0} < 50%");
        if (todayLog?.EnergyLevel <= 3)      deloadReasons.Add($"energía hoy = {todayLog!.EnergyLevel}/10 (crítica)");
        var deloadNeeded = deloadReasons.Count > 0;

        // Patrones musculares recientes
        var recentFocuses = results
            .Where(r => !string.IsNullOrWhiteSpace(r.WodFocus))
            .Select(r => r.WodFocus!)
            .Take(3)
            .ToList();

        var (recentPattern, suggestedPattern) = DetermineMovementBalance(recentFocuses, results);

        return new CoachSignals(
            AvgRpe:                avgRpe,
            CompletionRate:        completionRate,
            SubjectiveStateSummary: subjectiveSummary,
            DeloadNeeded:          deloadNeeded,
            DeloadReason:          deloadNeeded ? string.Join(", ", deloadReasons) : null,
            RecentMovementPattern: recentPattern,
            SuggestedPattern:      suggestedPattern
        );
    }

    // Detecta el balance push/pull/hinge/squat de las sesiones recientes
    private static (string recent, string suggested) DetermineMovementBalance(
        List<string> recentFocuses, List<AthleteWodContextView> results)
    {
        var allText = string.Join(" ",
            recentFocuses
            .Concat(results.Select(r => r.WodTitle   ?? ""))
            .Concat(results.Select(r => r.WodMetcon  ?? ""))
        ).ToLowerInvariant();

        var hasHinge  = allText.ContainsAny("deadlift", "rdl", "swing", "clean", "snatch", "posterior");
        var hasSquat  = allText.ContainsAny("squat", "thruster", "wall ball", "lunge", "piernas");
        var hasPush   = allText.ContainsAny("press", "push", "empuje", "jerk", "dip", "hspu");
        var hasPull   = allText.ContainsAny("pull", "row", "ring row", "muscle-up", "tracción");
        var hasCardio = allText.ContainsAny("run", "row 500", "double-under", "burpee", "cardio");

        var recent = new List<string>();
        if (hasHinge)  recent.Add("bisagra/posterior");
        if (hasSquat)  recent.Add("sentadilla/piernas");
        if (hasPush)   recent.Add("empuje");
        if (hasPull)   recent.Add("tracción");
        if (hasCardio) recent.Add("cardio");
        var recentStr = recent.Count > 0 ? string.Join(", ", recent) : "sin datos";

        // Sugerir el dominio menos entrenado
        var missing = new List<string>();
        if (!hasHinge)  missing.Add("bisagra de cadera (deadlift/clean)");
        if (!hasSquat)  missing.Add("sentadilla");
        if (!hasPush)   missing.Add("empuje");
        if (!hasPull)   missing.Add("tracción");
        if (!hasCardio) missing.Add("componente aeróbico");
        var suggestedStr = missing.Count > 0 ? string.Join(" y ", missing.Take(2)) : "balance libre (todos los patrones cubiertos)";

        return (recentStr, suggestedStr);
    }

    private static string LevelLabel(int level) => level switch
    {
        1 => "Principiante (movimientos básicos, técnica en desarrollo)",
        2 => "Amateur (movimientos establecidos, carga moderada)",
        3 => "Intermedio / Scaled (buena base, puede hacer RX en muchos WODs)",
        4 => "Avanzado / RX (alto nivel técnico, cargas altas)",
        5 => "Elite (atleta competitivo, sin restricciones de programación)",
        _ => $"Nivel {level}"
    };

    private static string GoalLabel(int goal) => goal switch
    {
        1 => "General (salud, bienestar, mantenerse activo)",
        2 => "Fitness (mejorar condición física y composición corporal)",
        3 => "Competencia (rendir en competencias CrossFit)",
        4 => "Rehabilitación (volver a entrenar con cuidado)",
        _ => $"Objetivo {goal}"
    };

    private record CoachSignals(
        double?  AvgRpe,
        double?  CompletionRate,
        string   SubjectiveStateSummary,
        bool     DeloadNeeded,
        string?  DeloadReason,
        string   RecentMovementPattern,
        string   SuggestedPattern
    );

    // ── Retry con backoff exponencial ────────────────────────────────────────
    private async Task<string> CallOpenAiWithRetryAsync(string userMessage)
    {
        int[] delays = [1000, 2000, 4000];

        for (var i = 0; i <= delays.Length; i++)
        {
            try
            {
                return await CallClaudeAsync(userMessage);
            }
            catch (Exception ex) when (i < delays.Length)
            {
                _logger.LogWarning(ex, "OpenAI falló, reintento {Attempt}/{Max}", i + 1, delays.Length);
                await Task.Delay(delays[i]);
            }
        }

        throw new InvalidOperationException("OpenAI no respondió después de 3 intentos.");
    }

    // ── Llamada a Claude API ──────────────────────────────────────────────────
    private async Task<string> CallClaudeAsync(string userMessage)
    {
        var payload = new
        {
            model      = Model,
            max_tokens = 2048,
            messages   = new[]
            {
                new { role = "system", content = SystemPrompt },
                new { role = "user",   content = userMessage  }
            }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, ApiUrl)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json")
        };
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

        var response = await _http.SendAsync(request);
        var body     = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"OpenAI API error {response.StatusCode}: {body}");

        using var doc = JsonDocument.Parse(body);
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()
            ?? throw new InvalidOperationException("Respuesta vacía de OpenAI API.");
    }

    // ── Parseo de la respuesta ────────────────────────────────────────────────
    private static ParsedWod ParseResponse(string raw)
    {
        try
        {
            // Limpiar posibles bloques markdown
            var json = raw.Trim();
            if (json.StartsWith("```")) json = json.Split('\n', 2)[1];
            if (json.EndsWith("```")) json  = json[..json.LastIndexOf("```")];

            using var doc = JsonDocument.Parse(json.Trim());
            var root = doc.RootElement;

            return new ParsedWod(
                Title:          root.TryGet("title")           ?? "WOD del día",
                Intensity:      root.TryGet("intensity")       ?? "moderate",
                Focus:          root.TryGet("focus")           ?? "general",
                DurationMinutes: root.TryGetInt("duration_minutes") ?? 20,
                WarmUp:         root.TryGet("warm_up"),
                StrengthSkill:  root.TryGet("strength_skill"),
                Metcon:         root.TryGet("metcon"),
                Scaling:        root.TryGet("scaling"),
                CoolDown:       root.TryGet("cool_down"),
                CoachNotes:     root.TryGet("coach_notes"),
                Alert:          root.TryGet("alert"),
                NutritionTip:   root.TryGet("nutrition_tip")
            );
        }
        catch
        {
            // Si el parseo falla, guardar la respuesta cruda en CoachNotes
            return new ParsedWod(
                Title: "WOD del día", Intensity: "moderate", Focus: "general",
                DurationMinutes: 20, WarmUp: null, StrengthSkill: null,
                Metcon: raw, Scaling: null, CoolDown: null,
                CoachNotes: null, Alert: null, NutritionTip: null);
        }
    }

    // ── Persistencia ─────────────────────────────────────────────────────────
    private async Task<Wod> SaveWodAsync(ParsedWod p, AthleteWodContextView profile, DateOnly today)
    {
        var wod = new Wod
        {
            Title           = p.Title,
            Description     = $"WOD generado por IA para {profile.AthleteName} — {today:dd/MM/yyyy}",
            Type            = DetermineWodType(p.Metcon),
            DurationMinutes = p.DurationMinutes,
            Intensity       = p.Intensity,
            Focus           = p.Focus,
            WarmUp          = p.WarmUp,
            StrengthSkill   = p.StrengthSkill,
            Metcon          = p.Metcon,
            Scaling         = p.Scaling,
            CoolDown        = p.CoolDown,
            CoachNotes      = p.CoachNotes,
            IsAiGenerated   = true
        };

        _db.Wods.Add(wod);
        await _db.SaveChangesAsync();
        return wod;
    }

    private async Task<WorkoutSession> SaveSessionAsync(Wod wod, int boxId, DateOnly today)
    {
        var session = new WorkoutSession { WodId = wod.Id, BoxId = boxId, Date = today };
        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();
        return session;
    }

    private static AiWodResponseDto MapViewToDto(AthleteWodContextView r) => new(
        WodId:            r.WodId!.Value,
        WorkoutSessionId: r.SessionId!.Value,
        Title:            r.WodTitle         ?? "WOD del día",
        Intensity:        r.WodIntensity     ?? "moderate",
        Focus:            r.WodFocus         ?? "general",
        DurationMinutes:  r.WodDurationMinutes ?? 20,
        WarmUp:           r.WodWarmup,
        StrengthSkill:    r.WodStrengthSkill,
        Metcon:           r.WodMetcon,
        Scaling:          r.WodScaling,
        CoolDown:         r.WodCooldown,
        CoachNotes:       r.WodCoachNotes,
        Alert:            null,
        NutritionTip:     null);

    // ── System prompt ─────────────────────────────────────────────────────────
    private const string SystemPrompt = """
        Sos un head coach de CrossFit de alto rendimiento con 15 años de experiencia programando para atletas individuales.
        Tu especialidad es la periodización basada en datos: usás métricas reales (RPE, completion rate, load ratio, logs diarios) para tomar decisiones de programación que maximizan el rendimiento y minimizan el riesgo de lesión.

        IDIOMA: Respondé SIEMPRE en español rioplatense (argentino). "vos", "hacé", "empezá", "fijate", "acomodá". Nunca uses "tú" ni español neutro.

        ═══════════════════════════════════════════════
        ÁRBOL DE DECISIÓN — seguilo en orden estricto
        ═══════════════════════════════════════════════

        PASO 1 — DELOAD (verificar primero):
          Si el campo "Deload obligatorio" dice SÍ → intensidad = "deload", volumen -50%, sin carga máxima, foco en movilidad y técnica. No hay excepción.

        PASO 2 — INTENSIDAD (si no es deload):
          - Readiness "high" + LoadRatio 0.8-1.1 + energía hoy ≥ 7 → "high"
          - Readiness "moderate" O LoadRatio 1.1-1.3 O energía 5-6 → "moderate"
          - Readiness "low" O energía ≤ 4 O RPE promedio > 8 → "low"
          - Atleta nuevo sin datos → "moderate" por defecto

        PASO 3 — PATRÓN DE MOVIMIENTO (campo "El WOD de hoy DEBE trabajar principalmente"):
          Respetá la sugerencia del sistema. Variedad de patrones semana a semana es obligatoria.
          Un buen WOD semanal cubre: empuje + tracción + bisagra/posterior + sentadilla + cardio.

        PASO 4 — EQUIPAMIENTO (NO NEGOCIABLE):
          Si el atleta NO tiene un equipo, ese ejercicio NO EXISTE para vos.
          Ejemplo: sin barbell → no hay deadlifts, cleans, thrusters con barra. Punto.

        PASO 5 — NIVEL:
          Principiante  → volumen bajo, técnica primero, sin carga máxima
          Amateur/Scaled → volumen moderado, carga al 70-80% percibido
          Avanzado/RX    → volumen estándar, incluir variantes técnicas complejas
          Elite          → volumen alto, movimientos olímpicos, carga máxima

        PASO 6 — LESIONES:
          Si hay lesión activa → excluí TODOS los movimientos que carguen esa zona.
          Documentalo en coach_notes.

        ═══════════════════════════════════════════════
        REGLAS DE CALIDAD DEL WOD
        ═══════════════════════════════════════════════
        - El WOD tiene que sumar exactamente la duración declarada (warm-up + strength + metcon + cooldown).
        - Metcon: especificá el formato exacto (AMRAP X min / For Time / EMOM X×Y), los ejercicios, las reps y los pesos sugeridos por nivel.
        - Strength/Skill: sets × reps + % de 1RM sugerido O RPE objetivo.
        - Scaling: 3 versiones concretas (RX+ / RX / Escalado) con modificaciones específicas.
        - NO repitas patrones de movimiento dominantes en las últimas 3 sesiones.
        - coach_notes DEBE citar datos concretos del atleta: "Como tu RPE promedio fue X...", "Dado que tu energía hoy está Y puntos por debajo de tu promedio...".

        RESPONDÉ SOLO con el JSON. Cero texto fuera del JSON.
        """;

    private static WodType DetermineWodType(string? metcon)
    {
        var upper = (metcon ?? "").ToUpperInvariant();
        if (upper.Contains("AMRAP")) return WodType.Amrap;
        if (upper.Contains("EMOM"))  return WodType.Emom;
        return WodType.ForTime;
    }

    // ── Tipos internos ────────────────────────────────────────────────────────
    private record ParsedWod(
        string  Title, string Intensity, string Focus, int DurationMinutes,
        string? WarmUp, string? StrengthSkill, string? Metcon, string? Scaling,
        string? CoolDown, string? CoachNotes, string? Alert, string? NutritionTip);
}

// ── Extension helpers ─────────────────────────────────────────────────────────
file static class StringExtensions
{
    public static bool ContainsAny(this string source, params string[] values) =>
        values.Any(v => source.Contains(v, StringComparison.OrdinalIgnoreCase));
}

file static class JsonElementExtensions
{
    public static string? TryGet(this JsonElement el, string key) =>
        el.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.String
            ? v.GetString()
            : null;

    public static int? TryGetInt(this JsonElement el, string key) =>
        el.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.Number
            ? v.GetInt32()
            : null;
}
