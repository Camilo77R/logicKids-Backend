import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";
import { comparePassword } from "../utils/auth/comparePassword.js";
import { hashPassword } from "../utils/auth/hashPassword.js";
import { resolveTutorFullName } from "../utils/tutor-name.js";

const USERS_TABLE = "users";
const GROUPS_TABLE = "groups";
const TUTOR_ROLE = "tutor";
const DEFAULT_GROUP_NAME = "Mi grupo";
const TUTOR_REGISTER_FIELDS = "id, full_name, email, institution, created_at, role";
const TUTOR_LOGIN_FIELDS = "id, full_name, email, institution, password_hash, role";

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

// Todo tutor nace con un grupo default para evitar friccion en dashboard y children.
const createDefaultGroupForTutor = async (tutorId) => {
    const { error } = await supabase
        .from(GROUPS_TABLE)
        .insert({
            user_id: tutorId,
            name: DEFAULT_GROUP_NAME,
            is_default: true,
        });

    if (error) {
        throw new AppError("Error al crear el grupo inicial del tutor", 500);
    }
};

const rollbackTutorCreation = async (tutorId) => {
    await supabase
        .from(USERS_TABLE)
        .delete()
        .eq("id", tutorId);
};

// Verifica la unicidad del correo antes de crear el tutor.
const assertEmailIsAvailable = async (email) => {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new AppError("El correo ya esta registrado", 409);
    }
};

// Crea el tutor y devuelve solo los campos seguros que el cliente puede recibir.
const createTutor = async ({ full_name, email, password, institution }) => {
    // (Cardona) Hashea la contrasena antes de guardarla en la base de datos.
    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
        .from(USERS_TABLE)
        .insert({
            full_name,
            email,
            institution: institution ?? null,
            password_hash: hashedPassword,
            role: TUTOR_ROLE,
        })
        .select(TUTOR_REGISTER_FIELDS)
        .single();

    if (error) {
        throw new AppError("Error al crear el usuario", 500);
    }

    try {
        await createDefaultGroupForTutor(data.id);
    } catch (groupError) {
        await rollbackTutorCreation(data.id);
        throw groupError;
    }

    return data;
};

// Obtiene el tutor con su hash de password para validar credenciales en login.
const findTutorForLogin = async (email) => {
    const { data, error } = await supabase
        .from(USERS_TABLE)
        .select(TUTOR_LOGIN_FIELDS)
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
        institution: payload.institution,
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
