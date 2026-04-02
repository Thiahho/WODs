using System.Text.Json.Serialization;

namespace CrossFitWOD.DTOs.Auth;

public record LoginDto(
    [property: JsonPropertyName("username")] string Username,
    [property: JsonPropertyName("password")] string Password
);
