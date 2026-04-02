using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrossFitWOD.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Athletes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Weight = table.Column<float>(type: "real", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Athletes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Wods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WodExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    WodId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Reps = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WodExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WodExercises_Wods_WodId",
                        column: x => x.WodId,
                        principalTable: "Wods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    WodId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutSessions_Wods_WodId",
                        column: x => x.WodId,
                        principalTable: "Wods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AthleteWorkouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    AthleteId = table.Column<int>(type: "integer", nullable: false),
                    WorkoutSessionId = table.Column<int>(type: "integer", nullable: false),
                    ScaledRepsFactor = table.Column<float>(type: "real", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AthleteWorkouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AthleteWorkouts_Athletes_AthleteId",
                        column: x => x.AthleteId,
                        principalTable: "Athletes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AthleteWorkouts_WorkoutSessions_WorkoutSessionId",
                        column: x => x.WorkoutSessionId,
                        principalTable: "WorkoutSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    AthleteWorkoutId = table.Column<int>(type: "integer", nullable: false),
                    Completed = table.Column<bool>(type: "boolean", nullable: false),
                    TimeSeconds = table.Column<int>(type: "integer", nullable: true),
                    Rounds = table.Column<float>(type: "real", nullable: true),
                    Rpe = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutResults_AthleteWorkouts_AthleteWorkoutId",
                        column: x => x.AthleteWorkoutId,
                        principalTable: "AthleteWorkouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AthleteWorkouts_AthleteId_WorkoutSessionId",
                table: "AthleteWorkouts",
                columns: new[] { "AthleteId", "WorkoutSessionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AthleteWorkouts_WorkoutSessionId",
                table: "AthleteWorkouts",
                column: "WorkoutSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_WodExercises_WodId",
                table: "WodExercises",
                column: "WodId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutResults_AthleteWorkoutId",
                table: "WorkoutResults",
                column: "AthleteWorkoutId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessions_WodId",
                table: "WorkoutSessions",
                column: "WodId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WodExercises");

            migrationBuilder.DropTable(
                name: "WorkoutResults");

            migrationBuilder.DropTable(
                name: "AthleteWorkouts");

            migrationBuilder.DropTable(
                name: "Athletes");

            migrationBuilder.DropTable(
                name: "WorkoutSessions");

            migrationBuilder.DropTable(
                name: "Wods");
        }
    }
}
