using CrossFitWOD.Middleware;
using CrossFitWOD.Services;
using CrossFitWOD.Persistence;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ── Database ─────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// ── Application services ──────────────────────────────────────────────────────
builder.Services.AddScoped<AthleteWorkoutService>();
builder.Services.AddScoped<WorkoutResultService>();
builder.Services.AddScoped<WodGeneratorService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AiWodService>();
builder.Services.AddScoped<AthleteStatusService>();
builder.Services.AddHttpClient("openai");

// ── Authentication / JWT ──────────────────────────────────────────────────────
var jwtSecret  = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is not configured.");
var jwtIssuer   = builder.Configuration["Jwt:Issuer"]   ?? "CrossFitWOD";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "CrossFitWOD";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer          = true,
            ValidIssuer             = jwtIssuer,
            ValidateAudience        = true,
            ValidAudience           = jwtAudience,
            ValidateLifetime        = true,
            ClockSkew               = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ── Validation ────────────────────────────────────────────────────────────────
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// ── Rate limiting ─────────────────────────────────────────────────────────────
builder.Services.AddRateLimiter(opts =>
{
    opts.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit    = 60,
                Window         = TimeSpan.FromMinutes(1),
                QueueLimit     = 0
            }));
    opts.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ── MVC + Swagger ─────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.ReferenceHandler =
        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CrossFitWOD API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In          = ParameterLocation.Header,
        Description = "JWT — introduce tu token (sin prefijo 'Bearer ')",
        Name        = "Authorization",
        Type        = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme      = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                    { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ── CORS ──────────────────────────────────────────────────────────────────────
var corsOrigins = (builder.Configuration["Cors:Origins"] ?? "http://localhost:3000")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(opt => opt.AddPolicy("dev", p =>
    p.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod()));

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// Auto-aplica migraciones pendientes al arrancar (seguro: idempotente)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("dev");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();
