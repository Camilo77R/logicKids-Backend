import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";

const GROUPS_TABLE = "groups";
const GROUP_STATS_VIEW = "v_group_stats";
const CHILDREN_TABLE = "children";
const CHILDREN_PREVIEW_LIMIT = 5;

const DASHBOARD_READ_ERROR = "No fue posible cargar el dashboard del tutor";
const DASHBOARD_GROUP_NOT_FOUND_ERROR = "Grupo no encontrado";
/**
 * Devuelve un resumen vacío cuando el tutor todavía no tiene grupo.
 *
 * POR QUÉ:
 * El frontend necesita una estructura estable incluso cuando no existe información real.
 */
const buildEmptySummary = () => ({
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
 * - no_children: sí hay grupo, pero todavía no hay children activos
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
 * Traduce cada child a un preview corto para el dashboard.
 *
 * POR QUÉ:
 * HU-09 no necesita todavía el detalle completo del módulo de children.
 * Solo necesita una vista breve y útil para arrancar.
 */
const mapChildPreview = (child) => ({
    id: child.id,
    name: child.name,
    age: child.age,
    avatarColor: child.avatar_color,
    starsTotal: child.stars_total,
    isSessionActive: child.is_session_active,
    accessCode: child.access_code,
});

/**
 * Resuelve qué grupo debe usar el dashboard del tutor.
 *
 * POR QUÉ:
 * Si llega un groupId en query, usamos ese grupo seleccionado.
 * Si no llega, hacemos fallback al grupo principal/default.
 */

const findTutorDashboardGroup = async (tutorId, selectedGroupId) => {
    if (selectedGroupId) {
        const { data, error } = await supabase
            .from(GROUPS_TABLE)
            .select("id, name, is_default")
            .eq("id", selectedGroupId)
            .eq("user_id", tutorId)
            .maybeSingle();

        if (error) {
            throw new AppError(DASHBOARD_READ_ERROR, 500);
        }

        if (!data) {
            throw new AppError(DASHBOARD_GROUP_NOT_FOUND_ERROR, 404);
        }

        return data;
    }

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
 * Trae una vista previa corta de children activos del grupo.
 *
 * POR QUÉ:
 * El dashboard no debe cargar toda la lógica del detalle.
 * Solo muestra un preview útil para arrancar.
 */
const findChildrenPreview = async (groupId) => {
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
 * - obtiene un preview de children
 * - devuelve un estado vacío honesto si aún no hay datos
 */
export const getTutorDashboardSummary = async (tutorId, selectedGroupId) => {
    const group = await findTutorDashboardGroup(tutorId, selectedGroupId);

    if (!group) {
        return {
            summary: buildEmptySummary(),
            childrenPreview: [],
            emptyState: buildEmptyState("no_group"),
        };
    }

    const [stats, children] = await Promise.all([
        findGroupStats(group.id, tutorId),
        findChildrenPreview(group.id),
    ]);

    return {
        summary: mapGroupSummary(group, stats),
        childrenPreview: children.map(mapChildPreview),
        emptyState: children.length === 0
            ? buildEmptyState("no_children")
            : buildReadyState(),
    };
};
