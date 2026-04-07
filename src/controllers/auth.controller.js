import { createTutor, findTutorByEmail, findTutorForLogin } from "../services/auth.service.js";
import AppError from "../utils/app-error.js";
import { comparePassword } from "../utils/auth/comparePassword.js";

// Orquesta el flujo HTTP del registro sin mezclar acceso directo a la base de datos.
export const registerTutor = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existingTutor = await findTutorByEmail(email);

        if (existingTutor) {
            return next(new AppError("El usuario ya existe", 409));
        }

        const tutor = await createTutor(req.body);

        return res.status(201).json({
            success: true,
            message: "Tutor registrado correctamente",
            data: tutor,
        });
    } catch (error) {
        return next(error);
    }
};

// Orquesta el flujo HTTP del login sin mezclar acceso directo a la base de datos.
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const tutor = await findTutorForLogin(email);

        if (!tutor) {
            return next(new AppError("Credenciales invalidas", 401));
        }

        const isValid = await comparePassword(password, tutor.password_hash);

        if (!isValid) {
            return next(new AppError("Credenciales invalidas", 401));
        }

        return res.status(200).json({
            success: true,
            message: "Login exitoso",
            data: {
                id: tutor.id,
                nombre: tutor.nombre,
                email: tutor.email,
            },
        });
    } catch (error) {
        return next(error);
    }
};

// Alias requerido por checklist de Cardona (loginTutor).
export const loginTutor = login;
