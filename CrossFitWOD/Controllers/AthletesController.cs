using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/athletes")]
public class AthletesController : ControllerBase
{
    private readonly AppDbContext _db;

    public AthletesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var athletes = await _db.Athletes
            .IgnoreQueryFilters()
            .ToListAsync();
        return Ok(athletes);
    }
}
