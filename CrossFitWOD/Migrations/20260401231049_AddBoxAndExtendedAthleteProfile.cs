using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CrossFitWOD.Migrations
{
    /// <inheritdoc />
    public partial class AddBoxAndExtendedAthleteProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WorkoutSessions_Date",
                table: "WorkoutSessions");

            migrationBuilder.AddColumn<int>(
                name: "BoxId",
                table: "WorkoutSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BoxId",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BoxId",
                table: "Athletes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DaysPerWeek",
                table: "Athletes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Equipment",
                table: "Athletes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SessionDurationMinutes",
                table: "Athletes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "WeakPoints",
                table: "Athletes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Boxes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    IsIndividual = table.Column<bool>(type: "boolean", nullable: false),
                    SubscriptionStatus = table.Column<string>(type: "text", nullable: false),
                    TrialEndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SubscriptionEndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Boxes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessions_BoxId_Date",
                table: "WorkoutSessions",
                columns: new[] { "BoxId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_BoxId",
                table: "Users",
                column: "BoxId");

            migrationBuilder.CreateIndex(
                name: "IX_Athletes_BoxId",
                table: "Athletes",
                column: "BoxId");

            migrationBuilder.AddForeignKey(
                name: "FK_Athletes_Boxes_BoxId",
                table: "Athletes",
                column: "BoxId",
                principalTable: "Boxes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Boxes_BoxId",
                table: "Users",
                column: "BoxId",
                principalTable: "Boxes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_Boxes_BoxId",
                table: "WorkoutSessions",
                column: "BoxId",
                principalTable: "Boxes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Athletes_Boxes_BoxId",
                table: "Athletes");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Boxes_BoxId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_Boxes_BoxId",
                table: "WorkoutSessions");

            migrationBuilder.DropTable(
                name: "Boxes");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutSessions_BoxId_Date",
                table: "WorkoutSessions");

            migrationBuilder.DropIndex(
                name: "IX_Users_BoxId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Athletes_BoxId",
                table: "Athletes");

            migrationBuilder.DropColumn(
                name: "BoxId",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "BoxId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BoxId",
                table: "Athletes");

            migrationBuilder.DropColumn(
                name: "DaysPerWeek",
                table: "Athletes");

            migrationBuilder.DropColumn(
                name: "Equipment",
                table: "Athletes");

            migrationBuilder.DropColumn(
                name: "SessionDurationMinutes",
                table: "Athletes");

            migrationBuilder.DropColumn(
                name: "WeakPoints",
                table: "Athletes");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessions_Date",
                table: "WorkoutSessions",
                column: "Date",
                unique: true);
        }
    }
}
