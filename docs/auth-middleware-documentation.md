# Middleware de Autenticación JWT - LogicKids Backend

## Resumen
Este documento explica la implementación del middleware de autenticación JWT y las rutas protegidas agregadas al backend de LogicKids.

## Archivos Creados/Modificados

### 1. `src/middlewares/authMiddleware.js`
**Propósito**: Middleware reutilizable que protege rutas requiriendo un token JWT válido.

**Funcionalidades**:
- Extrae el token del header `Authorization: Bearer <token>`
- Valida el formato del header
- Verifica la validez del token usando `jsonwebtoken.verify()`
- Decodifica el payload y asigna `req.user = { id, email }`
- Llama `next()` solo si el token es válido
- Retorna error 401 genérico en caso de fallo (sin exponer detalles sensibles)

**Criterios de Aceptación Cumplidos**:
- ✅ Maneja error si no hay header Authorization
- ✅ Maneja error si formato no es Bearer
- ✅ Maneja error si token es inválido o expirado
- ✅ Retorna error 401 con mensaje genérico
- ✅ Código limpio y reutilizable

### 2. `src/routes/protected.routes.js`
**Propósito**: Router con rutas protegidas que requieren autenticación JWT.

**Rutas Implementadas**:
- `GET /api/students`: Lista de estudiantes (datos de ejemplo)
- `GET /api/group-sessions`: Lista de sesiones de grupo (datos de ejemplo)

**Características**:
- Todas las rutas usan `authMiddleware` aplicado a nivel de router
- Devuelven datos de ejemplo junto con `req.user` para confirmar autenticación
- Responden con código 200 y estructura JSON estandarizada

### 3. `src/app.js` (modificado)
**Cambios**: Agregado import y montaje del router protegido en `/api`

## Flujo de Autenticación

```
Cliente → Header Authorization: Bearer <token>
       ↓
authMiddleware → Verifica formato
       ↓
authMiddleware → Verifica token con JWT_SECRET
       ↓
authMiddleware → Decodifica payload (id, email)
       ↓
req.user = { id, email }
       ↓
next() → Ruta protegida ejecuta
       ↓
Respuesta 200 con datos
```

## Manejo de Errores
- **Sin header**: 401 "No autorizado"
- **Formato inválido**: 401 "No autorizado"
- **Token inválido/expirado**: 401 "No autorizado"
- **Payload incompleto**: 401 "No autorizado"
- **JWT_SECRET no configurado**: 500 "Error interno del servidor"

## Pruebas Recomendadas

### Usando Postman:

1. **Rutas Públicas** (sin token):
   - `GET http://localhost:3000/` → 200
   - `GET http://localhost:3000/api/health` → 200

2. **Obtener Token**:
   - `POST http://localhost:3000/api/auth/register`
     - Body: `{"nombre":"Test","email":"test@test.com","password":"12345678"}`
   - O `POST http://localhost:3000/api/auth/login`
     - Body: `{"email":"test@test.com","password":"12345678"}`
   - Copiar token de la respuesta

3. **Rutas Protegidas sin Token**:
   - `GET http://localhost:3000/api/students` → 401
   - `GET http://localhost:3000/api/group-sessions` → 401

4. **Rutas Protegidas con Token Inválido**:
   - Header: `Authorization: Bearer abc.invalid.token`
   - `GET http://localhost:3000/api/students` → 401

5. **Rutas Protegidas con Token Válido**:
   - Header: `Authorization: Bearer <token>`
   - `GET http://localhost:3000/api/students` → 200 con datos
   - `GET http://localhost:3000/api/group-sessions` → 200 con datos

## Definition of Done
- ✅ Middleware extrae correctamente el token del header
- ✅ Token válido se decodifica correctamente
- ✅ req.user contiene id y email
- ✅ next() se ejecuta cuando el token es válido
- ✅ Código limpio y reutilizable
- ✅ Error 401 si no hay token
- ✅ Error 401 si token inválido o expirado
- ✅ Mensaje genérico: "No autorizado"
- ✅ Rutas protegidas no funcionan sin token
- ✅ Rutas funcionan correctamente con token válido
- ✅ Flujo probado end-to-end
- ✅ No rompe rutas públicas

## Notas Técnicas
- Usa `jsonwebtoken` para verificación
- Compatible con Express middleware pattern
- Manejo de errores consistente con el proyecto
- No expone información sensible en errores
- Reutilizable en múltiples rutas