# Conector

Programa que corre en un equipo del grupo y se conecta **hacia afuera** (WebSocket) al Worker; no abre puertos.

- Recibe las preguntas del panel web (texto e imágenes) desde la cola en memoria del Worker (Durable Object) y las
  responde con la **API de IA privada del grupo**, compatible con OpenAI (`POST /v1/chat/completions`).
- La dirección de esa API **no está en el repositorio**: se configura en un archivo local fuera de git.
- Al visitante solo se le muestra la etiqueta «IA del servidor».
- También ejecuta las consultas SELECT de las herramientas MCP sobre una base SQLite local, para no gastar las lecturas
  del plan gratuito de D1. Si el conector no está conectado, el Worker usa D1 y, para el chat, su respaldo de emergencia
  (Workers AI y luego Groq).

## Horario de clase: no reiniciar ni desplegar

**Miércoles y viernes de 09:00 a 11:10 (hora de Lima)** no se reinicia el servicio `obraclara` ni se despliega el Worker
(un push a `worker/**` despliega). Cada reinicio o despliegue corta el conector unos segundos: el chat muestra
«Reconectando…» y sigue, pero en una exposición en vivo se nota. El flujo de despliegue avisa (no bloquea) si se lanza en ese horario.

Si el conector se corta, vuelve a conectarse solo (0,5 s, 1 s, 2 s… hasta 15 s entre intentos). El navegador espera hasta
unos 16 s antes de pasar al modo de emergencia, y si el turno siguió en la API trae su respuesta sin volver a enviar el mensaje.

## Configuración local (no se sube a GitHub)

`~/.config/obraclara/conector.env`:

```bash
IA_URL=http://<host>:<puerto>        # API compatible con OpenAI (obligatoria)
IA_KEY=                              # opcional, si la API pide clave
IA_MODELO=                           # opcional
CONECTOR_SECRET_FILE=/ruta/al/secreto   # el mismo valor que el secreto CONECTOR_SECRET del Worker
DB_PATH=~/.local/share/obraclara/inversiones.db
```

Servicio systemd de usuario `obraclara` con `EnvironmentFile=%h/.config/obraclara/conector.env` y
`ExecStart=node conector/conector.mjs`. A mano:

```bash
set -a; . ~/.config/obraclara/conector.env; set +a
node conector/conector.mjs
```

## Base local

```bash
python etl/inversiones.py --csv DETALLE_INVERSIONES.csv --out build --fecha "$(date +%F)"
python etl/cargar_sqlite.py --build build --db ~/.local/share/obraclara/inversiones.db
```

## Modo agente

El conector anuncia `agente: true` al conectarse. Es un **cliente delgado**: toda la lógica del agente (turnos, mensajes durante un turno,
lectura y creación de archivos, MCP, reintentos, limpieza de la respuesta) vive en la API local.

- El Worker expone `POST /api/agente` (`{chat_id, mensaje, archivos?: [{nombre, datos}], mcp?: true}`; `datos` en base64 crudo; cuerpo máx. ~25 MB)
  y lo reenvía al conector como tarea `agente`. El conector llama una sola vez a `IA_URL/v1/agente` tal cual, añadiendo el servidor MCP de ObraClara
  (`SITIO/mcp`) si `mcp` es verdadero.
- Respuesta 200: el conector descarga solo los `adjuntos` que declara la API (máx. 25 MB en total; los que no caben van en `omitidos`), reenvía `archivos_chat` (archivos vigentes del chat, con `version`) y baja también las versiones que el navegador aún no tiene (si no caben: `pendiente: true`). Devuelve
  `{chat_id, respuesta, adjuntos, archivos_chat, mensajes_incorporados, archivos: [{nombre, titulo, tipo, version, datos}]}`. Bajo demanda, `GET /api/agente/archivos.zip?chat_id=…` trae el .zip con todos los archivos del chat. Respuesta 202 (ya había un turno en curso):
  `{estado: "inyectado", chat_id, pendientes}`. Espera máxima: 300 s. Al visitante no se le muestra qué proveedor respondió.
- Progreso: mientras dura el turno, el conector sigue `IA_URL/v1/agente/chats/<id>/eventos` (SSE) y empuja cada evento (`paso`, `herramienta`,
  `archivo`, `mensaje_incorporado`, `fin`, `error`) por el WebSocket; el Worker los guarda en memoria por chat y el navegador los lee en
  `GET /api/agente/eventos?chat_id=…&desde=N`.
