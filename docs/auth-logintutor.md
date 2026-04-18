# Login Tutor (Cardona)

## Objetivo
Documentar el login actual de `POST /api/auth/login` ya alineado con la DB oficial y con JWT activo.

## Estado actual
El login funciona con validacion, busqueda por email, comparacion de password, generacion de JWT y errores controlados.

## Archivos clave
- `src/routes/auth.routes.js`: ruta `POST /api/auth/login`
- `src/controllers/auth.controller.js`: controlador `loginTutor`
- `src/services/auth.service.js`: `authenticateTutor(payload)`
- `src/schemas/login.schema.js`: validacion Zod (email, password)
- `src/middlewares/validateSchema.js`: middleware de validacion

## Flujo del login
1. Valida `email` y `password` con Zod.
2. Busca tutor por email en `users` filtrando `role = tutor`.
3. Compara la contrasena enviada con el hash almacenado.
4. Si falla, responde `401` con "Credenciales invalidas".
5. Si pasa, genera JWT y responde `200` con tutor seguro y token.

## Respuesta actual esperada
```json
{
  "success": true,
  "data": {
    "tutor": {
      "id": "...",
      "nombre": "...",
      "email": "..."
    },
    "token": "..."
  }
}
```

## Payload del token
- `id`
- `email`
- `role`

## Manejo de errores
- `400`: datos invalidos (Zod) con mensaje "Los datos enviados son incorrectos".
- `401`: credenciales invalidas (usuario no existe o password incorrecto).

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
- Correcto: `200` con tutor y token.
- Credenciales invalidas: `401` con "Credenciales invalidas".
- Datos invalidos: `400` con "Los datos enviados son incorrectos".
