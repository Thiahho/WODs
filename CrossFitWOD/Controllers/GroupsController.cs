using CrossFitWOD.DTOs.Group;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/groups")]
[Authorize(Roles = "admin")]
public class GroupsController : ControllerBase
{
    private readonly AppDbContext _db;
    public GroupsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var boxId = await GetBoxIdAsync();

        var raw = await _db.Groups
            .Where(g => g.BoxId == boxId)
            .Include(g => g.AthleteGroups)
                .ThenInclude(ag => ag.Athlete)
            .OrderBy(g => g.Name)
            .ToListAsync();

        var groups = raw.Select(g => new GroupResponseDto(
            g.Id,
            g.Name,
            g.Description,
            g.CreatedAt,
            g.AthleteGroups.ToList()
                .Where(ag => ag.Athlete is not null)
                .Select(ag => new AthleteInGroupDto(ag.Athlete.Id, ag.Athlete.Name, ag.Athlete.Level.ToString()))
                .OrderBy(a => a.Name)
                .ToList())).ToList();

        return Ok(groups);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGroupDto dto)
    {
        var boxId = await GetBoxIdAsync();

        var group = new Entities.Group
        {
            Name        = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            BoxId       = boxId,
        };
        _db.Groups.Add(group);
        await _db.SaveChangesAsync();

        if (dto.AthleteIds is { Count: > 0 })
        {
            var validIds = await _db.Athletes
                .Where(a => a.BoxId == boxId && dto.AthleteIds.Contains(a.Id))
                .Select(a => a.Id)
                .ToListAsync();

            _db.AthleteGroups.AddRange(validIds.Select(id => new Entities.AthleteGroup
            {
                GroupId   = group.Id,
                AthleteId = id,
            }));
            await _db.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetAll), new GroupResponseDto(group.Id, group.Name, group.Description, group.CreatedAt, []));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGroupDto dto)
    {
        var boxId = await GetBoxIdAsync();
        var group = await _db.Groups.FirstOrDefaultAsync(g => g.Id == id && g.BoxId == boxId)
            ?? throw new NotFoundException("Grupo no encontrado.");

        group.Name        = dto.Name.Trim();
        group.Description = dto.Description?.Trim();
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var boxId = await GetBoxIdAsync();
        var group = await _db.Groups.FirstOrDefaultAsync(g => g.Id == id && g.BoxId == boxId)
            ?? throw new NotFoundException("Grupo no encontrado.");

        _db.Groups.Remove(group);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/athletes/{athleteId:int}")]
    public async Task<IActionResult> AddAthlete(int id, int athleteId)
    {
        var boxId   = await GetBoxIdAsync();
        var group   = await _db.Groups.FirstOrDefaultAsync(g => g.Id == id && g.BoxId == boxId)
            ?? throw new NotFoundException("Grupo no encontrado.");
        var athlete = await _db.Athletes.FirstOrDefaultAsync(a => a.Id == athleteId && a.BoxId == boxId)
            ?? throw new NotFoundException("Atleta no encontrado.");

        _db.AthleteGroups.Add(new Entities.AthleteGroup { GroupId = id, AthleteId = athleteId });
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
        {
            // Ya estaba en el grupo — idempotente, ignorar
        }
        return NoContent();
    }

    [HttpDelete("{id:int}/athletes/{athleteId:int}")]
    public async Task<IActionResult> RemoveAthlete(int id, int athleteId)
    {
        var boxId = await GetBoxIdAsync();
        _ = await _db.Groups.FirstOrDefaultAsync(g => g.Id == id && g.BoxId == boxId)
            ?? throw new NotFoundException("Grupo no encontrado.");

        var link = await _db.AthleteGroups.FirstOrDefaultAsync(ag => ag.GroupId == id && ag.AthleteId == athleteId);
        if (link is not null)
        {
            _db.AthleteGroups.Remove(link);
            await _db.SaveChangesAsync();
        }
        return NoContent();
    }

    private async Task<int> GetBoxIdAsync()
    {
        var userId = int.Parse(User.FindFirst("user_id")!.Value);
        var user   = await _db.Users.FindAsync(userId)
            ?? throw new NotFoundException("Usuario no encontrado.");
        return user.BoxId;
    }
}
