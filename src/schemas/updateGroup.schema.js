import { z } from "zod";

export const updateGroupSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "El nombre del grupo es obligatorio")
            .max(80, "El nombre del grupo es demasiado largo"),
    })
    .strict();
