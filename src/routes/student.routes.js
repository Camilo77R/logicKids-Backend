import { Router } from "express";
import { createStudentController, updateStudentController, deleteStudentController } from "../controllers/student.controller.js";
import { createStudentSchema } from "../schemas/createStudent.schema.js";
import { editStudentSchema } from "../schemas/editStudent.schema.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, validateSchema(createStudentSchema), createStudentController);
router.put("/:id", authMiddleware, validateSchema(editStudentSchema), updateStudentController);
router.delete("/:id", authMiddleware, deleteStudentController);

export default router;
