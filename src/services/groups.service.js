import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";

const GROUPS_TABLE = "groups";
const GROUPS_READ_ERROR = "No fue posible consultar los grupos del tutor";

const GROUP_CREATE_ERROR = "No fue posible crear el grupo del tutor";

const GROUP_UPDATE_ERROR = "No fue posible actualizar el grupo del tutor";
const GROUP_NOT_FOUND_ERROR = "Grupo no encontrado";

const GROUP_SET_DEFAULT_ERROR = "No fue posible actualizar el grupo por defecto";


// Traduce el shape de la DB al contrato que usará el módulo.
const mapGroup = (group) => ({
    id: group.id,
    name: group.name,
    isDefault: group.is_default,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
});

export const listGroups = async (tutorId) => {
    const { data, error } = await supabase
        .from(GROUPS_TABLE)
        .select("id, name, is_default, created_at, updated_at")
        .eq("user_id", tutorId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

    if (error) {
        throw new AppError(GROUPS_READ_ERROR, 500);
    }

    return (data ?? []).map(mapGroup);
};

export const createGroup = async (tutorId, groupData) => {
    const { data, error } = await supabase
        .from(GROUPS_TABLE)
        .insert({
            user_id: tutorId,
            name: groupData.name,
            is_default: false,
        })
        .select("id, name, is_default, created_at, updated_at")
        .single();

    if (error) {
        throw new AppError(GROUP_CREATE_ERROR, 500);
    }

    return mapGroup(data);
};

export const updateGroup = async (tutorId, groupId, groupData) => {
    const { data, error } = await supabase
        .from(GROUPS_TABLE)
        .update({
            name: groupData.name,
        })
        .eq("id", groupId)
        .eq("user_id", tutorId)
        .select("id, name, is_default, created_at, updated_at")
        .maybeSingle();

    if (error) {
        throw new AppError(GROUP_UPDATE_ERROR, 500);
    }

    if (!data) {
        throw new AppError(GROUP_NOT_FOUND_ERROR, 404);
    }

    return mapGroup(data);
};

// Cambia el grupo principal del tutor respetando la regla de un solo default.
export const setDefaultGroup = async (tutorId, groupId) => {
    const { data: targetGroup, error: targetGroupError } = await supabase
        .from(GROUPS_TABLE)
        .select("id, name, is_default, created_at, updated_at")
        .eq("id", groupId)
        .eq("user_id", tutorId)
        .maybeSingle();

    if (targetGroupError) {
        throw new AppError(GROUP_SET_DEFAULT_ERROR, 500);
    }

    if (!targetGroup) {
        throw new AppError(GROUP_NOT_FOUND_ERROR, 404);
    }

    // Si ya era el grupo principal, devolvemos éxito sin tocar la DB.
    if (targetGroup.is_default) {
        return mapGroup(targetGroup);
    }

    // Liberamos el default actual antes de marcar el nuevo para respetar
    // la regla de un solo grupo principal por tutor.
    const { error: clearDefaultError } = await supabase
        .from(GROUPS_TABLE)
        .update({ is_default: false })
        .eq("user_id", tutorId)
        .eq("is_default", true);

    if (clearDefaultError) {
        throw new AppError(GROUP_SET_DEFAULT_ERROR, 500);
    }

    // Marcamos como principal el grupo elegido por el tutor.
    const { data, error } = await supabase
        .from(GROUPS_TABLE)
        .update({ is_default: true })
        .eq("id", groupId)
        .eq("user_id", tutorId)
        .select("id, name, is_default, created_at, updated_at")
        .maybeSingle();

    if (error) {
        throw new AppError(GROUP_SET_DEFAULT_ERROR, 500);
    }

    if (!data) {
        throw new AppError(GROUP_NOT_FOUND_ERROR, 404);
    }

    return mapGroup(data);
};
