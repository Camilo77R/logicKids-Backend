import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { getTutorDashboard } from "../controllers/dashboard.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { dashboardQuerySchema } from "../schemas/dashboardQuery.schema.js";

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

router.get("/", validateSchema(dashboardQuerySchema, "query"), getTutorDashboard);

export default router;
