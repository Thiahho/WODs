using CrossFitWOD.DTOs.WorkoutSession;
using CrossFitWOD.Entities;
using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/workoutsessions")]
public class WorkoutSessionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkoutSessionsController(AppDbContext db) => _db = db;

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSessionDto dto)
    {
        var boxIdClaim = User.FindFirst("box_id")?.Value;

        var session = new WorkoutSession
        {
            WodId = dto.WodId,
            Date  = dto.Date,
            BoxId = Guid.Parse(boxIdClaim)
        };
        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetToday), new { }, session);
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var session = await _db.WorkoutSessions
            .IgnoreQueryFilters()
            .Include(s => s.Wod).ThenInclude(w => w.Exercises)
            .FirstOrDefaultAsync(s => s.Date == today);

        return session is null ? NotFound(new { error = "No hay WOD para hoy" }) : Ok(session);
    }
}
