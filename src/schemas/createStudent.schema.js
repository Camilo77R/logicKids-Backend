import { z } from "zod";

// Reglas para validar la creacion de un estudiante
export const createStudentSchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    age: z.number().int().min(5, "Edad minima 5 años").max(13, "Edad maxima 13 años"),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color debe ser hexadecimal").optional(),
    group_id: z.string().uuid("El group_id debe ser un UUID válido").optional(),
});
