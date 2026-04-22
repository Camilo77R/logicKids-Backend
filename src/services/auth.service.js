import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";
import { comparePassword } from "../utils/auth/comparePassword.js";
import { hashPassword } from "../utils/auth/hashPassword.js";

const USERS_TABLE = "users";
const TUTOR_ROLE = "tutor";

// Consulta si ya existe un usuario con el email recibido para aplicar la regla de unicidad.
const findUserByEmail = async (email) => {
    const { data, error } = await supabase
        .from(USERS_TABLE)
        .select("id, email, role")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw new AppError("Error al verificar el usuario", 500);
    }

    return data;
};

// Mantiene compatibilidad con el frontend del Sprint 1 sin romper la DB oficial.
const resolveTutorFullName = ({ nombre, full_name }) => full_name || nombre;

// Verifica la unicidad del correo antes de crear el tutor.
const assertEmailIsAvailable = async (email) => {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new AppError("El correo ya esta registrado", 409);
    }
};

// Crea el tutor y devuelve solo los campos seguros que el cliente puede recibir.
const createTutor = async ({ full_name, email, password }) => {
    // (Cardona) Hashea la contrasena antes de guardarla en la base de datos.
    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
        .from(USERS_TABLE)
        .insert({
            full_name,
            email,
            password_hash: hashedPassword,
            role: TUTOR_ROLE,
        })
        .select("id, full_name, email, created_at, role")
        .single();

    if (error) {
        throw new AppError("Error al crear el usuario", 500);
    }

    // Crear grupo por defecto para el tutor //pen
    const { error: groupError } = await supabase
        .from("groups")
        .insert({
            user_id: data.id,
            name: "Mi grupo",
            is_default: true,
        });

    if (groupError) {
        // Si falla crear grupo, eliminar el usuario creado
        await supabase.from(USERS_TABLE).delete().eq("id", data.id);
        throw new AppError("Error al crear el grupo del tutor", 500);
    }

    return data;
};

// Obtiene el tutor con su hash de password para validar credenciales en login.
const findTutorForLogin = async (email) => {
    const { data, error } = await supabase
        .from(USERS_TABLE)
        .select("id, full_name, email, password_hash, role")
        .eq("email", email)
        .eq("role", TUTOR_ROLE)
        .maybeSingle();

    if (error) {
        throw new AppError("Error al buscar el usuario", 500);
    }

    return data;
};

// Caso de uso: registrar tutor con regla de unicidad.
export const registerTutor = async (payload) => {
    const full_name = resolveTutorFullName(payload);

    if (!full_name) {
        throw new AppError("El nombre es obligatorio", 400);
    }

    await assertEmailIsAvailable(payload.email);

    return createTutor({
        full_name,
        email: payload.email,
        password: payload.password,
    });
};

// Caso de uso: autenticar tutor sin exponer si el correo existe.
export const authenticateTutor = async ({ email, password }) => {
    const tutor = await findTutorForLogin(email);

    if (!tutor) {
        throw new AppError("Credenciales inválidas", 401);
    }

    // (Cardona) Compara la contrasena enviada contra el hash almacenado.
    const isValidPassword = await comparePassword(password, tutor.password_hash);

    if (!isValidPassword) {
        throw new AppError("Credenciales inválidas", 401);
    }

    return tutor;
};
