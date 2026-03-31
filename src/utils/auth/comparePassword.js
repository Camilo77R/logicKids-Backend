import bcrypt from 'bcrypt';
/**
 * Función para comparar una contraseña en texto plano
 * con una contraseña encriptada (hash).
 * 
 * Se usa en el login.
 * 
 * @param {string} password - La contraseña sin encriptar (texto plano). 
 * @param {string} hashedPassword - La contraseña encriptada (hash).
 * @return {boolean} - true si las contraseñas coinciden, false en caso contrario.
 */

export async function comparePassword(password, hash) {
    // Compara la contraseña en texto plano con el hash usando bcrypt.
    const match = await bcrypt.compare(password, hash);
    return match; // Devuelve true si coinciden, false si no.
}