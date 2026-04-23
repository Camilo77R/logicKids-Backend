import { z } from "zod";

const institutionSchema = z.union([
    z.string().trim().min(2, "La institucion debe tener minimo 2 caracteres").max(120, "La institucion es demasiado larga"),
    z.literal(""),
]).transform((value) => value === "" ? null : value);

// Define los unicos campos que el tutor puede modificar desde su perfil.
export const updateProfileSchema = z.object({
    nombre: z.string().trim().min(2, "El nombre es obligatorio").optional(),
    full_name: z.string().trim().min(2, "El nombre es obligatorio").optional(),
    institution: institutionSchema.optional(),
}).refine(
    (data) => data.nombre || data.full_name || data.institution !== undefined,
    {
        message: "Debe enviar al menos un campo para actualizar",
        path: ["nombre"],
    }
);
