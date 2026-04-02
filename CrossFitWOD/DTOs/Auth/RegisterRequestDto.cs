using System.Text.Json.Serialization;

namespace CrossFitWOD.DTOs.Auth;

public record RegisterRequest(string Username, string Password, bool IsCoach = false);
