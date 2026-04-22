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

/**
 * Obtiene el perfil del usuario autenticado.
 *
 * @param {string} userId - ID del usuario del JWT
 * @returns {object} Datos del usuario
 */
export const getUserProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, institution, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return user;
};

/**
 * Actualiza el perfil del usuario autenticado.
 *
 * @param {string} userId
 * @param {{ full_name?, institution? }} updates
 * @returns {object} Usuario actualizado
 */
export const updateUserProfile = async (userId, updates) => {
  const allowedFields = {};
  if (updates.full_name) allowedFields.full_name = updates.full_name;
  if (updates.institution !== undefined) allowedFields.institution = updates.institution;

  const { data, error } = await supabase
    .from('users')
    .update(allowedFields)
    .eq('id', userId)
    .select('id, full_name, email, role, institution, updated_at')
    .single();

  if (error) throw error;
  return data;
};