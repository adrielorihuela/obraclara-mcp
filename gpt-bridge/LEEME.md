# Conector gpt-headless

Son dos proyectos separados:

- **gpt-headless** (`~/projects/gpt-headless`): el proveedor de IA. Servicio compatible con OpenAI en 127.0.0.1:8765 que acepta imágenes y
  hace su propio respaldo automático (ChatGPT web, luego Workers AI y luego Groq). Cada respuesta trae el campo `model` con quién respondió.
- **ObraClara** (este repo): usa gpt-headless como su única IA a través de este conector. El Worker mantiene las preguntas del panel
  en una cola en memoria (Durable Object, sin escribir en D1); el conector **se conecta hacia afuera** (WebSocket), reenvía los `messages`
  completos (texto e imágenes) a gpt-headless y devuelve `{content, modelo}`. No se abre ningún puerto de la máquina.
  El panel muestra «gpt-headless · <quién respondió>».

Servicios systemd de usuario: `gpt-headless` (la IA) y `obraclara` (este conector). El conector avisa en su mensaje inicial `imagenes: true`.

```bash
systemctl --user status gpt-headless obraclara
# a mano (sin systemd):
cd obraclara-mcp
CONECTOR_SECRET_FILE=~/.local/share/obraclara-gpt/secret node gpt-bridge/conector.mjs
```

Respaldo de emergencia: solo si el conector no está conectado, falla o está en pausa, el Worker responde con Workers AI y luego Groq
(rotando de modelo) y lo etiqueta «respaldo de ObraClara · <modelo>».

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
