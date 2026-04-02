import { Router } from "express";

const router = Router();

// Expone un punto simple para confirmar que el backend desplegado esta activo.
router.get("/", (req, res) => {
    void req;
    return res.status(200).json({
        success: true,
        message: "LogicKids Backend activo",
        data: {
            service: "logickids-backend",
            status: "ok"
        }
    });
});

export default router;
