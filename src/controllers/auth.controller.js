import { createTutor, findTutorByEmail } from "../services/auth.service.js";
import AppError from "../utils/app-error.js";
import { generateJWT } from "../utils/auth/generateJWT.js";


// Orquesta el flujo HTTP del registro sin mezclar acceso directo a la base de datos.
export const registerTutor = async (req, res, next) => {
    try {
        const { email } = req.body;

        const existingTutor = await findTutorByEmail(email);

        if (existingTutor) {
            return next(new AppError("El usuario ya existe", 409));
        }

        const tutor = await createTutor(req.body);

        // (Parte modificada por cardona) Genera un token JWT para el tutor recién registrado, incluyendo su id y email como payload.
        const token = generateJWT({
            id: tutor.id,
            email: tutor.email,
        });

        return res.status(201).json({
            success: true,
            message: "Tutor registrado correctamente",
            data: tutor,
            token, // (Parte modificada por cardona) Devuelve el token JWT al cliente para que pueda usarlo en futuras solicitudes autenticadas
        });
    } catch (error) {
        return next(error);
    }
};
