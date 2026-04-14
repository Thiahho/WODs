-- ═══════════════════════════════════════════════════════════════════
-- VISTA: v_athlete_wod_context
-- Propósito: Agrega todo el contexto necesario para generar el WOD
--            personalizado por IA. Una fila por combinación única de
--            atleta + sesión de entrenamiento.
--
-- Uso típico:
--   SELECT * FROM v_athlete_wod_context
--   WHERE athleteid = 42
--   ORDER BY session_date DESC;
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.v_athlete_wod_context AS

SELECT

    -- ── IDENTIFICADORES ─────────────────────────────────────────────
    a."Id"                          AS athleteid,
    a."boxid"                       AS boxid,
    ws.id                           AS session_id,
    aw.id                           AS athleteworkout_id,
    wr.id                           AS result_id,
    w.id                            AS wod_id,

    -- ── PERFIL DEL ATLETA ────────────────────────────────────────────
    a.name                          AS athlete_name,
    a.level                         AS athlete_level,
    a.goal                          AS athlete_goal,
    a.weight                        AS athlete_weight,
    a.daysperweek                   AS days_per_week,
    a.sessiondurationminute         AS session_duration_minutes,
    a.equipment                     AS equipment,
    a.weakpoints                    AS weak_points,
    a.injuryhistory                 AS injury_history,
    a.commitmentlevel               AS commitment_level,
    a.createdat                     AS athlete_created_at,

    -- ── ESTADO DEL ATLETA (AthleteStatus — calculado por el sistema) ─
    ast.id                          AS status_id,
    ast.fitnesslevel                AS fitness_level,
    ast.fatiguelevel                AS fatigue_level,
    ast.recoveryscore               AS recovery_score,
    ast.performancetrend            AS performance_trend,
    ast.lastperformancescore        AS last_performance_score,
    ast.acuteload                   AS acute_load,
    ast.chronicload                 AS chronic_load,
    ast.loadratio                   AS load_ratio,
    -- Interpretación del LoadRatio para facilitar el uso en el prompt
    CASE
        WHEN ast.loadratio > 1.3  THEN 'SOBRECARGA — deload obligatorio'
        WHEN ast.loadratio > 1.1  THEN 'CARGA ELEVADA — sesión suave'
        WHEN ast.loadratio >= 0.8 THEN 'ZONA OPTIMA — programación normal'
        WHEN ast.loadratio IS NOT NULL THEN 'SUBCARGA — podés incrementar'
        ELSE 'sin datos'
    END                             AS load_ratio_label,
    ast.readiness                   AS readiness,
    ast.injuryrisk                  AS injury_risk,
    ast.updatedat                   AS status_updated_at,

    -- ── SESIÓN Y WOD ─────────────────────────────────────────────────
    ws.date                         AS session_date,
    w.title                         AS wod_title,
    w.description                   AS wod_description,
    w.type                          AS wod_type,
    w.durationminutes               AS wod_duration_minutes,
    w.intensity                     AS wod_intensity,
    w.focus                         AS wod_focus,
    w.warmup                        AS wod_warmup,
    w.strengthskill                 AS wod_strength_skill,
    w.metcon                        AS wod_metcon,
    w.cooldown                      AS wod_cooldown,
    w.scaling                       AS wod_scaling,
    w.coachnotes                    AS wod_coach_notes,
    w.isaigenerated                 AS wod_is_ai_generated,

    -- ── RESULTADO DEL ATLETA EN ESA SESIÓN ──────────────────────────
    aw.scaledrepsfactor             AS scaled_reps_factor,
    aw.notes                        AS workout_notes,
    wr.completed                    AS result_completed,
    wr.timeseconds                  AS result_time_seconds,
    wr.rounds                       AS result_rounds,
    wr.durationseconds              AS result_duration_seconds,
    wr.rpe                          AS result_rpe,
    wr.notes                        AS result_notes,
    wr.createdat                    AS result_created_at

FROM public."Athletes" a

    -- Estado más reciente del atleta (LEFT JOIN para no perder atletas sin status)
    LEFT JOIN LATERAL (
        SELECT *
        FROM public."AthleteStatus" s
        WHERE s.athleteid = a."Id"
        ORDER BY s.updatedat DESC
        LIMIT 1
    ) ast ON true

    -- Sesiones del atleta en su box
    LEFT JOIN public."WorkoutSessions" ws
        ON ws.boxid = a."boxid"

    -- WOD de esa sesión (excluye WODs eliminados)
    LEFT JOIN public."Wods" w
        ON w.id = ws.wodid
        AND w.isdeleted = false

    -- Participación del atleta en esa sesión
    LEFT JOIN public."AthleteWorkouts" aw
        ON aw.athleteid = a."Id"
        AND aw.workoutsessionid = ws.id

    -- Resultado del atleta en esa sesión
    LEFT JOIN public."WorkoutResults" wr
        ON wr.athleteworkoutid = aw.id
