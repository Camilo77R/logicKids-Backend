import { Router } from "express";
import { getTutorProfileController, updateTutorProfileController } from "../controllers/tutor.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { updateTutorProfileSchema } from "../schemas/updateTutorProfile.schema.js";

const router = Router();

// El perfil del tutor requiere identidad válida y rol correcto.
router.use(authMiddleware);
router.use(authorizeRoles("tutor"));

router.get("/profile", getTutorProfileController);
router.put("/profile", validateSchema(updateTutorProfileSchema), updateTutorProfileController);

export default router;
