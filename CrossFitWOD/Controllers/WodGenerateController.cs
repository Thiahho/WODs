using CrossFitWOD.DTOs.Wod;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using CrossFitWOD.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/wod")]
public class WodGenerateController : ControllerBase
{
    private readonly AiWodService _service;
    private readonly AppDbContext _db;

    public WodGenerateController(AiWodService service, AppDbContext db)
    {
        _service = service;
        _db      = db;
    }

    /// <summary>Genera el WOD del día para el atleta autenticado.</summary>
    [Authorize]
    [HttpPost("generate")]
    public async Task<IActionResult> Generate()
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId)
            ?? throw new NotFoundException("Perfil de atleta no encontrado.");

        var result = await _service.GenerateForAthleteAsync(athlete.Id);
        return Ok(result);
    }

    /// <summary>Genera el WOD del día para un atleta específico (solo admin).</summary>
    [Authorize(Roles = "admin")]
    [HttpPost("generate/{athleteId:int}")]
    public async Task<IActionResult> GenerateForAthlete(int athleteId)
    {
        var coachId = GetUserId();
        var coach   = await _db.Users.FindAsync(coachId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.Id == athleteId)
            ?? throw new NotFoundException("Atleta no encontrado.");

        if (athlete.BoxId != coach.BoxId)
            throw new ForbiddenException("No tenés acceso a este atleta.");

        var result = await _service.GenerateForAthleteAsync(athlete.Id);
        return Ok(result);
    }

    /// <summary>Devuelve el WOD del día del atleta autenticado (sin regenerar).</summary>
    [Authorize]
    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId)
            ?? throw new NotFoundException("Perfil de atleta no encontrado.");

        var today   = DateOnly.FromDateTime(DateTime.UtcNow);
        var session = await _db.WorkoutSessions
            .Include(s => s.Wod).ThenInclude(w => w.Exercises)
            .FirstOrDefaultAsync(s => s.BoxId == athlete.BoxId && s.Date == today);

        return session is null
            ? NoContent()
            : Ok(ToDetailDto(session.Wod, session.Id));
    }

    /// <summary>Devuelve el detalle completo de un WOD por ID.</summary>
    [Authorize]
    [HttpGet("{wodId:int}")]
    public async Task<IActionResult> GetDetail(int wodId)
    {
        var wod = await _db.Wods
            .Include(w => w.Exercises)
            .FirstOrDefaultAsync(w => w.Id == wodId)
            ?? throw new NotFoundException("WOD no encontrado.");

        var sessionId = await _db.WorkoutSessions
            .Where(s => s.WodId == wodId)
            .Select(s => (int?)s.Id)
            .FirstOrDefaultAsync();

        return Ok(ToDetailDto(wod, sessionId));
    }

    private static WodDetailDto ToDetailDto(Entities.Wod w, int? sessionId) => new(
        WodId:           w.Id,
        SessionId:       sessionId,
        Title:           w.Title,
        Description:     w.Description,
        Type:            w.Type.ToString(),
        Intensity:       w.Intensity,
        Focus:           w.Focus,
        DurationMinutes: w.DurationMinutes,
        IsAiGenerated:   w.IsAiGenerated,
        WarmUp:          w.WarmUp,
        StrengthSkill:   w.StrengthSkill,
        Metcon:          w.Metcon,
        Scaling:         w.Scaling,
        CoolDown:        w.CoolDown,
        CoachNotes:      w.CoachNotes,
        Exercises:       w.Exercises
            .OrderBy(e => e.Order)
            .Select(e => new WodExerciseDto(e.Name, e.Reps, e.Order))
            .ToList()
    );

    private int GetUserId() => int.Parse(User.FindFirst("user_id")!.Value);
}
