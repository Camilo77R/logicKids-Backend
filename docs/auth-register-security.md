# Flujo de Seguridad en Registro

## Objetivo
Documentar los cambios de seguridad agregados al registro de usuarios: hash de contraseña con bcrypt y generación de JWT, sin alterar la estructura de capas existente.

## Flujo General
`request -> route -> validateSchema -> controller -> service -> errorHandler`

## Cambios implementados

### `auth.service`
Se agregó el hash de contraseña antes de guardar en base de datos.

Puntos clave:
- `hashPassword(password)` se ejecuta antes del insert.
- Se guarda `password_hash` con el hash, nunca la contraseña en texto plano.

### `registerTutor` (controller)
Se agregó la generación del token JWT después de crear el tutor.

Puntos clave:
- Se usa `generateJWT` con `{ id, email }` como payload.
- Se devuelve `token` junto con el tutor en la respuesta `201`.

## Casos probados en Postman
- Registro exitoso con respuesta `201` y `token`.
- Validaciones de datos invalidos con respuesta `400`.
- Usuario ya existente con respuesta `409`.
- Manejo de errores centralizado en `errorHandler`.

## Notas de integracion
- Se mantuvo el flujo y responsabilidades por capas.
- No se alteraron rutas ni middlewares existentes.
- Los cambios se concentraron en controller y service.
