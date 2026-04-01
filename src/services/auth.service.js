import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";

// Consulta si ya existe un tutor con el email recibido para aplicar la regla de unicidad.
export const findTutorByEmail = async (email) => {
    const { data, error } = await supabase
        .from("tutors")
        .select("id, email")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw new AppError("Error al verificar el usuario", 500);
    }

    return data;
};

// Crea el tutor y devuelve solo los campos seguros que el cliente puede recibir.
export const createTutor = async ({ nombre, email, password }) => {
    const { data, error } = await supabase
        .from("tutors")
        .insert({
            nombre,
            email,
            password_hash: password,
        })
        .select("id, nombre, email, created_at")
        .single();

    if (error) {
        throw new AppError("Error al crear el usuario", 500);
    }

    return data;
};
