import { createTutor, findTutorForLogin } from "../services/auth.service.js";
import AppError from "../utils/app-error.js";
import { generateJWT } from "../utils/auth/generateJWT.js";
import { comparePassword } from "../utils/auth/comparePassword.js";

// ================= REGISTER =================
export const registerTutor = async (req, res, next) => {
    try {
        const tutor = await createTutor(req.body);

        //  JWT (parte de Cardona) parte de cardona, para que el cliente lo reciba al registrarse y no tenga que loguearse después de registrarse
        const token = generateJWT({
            id: tutor.id,
            email: tutor.email,
        });

        return res.status(201).json({
            success: true,
            data: {
                tutor: {
                    id: tutor.id,
                    nombre: tutor.nombre,
                    email: tutor.email,
                },
                token, // Parte de cardona, para que el cliente lo reciba al registrarse y no tenga que loguearse después de registrarse
            },
        });

    } catch (error) {
        return next(error);
    }
};

// ================= LOGIN =================
export const loginTutor = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const tutor = await findTutorForLogin(email);

        if (!tutor) {
            return next(new AppError("Credenciales inválidas", 401));
        }

        const isValid = await comparePassword(password, tutor.password_hash);

        if (!isValid) {
            return next(new AppError("Credenciales inválidas", 401));
        }

        // (esto es de Garcés)
        return res.status(200).json({
            success: true,
            data: {
                tutor: {
                    id: tutor.id,
                    nombre: tutor.nombre,
                    email: tutor.email,
                },
                //  Aquí Garcés agregará:
                // token: "jwt"
            },
        });

    } catch (error) {
        return next(error);
    }
};