using CrossFitWOD.DTOs.AthleteStatus;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/athlete-status")]
public class AthleteStatusController : ControllerBase
{
    private readonly AppDbContext _db;

    public AthleteStatusController(AppDbContext db) => _db = db;

    /// <summary>Estado calculado más reciente del atleta autenticado.</summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId)
            ?? throw new NotFoundException("Perfil de atleta no encontrado.");

        var status = await _db.AthleteStatuses
            .Where(s => s.AthleteId == athlete.Id)
            .OrderByDescending(s => s.UpdatedAt)
            .FirstOrDefaultAsync();

        return status is null ? NoContent() : Ok(ToDto(status));
    }

    /// <summary>Estado calculado más reciente de un atleta (solo admin del mismo box).</summary>
    [Authorize(Roles = "admin")]
    [HttpGet("{athleteId:int}")]
    public async Task<IActionResult> GetByAthlete(int athleteId)
    {
        var coachId = GetUserId();
        var coach   = await _db.Users.FindAsync(coachId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.Id == athleteId)
            ?? throw new NotFoundException("Atleta no encontrado.");

        if (athlete.BoxId != coach.BoxId)
            throw new ForbiddenException("No tenés acceso a este atleta.");

        var status = await _db.AthleteStatuses
            .Where(s => s.AthleteId == athleteId)
            .OrderByDescending(s => s.UpdatedAt)
            .FirstOrDefaultAsync();

        return status is null ? NoContent() : Ok(ToDto(status));
    }

    private static AthleteStatusResponseDto ToDto(Entities.AthleteStatus s) => new(
        s.Id, s.AthleteId, s.FitnessLevel, s.FatigueLevel, s.RecoveryScore,
        s.PerformanceTrend, s.LastPerformanceScore, s.AcuteLoad, s.ChronicLoad,
        s.LoadRatio, s.Readiness, s.InjuryRisk, s.UpdatedAt);

    private int GetUserId() => int.Parse(User.FindFirst("user_id")!.Value);
}
