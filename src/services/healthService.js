import { supabase } from "../config/supabase.js";
import AppError from "../utils/app-error.js";

const USERS_TABLE = "users";
const DATABASE_CONNECTION_ERROR = "No fue posible conectar con la base de datos";

// Reutiliza la misma consulta de verificacion para health y para el arranque del servidor.
const probeDatabaseConnection = async () => {
    const { error } = await supabase
        .from(USERS_TABLE)
        .select("id")
        .limit(1);

    if (error) {
        throw new AppError(DATABASE_CONNECTION_ERROR, 500);
    }
};

export const getDatabaseHealthStatus = async () => {
    await probeDatabaseConnection();

    return {
        status: "ok",
        database: "connected",
    };
};

// (Garcés) Verifica si las credenciales de Supabase permiten conectar sin frenar el arranque.
const checkDatabase = async () => {
    try {
        await probeDatabaseConnection();
        console.log("Conexion a DB: OK");
    } catch (error) {
        console.error("Conexion a DB: ERROR -", error.message);
    }
};

export default checkDatabase;
