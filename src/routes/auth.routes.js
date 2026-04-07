import { Router } from "express";
import { registerTutor, loginTutor } from "../controllers/auth.controller.js";
import { registerSchema } from "../schemas/register.schema.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { loginSchema } from "../schemas/login.schema.js";
const router = Router();

router.post("/register", validateSchema(registerSchema), registerTutor);
router.post("/login", validateSchema(loginSchema), loginTutor);

export default router;
