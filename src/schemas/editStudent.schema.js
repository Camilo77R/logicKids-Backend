import { z } from "zod";

// Reglas para validar la edicion de un estudiante
export const editStudentSchema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio").optional(),
    age: z.number().int().min(5, "Edad minima 5 años").max(13, "Edad maxima 13 años").optional(),
    avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color debe ser hexadecimal").optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
});
