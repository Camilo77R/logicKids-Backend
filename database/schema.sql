CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- LOGICKIDS — BASE DE DATOS v2.2
-- Proyecto de Grado — SENA
-- Stack: PostgreSQL / Supabase
-- ============================================================
-- CAMBIOS RESPECTO A v2.1:
--   1. users.role agrega 'admin': figura institucional que gestiona
--      tutores y continuidad de grupos. El CHECK pasa de
--      ('tutor','parent') a ('tutor','parent','admin').
--      Sin migración de datos existentes.
--   2. children agrega is_session_active + session_started_at:
--      el tutor activa manualmente la sesión diagnóstica del niño.
--      El niño puede entrar al dashboard con access_code, pero solo
--      puede jugar cuando is_session_active=TRUE.
--   3. recommendations agrega severity: clasifica el diagnóstico en
--      high/medium/low para que el tutor atienda primero a los niños
--      con dificultades graves. El dashboard muestra primero los casos
--      más críticos usando el orden de severidad.
-- ============================================================



-- ============================================================
-- TABLA 1: users
-- CAMBIO v2.2: role ahora acepta 'admin'.
-- El admin institucional da de alta, baja o reactiva tutores
-- y garantiza continuidad cuando cambia el docente responsable.
-- Es la figura necesaria cuando los tutores cambian de curso o renuncian.
-- Escalable: agregar 'superadmin' en el futuro es solo un valor más.
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    -- CAMBIO v2.2: se agrega 'admin' al CHECK
    role            VARCHAR(10) NOT NULL
                    CHECK (role IN ('tutor', 'parent', 'admin')),
    institution     VARCHAR(150),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS
    'Adultos responsables. role=tutor gestiona grupos en institución. '
    'role=parent gestiona sus hijos. role=admin gestiona tutores y la continuidad '
    'de grupos cuando cambia el docente responsable. '
    'Mismo flujo de auth para todos. Escalable: agregar role=superadmin sin migración.';

COMMENT ON COLUMN users.role IS
    'tutor: gestiona su grupo, activa sesiones de sus niños. '
    'parent: gestiona sus hijos. '
    'admin: da de alta, baja o reactiva tutores y garantiza continuidad '
    'cuando cambia el docente responsable. Necesario para escalabilidad institucional.';


-- ============================================================
-- TABLA 2: groups (sin cambios)
-- ============================================================
CREATE TABLE groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL DEFAULT 'Mi grupo',
    description     VARCHAR(255),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE groups IS
    'Grupos de niños por tutor o padre. En MVP cada usuario tiene un grupo '
    'por defecto (is_default=TRUE). Escala a múltiples grupos sin cambiar '
    'otras tablas. Para padres el grupo se llama "Mis hijos" en el frontend.';

CREATE INDEX idx_groups_user_id ON groups (user_id);

-- Regla de integridad: un usuario puede tener muchos grupos,
-- pero solo uno puede ser el grupo por defecto.
CREATE UNIQUE INDEX ux_groups_one_default_per_user
    ON groups (user_id)
    WHERE is_default = TRUE;


-- ============================================================
-- TABLA 3: children
-- CAMBIO v2.2: se agregan is_session_active y session_started_at.
--
-- is_session_active: el tutor controla manualmente cuándo el niño
--   puede jugar. DEFAULT FALSE = el niño puede entrar al dashboard
--   con su access_code, pero no puede jugar hasta que el tutor
--   active el aula.
--
-- session_started_at: registra cuándo el tutor activó la sesión.
--   Permite detectar sesiones olvidadas abiertas (ej: el tutor activó
--   pero no cerró al final de la clase) y bloquearlas automáticamente
--   pasado un tiempo configurable.
-- ============================================================

