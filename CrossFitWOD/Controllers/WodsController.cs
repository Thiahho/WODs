using CrossFitWOD.DTOs.Wod;
using CrossFitWOD.Entities;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/wods")]
public class WodsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WodsController(AppDbContext db) => _db = db;

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var wods = await _db.Wods
            .Include(w => w.Exercises)
            .ToListAsync();
        return Ok(wods);
    }

    [Authorize(Roles ="admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWodDto dto)
    {
        var wod = new Wod
        {
            Title           = dto.Title,
            Description     = dto.Description,
            Type            = dto.Type,
            DurationMinutes = dto.DurationMinutes,
            Exercises       = dto.Exercises.Select(e => new WodExercise
            {
                Name  = e.Name,
                Reps  = e.Reps,
                Order = e.Order
            }).ToList()
        };
        _db.Wods.Add(wod);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = wod.Id }, wod);
    }

    [Authorize(Roles ="admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateWodDto dto)
    {
        var wod = await _db.Wods
            .Include(w => w.Exercises)
            .FirstOrDefaultAsync(w => w.Id == id)
            ?? throw new NotFoundException("WOD no encontrado.");

        wod.Title           = dto.Title;
        wod.Description     = dto.Description;
        wod.Type            = dto.Type;
        wod.DurationMinutes = dto.DurationMinutes;

        // Reemplazar ejercicios
        _db.WodExercises.RemoveRange(wod.Exercises);
        wod.Exercises = dto.Exercises.Select(e => new WodExercise
        {
            Name  = e.Name,
            Reps  = e.Reps,
            Order = e.Order
        }).ToList();

        await _db.SaveChangesAsync();
        return Ok(wod);
    }

    [Authorize(Roles ="admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var wod = await _db.Wods
            .Include(w => w.WorkoutSessions)
            .FirstOrDefaultAsync(w => w.Id == id)
            ?? throw new NotFoundException("WOD no encontrado.");

        if (wod.WorkoutSessions.Count > 0)
        {
            // Soft delete — tiene sesiones asignadas, preservar historial
            wod.IsDeleted = true;
        }
        else
        {
            // Hard delete — no tiene sesiones, borrar físicamente
            _db.Wods.Remove(wod);
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
