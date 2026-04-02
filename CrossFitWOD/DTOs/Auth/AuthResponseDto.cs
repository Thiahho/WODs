using System.Text.Json.Serialization;

namespace CrossFitWOD.DTOs.Auth;

public record AuthResponse(int Id, string Username);
