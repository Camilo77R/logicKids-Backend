// Middleware central de errores.
// Se ejecuta cuando alguna ruta llama next(err) o lanza un error.
// Devuelve una respuesta JSON consistente y un status adecuado.
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ error: message });
};

export default errorHandler;