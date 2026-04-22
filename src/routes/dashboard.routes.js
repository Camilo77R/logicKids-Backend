import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { getTutorDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

/**
 * Todas las rutas de este módulo requieren JWT válido.
 *
 * POR QUÉ:
 * El dashboard pertenece al tutor autenticado.
 * No debe existir acceso público a este resumen.
 */
router.use(authMiddleware);
router.use(authorizeRoles("tutor"));

/**
 * GET /api/dashboard
 *
 * POR QUÉ usamos "/" aquí:
 * Porque este router se montará en app.js sobre "/api/dashboard".
 * Entonces la ruta final será:
 *   GET /api/dashboard
 * y no:
 *   GET /api/dashboard/dashboard
 *
 * Además:
 * - authMiddleware valida identidad
 * - authorizeRoles("tutor") valida permiso
 */
router.get("/", getTutorDashboard);

export default router;
