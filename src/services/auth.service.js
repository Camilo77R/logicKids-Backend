import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";
import { hashPassword } from "../utils/auth/hashPassword.js";

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
    const hashedPassword = await hashPassword(password); // (Parte modificada por cardona) Hashea la contraseña antes de guardarla

    const { data, error } = await supabase
        .from("tutors")
        .insert({
            nombre,
            email,
            password_hash: hashedPassword, // (Parte modificada por cardona) Guarda el hash de la contraseña, no la contraseña en texto plano
        })
        .select("id, nombre, email, created_at")
        .single();

    if (error) {
        throw new AppError("Error al crear el usuario", 500);
    }

    return data;
};

// Obtiene el tutor con su hash de password para validar credenciales en login.
export const findTutorForLogin = async (email) => {
    const { data, error } = await supabase
        .from("tutors")
        .select("id, nombre, email, password_hash")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw new AppError("Error al buscar el usuario", 500);
    }

    return data;
};
