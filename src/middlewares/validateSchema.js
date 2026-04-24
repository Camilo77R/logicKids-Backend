import AppError from "../utils/app-error.js";

// Reutiliza la validacion de entrada para que los controllers reciban solo datos validos.
export const validateSchema = (schema, target = "body") => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req[target]);

            // req.query en Express es una propiedad calculada de solo lectura.
            // Por eso guardamos siempre la version validada en req.validated
            // y solo reescribimos body/params cuando el segmento sí es mutable.
            req.validated = {
                ...(req.validated ?? {}),
                [target]: validatedData,
            };

            if (target !== "query") {
                req[target] = validatedData;
            }

            next();
        } catch (error) {
            void error;
            return next(new AppError("Los datos enviados son incorrectos", 400));
        }
    };
};
