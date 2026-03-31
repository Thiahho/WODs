using CrossFitWOD.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Persistence;

public class AppDbContext : DbContext
{
    private readonly Guid _boxId;

    public AppDbContext(DbContextOptions<AppDbContext> options, IHttpContextAccessor accessor)
        : base(options)
    {
        var claim = accessor.HttpContext?.User.FindFirst("box_id")?.Value;
        _boxId = claim is not null ? Guid.Parse(claim) : Guid.Empty;
    }

    public DbSet<Athlete>        Athletes        => Set<Athlete>();
    public DbSet<Wod>            Wods            => Set<Wod>();
    public DbSet<WodExercise>    WodExercises    => Set<WodExercise>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<AthleteWorkout> AthleteWorkouts => Set<AthleteWorkout>();
    public DbSet<WorkoutResult>  WorkoutResults  => Set<WorkoutResult>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ── Global Query Filters (multi-tenancy automático) ──────────────
        b.Entity<Athlete>()       .HasQueryFilter(x => x.BoxId == _boxId);
        b.Entity<Wod>()           .HasQueryFilter(x => x.BoxId == _boxId);
        b.Entity<WorkoutSession>().HasQueryFilter(x => x.BoxId == _boxId);
        b.Entity<AthleteWorkout>().HasQueryFilter(x => x.BoxId == _boxId);
        b.Entity<WorkoutResult>() .HasQueryFilter(x => x.BoxId == _boxId);

        // ── Relaciones ───────────────────────────────────────────────────
        b.Entity<Wod>()
            .HasMany(w => w.Exercises)
            .WithOne(e => e.Wod)
            .HasForeignKey(e => e.WodId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<WorkoutSession>()
            .HasMany(s => s.AthleteWorkouts)
            .WithOne(a => a.WorkoutSession)
            .HasForeignKey(a => a.WorkoutSessionId);

        b.Entity<AthleteWorkout>()
            .HasOne(a => a.Result)
            .WithOne(r => r.AthleteWorkout)
            .HasForeignKey<WorkoutResult>(r => r.AthleteWorkoutId);

        // ── Índices ──────────────────────────────────────────────────────
        b.Entity<WorkoutSession>()
            .HasIndex(s => new { s.BoxId, s.Date })
            .IsUnique();

        b.Entity<AthleteWorkout>()
            .HasIndex(a => new { a.AthleteId, a.WorkoutSessionId })
            .IsUnique();

        b.Entity<WorkoutResult>()
            .HasIndex(r => r.AthleteWorkoutId)
            .IsUnique();
    }
}
