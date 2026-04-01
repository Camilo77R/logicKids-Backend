import AppError from "../utils/app-error.js";

// Reutiliza la validacion de entrada para que los controllers reciban solo datos validos.
export const validateSchema = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            // Reemplaza el body original por datos ya validados para simplificar el controller.
            req.body = validatedData;

            next();
        } catch (error) {
            void error;
            return next(new AppError("Los datos enviados son incorrectos", 400));
        }
    };
};
