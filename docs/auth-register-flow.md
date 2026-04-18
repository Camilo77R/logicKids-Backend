# Flujo de Registro de Tutor

## Objetivo
Documentar el flujo actual de `POST /api/auth/register` para que el equipo tenga claro donde vive cada responsabilidad y como extenderlo sin mezclar capas.

## Regla del proyecto
La DB oficial manda. En esta fase el registro ya no trabaja contra `tutors`, sino contra `users` con `role = tutor`.

## Flujo General
`request -> route -> validateSchema -> controller -> service -> errorHandler`

## Responsabilidades por capa

### `registerSchema`
Valida las reglas minimas de entrada del registro:
- `nombre` o `full_name`
- `email`
- `password`

Aqui solo viven reglas de formato y estructura. La unicidad del email no va aqui porque depende de la base de datos.

### `validateSchema`
Middleware reutilizable que ejecuta un schema de Zod antes de llegar al controller.

Si los datos son validos:
- reemplaza `req.body` por el resultado validado
- llama `next()`

Si los datos son invalidos:
- crea un `AppError`
- delega la respuesta al `errorHandler`

### `registerTutor`
Controller que coordina el caso de uso HTTP.

Su trabajo es:
- leer el body ya validado
- pedir al service que ejecute el caso de uso de registro
- devolver la respuesta `201`

No debe validar manualmente ni hablar directo con Supabase.

### `auth.service`
Contiene la logica de negocio y acceso a datos del registro.

Funciones clave actuales:
- `registerTutor(payload)`: registra al tutor respetando la DB oficial
- `findUserByEmail(email)`: revisa si el correo ya existe
- `createTutor(data)`: inserta en `users` con `full_name`, `password_hash` y `role = tutor`

### `AppError`
Error personalizado para transportar:
- mensaje
- status HTTP

Sirve para que las capas internas puedan describir el problema sin responder directamente con `res.status(...).json(...)`.

### `errorHandler`
Middleware global que recibe errores y los transforma en respuestas JSON consistentes.

Su trabajo es:
- leer `err.status`
- leer `err.message`
- responder con el formato estandar de error

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

## Casos probados
- `201`: tutor creado correctamente
- `409`: el correo ya existe
- `400`: datos invalidos

## Notas de implementacion
- Se mantiene compatibilidad con frontend del Sprint 1 aceptando `nombre`, pero la DB persiste `full_name`.
- La contrasena se guarda hasheada en `password_hash`.
- El token JWT se genera despues del registro y se devuelve junto con el tutor.
