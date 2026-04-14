# CrossFitWOD — Schema PostgreSQL

Script para crear la base de datos desde cero. Ejecutar en orden.

---

## Boxes

```sql
CREATE TABLE "Boxes" (
    "id"                  SERIAL          PRIMARY KEY,
    "name"                VARCHAR(200)    NOT NULL,
    "slug"                VARCHAR(100)    NOT NULL UNIQUE,
    "isindividual"        BOOLEAN         NOT NULL DEFAULT FALSE,
    "subscriptionstatus"  VARCHAR(50)     NOT NULL DEFAULT 'trial',
    "trialendsat"         TIMESTAMPTZ,
    "subscriptionendsat"  TIMESTAMPTZ,
    "active"              BOOLEAN         NOT NULL DEFAULT TRUE,
    "createdat"           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

## Users

```sql
CREATE TABLE "Users" (
    "id"           SERIAL       PRIMARY KEY,
    "username"     VARCHAR(100) NOT NULL,
    "passwordhash" TEXT         NOT NULL,
    "role"         VARCHAR(50)  NOT NULL DEFAULT 'athlete',
    "boxid"        INTEGER      NOT NULL REFERENCES "Boxes"("id"),
    "createdat"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_username UNIQUE ("username")
);
```

---

## Athletes

> `level` → `AthleteLevel`: Beginner=1 | Intermediate=2 | Advanced=3  
> `goal`  → `AthleteGoal`:  General=1 | Fitness=2 | Competition=3 | Rehabilitation=4

```sql
CREATE TABLE "Athletes" (
    "Id"                      SERIAL        PRIMARY KEY,
    "userid"                  INTEGER       NOT NULL REFERENCES "Users"("id"),
    "name"                    VARCHAR(200)  NOT NULL,
    "level"                   SMALLINT      NOT NULL DEFAULT 1,
    "goal"                    SMALLINT      NOT NULL DEFAULT 1,
    "weight"                  REAL,
    "daysperweek"             SMALLINT      NOT NULL DEFAULT 3,
    "sessiondurationminute"   INTEGER       NOT NULL DEFAULT 45,
    "equipment"               TEXT          NOT NULL DEFAULT '',
    "weakpoints"              TEXT          NOT NULL DEFAULT '',
    "injuryhistory"           TEXT,
    "commitmentlevel"         SMALLINT      NOT NULL DEFAULT 5,
    "Boxid"                   INTEGER       NOT NULL REFERENCES "Boxes"("id"),
    "createdat"               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_athletes_userid UNIQUE ("userid")
);
```

---

## Wods

> `type` → `WodType`: Amrap=1 | ForTime=2 | Emom=3

```sql
CREATE TABLE "Wods" (
    "id"              SERIAL        PRIMARY KEY,
    "title"           VARCHAR(300)  NOT NULL,
    "description"     TEXT,
    "type"            SMALLINT      NOT NULL,
    "durationminutes" INTEGER       NOT NULL,
    "intensity"       VARCHAR(100),
    "focus"           VARCHAR(200),
    "warmup"          TEXT,
    "strengthskill"   TEXT,
    "metcon"          TEXT,
    "cooldown"        TEXT,
    "scaling"         TEXT,
    "coachnotes"      TEXT,
    "isaigenerated"   BOOLEAN       NOT NULL DEFAULT FALSE,
    "isdeleted"       BOOLEAN       NOT NULL DEFAULT FALSE,
    "createdat"       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

## WodExercises

```sql
CREATE TABLE "WodExercises" (
    "id"    SERIAL        PRIMARY KEY,
    "wodid" INTEGER       NOT NULL REFERENCES "Wods"("id") ON DELETE CASCADE,
    "name"  VARCHAR(200)  NOT NULL,
    "reps"  INTEGER       NOT NULL,
    "order" INTEGER       NOT NULL
);
```

---

## WorkoutSessions

> Una sesión por box por día — constraint `(boxid, date)`.

```sql
CREATE TABLE "WorkoutSessions" (
    "id"    SERIAL   PRIMARY KEY,
    "wodid" INTEGER  NOT NULL REFERENCES "Wods"("id"),
    "boxid" INTEGER  NOT NULL REFERENCES "Boxes"("id"),
    "date"  DATE     NOT NULL,

    CONSTRAINT uq_workoutsessions_box_date UNIQUE ("boxid", "date")
);
```

---

## AthleteWorkouts

> Un atleta no puede tener dos entradas para la misma sesión.

```sql
CREATE TABLE "AthleteWorkouts" (
    "id"               SERIAL   PRIMARY KEY,
    "athleteid"        INTEGER  NOT NULL REFERENCES "Athletes"("Id"),
    "workoutsessionid" INTEGER  NOT NULL REFERENCES "WorkoutSessions"("id"),
    "scaledrepsfactor" REAL     NOT NULL DEFAULT 1.0,
    "notes"            TEXT,

    CONSTRAINT uq_athleteworkouts_athlete_session UNIQUE ("athleteid", "workoutsessionid")
);
```

---

## WorkoutResults

> Un resultado por `AthleteWorkout` (relación 1-a-1).

```sql
CREATE TABLE "WorkoutResults" (
    "id"               SERIAL      PRIMARY KEY,
    "athleteworkoutid" INTEGER     NOT NULL REFERENCES "AthleteWorkouts"("id"),
    "completed"        BOOLEAN     NOT NULL,
    "timeseconds"      INTEGER,
    "rounds"           REAL,
    "durationseconds"  INTEGER     NOT NULL DEFAULT 0,
    "rpe"              SMALLINT    NOT NULL,
    "notes"            TEXT,
    "createdat"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_workoutresults_athleteworkout UNIQUE ("athleteworkoutid")
);
```

---

## AthleteDailyLogs

> Check-in diario del atleta. `energylevel` y `fatiguelevel` en escala 1–10.

```sql
CREATE TABLE "AthleteDailyLogs" (
    "id"           SERIAL      PRIMARY KEY,
    "athleteid"    INTEGER     NOT NULL REFERENCES "Athletes"("Id"),
    "energylevel"  SMALLINT    NOT NULL,
    "fatiguelevel" SMALLINT    NOT NULL,
    "sleephours"   REAL,
    "notes"        TEXT,
    "painnotes"    TEXT,
    "mentalstate"  TEXT,
    "createdat"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## AthleteStates

> Mediciones físicas del atleta (peso, composición corporal).

```sql
CREATE TABLE "AthleteStates" (
    "id"         SERIAL      PRIMARY KEY,
    "athleteid"  INTEGER     NOT NULL REFERENCES "Athletes"("Id"),
    "weight"     REAL,
    "bodyfat"    REAL,
    "musclemass" REAL,
    "recordedat" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## AthleteStatus

> Estado de rendimiento calculado por el sistema (carga aguda/crónica, readiness).

```sql
CREATE TABLE "AthleteStatus" (
    "id"                   SERIAL       PRIMARY KEY,
    "athleteid"            INTEGER      NOT NULL REFERENCES "Athletes"("Id"),
    "fitnesslevel"         REAL         NOT NULL DEFAULT 0,
    "fatiguelevel"         REAL         NOT NULL DEFAULT 0,
    "recoveryscore"        REAL         NOT NULL DEFAULT 0,
    "performancetrend"     VARCHAR(20),
    "lastperformancescore" REAL         NOT NULL DEFAULT 0,
    "acuteload"            REAL         NOT NULL DEFAULT 0,
    "chronicload"          REAL         NOT NULL DEFAULT 0,
    "loadratio"            REAL         NOT NULL DEFAULT 0,
    "readiness"            VARCHAR(20),
    "injuryrisk"           VARCHAR(20),
    "createdat"            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedat"            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

> Valores posibles para los campos de texto:  
> `performancetrend` → `'improving'` | `'stable'` | `'declining'`  
> `readiness` / `injuryrisk` → `'high'` | `'moderate'` | `'low'`

---

## Índices adicionales

```sql
CREATE INDEX ix_athletes_boxid          ON "Athletes"("Boxid");
CREATE INDEX ix_workoutsessions_boxid   ON "WorkoutSessions"("boxid");
CREATE INDEX ix_athleteworkouts_sessid  ON "AthleteWorkouts"("workoutsessionid");
CREATE INDEX ix_dailylogs_athleteid     ON "AthleteDailyLogs"("athleteid");
CREATE INDEX ix_athletestates_athleteid ON "AthleteStates"("athleteid");
CREATE INDEX ix_athletestatus_athleteid ON "AthleteStatus"("athleteid");
```
