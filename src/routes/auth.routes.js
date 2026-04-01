import { Router } from "express";
import { registerTutor } from "../controllers/auth.controller.js";
import { registerSchema } from "../schemas/register.schema.js";
import { validateSchema } from "../middlewares/validateSchema.js";

const router = Router();

router.post("/register", validateSchema(registerSchema), registerTutor);

export default router;
