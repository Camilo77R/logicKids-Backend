import { hashPassword } from "../utils/auth/hashPassword.js";
import { comparePassword } from "../utils/auth/comparePassword.js";
import { generateJWT } from "../utils/auth/generateJWT.js";
import dotenv from "dotenv";
dotenv.config(); // Carga las variables de entorno desde el archivo .env
async function testAuth() {
  const password = "123456";

  // 1. Hash password
  const hashed = await hashPassword(password);
  console.log("Password original:", password);
  console.log("Password hash:", hashed);

  // 2. Compare password
  const match = await comparePassword(password, hashed);
  console.log("¿Las contraseñas coinciden?", match);

  // 3. Generate JWT
  const token = generateJWT({
    id: 1,
    email: "test@test.com"
  });

  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  console.log("JWT Token:", token);
}

testAuth();