using CrossFitWOD.DTOs.AthleteWod;
using CrossFitWOD.DTOs.Auth;
using CrossFitWOD.Entities;
using CrossFitWOD.Enums;
using CrossFitWOD.Exceptions;
using CrossFitWOD.Persistence;
using BC = BCrypt.Net.BCrypt;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Services;

public class AuthService
{
    private readonly AppDbContext _db;

    public AuthService(AppDbContext db) => _db= db;

    public async Task<AuthResponse> RegistroAsync(RegisterRequest request)
    {
        var existe = await _db.Users.AnyAsync(u => u.Username == request.Username);
        if (existe)
            throw new InvalidOperationException("El usuario ya existe.");

        // Box personal automático
        var baseSlug = request.Username.ToLower()
            .Replace(" ", "-")
            .Replace("_", "-");

        var slug = baseSlug;
        var suffix = 1;
        while (await _db.Boxes.AnyAsync(b => b.Slug == slug))
            slug = $"{baseSlug}-{suffix++}";

        var box = new Box
        {
            Name         = request.Username,
            Slug         = slug,
            IsIndividual = !request.IsCoach,
            TrialEndsAt  = DateTime.UtcNow.AddDays(30)
        };
        _db.Boxes.Add(box);
        await _db.SaveChangesAsync();

        var hora = DateTime.UtcNow;

        var user = new User
        {
            Username     = request.Username,
            PasswordHash = BC.HashPassword(request.Password, workFactor: 12),
            CreatedAt    = hora,
            Role         = request.IsCoach ? "admin" : "athlete",
            BoxId        = box.Id
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse(user.Id, user.Username);
    }
   
}
