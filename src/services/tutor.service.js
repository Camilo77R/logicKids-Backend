import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";
import { resolveTutorFullName } from "../utils/tutor-name.js";

const USERS_TABLE = "users";
const TUTOR_PUBLIC_FIELDS = "id, full_name, email, institution, created_at, updated_at, role";

const PROFILE_READ_ERROR = "No fue posible consultar el perfil del tutor";
const PROFILE_UPDATE_ERROR = "No fue posible actualizar el perfil del tutor";

const resolveTutorProfileUpdates = (updates) => {
    const allowedFields = {};
    const full_name = resolveTutorFullName(updates);

    if (full_name) {
        allowedFields.full_name = full_name;
    }

    if (updates.institution !== undefined) {
        allowedFields.institution = updates.institution;
    }

    return allowedFields;
};

// Caso de uso: consultar el perfil del tutor autenticado.
export const getTutorProfile = async (tutorId) => {
    const { data: tutor, error } = await supabase
        .from(USERS_TABLE)
        .select(TUTOR_PUBLIC_FIELDS)
        .eq("id", tutorId)
        .maybeSingle();

    if (error) {
        throw new AppError(PROFILE_READ_ERROR, 500);
    }

    if (!tutor) {
        throw new AppError("Tutor no encontrado", 404);
    }

    return tutor;
};

// Caso de uso: actualizar los únicos campos editables del perfil del tutor.
export const updateTutorProfile = async (tutorId, updates) => {
    const allowedFields = resolveTutorProfileUpdates(updates);

    if (Object.keys(allowedFields).length === 0) {
        throw new AppError("Debe enviar al menos un campo para actualizar", 400);
    }

    const { data: tutor, error } = await supabase
        .from(USERS_TABLE)
        .update(allowedFields)
        .eq("id", tutorId)
        .select(TUTOR_PUBLIC_FIELDS)
        .maybeSingle();

    if (error) {
        throw new AppError(PROFILE_UPDATE_ERROR, 500);
    }

    if (!tutor) {
        throw new AppError("Tutor no encontrado", 404);
    }

    return tutor;
};
