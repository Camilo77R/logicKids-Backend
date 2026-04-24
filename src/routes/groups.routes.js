import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
    getGroups,
    createGroup,
    updateGroup,
    setDefaultGroup,
} from "../controllers/groups.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { createGroupSchema } from "../schemas/createGroup.schema.js";
import { groupIdParamSchema } from "../schemas/groupIdParam.schema.js";
import { updateGroupSchema } from "../schemas/updateGroup.schema.js";

const router = Router();

router.use(authMiddleware);
router.use(authorizeRoles("tutor"));

router.get("/", getGroups);
router.post("/", validateSchema(createGroupSchema), createGroup);
router.put("/:id", validateSchema(groupIdParamSchema, "params"), validateSchema(updateGroupSchema), updateGroup);
router.patch("/:id/default", validateSchema(groupIdParamSchema, "params"), setDefaultGroup);

export default router;
