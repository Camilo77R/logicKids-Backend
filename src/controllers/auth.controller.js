import { createTutor, findTutorForLogin } from "../services/auth.service.js";
import AppError from "../utils/app-error.js";
import { generateJWT } from "../utils/auth/generateJWT.js";
import { comparePassword } from "../utils/auth/comparePassword.js";
import { loginSchema } from "../schemas/login.schema.js"; // 🔐 (Cardona) Zod

// ================= REGISTER =================
export const registerTutor = async (req, res, next) => {
    try {
        //  (Camilo) Crear tutor en la base de datos
        const tutor = await createTutor(req.body);

        //  (Cardona) Generar JWT después del registro
        // Permite que el usuario no tenga que loguearse nuevamente
        const token = generateJWT({
            id: tutor.id,
            email: tutor.email,
        });

        //  (Camilo + Cardona) Respuesta estandarizada sin password
        return res.status(201).json({
            success: true,
            data: {
                tutor: {
                    id: tutor.id,
                    nombre: tutor.nombre,
                    email: tutor.email,
                },
                token, //  Token de autenticación
            },
        });

    } catch (error) {
        return next(error);
    }
};

// ================= LOGIN =================
export const loginTutor = async (req, res, next) => {
    try {
        //  (Cardona) 1. VALIDACIÓN CON ZOD
        // Se valida que email y password cumplan reglas antes de procesar
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            // ❌ Error 400 → datos inválidos
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                errors: result.error.errors,
            });
        }

        //  Datos validados correctamente
        const { email, password } = result.data;

        // (Cardona base) 2. Buscar tutor por email
        const tutor = await findTutorForLogin(email);

        //  (Seguridad) NO revelar si el email existe
        if (!tutor) {
            return next(new AppError("Credenciales inválidas", 401));
        }

        //  (Cardona ) 3. Comparar contraseña con bcrypt
        const isValid = await comparePassword(password, tutor.password_hash);

        if (!isValid) {
            return next(new AppError("Credenciales inválidas", 401));
        }

        //  (Cardona) 4. Generar JWT
        const token = generateJWT({
            id: tutor.id,
            email: tutor.email,
        });

        //  5. Respuesta segura (sin password)
        return res.status(200).json({
            success: true,
            data: {
                tutor: {
                    id: tutor.id,
                    nombre: tutor.nombre,
                    email: tutor.email,
                },
                token, //  Token para autenticación en frontend
            },
        });

    } catch (error) {
        return next(error);
    }
};