import { z } from "zod";

export const dashboardQuerySchema = z
    .object({
        groupId: z.string().uuid("El identificador del grupo es inválido").optional(),
    })
    .strict();