CREATE TABLE children (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id            UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    age                 INTEGER NOT NULL
                        CHECK (age BETWEEN 5 AND 13),
    avatar_color        VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    access_code         VARCHAR(6) UNIQUE NOT NULL DEFAULT '',
    daily_limit_minutes INTEGER NOT NULL DEFAULT 30
                        CHECK (daily_limit_minutes BETWEEN 5 AND 120),
    stars_total         INTEGER NOT NULL DEFAULT 0,
 
    -- NUEVO v2.2: control de sesión diagnóstica
    -- DEFAULT FALSE = el niño puede entrar a su dashboard, 
    -- pero no puede jugar hasta que el tutor active el aula.
    is_session_active   BOOLEAN NOT NULL DEFAULT FALSE,

    -- NUEVO v2.2: cuándo el tutor abrió la sesión.
    -- NULL si is_session_active=FALSE (sesión no activa).
    -- Permite detectar y cerrar sesiones olvidadas abiertas.
    session_started_at  TIMESTAMPTZ,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE children IS
    'Niños registrados. Acceden con access_code (sin email ni contraseña). '
    'is_session_active controla si el tutor habilitó la sesión diagnóstica. '
    'Sin activación el niño ve la app pero no puede jugar. '
    'Edad con rango flexible 5-13, el frontend advierte si está fuera de 7-10.';
COMMENT ON COLUMN children.is_session_active IS
    'Interruptor por niño. TRUE = el tutor habilitó la sesión, el niño puede jugar. '
    'FALSE = bloqueado. El tutor activa/desactiva desde su dashboard. '
    'Núcleo del enfoque diagnóstico supervisado del proyecto.';
COMMENT ON COLUMN children.session_started_at IS
    'Timestamp de cuando el tutor activó is_session_active=TRUE. '
    'NULL cuando la sesión está cerrada. Permite detectar sesiones olvidadas '
    'abiertas para cerrarlas automáticamente si pasan X minutos sin actividad.';
COMMENT ON COLUMN children.access_code IS
    '6 caracteres únicos. Caracteres: A-Z y 2-9 (sin 0/O/1/I para evitar '
    'confusión visual). Se genera automáticamente con el trigger trg_gen_child_code. '
    'El DEFAULT "" es necesario para que el trigger pueda dispararse.';
COMMENT ON COLUMN children.stars_total IS
    'Estrellas acumuladas del niño en todas sus sesiones. '
    '3⭐ si precisión ≥90%, 2⭐ si ≥70%, 1⭐ si ≥50%, 0 si <50%. '
    'Vive en children (no en achievements) porque es un atributo del niño.';
COMMENT ON COLUMN children.daily_limit_minutes IS
    'Límite de minutos de juego por día. Default 30. El tutor o padre puede '
    'cambiarlo entre 5 y 120 minutos. El trigger accumulate_daily_play registra '
    'el consumo diario y este dato se usa para validar el límite.';

CREATE INDEX idx_children_group_id ON children (group_id);


-- ============================================================
-- TABLA 4: game_sessions (sin cambios)
-- ============================================================
CREATE TABLE game_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    minigame_id     VARCHAR(50) NOT NULL,
    difficulty      INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    score           INTEGER NOT NULL DEFAULT 0,
    correct_count   INTEGER NOT NULL DEFAULT 0,
    wrong_count     INTEGER NOT NULL DEFAULT 0,
    max_combo       INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE game_sessions IS
    'Una partida completa. Es el resumen. Los detalles de cada acción '
    'están en game_events. minigame_id como VARCHAR permite agregar '
    'juegos nuevos sin migrar la DB.';

CREATE INDEX idx_game_sessions_child_id   ON game_sessions (child_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions (started_at DESC);


-- ============================================================
-- TABLA 5: game_events (sin cambios)
-- ============================================================
CREATE TABLE game_events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id       UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    event_type       VARCHAR(30) NOT NULL
                     CHECK (event_type IN (
                         'correct_answer',
                         'wrong_answer',
                         'time_out',
                         'level_up',
                         'combo_broken'
                     )),
    skill_tag        VARCHAR(50),
    reaction_time_ms INTEGER,
    points_earned    INTEGER NOT NULL DEFAULT 0,
    combo_at_event   INTEGER NOT NULL DEFAULT 0,
    occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE game_events IS
    'Cada acción individual durante una partida. Fuente de las '
    'recomendaciones pedagógicas: permite saber en qué skill_tag falla '
    'el niño, qué tan rápido responde, cómo evoluciona su racha.';
COMMENT ON COLUMN game_events.skill_tag IS
    'Habilidad lógica evaluada en este evento. Ejemplos: secuencia_numerica, '
    'clasificacion_color, patron_visual. Permite al tutor ver '
    '"María falla en clasificación (45%)".';

CREATE INDEX idx_game_events_session_id ON game_events (session_id);


-- ============================================================
-- TABLA 6: achievements (sin cambios)
-- ============================================================
CREATE TABLE achievements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    achievement_key VARCHAR(50) NOT NULL,
    unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (child_id, achievement_key)
);

COMMENT ON TABLE achievements IS
    'Logros desbloqueados por cada niño. El catálogo de logros vive '
    'en el frontend/juego: agregar logros nuevos no requiere migración.';
COMMENT ON COLUMN achievements.achievement_key IS
    'Clave del logro. Ejemplos: first_game, combo_5, combo_10, '
    'perfect_run, week_streak, speed_star. '
    'El frontend traduce esta clave al texto e ícono que ve el niño.';

CREATE INDEX idx_achievements_child_id ON achievements (child_id);


-- ============================================================
-- TABLA 7: daily_play_log (sin cambios)
-- ============================================================
CREATE TABLE daily_play_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    play_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    minutes_played  INTEGER NOT NULL DEFAULT 0,
    UNIQUE (child_id, play_date)
);

