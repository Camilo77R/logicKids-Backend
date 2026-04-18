import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getAuthenticatedUser } from "../controllers/protected.controller.js";

const router = Router();

// Todas las rutas de este router requieren JWT válido.
router.use(authMiddleware);

// Ruta protegida de smoke test para verificar JWT.
router.get("/protected/me", getAuthenticatedUser);

export default router;
