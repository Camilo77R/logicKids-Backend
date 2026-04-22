import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";

const CHILDREN_TABLE = "children";
const GROUPS_TABLE = "groups";

// Busca el grupo por defecto del tutor
const getTutorDefaultGroupId = async (tutorId) => {
    const { data, error } = await supabase
        .from(GROUPS_TABLE)
        .select("id")
        .eq("user_id", tutorId)
        .eq("is_default", true)
        .maybeSingle();

    if (error) {
        throw new AppError("Error al obtener el grupo del tutor", 500);
    }

    if (!data) {
        throw new AppError("El tutor no tiene un grupo por defecto", 400);
    }

    return data.id;
};

// Inserta el estudiante en la base de datos
const createStudentInDB = async (groupId, studentData) => {
    const { data, error } = await supabase
        .from(CHILDREN_TABLE)
        .insert({
            group_id: groupId,
            name: studentData.name,
            age: studentData.age,
            avatar_color: studentData.avatar_color || "#3B82F6",
        })
        .select("id, name, age, avatar_color, access_code, created_at")
        .single();

    if (error) {
        throw new AppError("Error al crear el estudiante", 500);
    }

    return data;
};

// Funcion principal para crear estudiante
export const createStudent = async (tutorId, studentData) => {
    let groupId;

    if (studentData.group_id) {
        // Verificar que el grupo pertenece al tutor
        const { data: group, error } = await supabase
            .from(GROUPS_TABLE)
            .select("id")
            .eq("id", studentData.group_id)
            .eq("user_id", tutorId)
            .single();

        if (error || !group) {
            throw new AppError("Grupo no encontrado o no pertenece al tutor", 400);
        }

        groupId = studentData.group_id;
    } else {
        // Usar grupo por defecto
        groupId = await getTutorDefaultGroupId(tutorId);
    }

    return createStudentInDB(groupId, studentData);
};

// Verifica que el estudiante pertenezca al tutor
const verifyStudentOwnership = async (studentId, tutorId) => {
    const groupId = await getTutorDefaultGroupId(tutorId);
    const { data, error } = await supabase
        .from(CHILDREN_TABLE)
        .select("id")
        .eq("id", studentId)
        .eq("group_id", groupId)
        .maybeSingle();

    if (error) {
        throw new AppError("Error al verificar propiedad del estudiante", 500);
    }

    if (!data) {
        throw new AppError("Estudiante no encontrado o no pertenece al tutor", 404);
    }
};

// Actualiza un estudiante
export const updateStudent = async (studentId, tutorId, updateData) => {
    await verifyStudentOwnership(studentId, tutorId);

    const { data, error } = await supabase
        .from(CHILDREN_TABLE)
        .update(updateData)
        .eq("id", studentId)
        .select("id, name, age, avatar_color, access_code, updated_at")
        .single();

    if (error) {
        throw new AppError("Error al actualizar el estudiante", 500);
    }

    return data;
};

// Elimina un estudiante (soft delete)
export const deleteStudent = async (studentId, tutorId) => {
    await verifyStudentOwnership(studentId, tutorId);

    const { error } = await supabase
        .from(CHILDREN_TABLE)
        .update({ is_active: false })
        .eq("id", studentId);

    if (error) {
        throw new AppError("Error al eliminar el estudiante", 500);
    }
};
