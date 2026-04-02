using CrossFitWOD.DTOs.AthleteWod;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using CrossFitWOD.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/athlete-workouts")]
public class AthleteWorkoutsController : ControllerBase
{
    private readonly AthleteWorkoutService _service;
    private readonly AppDbContext          _db;

    public AthleteWorkoutsController(AthleteWorkoutService service, AppDbContext db)
    {
        _service = service;
        _db      = db;
    }

    [Authorize]
    [HttpGet("today/me")]
    public async Task<IActionResult> GetTodayMe()
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId)
            ?? throw new NotFoundException("Perfil de atleta no encontrado. Creá tu perfil primero.");

        var result = await _service.GetTodayAsync(athlete.Id);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int skip = 0)
    {
        var userId  = GetUserId();
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.UserId == userId)
            ?? throw new NotFoundException("Perfil de atleta no encontrado.");

        const int pageSize = 10;

        var entries = await _db.AthleteWorkouts
            .Where(aw => aw.AthleteId == athlete.Id && aw.Result != null)
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

    private int GetUserId() => int.Parse(User.FindFirst("user_id")!.Value);
}
