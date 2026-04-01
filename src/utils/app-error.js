// Representa errores controlados de la aplicacion con su status HTTP asociado.
class AppError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

export default AppError;
