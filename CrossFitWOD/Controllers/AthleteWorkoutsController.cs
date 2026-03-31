using CrossFitWOD.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/athlete-workouts")]
[Authorize]
public class AthleteWorkoutsController : ControllerBase
{
    private readonly AthleteWorkoutService _service;

    public AthleteWorkoutsController(AthleteWorkoutService service) => _service = service;

    [HttpGet("today/{athleteId:guid}")]
    public async Task<IActionResult> GetToday(Guid athleteId)
    {
        var result = await _service.GetTodayAsync(athleteId);
        return Ok(result);
    }
}
