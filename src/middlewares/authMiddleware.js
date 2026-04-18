import jwt from "jsonwebtoken";
import AppError from "../utils/app-error.js";

/**
 * Middleware  para proteger rutas con JWT.
 *
 * Criterios de aceptación :
 * - Extrae el token desde Authorization.
 * - Valida el formato "Bearer <token>".
 * - Verifica el token con jsonwebtoken.verify().
 * - Decodifica payload y guarda id/email en req.user.
 * - Llama next() solo si el token es válido.
 * - Retorna 401 sin exponer información sensible cuando hay fallo de autenticación.
 */
const authMiddleware = (req, res, next) => {
    try {
        // Extraer token desde header Authorization.
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            // No hay header → 401
            return next(new AppError("No autorizado", 401));
        }

        // Verificar formato "Bearer <token>".
        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            // Formato inválido → 401
            return next(new AppError("No autorizado", 401));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET no está configurado");
            return next(new AppError("Error interno del servidor", 500));
        }

        // Validar token con jsonwebtoken.verify().
        const payload = jwt.verify(token, secret);

        // Tarea: Decodificar payload (id, email, role).
        const { id, email, role } = payload;
        if (!id || !email || !role) {
            // Payload no contiene datos esperados → 401
            return next(new AppError("No autorizado", 401));
        }

        // Agregar req.user = { id, email, role }.
        req.user = { id, email, role };

        // Tnext() se ejecuta si el token es válido.
        return next();
    } catch {
        // Cualquier error en la verificación entrega 401 sin detallar el motivo.
        return next(new AppError("No autorizado", 401));
    }
};

export default authMiddleware;
