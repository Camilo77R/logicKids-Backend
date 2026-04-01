# Flujo de Registro de Tutor

## Objetivo
Documentar el flujo actual de `POST /api/auth/register` para que el equipo tenga claro donde vive cada responsabilidad y como extenderlo sin mezclar capas.

## Flujo General
`request -> route -> validateSchema -> controller -> service -> errorHandler`

## Responsabilidades por capa

### `registerSchema`
Valida las reglas minimas de entrada del registro:
- `nombre`
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
- pedir al service que revise si el email existe
- pedir al service que cree el tutor
- devolver la respuesta `201`

No debe validar manualmente ni hablar directo con Supabase.

### `auth.service`
Contiene la logica de negocio y acceso a datos de registro.

Funciones actuales:
- `findTutorByEmail(email)`: revisa si el tutor ya existe
- `createTutor(data)`: inserta el tutor y devuelve solo campos seguros

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

## Casos probados
- `201`: tutor creado correctamente
- `409`: el usuario ya existe
- `400`: datos invalidos

## Decision temporal del proyecto
Por ahora el registro guarda `password` en la columna `password_hash` de forma temporal.

Esto se hizo para completar el bloque backend de Camilo sin bloquear el trabajo del compañero encargado de hash y JWT.

## Pendiente para la siguiente fase
- reemplazar el guardado temporal por `bcrypt`
- generar JWT
- devolver `token` junto con el tutor
- revisar si la respuesta final debe estandarizarse con `message`, `data` y `token`
