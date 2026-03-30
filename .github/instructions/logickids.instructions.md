---
applyTo: "**"
description: >
  Instrucciones del proyecto LogicKids. Activa siempre dentro de este workspace.
  Plataforma educativa para niños 7-10 años. Stack: React, React Native+Expo,
  Node.js+Express, PostgreSQL/Supabase, Godot 4.
---

# LogicKids — Contexto del Proyecto

## Qué es LogicKids

Plataforma educativa para evaluar y desarrollar el pensamiento lógico en niños de 7 a 10 años.
Equipo de 5 personas: Christ, Dorado, Jonathan (Sebastián), Cardona, Garcés.

---

## Arquitectura del sistema

```
┌─────────────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│  React Web App      │     │  React Native + Expo  │     │  Godot 4          │
│  (tutores/docentes) │     │  (estudiantes)        │     │  (minijuegos)     │
└────────┬────────────┘     └──────────┬────────────┘     └─────────┬─────────┘
         │                             │                             │
         └─────────────────┬───────────┘                             │
                           ▼                                         │
              ┌────────────────────────┐                             │
              │  Node.js + Express     │◄────────────────────────────┘
              │  API REST              │
              └────────────┬───────────┘
                           ▼
              ┌────────────────────────┐
              │  PostgreSQL (Supabase) │
              │  + Supabase Auth       │
              └────────────────────────┘
```

---

## Reglas de desarrollo en este proyecto

### Roles de usuario
- **Tutor/Docente**: usa la web app React. Ve reportes, configura actividades.
- **Estudiante**: usa la app móvil React Native. Juega los minijuegos.
- Nunca mezclar lógica de un rol en la interfaz del otro.

### Base de datos
- ORM: usar queries de Supabase client o SQL directo — no Prisma en este proyecto.
- Toda tabla tiene `created_at` y `updated_at` por convención.
- Soft delete preferido sobre hard delete donde haya datos de estudiantes.

### API
- Rutas REST en Express, siempre con manejo de errores explícito.
- JWT via Supabase Auth — no implementar auth custom.
- Respuestas siempre con estructura `{ data, error, message }`.

### Godot / Minijuegos
- Godot 4 + GDScript.
- Solo Christ y Cardona tienen experiencia aquí — no asumir que todos entienden Godot.
- Calidad esperada comparable a: Piano Kids, Lingo Kids.
- Los minijuegos son el componente de mayor impacto pedagógico — prioridad de calidad alta.

### Convenciones de código
- Componentes React: PascalCase, un componente por archivo.
- Funciones y variables: camelCase.
- Archivos de utilidades: kebab-case.
- Comentarios en español para lógica de negocio, inglés para código técnico genérico.

---

## Lo que NO hacer en este proyecto

- ❌ No usar `localStorage` para datos de sesión — usar Supabase Auth.
- ❌ No poner lógica de negocio en componentes — separar en hooks o servicios.
- ❌ No hardcodear IDs, rutas o strings de configuración — usar variables de entorno.
- ❌ No asumir que el estudiante tiene buena conexión — diseñar con offline-first en mente para la app móvil.
- ❌ No usar librerías pesadas sin evaluar el impacto en la app móvil.

---

## Contexto pedagógico

El sistema evalúa **pensamiento lógico** en niños. Esto implica:
- UX extremadamente simple y visual para los niños.
- Feedback inmediato y positivo — nunca punitivo.
- Las métricas de evaluación deben ser invisibles para el niño pero visibles para el tutor.
- Cualquier flujo para estudiantes debe ser aprobable por alguien sin experiencia técnica.
