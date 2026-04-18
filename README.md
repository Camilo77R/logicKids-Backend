# logicKids Backend

## Integrantes
- Camilo Rivillas
- Sebastian Dorado
- Sebastian Cardona
- Sebastian Garces
- Jonathan Montenegro
- Mauricio

## Sobre el proyecto
Backend en Node.js con Express. Se organiza por capas (config, controllers, services, routes, models, middlewares y utils) para mantener responsabilidades claras y facilitar el mantenimiento.

## Objetivo del proyecto
LogicKids es un proyecto de grado del SENA orientado a apoyar al tutor en la observacion y evaluacion del razonamiento logico de ninos mediante una experiencia digital ludica. El sistema permite registrar tutores y estudiantes, controlar el acceso del nino a las sesiones diagnosticas, capturar evidencia de desempeno durante los minijuegos y presentar resultados utiles para identificar fortalezas, dificultades y necesidades de acompanamiento.

El foco principal del proyecto no es la ensenanza directa, sino la generacion de informacion diagnostica que ayude al tutor a comprender como se desempena cada nino y como proceder con su seguimiento.

Este objetivo puede ajustarse si el proyecto evoluciona, pero hoy representa la guia oficial del equipo.

## Regla actual
La DB oficial manda. El backend del Sprint 1 ya fue alineado para trabajar con `users` y `role`, manteniendo compatibilidad con el frontend existente.

Para mas contexto, revisar `docs/project-objective.md`.

## Estructura
- `src/app.js`: configuracion de la app y middlewares.
- `src/server.js`: arranque del servidor.
- `src/config/`: configuraciones (por ejemplo Supabase).
- `src/controllers/`: controladores de rutas.
- `src/services/`: logica de negocio.
- `src/routes/`: definicion de rutas.
- `src/models/`: modelos y acceso a datos.
- `src/middlewares/`: middlewares reutilizables.
- `src/utils/`: utilidades compartidas.
- `database/schema.sql`: esquema oficial de base de datos.

## Como correr el proyecto
1. Instalar dependencias:

   `npm install`

2. Crear el archivo `.env` en la raiz (usa `.env.example` como guia).

3. Ejecutar en desarrollo:

   `npm run dev`

Si no existe el script `dev`, usa:

`npm start`
