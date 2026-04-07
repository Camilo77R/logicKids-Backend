import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Todas las rutas de este router requieren JWT válido.
router.use(authMiddleware);

// Rutas protegidas de ejemplo para demostrar la autenticación.
router.get("/students", (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            user: req.user,
            students: [
                { id: 1, nombre: "Alumno Ejemplo" },
                { id: 2, nombre: "Alumno Demo" }
            ]
        },
        message: "Acceso autorizado a lista de estudiantes"
    });
});

router.get("/group-sessions", (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            user: req.user,
            sessions: [
                { id: 101, nombre: "Grupo 1" },
                { id: 102, nombre: "Grupo 2" }
            ]
        },
        message: "Acceso autorizado a sesiones de grupo"
    });
});

export default router;
