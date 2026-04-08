using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CrossFitWOD.Migrations
{
    /// <inheritdoc />
    public partial class FixGroupColumnNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Athlete_Box_boxid",
                table: "Athlete");

            migrationBuilder.DropForeignKey(
                name: "FK_Athlete_User_userid",
                table: "Athlete");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteDailyLogs_Athlete_athleteid",
                table: "AthleteDailyLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteStates_Athlete_athleteid",
                table: "AthleteStates");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteStatus_Athlete_athleteid",
                table: "AthleteStatus");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteWorkout_Athlete_athleteid",
                table: "AthleteWorkout");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteWorkout_WorkoutSession_workoutsessionid",
                table: "AthleteWorkout");

            migrationBuilder.DropForeignKey(
                name: "FK_User_Box_boxid",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_WodExercise_Wod_wodid",
                table: "WodExercise");

            migrationBuilder.DropForeignKey(
                name: "FK_workoutresult_AthleteWorkout_athleteworkoutid",
                table: "workoutresult");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSession_Box_boxid",
                table: "WorkoutSession");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSession_Wod_wodid",
                table: "WorkoutSession");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkoutSession",
                table: "WorkoutSession");

            migrationBuilder.DropPrimaryKey(
                name: "PK_workoutresult",
                table: "workoutresult");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WodExercise",
                table: "WodExercise");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Wod",
                table: "Wod");

            migrationBuilder.DropPrimaryKey(
                name: "PK_User",
                table: "User");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Box",
                table: "Box");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AthleteWorkout",
                table: "AthleteWorkout");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Athlete",
                table: "Athlete");

            migrationBuilder.RenameTable(
                name: "WorkoutSession",
                newName: "WorkoutSessions");

            migrationBuilder.RenameTable(
                name: "workoutresult",
                newName: "WorkoutResults");

            migrationBuilder.RenameTable(
                name: "WodExercise",
                newName: "WodExercises");

            migrationBuilder.RenameTable(
                name: "Wod",
                newName: "Wods");

            migrationBuilder.RenameTable(
                name: "User",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "Box",
                newName: "Boxes");

            migrationBuilder.RenameTable(
                name: "AthleteWorkout",
                newName: "AthleteWorkouts");

            migrationBuilder.RenameTable(
                name: "Athlete",
                newName: "Athletes");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutSession_wodid",
                table: "WorkoutSessions",
                newName: "IX_WorkoutSessions_wodid");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutSession_boxid_date",
                table: "WorkoutSessions",
                newName: "IX_WorkoutSessions_boxid_date");

            migrationBuilder.RenameColumn(
                name: "timesecords",
                table: "WorkoutResults",
                newName: "timeseconds");

            migrationBuilder.RenameColumn(
                name: "durationsecords",
                table: "WorkoutResults",
                newName: "durationseconds");

            migrationBuilder.RenameIndex(
                name: "IX_workoutresult_athleteworkoutid",
                table: "WorkoutResults",
                newName: "IX_WorkoutResults_athleteworkoutid");

            migrationBuilder.RenameIndex(
                name: "IX_WodExercise_wodid",
                table: "WodExercises",
                newName: "IX_WodExercises_wodid");

            migrationBuilder.RenameColumn(
                name: "tittle",
                table: "Wods",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "iddeleted",
                table: "Wods",
                newName: "isdeleted");

            migrationBuilder.RenameIndex(
                name: "IX_User_username",
                table: "Users",
                newName: "IX_Users_username");

            migrationBuilder.RenameIndex(
                name: "IX_User_boxid",
                table: "Users",
                newName: "IX_Users_boxid");

            migrationBuilder.RenameIndex(
                name: "IX_AthleteWorkout_workoutsessionid",
                table: "AthleteWorkouts",
                newName: "IX_AthleteWorkouts_workoutsessionid");

            migrationBuilder.RenameIndex(
                name: "IX_AthleteWorkout_athleteid_workoutsessionid",
                table: "AthleteWorkouts",
                newName: "IX_AthleteWorkouts_athleteid_workoutsessionid");

            migrationBuilder.RenameColumn(
                name: "Level",
                table: "Athletes",
                newName: "level");

            migrationBuilder.RenameColumn(
                name: "Goal",
                table: "Athletes",
                newName: "goal");

            migrationBuilder.RenameColumn(
                name: "weekpoints",
                table: "Athletes",
                newName: "weakpoints");

            migrationBuilder.RenameIndex(
                name: "IX_Athlete_userid",
                table: "Athletes",
                newName: "IX_Athletes_userid");

            migrationBuilder.RenameIndex(
                name: "IX_Athlete_boxid",
                table: "Athletes",
                newName: "IX_Athletes_boxid");

            migrationBuilder.AddColumn<string>(
                name: "coachnotes",
                table: "Wods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cooldown",
                table: "Wods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isaigenerated",
                table: "Wods",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "metcon",
                table: "Wods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "scaling",
                table: "Wods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "strengthskill",
                table: "Wods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "warmup",
                table: "Wods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "createdat",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkoutSessions",
                table: "WorkoutSessions",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkoutResults",
                table: "WorkoutResults",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WodExercises",
                table: "WodExercises",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Wods",
                table: "Wods",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Boxes",
                table: "Boxes",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AthleteWorkouts",
                table: "AthleteWorkouts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Athletes",
                table: "Athletes",
                column: "id");

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    boxid = table.Column<int>(type: "integer", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.id);
                    table.ForeignKey(
                        name: "FK_Groups_Boxes_boxid",
                        column: x => x.boxid,
                        principalTable: "Boxes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AthleteGroups",
                columns: table => new
                {
                    groupid = table.Column<int>(type: "integer", nullable: false),
                    athleteid = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AthleteGroups", x => new { x.groupid, x.athleteid });
                    table.ForeignKey(
                        name: "FK_AthleteGroups_Athletes_athleteid",
                        column: x => x.athleteid,
                        principalTable: "Athletes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AthleteGroups_Groups_groupid",
                        column: x => x.groupid,
                        principalTable: "Groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AthleteGroups_athleteid",
                table: "AthleteGroups",
                column: "athleteid");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_boxid",
                table: "Groups",
                column: "boxid");

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteDailyLogs_Athletes_athleteid",
                table: "AthleteDailyLogs",
                column: "athleteid",
                principalTable: "Athletes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Athletes_Boxes_boxid",
                table: "Athletes",
                column: "boxid",
                principalTable: "Boxes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Athletes_Users_userid",
                table: "Athletes",
                column: "userid",
                principalTable: "Users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteStates_Athletes_athleteid",
                table: "AthleteStates",
                column: "athleteid",
                principalTable: "Athletes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteStatus_Athletes_athleteid",
                table: "AthleteStatus",
                column: "athleteid",
                principalTable: "Athletes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteWorkouts_Athletes_athleteid",
                table: "AthleteWorkouts",
                column: "athleteid",
                principalTable: "Athletes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteWorkouts_WorkoutSessions_workoutsessionid",
                table: "AthleteWorkouts",
                column: "workoutsessionid",
                principalTable: "WorkoutSessions",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Boxes_boxid",
                table: "Users",
                column: "boxid",
                principalTable: "Boxes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WodExercises_Wods_wodid",
                table: "WodExercises",
                column: "wodid",
                principalTable: "Wods",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutResults_AthleteWorkouts_athleteworkoutid",
                table: "WorkoutResults",
                column: "athleteworkoutid",
                principalTable: "AthleteWorkouts",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_Boxes_boxid",
                table: "WorkoutSessions",
                column: "boxid",
                principalTable: "Boxes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_Wods_wodid",
                table: "WorkoutSessions",
                column: "wodid",
                principalTable: "Wods",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AthleteDailyLogs_Athletes_athleteid",
                table: "AthleteDailyLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_Athletes_Boxes_boxid",
                table: "Athletes");

            migrationBuilder.DropForeignKey(
                name: "FK_Athletes_Users_userid",
                table: "Athletes");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteStates_Athletes_athleteid",
                table: "AthleteStates");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteStatus_Athletes_athleteid",
                table: "AthleteStatus");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteWorkouts_Athletes_athleteid",
                table: "AthleteWorkouts");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteWorkouts_WorkoutSessions_workoutsessionid",
                table: "AthleteWorkouts");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Boxes_boxid",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_WodExercises_Wods_wodid",
                table: "WodExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutResults_AthleteWorkouts_athleteworkoutid",
                table: "WorkoutResults");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_Boxes_boxid",
                table: "WorkoutSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_Wods_wodid",
                table: "WorkoutSessions");

            migrationBuilder.DropTable(
                name: "AthleteGroups");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkoutSessions",
                table: "WorkoutSessions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WorkoutResults",
                table: "WorkoutResults");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Wods",
                table: "Wods");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WodExercises",
                table: "WodExercises");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Boxes",
                table: "Boxes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AthleteWorkouts",
                table: "AthleteWorkouts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Athletes",
                table: "Athletes");

            migrationBuilder.DropColumn(
                name: "coachnotes",
                table: "Wods");

            migrationBuilder.DropColumn(
                name: "cooldown",
                table: "Wods");

            migrationBuilder.DropColumn(
                name: "isaigenerated",
                table: "Wods");

            migrationBuilder.DropColumn(
                name: "metcon",
                table: "Wods");

            migrationBuilder.DropColumn(
                name: "scaling",
                table: "Wods");

            migrationBuilder.DropColumn(
                name: "strengthskill",
                table: "Wods");

            migrationBuilder.DropColumn(
                name: "warmup",
                table: "Wods");

            migrationBuilder.DropColumn(
                name: "createdat",
                table: "Users");

            migrationBuilder.RenameTable(
                name: "WorkoutSessions",
                newName: "WorkoutSession");

            migrationBuilder.RenameTable(
                name: "WorkoutResults",
                newName: "workoutresult");

            migrationBuilder.RenameTable(
                name: "Wods",
                newName: "Wod");

            migrationBuilder.RenameTable(
                name: "WodExercises",
                newName: "WodExercise");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "User");

            migrationBuilder.RenameTable(
                name: "Boxes",
                newName: "Box");

            migrationBuilder.RenameTable(
                name: "AthleteWorkouts",
                newName: "AthleteWorkout");

            migrationBuilder.RenameTable(
                name: "Athletes",
                newName: "Athlete");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutSessions_wodid",
                table: "WorkoutSession",
                newName: "IX_WorkoutSession_wodid");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutSessions_boxid_date",
                table: "WorkoutSession",
                newName: "IX_WorkoutSession_boxid_date");

            migrationBuilder.RenameColumn(
                name: "timeseconds",
                table: "workoutresult",
                newName: "timesecords");

            migrationBuilder.RenameColumn(
                name: "durationseconds",
                table: "workoutresult",
                newName: "durationsecords");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutResults_athleteworkoutid",
                table: "workoutresult",
                newName: "IX_workoutresult_athleteworkoutid");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "Wod",
                newName: "tittle");

            migrationBuilder.RenameColumn(
                name: "isdeleted",
                table: "Wod",
                newName: "iddeleted");

            migrationBuilder.RenameIndex(
                name: "IX_WodExercises_wodid",
                table: "WodExercise",
                newName: "IX_WodExercise_wodid");

            migrationBuilder.RenameIndex(
                name: "IX_Users_username",
                table: "User",
                newName: "IX_User_username");

            migrationBuilder.RenameIndex(
                name: "IX_Users_boxid",
                table: "User",
                newName: "IX_User_boxid");

            migrationBuilder.RenameIndex(
                name: "IX_AthleteWorkouts_workoutsessionid",
                table: "AthleteWorkout",
                newName: "IX_AthleteWorkout_workoutsessionid");

            migrationBuilder.RenameIndex(
                name: "IX_AthleteWorkouts_athleteid_workoutsessionid",
                table: "AthleteWorkout",
                newName: "IX_AthleteWorkout_athleteid_workoutsessionid");

            migrationBuilder.RenameColumn(
                name: "level",
                table: "Athlete",
                newName: "Level");

            migrationBuilder.RenameColumn(
                name: "goal",
                table: "Athlete",
                newName: "Goal");

            migrationBuilder.RenameColumn(
                name: "weakpoints",
                table: "Athlete",
                newName: "weekpoints");

            migrationBuilder.RenameIndex(
                name: "IX_Athletes_userid",
                table: "Athlete",
                newName: "IX_Athlete_userid");

            migrationBuilder.RenameIndex(
                name: "IX_Athletes_boxid",
                table: "Athlete",
                newName: "IX_Athlete_boxid");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkoutSession",
                table: "WorkoutSession",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_workoutresult",
                table: "workoutresult",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Wod",
                table: "Wod",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WodExercise",
                table: "WodExercise",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_User",
                table: "User",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Box",
                table: "Box",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AthleteWorkout",
                table: "AthleteWorkout",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Athlete",
                table: "Athlete",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_Athlete_Box_boxid",
                table: "Athlete",
                column: "boxid",
                principalTable: "Box",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Athlete_User_userid",
                table: "Athlete",
                column: "userid",
                principalTable: "User",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteDailyLogs_Athlete_athleteid",
                table: "AthleteDailyLogs",
                column: "athleteid",
                principalTable: "Athlete",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteStates_Athlete_athleteid",
                table: "AthleteStates",
                column: "athleteid",
                principalTable: "Athlete",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteStatus_Athlete_athleteid",
                table: "AthleteStatus",
                column: "athleteid",
                principalTable: "Athlete",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteWorkout_Athlete_athleteid",
                table: "AthleteWorkout",
                column: "athleteid",
                principalTable: "Athlete",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteWorkout_WorkoutSession_workoutsessionid",
                table: "AthleteWorkout",
                column: "workoutsessionid",
                principalTable: "WorkoutSession",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_User_Box_boxid",
                table: "User",
                column: "boxid",
                principalTable: "Box",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WodExercise_Wod_wodid",
                table: "WodExercise",
                column: "wodid",
                principalTable: "Wod",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_workoutresult_AthleteWorkout_athleteworkoutid",
                table: "workoutresult",
                column: "athleteworkoutid",
                principalTable: "AthleteWorkout",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSession_Box_boxid",
                table: "WorkoutSession",
                column: "boxid",
                principalTable: "Box",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSession_Wod_wodid",
                table: "WorkoutSession",
                column: "wodid",
                principalTable: "Wod",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
