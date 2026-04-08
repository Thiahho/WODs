using BC = BCrypt.Net.BCrypt;
using CrossFitWOD.DTOs.Auth;
using CrossFitWOD.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CrossFitWOD.Services;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext  _db;
    private readonly AuthService _auth;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config, AuthService authService)
    {
        _db     = db;
        _config = config;
        _auth = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user is null || !BC.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { error = "Credenciales inválidas" });

        var secret   = _config["Jwt:Secret"]!;
        var issuer   = _config["Jwt:Issuer"]   ?? "CrossFitWOD";
        var audience = _config["Jwt:Audience"] ?? "CrossFitWOD";
        var expiry   = int.TryParse(_config["Jwt:ExpiryMinutes"], out var m) ? m : 1440;

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             [
                new Claim("user_id",         user.Id.ToString()),
                new Claim(ClaimTypes.Role,   user.Role),
            ],
            expires:            DateTime.UtcNow.AddMinutes(expiry),
            signingCredentials: creds
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            role  = user.Role,
        });
    }

    [HttpPut("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirst("user_id")!.Value);
        var user   = await _db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        if (!BC.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { error = "Contraseña actual incorrecta" });

        user.PasswordHash = BC.HashPassword(dto.NewPassword, workFactor: 12);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("registro")]
    public async Task<IActionResult> Registro([FromBody] RegisterRequest request)
    {
        if(string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Username y contraseña son requeridos.");

        try
        {
            var result = await _auth.RegistroAsync(request);
            return CreatedAtAction(nameof(Registro), result);
        }
        catch(InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }


}
