using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrossFitWOD.Migrations
{
    /// <inheritdoc />
    public partial class AddAthleteGoal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Goal",
                table: "Athletes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Goal",
                table: "Athletes");
        }
    }
}
