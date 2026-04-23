import { Router } from "express";
import { getMe, loginTutor, registerTutor, updateMe } from "../controllers/auth.controller.js";
import { registerSchema } from "../schemas/register.schema.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { loginSchema } from "../schemas/login.schema.js";
import { updateProfileSchema } from "../schemas/updateProfile.schema.js";
import requireAuth from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", validateSchema(registerSchema), registerTutor);
router.post("/login", validateSchema(loginSchema), loginTutor);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, validateSchema(updateProfileSchema), updateMe);

export default router;