;


-- ═══════════════════════════════════════════════════════════════════
-- VISTA COMPLEMENTARIA: v_athlete_daily_logs_summary
-- Propósito: Últimos 7 días de check-ins del atleta con promedios.
--            Usala en conjunto con v_athlete_wod_context.
--
-- Uso típico:
--   SELECT * FROM v_athlete_daily_logs_summary WHERE athleteid = 42;
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.v_athlete_daily_logs_summary AS

SELECT
    a."Id"                                      AS athleteid,
    a.name                                      AS athlete_name,

    -- ── LOG INDIVIDUAL ───────────────────────────────────────────────
    dl.id                                       AS log_id,
    dl.createdat                                AS log_date,
    dl.energylevel                              AS energy_level,
    dl.fatiguelevel                             AS fatigue_level,
    dl.sleephours                               AS sleep_hours,
    dl.painnotes                                AS pain_notes,
    dl.mentalstate                              AS mental_state,
    dl.notes                                    AS notes,

    -- ── PROMEDIOS ÚLTIMOS 7 DÍAS (calculados en la vista) ────────────
    -- Útil para mandar directamente al prompt sin calcular en C#
    AVG(dl.energylevel)  OVER (
        PARTITION BY dl.athleteid
        ORDER BY dl.createdat DESC
        ROWS BETWEEN CURRENT ROW AND 6 FOLLOWING
    )                                           AS avg_energy_7d,

    AVG(dl.fatiguelevel) OVER (
        PARTITION BY dl.athleteid
        ORDER BY dl.createdat DESC
        ROWS BETWEEN CURRENT ROW AND 6 FOLLOWING
    )                                           AS avg_fatigue_7d,

    AVG(dl.sleephours)   OVER (
        PARTITION BY dl.athleteid
        ORDER BY dl.createdat DESC
        ROWS BETWEEN CURRENT ROW AND 6 FOLLOWING
    )                                           AS avg_sleep_7d,

    -- Semáforo calculado en SQL (el mismo que calculás en C#)
    CASE
        WHEN dl.energylevel <= 3              THEN 'ROJO — energía crítica'
        WHEN dl.fatiguelevel >= 8             THEN 'ROJO — fatiga crítica'
        WHEN dl.energylevel <= 5
         AND dl.fatiguelevel >= 6             THEN 'AMARILLO — estado comprometido'
        ELSE                                       'VERDE — estado normal'
    END                                         AS checkin_alert,

    -- Ranking para filtrar fácilmente el log más reciente
    ROW_NUMBER() OVER (
        PARTITION BY dl.athleteid
        ORDER BY dl.createdat DESC
    )                                           AS log_rank

FROM public."Athletes" a
JOIN public."AthleteDailyLogs" dl
    ON dl.athleteid = a."Id"
WHERE dl.createdat >= NOW() - INTERVAL '7 days'
;


-- ═══════════════════════════════════════════════════════════════════
-- QUERIES DE USO DESDE EL SERVICE
-- ═══════════════════════════════════════════════════════════════════

-- 1. Contexto completo del atleta: perfil + estado + últimas 7 sesiones
--    (reemplaza todas las queries individuales del service)
/*
SELECT *
FROM v_athlete_wod_context
WHERE athleteid = :athleteId
  AND session_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY session_date DESC;
*/

-- 2. Check-ins de los últimos 7 días con promedios
/*
SELECT *
FROM v_athlete_daily_logs_summary
WHERE athleteid = :athleteId
ORDER BY log_date DESC;
*/

-- 3. Solo el log más reciente del atleta
/*
SELECT *
FROM v_athlete_daily_logs_summary
WHERE athleteid = :athleteId
  AND log_rank = 1;
*/

-- 4. Verificar si ya existe sesión hoy para el box del atleta
/*
SELECT ws.id, w.title
FROM v_athlete_wod_context
WHERE athleteid = :athleteId
  AND session_date = CURRENT_DATE
LIMIT 1;
*/
