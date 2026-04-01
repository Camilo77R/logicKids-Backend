import "dotenv/config";
import app from "./app.js";
import checkDatabase from "./services/healthService.js";

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || "development";

console.log(`Entorno activo: ${env}`);

const server = app.listen(port, () => {
    console.log(`Servidor activo en el puerto ${port}`);
});

// Si falla el arranque (puerto ocupado, etc.), cerramos el proceso con mensaje claro
server.on("error", (error) => {
	console.error("Error al iniciar el servidor:", error.message);
	process.exit(1);
});

checkDatabase();

process.on("unhandledRejection", (reason) => {
	console.error("Promesa rechazada sin catch:", reason);
	process.exit(1);
});

process.on("uncaughtException", (error) => {
	console.error("Excepcion no controlada:", error.message);
	process.exit(1);
});

