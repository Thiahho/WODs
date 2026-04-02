using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CrossFitWOD.Migrations
{
    /// <inheritdoc />
    public partial class AddWodSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Wods",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Wods");
        }
    }
}
