using CrossFitWOD.DTOs.WorkoutResult;
using CrossFitWOD.Services;
using Microsoft.AspNetCore.Mvc;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/workout-results")]
public class WorkoutResultsController : ControllerBase
{
    private readonly WorkoutResultService _service;

    public WorkoutResultsController(WorkoutResultService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterResultDto dto)
    {
        if (dto.Rpe is < 1 or > 10)
            return BadRequest(new { error = "RPE debe estar entre 1 y 10" });

        var result = await _service.RegisterAsync(dto);
        return CreatedAtAction(nameof(Register), new { id = result.Id }, result);
    }
}
