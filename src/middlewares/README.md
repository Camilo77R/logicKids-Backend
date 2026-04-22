# middlewares

Funciones que se ejecutan antes de llegar a la ruta (auth, logs, validacion).
Se reutilizan en varias rutas.

- `authMiddleware.js` -> valida JWT e identifica al usuario autenticado
- `authorizeRoles.js` -> valida si el rol autenticado puede usar el recurso
