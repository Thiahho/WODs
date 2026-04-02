using CrossFitWOD.DTOs.WorkoutResult;
using CrossFitWOD.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/workout-results")]
public class WorkoutResultsController : ControllerBase
{
    private readonly WorkoutResultService _service;

    public WorkoutResultsController(WorkoutResultService service) => _service = service;

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterResultDto dto)
    {
        var userId   = int.Parse(User.FindFirstValue("user_id")!);
        var response = await _service.RegisterAsync(dto, userId);
        return CreatedAtAction(nameof(Register), new { id = response.Id }, response);
    }
}
