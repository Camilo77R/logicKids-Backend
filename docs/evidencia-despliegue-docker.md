# Evidencia de Despliegue con Docker - LogicKids

## Objetivo
Demostrar una ejecucion reproducible de frontend y backend con Docker, sin depender de instalaciones locales de Node/Express en la maquina evaluadora.

## Estructura esperada para replicar
El `docker-compose.yml` del backend asume esta estructura:

```text
proyecto_final/
  logicKids-Backend/
  logicKids-Frontend/
```

## Instrucciones de replica (profesor)
1. Crear carpeta de trabajo:

```bash
mkdir proyecto_final
cd proyecto_final
```

2. Clonar ambos repositorios en sus ramas de entrega:

```bash
git clone -b feature/camilo-docker-evidencia <URL_BACKEND> logicKids-Backend
git clone -b camilo/entrega-docker <URL_FRONTEND> logicKids-Frontend
```

3. Entrar al backend:

```bash
cd logicKids-Backend
```

4. Crear `.env` a partir de `.env.example` y completar variables reales.

Variables requeridas:
- `PORT`
- `NODE_ENV`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL` (opcional para CORS en despliegue)

5. Levantar servicios:

```bash
docker compose up --build -d
```

6. Validar estado:

```bash
docker ps
curl http://localhost:3000/api/health
```

7. Validar interfaz:
- Frontend: `http://localhost:5173`
- Health backend: `http://localhost:3000/api/health`

## Comandos utiles
Ver logs:

```bash
docker compose logs -f
```

Detener servicios:

```bash
docker compose down
```

Reconstruir:

```bash
docker compose up --build
```

## Evidencias recomendadas (capturas)
- Rama usada en backend y frontend.
- Build de imagen backend y frontend.
- `docker compose up --build -d`.
- `docker ps` con ambos contenedores.
- Respuesta de `/api/health`.
- Frontend abierto en `http://localhost:5173`.
- Logs de comunicacion front/back durante login o registro.

## Nota de seguridad
- No subir `.env` a GitHub.
- Versionar solo `.env.example`.
- Compartir variables reales por canal privado cuando se requiera evaluacion.
