// Middleware para rutas no encontradas (404).
// Se ejecuta cuando ninguna ruta anterior respondio.
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada"
    });
};

export default notFound;
