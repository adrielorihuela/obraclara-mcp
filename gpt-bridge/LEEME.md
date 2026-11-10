# Conector gpt-headless

El Worker mantiene las preguntas del panel web en una cola en memoria (Durable Object, sin escribir en D1). Este conector, que corre en la máquina donde está
`gpt-headless`, **se conecta hacia afuera** (WebSocket) al Worker, recibe las preguntas, las responde con `gpt-headless`
(127.0.0.1:8765) y devuelve la respuesta. No se abre ningún puerto de esa máquina.

```bash
cd ~/projects/gpt && ./gpt start                       # enciende gpt-headless
cd obraclara-mcp
CONECTOR_SECRET_FILE=~/.local/share/obraclara-gpt/secret node gpt-bridge/conector.mjs
```

El secreto es el mismo que el secreto `GPT_CONECTOR_SECRET` del Worker (`wrangler secret put GPT_CONECTOR_SECRET`).
Mientras el conector no esté corriendo, el panel muestra que la IA no está conectada y se puede usar «Mi propia clave».

## Consultas de datos en el servidor
El conector también ejecuta las consultas SELECT de las herramientas MCP sobre una base SQLite local
(`~/.local/share/obraclara-gpt/inversiones.db`), así no se gastan las lecturas del plan gratuito de D1 (5 millones de filas
por día, y cada búsqueda por texto recorre 150 mil). Si el conector no está conectado, el Worker usa D1 como respaldo.

```bash
python etl/inversiones.py --csv DETALLE_INVERSIONES.csv --out build --fecha "$(date +%F)"
python etl/cargar_sqlite.py --build build --db ~/.local/share/obraclara-gpt/inversiones.db
```
Reparto: en Cloudflare (plan gratuito) están el Worker, la página, el servidor MCP, la cola en memoria (Durable Object),
el límite de uso y una copia de los datos en D1; en el servidor (este equipo) están `gpt-headless`, el conector y la base local.
