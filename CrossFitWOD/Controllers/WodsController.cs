using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/wods")]
public class WodsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WodsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var wods = await _db.Wods
            .IgnoreQueryFilters()
            .Include(w => w.Exercises)
            .ToListAsync();
        return Ok(wods);
    }
}
