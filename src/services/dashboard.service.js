import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";

const GROUPS_TABLE = "groups";
const GROUP_STATS_VIEW = "v_group_stats";
const CHILDREN_TABLE = "children";
const CHILDREN_PREVIEW_LIMIT = 5;

const DASHBOARD_READ_ERROR = "No fue posible cargar el dashboard del tutor";

/**
 * Devuelve un resumen vacío cuando el tutor todavía no tiene grupo.
 *
 * POR QUÉ:
 * El frontend necesita una estructura estable incluso cuando no existe información real.
 */
const buildEmptySummary = () => ({//esrot e para la salidas finales (separamos leer el  datos de armar la salida formal)
    groupId: null,
    groupName: null,
    totalChildren: 0,
    totalSessions: 0,
    accuracyPct: 0,
    lastActivityAt: null,
});

/**
 * Representa un estado vacío honesto del dashboard.
 *
 * reason:
 * - no_group: el tutor aún no tiene grupo creado
 * - no_students: sí hay grupo, pero todavía no hay estudiantes activos
 */
const buildEmptyState = (reason) => ({
    isEmpty: true,
    reason,
});

/**
 * Representa un dashboard con información real disponible.
 */
const buildReadyState = () => ({
    isEmpty: false,
    reason: null,
});

/**
 * Traduce el resumen de grupo desde la DB a un shape claro para frontend.
 */
const mapGroupSummary = (group, stats) => ({
    groupId: group.id,
    groupName: group.name,
    totalChildren: stats?.total_children ?? 0,
    totalSessions: stats?.total_sessions ?? 0,
    accuracyPct: stats?.group_accuracy_pct ?? 0,
    lastActivityAt: stats?.last_activity_at ?? null,
});

/**
 * Traduce cada estudiante a un preview corto para el dashboard.
 *
 * POR QUÉ:
 * HU-09 no necesita todavía el detalle completo del estudiante.
 * Solo necesita una vista breve y útil.
 *
 * NOTA DE CONVENCION:
 * - La DB oficial usa children
 * - El contrato del producto usa students
 * Esta funcion hace ese puente sin romper la regla DB-first.
 */
const mapStudentPreview = (child) => ({
    id: child.id,
    name: child.name,
    age: child.age,
    avatarColor: child.avatar_color,
    starsTotal: child.stars_total,
    isSessionActive: child.is_session_active,
    accessCode: child.access_code,
});

/**
 * Busca el grupo principal del tutor autenticado.
 *
 * POR QUÉ:
 * El dashboard debe mostrar solo información del tutor dueño del grupo.
 */
const findTutorPrimaryGroup = async (tutorId) => {
    const { data, error } = await supabase
        .from(GROUPS_TABLE)
        .select("id, name, is_default")
        .eq("user_id", tutorId)
        .order("is_default", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new AppError(DASHBOARD_READ_ERROR, 500);
    }

    return data;
};

/**
 * Lee el resumen agregado del grupo desde la vista oficial.
 *
 * POR QUÉ:
 * La vista ya concentra el cálculo que el dashboard necesita.
 * Así evitamos duplicar reglas en backend.
 */
const findGroupStats = async (groupId, tutorId) => {
    const { data, error } = await supabase
        .from(GROUP_STATS_VIEW)
        .select("group_id, group_name, total_children, total_sessions, group_accuracy_pct, last_activity_at")
        .eq("group_id", groupId)
        .eq("user_id", tutorId)
        .maybeSingle();

    if (error) {
        throw new AppError(DASHBOARD_READ_ERROR, 500);
    }

    return data;
};

/**
 * Trae una vista previa corta de estudiantes activos del grupo.
 *
 * POR QUÉ:
 * El dashboard no debe cargar toda la lógica del detalle.
 * Solo muestra un preview útil para arrancar.
 */
const findStudentsPreview = async (groupId) => {
    const { data, error } = await supabase
        .from(CHILDREN_TABLE)
        .select("id, name, age, avatar_color, stars_total, is_session_active, access_code")
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(CHILDREN_PREVIEW_LIMIT);

    if (error) {
        throw new AppError(DASHBOARD_READ_ERROR, 500);
    }

    return data ?? [];
};

/**
 * Caso de uso principal de HU-09.
 *
 * QUÉ hace:
 * - identifica el grupo del tutor autenticado
 * - obtiene el resumen estadístico del grupo
 * - obtiene un preview de estudiantes
 * - devuelve un estado vacío honesto si aún no hay datos
 */
export const getTutorDashboardSummary = async (tutorId) => {
    const group = await findTutorPrimaryGroup(tutorId);

    if (!group) {
        return {
            summary: buildEmptySummary(),
            studentsPreview: [],
            emptyState: buildEmptyState("no_group"),
        };
    }

    const [stats, students] = await Promise.all([
        findGroupStats(group.id, tutorId),
        findStudentsPreview(group.id),
    ]);

    return {
        summary: mapGroupSummary(group, stats),
        studentsPreview: students.map(mapStudentPreview),
        emptyState: students.length === 0
            ? buildEmptyState("no_students")
            : buildReadyState(),
    };
};
