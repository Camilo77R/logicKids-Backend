# Flujo de Seguridad en Registro

## Objetivo
Documentar los cambios de seguridad agregados al registro de usuarios: hash de contrasena con bcrypt y generacion de JWT, manteniendo la estructura por capas.

## Flujo General
`request -> route -> validateSchema -> controller -> service -> errorHandler`

## Cambios implementados

### `auth.service`
Se hace hash de la contrasena antes de guardar en base de datos.

Puntos clave:
- `hashPassword(password)` se ejecuta antes del insert.
- Se guarda `password_hash` con el hash, nunca la contrasena en texto plano.
- El registro escribe en `users`, no en `tutors`.
- El registro fija `role = tutor`.

### `registerTutor` (controller)
Se genera el token JWT despues de crear el tutor y se mantiene el contrato del Sprint 1 hacia el frontend.

Puntos clave:
- Se usa `generateJWT` con `{ id, email, role }` como payload.
- Se devuelve `token` junto con el tutor en la respuesta `201`.
- La respuesta mantiene `nombre` hacia el frontend, aunque la DB persiste `full_name`.

## Casos probados en Postman
- Registro exitoso con respuesta `201` y `token`.
- Validaciones de datos invalidos con respuesta `400`.
- Usuario ya existente con respuesta `409`.
- Manejo de errores centralizado en `errorHandler`.

## Notas de integracion
- Se mantuvo el flujo y responsabilidades por capas.
- No se alteraron las rutas publicas del Sprint 1.
- Los cambios se concentraron en controller y service, respetando la regla DB-first.
