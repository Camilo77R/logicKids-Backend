import { z } from "zod";

// Valida el nombre del grupo antes de llegar a la lógica de negocio.
export const createGroupSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "El nombre del grupo es obligatorio")
            .max(80, "El nombre del grupo es demasiado largo"),
    })
    .strict();
