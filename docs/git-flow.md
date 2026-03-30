# Guia simple de Git Flow (para novatos)

Esta guia explica como trabajar en equipo sin pisarse ni romper la rama principal.

## Idea base (muy simple)
- `main`: version estable. Aqui solo entra lo que ya funciona.
- `develop`: trabajo diario del equipo.
- `feat/*`: ramas pequeñas para cada tarea.
- `fix/*`: ramas para arreglos puntuales.

## Reglas basicas
1) Nunca trabajes directo en `main`.
2) Tu trabajo va en una rama `feat/*` o `fix/*`.
3) Siempre actualiza tu rama antes de abrir un PR.
4) Si algo rompe, se arregla en otra rama, no en `main` directo.

## Flujo paso a paso (tarea nueva)
1) Actualiza tu local:

   git checkout develop
   git pull

2) Crea tu rama de trabajo:

   git checkout -b feat/nombre-corto

3) Trabaja y guarda cambios:

   git add .
   git commit -m "feat: descripcion corta"

4) Sube tu rama:

   git push -u origin feat/nombre-corto

5) Abre un Pull Request hacia `develop`.

## Antes de terminar tu PR
- Verifica que tu rama este actualizada:

  git checkout develop
  git pull
  git checkout feat/nombre-corto
  git merge develop

- Si hay conflictos, resuelvelos y vuelve a hacer commit.

## Cuando se hace merge a `main`
Solo cuando `develop` esta estable y probado:

1) Merge de `develop` a `main`.
2) (Opcional) Tag de version.
3) Deploy.

## Consejos para no pisarse
- Una tarea = una rama.
- Commits pequenos y claros.
- No toques archivos de otra tarea sin avisar.
- Si dudas, pregunta antes de mezclar ramas.

## Mensajes de commit recomendados
- feat: nueva funcionalidad
- fix: arreglo de bug
- docs: documentacion
- chore: tareas de mantenimiento

## Donde guardar esta guia
Esta guia debe vivir en `main` para que todos la vean al clonar el repo.
