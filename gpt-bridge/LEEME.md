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
