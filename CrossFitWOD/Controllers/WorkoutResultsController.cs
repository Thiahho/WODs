using CrossFitWOD.DTOs.WorkoutResult;
using CrossFitWOD.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/workout-results")]
[Authorize]
public class WorkoutResultsController : ControllerBase
{
    private readonly WorkoutResultService _service;

    public WorkoutResultsController(WorkoutResultService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterResultDto dto)
    {
        var result = await _service.RegisterAsync(dto);
        return CreatedAtAction(nameof(Register), new { id = result.Id }, result);
    }
}
