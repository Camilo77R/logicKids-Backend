# logicKids Backend

## Integrantes
- Camilo Rivillas
- Sebastian Dorado
- Sebastian Cardona
- Sebastian Garces
- Jonathan Montenegro

## Sobre el proyecto
Backend en Node.js con Express. Se organiza por capas (config, controllers, services, routes, models, middlewares y utils) para mantener responsabilidades claras y facilitar el mantenimiento.

## Estructura
- src/app.js: configuracion de la app y middlewares.
- src/server.js: arranque del servidor.
- src/config/: configuraciones (por ejemplo Supabase).
- src/controllers/: controladores de rutas.
- src/services/: logica de negocio.
- src/routes/: definicion de rutas.
- src/models/: modelos y acceso a datos.
- src/middlewares/: middlewares reutilizables.
- src/utils/: utilidades compartidas.

## Como correr el proyecto
1) Instalar dependencias:
   
   npm install
2) Crear el archivo .env en la raiz (usa .env.example como guia).
3) Ejecutar en desarrollo:
   
   npm run dev

Si no existe el script dev, usa:

npm start
