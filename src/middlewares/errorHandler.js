// Middleware central de errores.
// Se ejecuta cuando alguna ruta llama next(err) o lanza un error.
// Devuelve una respuesta JSON consistente y un status adecuado.
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Error interno del servidor";
    res.status(status).json({
        success: false,
        message
    });
};

export default errorHandler;
