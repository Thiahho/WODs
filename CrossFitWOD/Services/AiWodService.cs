using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CrossFitWOD.DTOs.Wod;
using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
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
        var athlete = await _db.Athletes
            .FirstOrDefaultAsync(a => a.Id == athleteId)
            ?? throw new NotFoundException("Atleta no encontrado.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Verificar si ya existe sesión hoy
        var existingSession = await _db.WorkoutSessions
            .Include(s => s.Wod)
            .FirstOrDefaultAsync(s => s.BoxId == athlete.BoxId && s.Date == today);

        if (existingSession is not null)
            return MapSessionToDto(existingSession);

        // ── Recopilar contexto ────────────────────────────────────────────────
        var status = await _db.AthleteStatuses
            .Where(s => s.AthleteId == athleteId)
            .OrderByDescending(s => s.UpdatedAt)
            .FirstOrDefaultAsync();

        var recentLogs = await _db.AthleteDailyLogs
            .Where(l => l.AthleteId == athleteId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(5)
            .ToListAsync();

        var recentResults = await _db.AthleteWorkouts
            .Where(aw => aw.AthleteId == athleteId && aw.Result != null)
            .Include(aw => aw.Result)
            .Include(aw => aw.WorkoutSession).ThenInclude(s => s.Wod)
            .OrderByDescending(aw => aw.WorkoutSession.Date)
            .Take(5)
            .ToListAsync();

        // ── Contexto semanal ──────────────────────────────────────────────────
        var weekStart = today.AddDays(-(int)today.DayOfWeek == 0 ? 6 : (int)today.DayOfWeek - 1);
        var sessionsThisWeek = await _db.AthleteWorkouts
            .Where(aw => aw.AthleteId == athleteId && aw.WorkoutSession.Date >= weekStart && aw.WorkoutSession.Date <= today)
            .CountAsync();

        // ── Llamar Claude API ─────────────────────────────────────────────────
        var userMessage = BuildUserMessage(athlete, status, recentLogs, recentResults, today, sessionsThisWeek);
        var rawResponse = await CallOpenAiWithRetryAsync(userMessage);

        // ── Parsear y guardar ─────────────────────────────────────────────────
        var parsed  = ParseResponse(rawResponse);
        var wod     = await SaveWodAsync(parsed, athlete, today);
        var session = await SaveSessionAsync(wod, athlete.BoxId, today);

        return new AiWodResponseDto(
            WodId:             wod.Id,
            WorkoutSessionId:  session.Id,
            Title:             wod.Title,
            Intensity:         wod.Intensity ?? "moderate",
            Focus:             wod.Focus ?? "general",
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
        Athlete athlete,
        AthleteStatus? status,
        List<AthleteDailyLogs> logs,
        List<AthleteWorkout> results,
        DateOnly today,
        int sessionsThisWeek)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"Hoy es {today:dddd dd/MM/yyyy}. Genera el WOD para este atleta.");
        sb.AppendLine();

        // Perfil
        sb.AppendLine("## PERFIL DEL ATLETA");
        sb.AppendLine($"- Nombre: {athlete.Name}");
        sb.AppendLine($"- Edad: {(athlete.Edad.HasValue ? $"{athlete.Edad} años" : "no especificada")}");
        sb.AppendLine($"- Nivel: {athlete.Level}");
        sb.AppendLine($"- Objetivo: {athlete.Goal}");
        sb.AppendLine($"- Días por semana: {athlete.DaysPerWeek}");
        sb.AppendLine($"- Duración de sesión: {athlete.SessionDurationMinutes} minutos");
        sb.AppendLine($"- Equipamiento disponible: {(string.IsNullOrWhiteSpace(athlete.Equipment) ? "solo bodyweight" : athlete.Equipment)}");
        sb.AppendLine($"- Puntos débiles: {(string.IsNullOrWhiteSpace(athlete.WeakPoints) ? "ninguno declarado" : athlete.WeakPoints)}");
        sb.AppendLine($"- Historial de lesiones: {(string.IsNullOrWhiteSpace(athlete.InjuryHistory) ? "ninguna" : athlete.InjuryHistory)}");
        sb.AppendLine($"- Nivel de compromiso: {athlete.CommitmentLevel}/10");
        sb.AppendLine();

        // Estado calculado
        sb.AppendLine("## ESTADO ACTUAL");
        if (status is not null)
        {
            sb.AppendLine($"- Readiness: {status.Readiness ?? "desconocido"}");
            sb.AppendLine($"- Fatiga: {status.FatigueLevel:F1}/100");
            sb.AppendLine($"- Recuperación: {status.RecoveryScore:F1}/100");
            sb.AppendLine($"- Ratio de carga (acuda/crónica): {status.LoadRatio:F2} (ideal 0.8–1.3)");
            sb.AppendLine($"- Tendencia de rendimiento: {status.PerformanceTrend ?? "sin datos"}");
            sb.AppendLine($"- Riesgo de lesión: {status.InjuryRisk ?? "desconocido"}");
        }
        else
        {
            sb.AppendLine("- Sin datos de estado calculado aún.");
        }
        sb.AppendLine();

        // Logs diarios recientes
        sb.AppendLine("## LOGS DIARIOS RECIENTES");
        if (logs.Count == 0)
        {
            sb.AppendLine("- Sin logs diarios registrados.");
        }
        else
        {
            foreach (var log in logs)
            {
                sb.AppendLine($"- {log.CreatedAt:dd/MM}: energía={log.EnergyLevel}/10, fatiga={log.FatigueLevel}/10, " +
                              $"sueño={log.SleepHours?.ToString("F1") ?? "?"}h" +
                              (string.IsNullOrWhiteSpace(log.PainNotes)   ? "" : $", dolor: {log.PainNotes}") +
                              (string.IsNullOrWhiteSpace(log.MentalState) ? "" : $", mental: {log.MentalState}") +
                              (string.IsNullOrWhiteSpace(log.Notes)       ? "" : $", notas: {log.Notes}"));
            }
        }
        sb.AppendLine();

        // Contexto semanal
        sb.AppendLine("## CONTEXTO SEMANAL");
        var remainingThisWeek = Math.Max(0, athlete.DaysPerWeek - sessionsThisWeek);
        sb.AppendLine($"- Sesiones planificadas por semana: {athlete.DaysPerWeek}");
        sb.AppendLine($"- Sesiones completadas esta semana: {sessionsThisWeek}");
        sb.AppendLine($"- Sesiones restantes esta semana: {remainingThisWeek}");
        if (sessionsThisWeek == 0)
            sb.AppendLine("- Es el primer entrenamiento de la semana — podés arrancar con más intensidad si el readiness lo permite.");
        else if (remainingThisWeek == 0)
            sb.AppendLine("- Es el último entrenamiento de la semana — considerá reducir la intensidad o enfocar en movilidad/técnica.");
        else if (sessionsThisWeek >= athlete.DaysPerWeek - 1)
            sb.AppendLine("- Queda solo una sesión más esta semana — planificá en función de la recuperación acumulada.");
        sb.AppendLine();

        // Resultados recientes
        sb.AppendLine("## HISTORIAL DE ENTRENAMIENTOS RECIENTES");
        if (results.Count == 0)
        {
            sb.AppendLine("- Sin entrenamientos registrados aún.");
        }
        else
        {
            foreach (var aw in results)
            {
                var r = aw.Result!;
                sb.AppendLine($"- {aw.WorkoutSession.Date:dd/MM} | {aw.WorkoutSession.Wod.Title} | " +
                              $"completado={r.Completed} | RPE={r.Rpe}/10 | " +
                              $"tiempo={r.TimeSeconds?.ToString() ?? "-"}s | reps={r.Rounds?.ToString() ?? "-"}" +
                              (string.IsNullOrWhiteSpace(r.Notes) ? "" : $" | nota: \"{r.Notes}\""));
            }
        }
        sb.AppendLine();

        sb.AppendLine("## INSTRUCCIÓN");
        sb.AppendLine("Genera el WOD de hoy respetando ESTRICTAMENTE el equipamiento disponible.");
        sb.AppendLine("No incluyas ningún ejercicio que requiera equipo que el atleta NO tiene.");
        sb.AppendLine("Adapta la intensidad según el readiness y los logs recientes.");
        sb.AppendLine("Devuelve SOLO el siguiente JSON (sin markdown, sin texto extra).");
        sb.AppendLine("IMPORTANTE — Formato de los campos de texto:");
        sb.AppendLine("- Usá listas con guiones (- item) para ejercicios, opciones y pasos.");
        sb.AppendLine("- Usá subtítulos cortos terminados en ':' para separar bloques (ej: 'Movilidad:', 'Activación:').");
        sb.AppendLine("- Nunca escribas párrafos largos. Cada dato va en su propia línea.");
        sb.AppendLine("- Sé conciso: datos clave solamente.");
        sb.AppendLine("""
{
  "title": "string corto",
  "intensity": "low|moderate|high|deload",
  "focus": "string (fuerza, resistencia, gimnasia, etc.)",
  "duration_minutes": number,
  "warm_up": "lista de ejercicios con reps/tiempo, una línea por ejercicio",
  "strength_skill": "nombre del movimiento + series x reps + peso recomendado, en lista",
  "metcon": "tipo (AMRAP/EMOM/For Time) + tiempo + lista de movimientos con reps exactas",
  "scaling": "Escalado:\n- [versión más fácil]\nRX:\n- [versión estándar]\nRX+:\n- [versión avanzada]",
  "cool_down": "lista de estiramientos/movilidad con duración",
  "coach_notes": "2-3 puntos clave: análisis y tips. Sin párrafos.",
  "alert": "string corto o null",
  "nutrition_tip": "1 línea concreta o null"
}
""");

        return sb.ToString();
    }

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
    private async Task<Wod> SaveWodAsync(ParsedWod p, Athlete athlete, DateOnly today)
    {
        var wod = new Wod
        {
            Title           = p.Title,
            Description     = $"WOD generado por IA para {athlete.Name} — {today:dd/MM/yyyy}",
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

    private static AiWodResponseDto MapSessionToDto(WorkoutSession s) => new(
        WodId:            s.Wod.Id,
        WorkoutSessionId: s.Id,
        Title:            s.Wod.Title,
        Intensity:        s.Wod.Intensity ?? "moderate",
        Focus:            s.Wod.Focus     ?? "general",
        DurationMinutes:  s.Wod.DurationMinutes,
        WarmUp:           s.Wod.WarmUp,
        StrengthSkill:    s.Wod.StrengthSkill,
        Metcon:           s.Wod.Metcon,
        Scaling:          s.Wod.Scaling,
        CoolDown:         s.Wod.CoolDown,
        CoachNotes:       s.Wod.CoachNotes,
        Alert:            null,
        NutritionTip:     null);

    // ── System prompt ─────────────────────────────────────────────────────────
    private const string SystemPrompt = """
        Sos un entrenador de CrossFit de alto rendimiento. Generás WODs personalizados basados en los datos del atleta.

        IDIOMA: Español rioplatense. Usá "vos", "hacé", "empezá". Nunca "tú", "haz", "empieza".

        FORMATO DE RESPUESTA — MUY IMPORTANTE:
        - Respondé SOLO con el JSON solicitado, sin texto extra ni markdown.
        - Los valores de texto deben ser CONCISOS: listas con guiones, datos clave, sin párrafos.
        - Cada ejercicio en su propia línea. Cada opción de escalado en su propia línea.
        - Máximo 2-3 líneas para coach_notes y nutrition_tip.

        PRINCIPIOS:
        - Nunca uses equipo que el atleta no tiene.
        - Ajustá intensidad según readiness y logs.
        - Fatiga alta o ratio > 1.3 → deload.
        - Lesiones → evitá esa zona.
        - Reps exactas, tiempos, pesos recomendados.
        - Periodizá según semana: primer día → más intensidad; último → técnica/movilidad.
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

// ── Extension helper ──────────────────────────────────────────────────────────
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
