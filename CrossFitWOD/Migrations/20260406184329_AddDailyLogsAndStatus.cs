using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CrossFitWOD.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyLogsAndStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Athletes_Boxes_BoxId",
                table: "Athletes");

            migrationBuilder.DropForeignKey(
                name: "FK_Athletes_Users_UserId",
                table: "Athletes");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteWorkouts_Athletes_AthleteId",
                table: "AthleteWorkouts");

            migrationBuilder.DropForeignKey(
                name: "FK_AthleteWorkouts_WorkoutSessions_WorkoutSessionId",
                table: "AthleteWorkouts");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Boxes_BoxId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_WodExercises_Wods_WodId",
                table: "WodExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutResults_AthleteWorkouts_AthleteWorkoutId",
                table: "WorkoutResults");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_Boxes_BoxId",
                table: "WorkoutSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessions_Wods_WodId",
                table: "WorkoutSessions");

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

            migrationBuilder.RenameColumn(
                name: "WodId",
                table: "WorkoutSession",
                newName: "wodid");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "WorkoutSession",
                newName: "date");

            migrationBuilder.RenameColumn(
                name: "BoxId",
                table: "WorkoutSession",
                newName: "boxid");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "WorkoutSession",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutSessions_WodId",
                table: "WorkoutSession",
                newName: "IX_WorkoutSession_wodid");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutSessions_BoxId_Date",
                table: "WorkoutSession",
                newName: "IX_WorkoutSession_boxid_date");

            migrationBuilder.RenameColumn(
                name: "Rpe",
                table: "workoutresult",
                newName: "rpe");

            migrationBuilder.RenameColumn(
                name: "Rounds",
                table: "workoutresult",
                newName: "rounds");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "workoutresult",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "Completed",
                table: "workoutresult",
                newName: "completed");

            migrationBuilder.RenameColumn(
                name: "AthleteWorkoutId",
                table: "workoutresult",
                newName: "athleteworkoutid");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "workoutresult",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "TimeSeconds",
                table: "workoutresult",
                newName: "timesecords");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutResults_AthleteWorkoutId",
                table: "workoutresult",
                newName: "IX_workoutresult_athleteworkoutid");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Wod",
                newName: "type");

            migrationBuilder.RenameColumn(
                name: "DurationMinutes",
                table: "Wod",
                newName: "durationminutes");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Wod",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Wod",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Wod",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Wod",
                newName: "tittle");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Wod",
                newName: "iddeleted");

            migrationBuilder.RenameColumn(
                name: "WodId",
                table: "WodExercise",
                newName: "wodid");

            migrationBuilder.RenameColumn(
                name: "Reps",
                table: "WodExercise",
                newName: "reps");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "WodExercise",
                newName: "order");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "WodExercise",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "WodExercise",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_WodExercises_WodId",
                table: "WodExercise",
                newName: "IX_WodExercise_wodid");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "User",
                newName: "username");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "User",
                newName: "passwordhash");

            migrationBuilder.RenameColumn(
                name: "BoxId",
                table: "User",
                newName: "boxid");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "User",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Username",
                table: "User",
                newName: "IX_User_username");

            migrationBuilder.RenameIndex(
                name: "IX_Users_BoxId",
                table: "User",
                newName: "IX_User_boxid");

            migrationBuilder.RenameColumn(
                name: "TrialEndsAt",
                table: "Box",
                newName: "trialendsat");

            migrationBuilder.RenameColumn(
                name: "SubscriptionStatus",
                table: "Box",
                newName: "subscriptionstatus");

            migrationBuilder.RenameColumn(
                name: "SubscriptionEndsAt",
                table: "Box",
                newName: "subscriptionendsat");

            migrationBuilder.RenameColumn(
                name: "Slug",
                table: "Box",
                newName: "slug");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Box",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "IsIndividual",
                table: "Box",
                newName: "isindividual");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Box",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "Active",
                table: "Box",
                newName: "active");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Box",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "WorkoutSessionId",
                table: "AthleteWorkout",
                newName: "workoutsessionid");

            migrationBuilder.RenameColumn(
                name: "ScaledRepsFactor",
                table: "AthleteWorkout",
                newName: "scaledrepsfactor");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "AthleteWorkout",
                newName: "notes");

            migrationBuilder.RenameColumn(
                name: "AthleteId",
                table: "AthleteWorkout",
                newName: "athleteid");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "AthleteWorkout",
                newName: "id");

            migrationBuilder.RenameIndex(
                name: "IX_AthleteWorkouts_WorkoutSessionId",
                table: "AthleteWorkout",
                newName: "IX_AthleteWorkout_workoutsessionid");

            migrationBuilder.RenameIndex(
                name: "IX_AthleteWorkouts_AthleteId_WorkoutSessionId",
                table: "AthleteWorkout",
                newName: "IX_AthleteWorkout_athleteid_workoutsessionid");

            migrationBuilder.RenameColumn(
                name: "Weight",
                table: "Athlete",
                newName: "weight");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Athlete",
                newName: "userid");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Athlete",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Equipment",
                table: "Athlete",
                newName: "equipment");

            migrationBuilder.RenameColumn(
                name: "DaysPerWeek",
                table: "Athlete",
                newName: "daysperweek");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Athlete",
                newName: "createdat");

            migrationBuilder.RenameColumn(
                name: "BoxId",
                table: "Athlete",
                newName: "boxid");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Athlete",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "WeakPoints",
                table: "Athlete",
                newName: "weekpoints");

            migrationBuilder.RenameColumn(
                name: "SessionDurationMinutes",
                table: "Athlete",
                newName: "sessiondurationminute");

            migrationBuilder.RenameIndex(
                name: "IX_Athletes_UserId",
                table: "Athlete",
                newName: "IX_Athlete_userid");

            migrationBuilder.RenameIndex(
                name: "IX_Athletes_BoxId",
                table: "Athlete",
                newName: "IX_Athlete_boxid");

            migrationBuilder.AddColumn<int>(
                name: "durationsecords",
                table: "workoutresult",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "workoutresult",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "focus",
                table: "Wod",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "intensity",
                table: "Wod",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "role",
                table: "User",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "commitmentlevel",
                table: "Athlete",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "injuryhistory",
                table: "Athlete",
                type: "text",
                nullable: true);

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

            migrationBuilder.CreateTable(
                name: "AthleteDailyLogs",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    athleteid = table.Column<int>(type: "integer", nullable: false),
                    energylevel = table.Column<int>(type: "integer", nullable: false),
                    fatiguelevel = table.Column<int>(type: "integer", nullable: false),
                    sleephours = table.Column<float>(type: "real", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    painnotes = table.Column<string>(type: "text", nullable: true),
                    mentalstate = table.Column<string>(type: "text", nullable: true),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AthleteDailyLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_AthleteDailyLogs_Athlete_athleteid",
                        column: x => x.athleteid,
                        principalTable: "Athlete",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AthleteStates",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    athleteid = table.Column<int>(type: "integer", nullable: false),
                    weight = table.Column<float>(type: "real", nullable: true),
                    bodyfat = table.Column<float>(type: "real", nullable: true),
                    musclemass = table.Column<float>(type: "real", nullable: true),
                    recordedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AthleteStates", x => x.id);
                    table.ForeignKey(
                        name: "FK_AthleteStates_Athlete_athleteid",
                        column: x => x.athleteid,
                        principalTable: "Athlete",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AthleteStatus",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    athleteid = table.Column<int>(type: "integer", nullable: false),
                    fitnesslevel = table.Column<float>(type: "real", nullable: false),
                    fatiguelevel = table.Column<float>(type: "real", nullable: false),
                    recoveryscore = table.Column<float>(type: "real", nullable: false),
                    performancetrend = table.Column<string>(type: "text", nullable: true),
                    lastperformancescore = table.Column<float>(type: "real", nullable: false),
                    acuteload = table.Column<float>(type: "real", nullable: false),
                    chronicload = table.Column<float>(type: "real", nullable: false),
                    loadratio = table.Column<float>(type: "real", nullable: false),
                    readiness = table.Column<string>(type: "text", nullable: true),
                    injuryrisk = table.Column<string>(type: "text", nullable: true),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updatedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AthleteStatus", x => x.id);
                    table.ForeignKey(
                        name: "FK_AthleteStatus_Athlete_athleteid",
                        column: x => x.athleteid,
                        principalTable: "Athlete",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AthleteDailyLogs_athleteid",
                table: "AthleteDailyLogs",
                column: "athleteid");

            migrationBuilder.CreateIndex(
                name: "IX_AthleteStates_athleteid",
                table: "AthleteStates",
                column: "athleteid");

            migrationBuilder.CreateIndex(
                name: "IX_AthleteStatus_athleteid",
                table: "AthleteStatus",
                column: "athleteid");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Athlete_Box_boxid",
                table: "Athlete");

            migrationBuilder.DropForeignKey(
                name: "FK_Athlete_User_userid",
                table: "Athlete");

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

            migrationBuilder.DropTable(
                name: "AthleteDailyLogs");

            migrationBuilder.DropTable(
                name: "AthleteStates");

            migrationBuilder.DropTable(
                name: "AthleteStatus");

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

            migrationBuilder.DropColumn(
                name: "durationsecords",
                table: "workoutresult");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "workoutresult");

            migrationBuilder.DropColumn(
                name: "focus",
                table: "Wod");

            migrationBuilder.DropColumn(
                name: "intensity",
                table: "Wod");

            migrationBuilder.DropColumn(
                name: "role",
                table: "User");

            migrationBuilder.DropColumn(
                name: "commitmentlevel",
                table: "Athlete");

            migrationBuilder.DropColumn(
                name: "injuryhistory",
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

            migrationBuilder.RenameColumn(
                name: "wodid",
                table: "WorkoutSessions",
                newName: "WodId");

            migrationBuilder.RenameColumn(
                name: "date",
                table: "WorkoutSessions",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "boxid",
                table: "WorkoutSessions",
                newName: "BoxId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "WorkoutSessions",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutSession_wodid",
                table: "WorkoutSessions",
                newName: "IX_WorkoutSessions_WodId");

            migrationBuilder.RenameIndex(
                name: "IX_WorkoutSession_boxid_date",
                table: "WorkoutSessions",
                newName: "IX_WorkoutSessions_BoxId_Date");

            migrationBuilder.RenameColumn(
                name: "rpe",
                table: "WorkoutResults",
                newName: "Rpe");

            migrationBuilder.RenameColumn(
                name: "rounds",
                table: "WorkoutResults",
                newName: "Rounds");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "WorkoutResults",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "completed",
                table: "WorkoutResults",
                newName: "Completed");

            migrationBuilder.RenameColumn(
                name: "athleteworkoutid",
                table: "WorkoutResults",
                newName: "AthleteWorkoutId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "WorkoutResults",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "timesecords",
                table: "WorkoutResults",
                newName: "TimeSeconds");

            migrationBuilder.RenameIndex(
                name: "IX_workoutresult_athleteworkoutid",
                table: "WorkoutResults",
                newName: "IX_WorkoutResults_AthleteWorkoutId");

            migrationBuilder.RenameColumn(
                name: "wodid",
                table: "WodExercises",
                newName: "WodId");

            migrationBuilder.RenameColumn(
                name: "reps",
                table: "WodExercises",
                newName: "Reps");

            migrationBuilder.RenameColumn(
                name: "order",
                table: "WodExercises",
                newName: "Order");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "WodExercises",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "WodExercises",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_WodExercise_wodid",
                table: "WodExercises",
                newName: "IX_WodExercises_WodId");

            migrationBuilder.RenameColumn(
                name: "type",
                table: "Wods",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "durationminutes",
                table: "Wods",
                newName: "DurationMinutes");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Wods",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Wods",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Wods",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "tittle",
                table: "Wods",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "iddeleted",
                table: "Wods",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "username",
                table: "Users",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "passwordhash",
                table: "Users",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "boxid",
                table: "Users",
                newName: "BoxId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Users",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_User_username",
                table: "Users",
                newName: "IX_Users_Username");

            migrationBuilder.RenameIndex(
                name: "IX_User_boxid",
                table: "Users",
                newName: "IX_Users_BoxId");

            migrationBuilder.RenameColumn(
                name: "trialendsat",
                table: "Boxes",
                newName: "TrialEndsAt");

            migrationBuilder.RenameColumn(
                name: "subscriptionstatus",
                table: "Boxes",
                newName: "SubscriptionStatus");

            migrationBuilder.RenameColumn(
                name: "subscriptionendsat",
                table: "Boxes",
                newName: "SubscriptionEndsAt");

            migrationBuilder.RenameColumn(
                name: "slug",
                table: "Boxes",
                newName: "Slug");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Boxes",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "isindividual",
                table: "Boxes",
                newName: "IsIndividual");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Boxes",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "active",
                table: "Boxes",
                newName: "Active");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Boxes",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "workoutsessionid",
                table: "AthleteWorkouts",
                newName: "WorkoutSessionId");

            migrationBuilder.RenameColumn(
                name: "scaledrepsfactor",
                table: "AthleteWorkouts",
                newName: "ScaledRepsFactor");

            migrationBuilder.RenameColumn(
                name: "notes",
                table: "AthleteWorkouts",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "athleteid",
                table: "AthleteWorkouts",
                newName: "AthleteId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "AthleteWorkouts",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_AthleteWorkout_workoutsessionid",
                table: "AthleteWorkouts",
                newName: "IX_AthleteWorkouts_WorkoutSessionId");

            migrationBuilder.RenameIndex(
                name: "IX_AthleteWorkout_athleteid_workoutsessionid",
                table: "AthleteWorkouts",
                newName: "IX_AthleteWorkouts_AthleteId_WorkoutSessionId");

            migrationBuilder.RenameColumn(
                name: "weight",
                table: "Athletes",
                newName: "Weight");

            migrationBuilder.RenameColumn(
                name: "userid",
                table: "Athletes",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Athletes",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "equipment",
                table: "Athletes",
                newName: "Equipment");

            migrationBuilder.RenameColumn(
                name: "daysperweek",
                table: "Athletes",
                newName: "DaysPerWeek");

            migrationBuilder.RenameColumn(
                name: "createdat",
                table: "Athletes",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "boxid",
                table: "Athletes",
                newName: "BoxId");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Athletes",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "weekpoints",
                table: "Athletes",
                newName: "WeakPoints");

            migrationBuilder.RenameColumn(
                name: "sessiondurationminute",
                table: "Athletes",
                newName: "SessionDurationMinutes");

            migrationBuilder.RenameIndex(
                name: "IX_Athlete_userid",
                table: "Athletes",
                newName: "IX_Athletes_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Athlete_boxid",
                table: "Athletes",
                newName: "IX_Athletes_BoxId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkoutSessions",
                table: "WorkoutSessions",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WorkoutResults",
                table: "WorkoutResults",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WodExercises",
                table: "WodExercises",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Wods",
                table: "Wods",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Boxes",
                table: "Boxes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AthleteWorkouts",
                table: "AthleteWorkouts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Athletes",
                table: "Athletes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Athletes_Boxes_BoxId",
                table: "Athletes",
                column: "BoxId",
                principalTable: "Boxes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Athletes_Users_UserId",
                table: "Athletes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteWorkouts_Athletes_AthleteId",
                table: "AthleteWorkouts",
                column: "AthleteId",
                principalTable: "Athletes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AthleteWorkouts_WorkoutSessions_WorkoutSessionId",
                table: "AthleteWorkouts",
                column: "WorkoutSessionId",
                principalTable: "WorkoutSessions",
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
                name: "FK_WodExercises_Wods_WodId",
                table: "WodExercises",
                column: "WodId",
                principalTable: "Wods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutResults_AthleteWorkouts_AthleteWorkoutId",
                table: "WorkoutResults",
                column: "AthleteWorkoutId",
                principalTable: "AthleteWorkouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_Boxes_BoxId",
                table: "WorkoutSessions",
                column: "BoxId",
                principalTable: "Boxes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessions_Wods_WodId",
                table: "WorkoutSessions",
                column: "WodId",
                principalTable: "Wods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
