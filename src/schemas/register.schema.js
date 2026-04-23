import { z } from "zod";

const institutionSchema = z.union([
    z.string().trim().min(2, "La institucion debe tener minimo 2 caracteres").max(120, "La institucion es demasiado larga"),
    z.literal(""),
]).transform((value) => value === "" ? null : value);

// Define las reglas minimas de entrada antes de ejecutar la logica de registro.
export const registerSchema = z.object({
    nombre: z.string().trim().min(2, "El nombre es obligatorio").optional(),
    full_name: z.string().trim().min(2, "El nombre es obligatorio").optional(),
    institution: institutionSchema.optional(),
    email: z.string().email({ message: "El correo no es valido" }).trim(),
    password: z.string().trim().min(8, "La contrasena debe tener minimo 8 caracteres"),
}).refine((data) => data.full_name || data.nombre, {
    message: "El nombre es obligatorio",
    path: ["nombre"],
});