COMMENT ON TABLE daily_play_log IS
    'Minutos jugados por niño por día. Registra el consumo diario usado '
    'para validar el límite configurado en children.daily_limit_minutes. '
    'El trigger trg_accumulate_play_time lo actualiza automáticamente '
    'al cerrar sesión.';

CREATE INDEX idx_daily_play_log_child_date
    ON daily_play_log (child_id, play_date);


-- ============================================================
-- TABLA 8: notifications (sin cambios)
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id        UUID REFERENCES children(id) ON DELETE SET NULL,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN (
                        'achievement_unlocked',
                        'session_completed',
                        'limit_reached'
                    )),
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS
    'Feed de actividad in-app para el tutor/padre. No son push notifications. '
    'Escalable: nuevos tipos se agregan al CHECK.';

CREATE INDEX idx_notifications_user_id
    ON notifications (user_id, is_read, created_at DESC);


-- ============================================================
-- TABLA 9: recommendations
-- CAMBIO v2.2: se agrega severity (high/medium/low).
--
-- severity permite al dashboard ordenar y resaltar visualmente
-- los diagnósticos más urgentes. El tutor ve primero "en rojo"
-- a los niños con dificultades graves comprobadas por las métricas.
-- No es una opinión: se calcula automáticamente desde game_events.
--
-- Criterio sugerido para el backend al generar recomendaciones:
--   high:   precisión < 40% en una habilidad con ≥10 intentos
--   medium: precisión entre 40% y 65% con ≥5 intentos
--   low:    precisión entre 65% y 75% (área de mejora, no crítica)
-- ============================================================
CREATE TABLE recommendations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type         VARCHAR(10) NOT NULL
                        CHECK (target_type IN ('child', 'group')),
    target_id           UUID NOT NULL,
    skill_tag           VARCHAR(50),
    message             TEXT NOT NULL,
    recommendation_type VARCHAR(20) NOT NULL
                        CHECK (recommendation_type IN ('in_app', 'outside')),

    -- NUEVO v2.2: nivel de urgencia del diagnóstico
    -- high:   dificultad grave, el tutor debe atender primero
    -- medium: área de mejora importante
    -- low:    sugerencia de refuerzo, no crítica
    severity            VARCHAR(10) NOT NULL DEFAULT 'low'
                        CHECK (severity IN ('high', 'medium', 'low')),

    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE recommendations IS
    'Diagnósticos automáticos para el tutor. Se generan al terminar '
    'cada sesión basándose en game_events y skill_tags. '
    'severity ordena el dashboard: high=rojo (atención urgente), '
    'medium=amarillo, low=verde. Incluye recomendaciones in_app '
    '(qué minijuego/nivel practicar) y outside (actividades fuera de la app).';
