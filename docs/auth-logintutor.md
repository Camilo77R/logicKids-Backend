# Login Tutor (Cardona)

## Objetivo
Implementar el login **completo pero SIN JWT** ni expiracion aun. La generacion del token corresponde a la tarea de Garces.

## Estado actual
El login funciona con validacion, busqueda por email, comparacion de password y errores controlados.

## Archivos clave
- `src/routes/auth.routes.js`: ruta `POST /api/auth/login`
- `src/controllers/auth.controller.js`: controlador `login` y alias `loginTutor`
- `src/services/auth.service.js`: `findTutorForLogin(email)`
- `src/schemas/login.schema.js`: validacion Zod (email, password)
- `src/middlewares/validateSchema.js`: middleware de validacion

## Flujo del login (sin JWT)
1. Valida `email` y `password` con Zod.
2. Busca tutor por email en DB.
3. Compara password.
4. Si falla, responde `401` con "Credenciales invalidas".
5. Si pasa, responde `200` con `id`, `nombre`, `email` (sin password).

## Respuesta esperada
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "id": "...",
    "nombre": "...",
    "email": "..."
  }
}
```

## Manejo de errores
- `400`: datos invalidos (Zod) con mensaje "Los datos enviados son incorrectos".
- `401`: credenciales invalidas (usuario no existe o password incorrecto).

## Nota para Garces (siguiente paso)
- Integrar `generateJWT(payload)` en login.
- Token con `id` y `email`.
- Expiracion (ej. `7d`).
- Firmar con `JWT_SECRET` desde `.env`.
- Probar login end-to-end.

## Como probar en Postman
- URL: `POST http://localhost:3000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "correo@ejemplo.com",
  "password": "tu_password"
}
```

Casos a probar:
- Correcto: `200` con datos del tutor.
- Credenciales invalidas: `401` con "Credenciales invalidas".
- Datos invalidos: `400` con "Los datos enviados son incorrectos".
