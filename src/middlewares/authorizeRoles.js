import AppError from "../utils/app-error.js";

const FORBIDDEN_MESSAGE = "No tienes permisos para acceder a este recurso";
const UNAUTHORIZED_MESSAGE = "No autorizado";

/**
 * Crea un middleware de autorización por rol.
 *
 * POR QUÉ:
 * - Separa la autenticación de la autorización
 * - Evita repetir validaciones de rol en cada controller
 * - Hace explícito qué roles pueden entrar a cada módulo
 *
 * USO:
 * authorizeRoles("tutor")
 * authorizeRoles("admin", "tutor")
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        void res;

        const currentUserRole = req.user?.role;

        // Si no existe req.user, la ruta protegida se usó sin autenticación previa.
        if (!currentUserRole) {
            return next(new AppError(UNAUTHORIZED_MESSAGE, 401));
        }

        // Si el rol no está permitido para este recurso, respondemos 403.
        if (!allowedRoles.includes(currentUserRole)) {
            return next(new AppError(FORBIDDEN_MESSAGE, 403));
        }

        return next();
    };
};
