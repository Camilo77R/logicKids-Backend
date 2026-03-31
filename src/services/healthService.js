import { supabase } from "../config/supabase.js";

// Verifica si las credenciales de Supabase permiten conectar sin frenar el arranque.
const checkDatabase = async () => {
	try {
		const { error } = await supabase
			.from("tutors")
			.select("id")
			.limit(1);

		if (error) {
			console.error("Conexion a DB: ERROR -", error.message);
			return;
		}

		console.log("Conexion a DB: OK");
	} catch (err) {
		console.error("Conexion a DB: ERROR -", err.message);
	}
};

export default checkDatabase;
