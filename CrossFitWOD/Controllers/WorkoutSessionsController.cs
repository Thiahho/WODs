using CrossFitWOD.DTOs.WorkoutSession;
using CrossFitWOD.Entities;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/workoutsessions")]
public class WorkoutSessionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkoutSessionsController(AppDbContext db) => _db = db;

    [Authorize(Roles ="admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSessionDto dto)
    {
        var userId  = int.Parse(User.FindFirstValue("user_id")!);
        var user    = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var existing = await _db.WorkoutSessions
            .FirstOrDefaultAsync(s => s.BoxId == user.BoxId && s.Date == dto.Date);

        if (existing is not null)
        {
            existing.WodId = dto.WodId;
            await _db.SaveChangesAsync();
            return Ok(new { existing.Id, existing.WodId, existing.Date });
        }

        var session = new WorkoutSession
        {
            WodId = dto.WodId,
            BoxId = user.BoxId,
            Date  = dto.Date,
        };
        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetToday), new { }, new { session.Id, session.WodId, session.Date });
    }

    [Authorize]
    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var userId  = int.Parse(User.FindFirstValue("user_id")!);
        var user    = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var today   = DateOnly.FromDateTime(DateTime.UtcNow);
        var session = await _db.WorkoutSessions
            .Include(s => s.Wod).ThenInclude(w => w.Exercises)
            .FirstOrDefaultAsync(s => s.BoxId == user.BoxId && s.Date == today);

        if (session is null) return NotFound(new { error = "No hay WOD para hoy" });

        return Ok(new
        {
            session.Id,
            session.Date,
            wod = new { session.Wod.Id, session.Wod.Title, session.Wod.Type, session.Wod.DurationMinutes }
        });
    }
}
