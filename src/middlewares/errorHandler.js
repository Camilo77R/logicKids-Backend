// Centraliza la respuesta de errores para mantener el mismo formato entre endpoints.
const errorHandler = (err, req, res, next) => {
    void req;
    void next;

    const status = err.status || 500;
    const message = err.message || "Error interno del servidor";
    
    return res.status(status).json({
        success: false,
        message
    });
};

export default errorHandler;