COMMENT ON COLUMN recommendations.severity IS
    'Urgencia del diagnóstico. high: precisión <40% con ≥10 intentos. '
    'medium: precisión 40-65% con ≥5 intentos. low: área de mejora no crítica. '
    'El dashboard usa este valor para priorizar los casos más urgentes.';


CREATE INDEX idx_recommendations_target
    ON recommendations (target_type, target_id, is_active);

-- Índice adicional para ordenar por severidad en el dashboard
CREATE INDEX idx_recommendations_severity
    ON recommendations (target_type, target_id, severity, is_active);


-- ============================================================
-- TRIGGERS
-- ============================================================

-- ── Trigger 1: Generar access_code único (sin cambios) ───────────────────
CREATE OR REPLACE FUNCTION generate_child_code()
RETURNS TRIGGER AS $$
DECLARE
    chars       TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    new_code    VARCHAR(6);
    ya_existe   BOOLEAN;
BEGIN
    LOOP
        new_code := '';
        FOR i IN 1..6 LOOP
            new_code := new_code ||
                substr(chars, floor(random() * length(chars) + 1)::INT, 1);
        END LOOP;
        SELECT EXISTS(
            SELECT 1 FROM children WHERE access_code = new_code
        ) INTO ya_existe;
        EXIT WHEN NOT ya_existe;
    END LOOP;
    NEW.access_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gen_child_code
    BEFORE INSERT ON children
    FOR EACH ROW
    WHEN (NEW.access_code IS NULL OR NEW.access_code = '')
    EXECUTE FUNCTION generate_child_code();


-- ── Trigger 2: updated_at automático (sin cambios) ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── Trigger 3: Acumular minutos al cerrar sesión (sin cambios) ───────────
-- El trigger accumulate_daily_play registra el consumo diario; la validación del límite usa este dato
CREATE OR REPLACE FUNCTION accumulate_daily_play()
RETURNS TRIGGER AS $$
DECLARE
    session_minutes INTEGER;
BEGIN
    IF OLD.status = 'active'
       AND NEW.status IN ('completed', 'abandoned')
       AND NEW.ended_at IS NOT NULL
    THEN
        session_minutes := GREATEST(
            0,
            EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60
        )::INTEGER;

        INSERT INTO daily_play_log (child_id, play_date, minutes_played)
        VALUES (NEW.child_id, NEW.started_at::DATE, session_minutes)
        ON CONFLICT (child_id, play_date)
        DO UPDATE SET
            minutes_played = daily_play_log.minutes_played + session_minutes;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accumulate_play_time
    AFTER UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION accumulate_daily_play();


-- ── Trigger 4: Notificación al desbloquear logro (sin cambios) ───────────
CREATE OR REPLACE FUNCTION notify_on_achievement()
RETURNS TRIGGER AS $$
DECLARE
    v_child_name    VARCHAR(100);
    v_user_id       UUID;
