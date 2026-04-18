# Middleware de Autenticacion JWT - LogicKids Backend

## Resumen
Este documento explica la implementacion del middleware de autenticacion JWT y la ruta protegida de smoke test agregada al backend de LogicKids.

## Archivos creados o modificados

### 1. `src/middlewares/authMiddleware.js`
**Proposito**: Middleware reutilizable que protege rutas requiriendo un token JWT valido.

**Funcionalidades**:
- Extrae el token del header `Authorization: Bearer <token>`
- Valida el formato del header
- Verifica la validez del token usando `jsonwebtoken.verify()`
- Decodifica el payload y asigna `req.user = { id, email, role }`
- Llama `next()` solo si el token es valido
- Retorna error 401 generico en caso de fallo

### 2. `src/routes/protected.routes.js`
**Proposito**: Router con una ruta protegida de smoke test.

**Ruta actual**:
- `GET /api/protected/me`: devuelve `req.user` cuando el token es valido

**Caracteristicas**:
- Usa `authMiddleware` a nivel de router
- No devuelve datos fake del dominio
- Sirve para confirmar que el flujo JWT funciona end-to-end

### 3. `src/controllers/protected.controller.js`
**Proposito**: responder el smoke test protegido con el formato JSON estandar del proyecto.

## Flujo de autenticacion

```
Cliente -> Header Authorization: Bearer <token>
       -> authMiddleware valida formato y firma
       -> authMiddleware decodifica payload (id, email, role)
       -> req.user = { id, email, role }
       -> controller responde 200 con usuario autenticado
```

## Manejo de errores
- **Sin header**: 401 "No autorizado"
- **Formato invalido**: 401 "No autorizado"
- **Token invalido o expirado**: 401 "No autorizado"
- **Payload incompleto**: 401 "No autorizado"
- **JWT_SECRET no configurado**: 500 "Error interno del servidor"

## Pruebas recomendadas

1. **Rutas publicas**:
   - `GET http://localhost:3000/` -> 200
   - `GET http://localhost:3000/api/health` -> 200

2. **Obtener token**:
   - `POST http://localhost:3000/api/auth/register`
   - o `POST http://localhost:3000/api/auth/login`

3. **Ruta protegida sin token**:
   - `GET http://localhost:3000/api/protected/me` -> 401

4. **Ruta protegida con token invalido**:
   - Header: `Authorization: Bearer abc.invalid.token`
   - `GET http://localhost:3000/api/protected/me` -> 401

5. **Ruta protegida con token valido**:
   - Header: `Authorization: Bearer <token>`
   - `GET http://localhost:3000/api/protected/me` -> 200 con `req.user`

## Definition of Done
- Middleware extrae correctamente el token del header
- Token valido se decodifica correctamente
- `req.user` contiene `id`, `email` y `role`
- `next()` se ejecuta cuando el token es valido
- Error 401 si no hay token o si es invalido
- Mensaje generico: "No autorizado"
- La ruta protegida no funciona sin token
- La ruta protegida funciona correctamente con token valido
