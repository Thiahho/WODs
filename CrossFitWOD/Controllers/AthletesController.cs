using CrossFitWOD.DTOs.Athlete;
using CrossFitWOD.DTOs.AthleteWod;
using CrossFitWOD.Entities;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BC = BCrypt.Net.BCrypt;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/athletes")]
public class AthletesController : ControllerBase
{
    private readonly AppDbContext _db;

    public AthletesController(AppDbContext db) => _db = db;

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var user   = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var athletes = await _db.Athletes
            .Where(a => a.BoxId == user.BoxId)
            .Select(a => new AthleteListItemDto(
                a.Id,
                a.Name,
                a.Level.ToString(),
                a.AthleteWorkouts
                    .OrderByDescending(aw => aw.WorkoutSession.Date)
                    .Select(aw => (float?)aw.ScaledRepsFactor)
                    .FirstOrDefault(),
                a.AthleteWorkouts
                    .Where(aw => aw.Result != null)
                    .OrderByDescending(aw => aw.WorkoutSession.Date)
                    .Select(aw => aw.WorkoutSession.Date.ToString("yyyy-MM-dd"))
                    .FirstOrDefault(),
                a.AthleteWorkouts
                    .Where(aw => aw.Result != null)
                    .OrderByDescending(aw => aw.WorkoutSession.Date)
                    .Select(aw => (int?)aw.Result!.Rpe)
                    .FirstOrDefault(),
                a.AthleteWorkouts
                    .Where(aw => aw.Result != null)
                    .OrderByDescending(aw => aw.WorkoutSession.Date)
                    .Select(aw => (bool?)aw.Result!.Completed)
                    .FirstOrDefault()
            ))
            .ToListAsync();

        return Ok(athletes);
    }

    [Authorize]
    [HttpGet("{id:int}/history")]
    public async Task<IActionResult> GetHistory(int id, [FromQuery] int skip = 0)
    {
        var userId  = GetUserId();
        var user    = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new NotFoundException("Atleta no encontrado.");

        if (athlete.BoxId != user.BoxId)
            throw new ForbiddenException("No tenés acceso al historial de este atleta.");

        const int pageSize = 20;

        var entries = await _db.AthleteWorkouts
            .Where(aw => aw.AthleteId == id && aw.Result != null)
            .Include(aw => aw.Result)
            .Include(aw => aw.WorkoutSession).ThenInclude(s => s.Wod)
            .OrderByDescending(aw => aw.WorkoutSession.Date)
            .Skip(skip)
            .Take(pageSize)
            .Select(aw => new HistoryEntryDto(
                aw.WorkoutSession.Date.ToString("yyyy-MM-dd"),
                aw.WorkoutSession.Wod.Title,
                aw.WorkoutSession.Wod.Type.ToString(),
                aw.ScaledRepsFactor,
                aw.Result!.Completed,
                aw.Result!.TimeSeconds,
                aw.Result!.Rounds,
                aw.Result!.Rpe
            ))
            .ToListAsync();

        return Ok(entries);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId);
        return athlete is null
            ? NotFound(new { error = "Perfil de atleta no encontrado" })
            : Ok(athlete);
    }

    [Authorize]
    [HttpPost("me")]
    public async Task<IActionResult> CreateMe([FromBody] CreateAthleteDto dto)
    {
        var userId = GetUserId();

        if (await _db.Athletes.AnyAsync(a => a.UserId == userId))
            return Conflict(new { error = "Ya tenés un perfil de atleta" });

        var user = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var athlete = new Athlete
        {
            UserId                 = userId,
            BoxId                  = user.BoxId,
            Name                   = dto.Name,
            Level                  = dto.Level,
            Goal                   = dto.Goal,
            Weight                 = dto.Weight,
            DaysPerWeek            = dto.DaysPerWeek,
            SessionDurationMinutes = dto.SessionDurationMinutes,
            Equipment              = dto.Equipment,
            WeakPoints             = dto.WeakPoints,
            InjuryHistory          = dto.InjuryHistory,
            CommitmentLevel        = dto.CommitmentLevel,
        };
        _db.Athletes.Add(athlete);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMe), athlete);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] CreateAthleteDto dto)
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId)
            ?? throw new NotFoundException("Perfil de atleta no encontrado.");

        athlete.Name                   = dto.Name;
        athlete.Level                  = dto.Level;
        athlete.Goal                   = dto.Goal;
        athlete.Weight                 = dto.Weight;
        athlete.DaysPerWeek            = dto.DaysPerWeek;
        athlete.SessionDurationMinutes = dto.SessionDurationMinutes;
        athlete.Equipment              = dto.Equipment ?? string.Empty;
        athlete.WeakPoints             = dto.WeakPoints ?? string.Empty;
        athlete.InjuryHistory          = dto.InjuryHistory;
        athlete.CommitmentLevel        = dto.CommitmentLevel;

        await _db.SaveChangesAsync();
        return Ok(new { athlete.Id, athlete.Name, athlete.Level, athlete.Goal });
    }

    [Authorize(Roles = "admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateById(int id, [FromBody] CreateAthleteDto dto)
    {
        var coachId = GetUserId();
        var coach   = await _db.Users.FindAsync(coachId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new NotFoundException("Atleta no encontrado.");

        if (athlete.BoxId != coach.BoxId)
            throw new ForbiddenException("No tenés acceso a este atleta.");

        athlete.Name                   = dto.Name;
        athlete.Level                  = dto.Level;
        athlete.Goal                   = dto.Goal;
        athlete.Weight                 = dto.Weight;
        athlete.DaysPerWeek            = dto.DaysPerWeek;
        athlete.SessionDurationMinutes = dto.SessionDurationMinutes;
        athlete.Equipment              = dto.Equipment ?? string.Empty;
        athlete.WeakPoints             = dto.WeakPoints ?? string.Empty;
        athlete.InjuryHistory          = dto.InjuryHistory;
        athlete.CommitmentLevel        = dto.CommitmentLevel;

        await _db.SaveChangesAsync();
        return Ok(new { athlete.Id, athlete.Name, athlete.Level, athlete.Goal });
    }

    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAthleteByCoachDto dto)
    {
        var coachId = GetUserId();
        var coach   = await _db.Users.FindAsync(coachId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return Conflict(new { error = "El nombre de usuario ya está en uso." });

        var user = new User
        {
            Username     = dto.Username,
            PasswordHash = BC.HashPassword(dto.Password),
            Role         = "athlete",
            BoxId        = coach.BoxId,
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var athlete = new Athlete
        {
            UserId = user.Id,
            BoxId  = coach.BoxId,
            Name   = dto.Name,
            Level  = dto.Level,
            Goal   = dto.Goal,
            Weight = dto.Weight,
        };
        _db.Athletes.Add(athlete);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = athlete.Id }, new { athlete.Id, athlete.Name });
    }

    private int GetUserId() => int.Parse(User.FindFirst("user_id")!.Value);
}