BEGIN
    SELECT c.name, g.user_id
    INTO   v_child_name, v_user_id
    FROM   children c
    JOIN   groups   g ON g.id = c.group_id
    WHERE  c.id = NEW.child_id;

    INSERT INTO notifications (user_id, child_id, type, message)
    VALUES (
        v_user_id,
        NEW.child_id,
        'achievement_unlocked',
        v_child_name || ' desbloqueó el logro: ' || NEW.achievement_key
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_achievement
    AFTER INSERT ON achievements
    FOR EACH ROW EXECUTE FUNCTION notify_on_achievement();


-- ── Trigger 5: Limpiar session_started_at al desactivar sesión ───────────
-- NUEVO v2.2: cuando el tutor pone is_session_active=FALSE,
-- limpia session_started_at automáticamente para mantener consistencia.
-- Así nunca queda un session_started_at con is_session_active=FALSE.
CREATE OR REPLACE FUNCTION clear_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_session_active = TRUE AND NEW.is_session_active = FALSE THEN
        NEW.session_started_at := NULL;
    END IF;
    IF OLD.is_session_active = FALSE AND NEW.is_session_active = TRUE THEN
        NEW.session_started_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clear_session_timestamp
    BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION clear_session_timestamp();


-- ============================================================
-- VISTAS
-- ============================================================

-- ── Vista 1: Stats por niño ───────────────────────────────────────────────
-- CAMBIO v2.2: agrega is_session_active para que el dashboard
-- del tutor muestre el estado del interruptor de cada niño.
CREATE OR REPLACE VIEW v_child_stats AS
SELECT
    c.id                                                  AS child_id,
    c.name                                                AS child_name,
    c.group_id,
    g.user_id,
    c.daily_limit_minutes,
    c.stars_total,
    c.is_session_active,
    c.session_started_at,
    COUNT(gs.id)                                          AS total_sessions,
    COALESCE(SUM(gs.correct_count + gs.wrong_count), 0)  AS total_attempts,
    CASE
        WHEN COALESCE(SUM(gs.correct_count + gs.wrong_count), 0) > 0
        THEN ROUND(
            100.0 * SUM(gs.correct_count) /
            SUM(gs.correct_count + gs.wrong_count), 1
        )
        ELSE 0
    END                                                   AS accuracy_pct,
    COALESCE(
        SUM(EXTRACT(EPOCH FROM (gs.ended_at - gs.started_at)) / 60)
        FILTER (WHERE gs.ended_at IS NOT NULL), 0
    )::INTEGER                                            AS total_minutes_played,
    MAX(gs.started_at)                                    AS last_played_at
FROM children c
JOIN  groups g ON g.id = c.group_id
LEFT JOIN game_sessions gs
    ON  gs.child_id = c.id
    AND gs.status IN ('completed', 'abandoned')
GROUP BY
    c.id, c.name, c.group_id, g.user_id,
    c.daily_limit_minutes, c.stars_total,
    c.is_session_active, c.session_started_at;


-- ── Vista 2: Stats por habilidad lógica (sin cambios) ────────────────────
CREATE OR REPLACE VIEW v_child_skill_stats AS
SELECT
    gs.child_id,
    ge.skill_tag,
    COUNT(*)                                                        AS total_events,
    COUNT(*) FILTER (WHERE ge.event_type = 'correct_answer')       AS correct_count,
    COUNT(*) FILTER (WHERE ge.event_type = 'wrong_answer')         AS wrong_count,
    CASE
        WHEN COUNT(*) FILTER (
            WHERE ge.event_type IN ('correct_answer', 'wrong_answer')
        ) > 0
        THEN ROUND(
            100.0 * COUNT(*) FILTER (WHERE ge.event_type = 'correct_answer') /
            NULLIF(COUNT(*) FILTER (
                WHERE ge.event_type IN ('correct_answer', 'wrong_answer')
            ), 0), 1
        )
        ELSE 0
    END                                                             AS accuracy_pct,
    ROUND(
        AVG(ge.reaction_time_ms) FILTER (WHERE ge.reaction_time_ms IS NOT NULL)
    )                                                               AS avg_reaction_ms
FROM game_events    ge
JOIN game_sessions  gs ON gs.id = ge.session_id
WHERE ge.skill_tag IS NOT NULL
GROUP BY gs.child_id, ge.skill_tag;


-- ── Vista 3: Progreso semanal (sin cambios) ───────────────────────────────
-- ORDER BY va en el backend: ORDER BY child_id, week_start ASC
CREATE OR REPLACE VIEW v_child_weekly_progress AS
SELECT
    gs.child_id,
    DATE_TRUNC('week', gs.started_at)   AS week_start,
    COUNT(gs.id)                        AS sessions_count,
    CASE
        WHEN SUM(gs.correct_count + gs.wrong_count) > 0
        THEN ROUND(
            100.0 * SUM(gs.correct_count) /
            SUM(gs.correct_count + gs.wrong_count), 1
        )
        ELSE 0
    END                                 AS weekly_accuracy_pct,
    ROUND(AVG(gs.max_combo), 1)        AS avg_max_combo
FROM game_sessions gs
WHERE gs.status = 'completed'
GROUP BY gs.child_id, DATE_TRUNC('week', gs.started_at);


-- ── Vista 4: Stats grupales (sin cambios) ────────────────────────────────
CREATE OR REPLACE VIEW v_group_stats AS
SELECT
    g.id                                                    AS group_id,
    g.name                                                  AS group_name,
    g.user_id,
    COUNT(DISTINCT c.id)                                    AS total_children,
    COUNT(gs.id)                                            AS total_sessions,
    CASE
        WHEN COALESCE(SUM(gs.correct_count + gs.wrong_count), 0) > 0
        THEN ROUND(
            100.0 * SUM(gs.correct_count) /
            SUM(gs.correct_count + gs.wrong_count), 1
        )
        ELSE 0
    END                                                     AS group_accuracy_pct,
    MAX(gs.started_at)                                      AS last_activity_at
FROM groups g
LEFT JOIN children      c   ON c.group_id = g.id
LEFT JOIN game_sessions gs  ON gs.child_id = c.id
    AND gs.status IN ('completed', 'abandoned')
GROUP BY g.id, g.name, g.user_id;


-- ── Vista 5: Diagnósticos activos por severidad (NUEVA v2.2) ─────────────
-- Para el dashboard del tutor: muestra las recomendaciones urgentes
-- ordenadas por severidad. El backend hace ORDER BY severity_order.
CREATE OR REPLACE VIEW v_active_recommendations AS
SELECT
    r.id,
    r.target_type,
    r.target_id,
    r.skill_tag,
    r.message,
    r.recommendation_type,
    r.severity,
    -- Orden numérico para que el backend pueda ordenar fácilmente
    CASE r.severity
        WHEN 'high'   THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low'    THEN 3
    END                         AS severity_order,
    r.generated_at,
    -- Si es recomendación de niño, trae su nombre para el dashboard
    CASE WHEN r.target_type = 'child'
        THEN (SELECT name FROM children WHERE id = r.target_id)
        ELSE NULL
    END                         AS child_name,
    -- Si es recomendación de grupo, trae el nombre del grupo
    CASE WHEN r.target_type = 'group'
        THEN (SELECT name FROM groups WHERE id = r.target_id)
        ELSE NULL
    END                         AS group_name
FROM recommendations r
WHERE r.is_active = TRUE;

COMMENT ON VIEW v_active_recommendations IS
    'Diagnósticos activos ordenables por severidad. El backend ordena con '
    'ORDER BY severity_order ASC para mostrar high primero (rojo), '
    'medium segundo (amarillo), low último (verde).';


-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO users (id, full_name, email, password_hash, role, institution)
VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001',
     'Profe Laura Gómez', 'laura@logickids.dev',
     '$2b$10$placeholderHashParaDesarrollo', 'tutor', 'Colegio San José'),

    ('aaaaaaaa-0000-0000-0000-000000000002',
     'Carlos Martínez', 'carlos@logickids.dev',
     '$2b$10$placeholderHashParaDesarrollo', 'parent', NULL),

    -- NUEVO v2.2: usuario admin de prueba
    ('aaaaaaaa-0000-0000-0000-000000000003',
     'Admin Colegio San José', 'admin@logickids.dev',
     '$2b$10$placeholderHashParaDesarrollo', 'admin', 'Colegio San José');

INSERT INTO groups (id, user_id, name, is_default)
VALUES
    ('cccccccc-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001', '3ro Primaria A', TRUE),

    ('cccccccc-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000002', 'Mis hijos', TRUE);

INSERT INTO children
    (id, group_id, name, age, avatar_color, access_code, daily_limit_minutes)
VALUES
    ('bbbbbbbb-0000-0000-0000-000000000001',
     'cccccccc-0000-0000-0000-000000000001',
     'María Pérez',    8, '#EF4444', 'MX4K2A', 30),

    ('bbbbbbbb-0000-0000-0000-000000000002',
     'cccccccc-0000-0000-0000-000000000001',
     'Juan García',    9, '#3B82F6', 'PQ8R3B', 30),

    ('bbbbbbbb-0000-0000-0000-000000000003',
     'cccccccc-0000-0000-0000-000000000001',
     'Ana López',      7, '#10B981', 'LN5T7C', 20),

    ('bbbbbbbb-0000-0000-0000-000000000004',
     'cccccccc-0000-0000-0000-000000000002',
     'Sofía Martínez', 8, '#F59E0B', 'WV2H9D', 45);
