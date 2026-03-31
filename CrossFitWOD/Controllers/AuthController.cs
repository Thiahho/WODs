using CrossFitWOD.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CrossFitWOD.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config) => _config = config;

    /// <summary>
    /// Devuelve un JWT con claim box_id. V1: valida contra secretos configurados en appsettings.
    /// </summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        var boxSecrets = _config
            .GetSection("Auth:BoxSecrets")
            .Get<Dictionary<string, string>>() ?? [];

        var boxKey = dto.BoxId.ToString();
        if (!boxSecrets.TryGetValue(boxKey, out var expected) || expected != dto.Secret)
            return Unauthorized(new { error = "Credenciales inválidas" });

        var secret  = _config["Jwt:Secret"]!;
        var issuer  = _config["Jwt:Issuer"] ?? "CrossFitWOD";
        var audience = _config["Jwt:Audience"] ?? "CrossFitWOD";
        var expiry  = int.TryParse(_config["Jwt:ExpiryMinutes"], out var m) ? m : 1440;

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             [new Claim("box_id", boxKey)],
            expires:            DateTime.UtcNow.AddMinutes(expiry),
            signingCredentials: creds
        );

        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
    }
}
