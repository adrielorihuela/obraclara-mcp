# Conector

Programa que corre en un equipo del grupo y se conecta **hacia afuera** (WebSocket) al Worker; no abre puertos.

- Recibe las preguntas del panel web (texto e imágenes) desde la cola en memoria del Worker (Durable Object) y las
  responde con la **API de IA privada del grupo**, compatible con OpenAI (`POST /v1/chat/completions`).
- La dirección de esa API **no está en el repositorio**: se configura en un archivo local fuera de git.
- Al visitante solo se le muestra la etiqueta «IA del servidor».
- También ejecuta las consultas SELECT de las herramientas MCP sobre una base SQLite local, para no gastar las lecturas
  del plan gratuito de D1. Si el conector no está conectado, el Worker usa D1 y, para el chat, su respaldo de emergencia
  (Workers AI y luego Groq).

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
