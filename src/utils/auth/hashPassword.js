import bcrypt from 'bcrypt';


/**
 * Funcion para encriptar la contraseña del usuario
 * antes de guardarla en la base de datos.
 * 
 * @param {string} password - La contraseña sin encriptar(texto plano).
 * @return {string} - la contraseña encriptada(encriptada).
 */

export async function hashPassword(password) {
    const saltRounds = 10; // Número de rondas de encriptacion(seguirdad)

    //Genera el hash de la contraseña usando bcrypt.
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
}