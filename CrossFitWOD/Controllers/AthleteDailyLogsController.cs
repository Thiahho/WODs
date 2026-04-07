using CrossFitWOD.DTOs.AthleteDailyLog;
using CrossFitWOD.Entities;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using CrossFitWOD.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/athlete-daily-logs")]
public class AthleteDailyLogsController : ControllerBase
{
    private readonly AppDbContext          _db;
    private readonly AthleteStatusService  _statusService;
    private readonly ILogger<AthleteDailyLogsController> _logger;

    public AthleteDailyLogsController(AppDbContext db, AthleteStatusService statusService, ILogger<AthleteDailyLogsController> logger)
    {
        _db            = db;
        _statusService = statusService;
        _logger        = logger;
    }

    /// <summary>Registra el estado diario del atleta autenticado.</summary>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDailyLogDto dto)
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId)
            ?? throw new NotFoundException("Perfil de atleta no encontrado.");

        var log = new AthleteDailyLogs
        {
            AthleteId    = athlete.Id,
            EnergyLevel  = dto.EnergyLevel,
            FatigueLevel = dto.FatigueLevel,
            SleepHours   = dto.SleepHours,
            Notes        = dto.Notes,
            PainNotes    = dto.PainNotes,
            MentalState  = dto.MentalState,
            CreatedAt    = DateTime.UtcNow,
        };

        _db.AthleteDailyLogs.Add(log);
        await _db.SaveChangesAsync();

        // Recalcular status con los nuevos datos subjetivos
        var athleteId = athlete.Id;
        _ = Task.Run(async () =>
        {
            try   { await _statusService.RecalculateAsync(athleteId); }
            catch (Exception ex) { _logger.LogError(ex, "Error recalculando AthleteStatus para atleta {AthleteId}", athleteId); }
        });

        var response = ToDto(log);
        return CreatedAtAction(nameof(GetHistory), new { athleteId = log.AthleteId }, response);
    }

    /// <summary>Historial de logs diarios del atleta (últimos 30, paginado).</summary>
    [Authorize]
    [HttpGet("{athleteId:int}")]
    public async Task<IActionResult> GetHistory(int athleteId, [FromQuery] int skip = 0)
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.Id == athleteId)
            ?? throw new NotFoundException("Atleta no encontrado.");

        // Solo el propio atleta o un admin del mismo box puede ver el historial
        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        if (athlete.UserId != userId && (user.Role != "admin" || athlete.BoxId != user.BoxId))
            throw new ForbiddenException("No tenés acceso al historial de este atleta.");

        var logs = await _db.AthleteDailyLogs
            .Where(l => l.AthleteId == athleteId)
            .OrderByDescending(l => l.CreatedAt)
            .Skip(skip)
            .Take(30)
            .Select(l => ToDto(l))
            .ToListAsync();

        return Ok(logs);
    }

    /// <summary>Log de hoy del atleta autenticado (si existe).</summary>
    [Authorize]
    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId)
            ?? throw new NotFoundException("Perfil de atleta no encontrado.");

        var today = DateTime.UtcNow.Date;
        var log   = await _db.AthleteDailyLogs
            .Where(l => l.AthleteId == athlete.Id && l.CreatedAt.Date == today)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync();

        return log is null ? NoContent() : Ok(ToDto(log));
    }

    private static DailyLogResponseDto ToDto(AthleteDailyLogs l) => new(
        l.Id, l.AthleteId, l.EnergyLevel, l.FatigueLevel,
        l.SleepHours, l.Notes, l.PainNotes, l.MentalState, l.CreatedAt);

    private int GetUserId() => int.Parse(User.FindFirst("user_id")!.Value);
}
