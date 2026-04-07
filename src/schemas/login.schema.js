import { z } from "zod";

//  Schema de validación para login (Zod)
// Se encarga de validar los datos antes de llegar a la lógica de negocio
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password mínimo 6 caracteres")
});