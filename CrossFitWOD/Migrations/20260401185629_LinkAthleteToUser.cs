using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrossFitWOD.Migrations
{
    /// <inheritdoc />
    public partial class LinkAthleteToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Athletes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Athletes_UserId",
                table: "Athletes",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Athletes_Users_UserId",
                table: "Athletes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Athletes_Users_UserId",
                table: "Athletes");

            migrationBuilder.DropIndex(
                name: "IX_Athletes_UserId",
                table: "Athletes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Athletes");
        }
    }
}
