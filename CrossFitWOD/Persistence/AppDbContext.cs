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
    public DbSet<WorkoutResult>   WorkoutResults  => Set<WorkoutResult>();
    public DbSet<AthleteDailyLogs> AthleteDailyLogs => Set<AthleteDailyLogs>();
    public DbSet<AthleteStates>    AthleteStates    => Set<AthleteStates>();
    public DbSet<AthleteStatus>    AthleteStatuses  => Set<AthleteStatus>();
    public DbSet<Group>            Groups           => Set<Group>();
    public DbSet<AthleteGroup>     AthleteGroups    => Set<AthleteGroup>();

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

        // ── AthleteDailyLogs ─────────────────────────────────────────────
        b.Entity<AthleteDailyLogs>()
            .HasOne(d => d.Athlete)
            .WithMany(a => a.DailyLogs)
            .HasForeignKey(d => d.AthleteId);

        // ── AthleteStates ────────────────────────────────────────────────
        b.Entity<AthleteStates>()
            .HasOne(s => s.Athlete)
            .WithMany(a => a.PhysicalLogs)
            .HasForeignKey(s => s.AthleteId);

        // ── AthleteStatus ────────────────────────────────────────────────
        b.Entity<AthleteStatus>()
            .HasOne(s => s.Athlete)
            .WithMany(a => a.Statuses)
            .HasForeignKey(s => s.AthleteId);

        // ── Groups ───────────────────────────────────────────────────────
        b.Entity<Group>()
            .HasOne(g => g.Box)
            .WithMany()
            .HasForeignKey(g => g.BoxId);

        b.Entity<AthleteGroup>()
            .HasKey(ag => new { ag.GroupId, ag.AthleteId });

        b.Entity<AthleteGroup>()
            .HasOne(ag => ag.Group)
            .WithMany(g => g.AthleteGroups)
            .HasForeignKey(ag => ag.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<AthleteGroup>()
            .HasOne(ag => ag.Athlete)
            .WithMany(a => a.AthleteGroups)
            .HasForeignKey(ag => ag.AthleteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
