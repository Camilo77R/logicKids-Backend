import jwt from "jsonwebtoken";

/**
 * Genera un token JWT para un usuario autenticado.
 * 
 * @param {Object} payload - Datos del usuario (id, email, etc.) que se incluirán en el token.
 * @return {string} - El token JWT firmado.
 */

export function generateJWT(payload) {
    const token = jwt.sign(
        payload, // Datos del usuario que se incluirán en el token.
        process.env.JWT_SECRET, // Clave secreta para firmar el token (debe estar en variables de entorno).
        { expiresIn: "7d" } // El token expirará en 7 días.
    );
    return token; // Devuelve el token JWT generado.
}