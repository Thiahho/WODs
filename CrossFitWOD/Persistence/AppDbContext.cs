using CrossFitWOD.Entities;
using Microsoft.EntityFrameworkCore;

namespace CrossFitWOD.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Box>     Boxes    => Set<Box>();
    public DbSet<User>    Users    => Set<User>();
    public DbSet<Athlete> Athletes => Set<Athlete>();
    public DbSet<Wod> Wods => Set<Wod>();
    public DbSet<WodExercise> WodExercises => Set<WodExercise>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<AthleteWorkout> AthleteWorkouts => Set<AthleteWorkout>();
    public DbSet<WorkoutResult> WorkoutResults => Set<WorkoutResult>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ── Soft delete ──────────────────────────────────────────────────
        b.Entity<Wod>().HasQueryFilter(w => !w.IsDeleted);

        // ── Box → User / Athlete / WorkoutSession ─────────────────────────
        b.Entity<User>()
            .HasOne(u => u.Box)
            .WithMany(bx => bx.Users)
            .HasForeignKey(u => u.BoxId);

        b.Entity<Athlete>()
            .HasOne(a => a.Box)
            .WithMany(bx => bx.Athletes)
            .HasForeignKey(a => a.BoxId);

        b.Entity<WorkoutSession>()
            .HasOne(s => s.Box)
            .WithMany()
            .HasForeignKey(s => s.BoxId);

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

        // ── Relación User → Athlete ──────────────────────────────────────
        b.Entity<Athlete>()
            .HasOne(a => a.User)
            .WithOne()
            .HasForeignKey<Athlete>(a => a.UserId);

        // ── Índices ──────────────────────────────────────────────────────
        b.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        b.Entity<Athlete>()
            .HasIndex(a => a.UserId)
            .IsUnique();

        // Una sesión por box por día (reemplaza el unique en Date solo)
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
