import { createTutor, findTutorByEmail } from "../services/auth.service.js";
import AppError from "../utils/app-error.js";

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
