import { z } from "zod";

// Define las reglas minimas de entrada antes de ejecutar la logica de registro.
export const registerSchema = z.object({
    nombre: z.string().trim().min(2, "El nombre es obligatorio"),
    email: z.email({ message: "El correo no es valido" }).trim(),
    password: z.string().trim().min(8, "La contrasena debe tener minimo 8 caracteres"),
});
