import { z } from "zod";

export const groupIdParamSchema = z.object({
    id: z.string().uuid("El identificador del grupo es inválido"),
});
