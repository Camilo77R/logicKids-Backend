import { getTutorDashboardSummary } from "../services/dashboard.service.js";

/**
 * Controller del dashboard inicial del tutor.
 *
 * POR QUÉ:
 * Esta capa adapta la petición HTTP al caso de uso del dashboard.
 * No consulta la DB directamente ni decide reglas del negocio.
 *
 * RESPONSABILIDAD:
 * - toma el tutor autenticado desde req.user
 * - llama al service
 * - devuelve la respuesta HTTP con el formato estándar
 */
export const getTutorDashboard = async (req, res, next) => {
    try {
        const dashboard = await getTutorDashboardSummary(req.user.id);

        return res.status(200).json({
            success: true,
            data: dashboard,
            message: "Dashboard cargado correctamente",
        });
    } catch (error) {
        return next(error);
    }
};
