#!/usr/bin/env node
// Conector: corre en la máquina del grupo y se conecta HACIA AFUERA (WebSocket) al Worker; no abre puertos.
// Recibe las preguntas del panel web, las responde con el servicio local gpt-headless (127.0.0.1:8765, de una en una)
// y devuelve la respuesta. Variables: CONECTOR_SECRET_FILE (o CONECTOR_SECRET), SITIO, GPT_LOCAL.
import { readFileSync } from "node:fs";

const SITIO = process.env.SITIO || "https://obraclara.adrielorihuela.net";
const GPT = process.env.GPT_LOCAL || "http://127.0.0.1:8765";
const SECRET = (process.env.CONECTOR_SECRET || (process.env.CONECTOR_SECRET_FILE ? readFileSync(process.env.CONECTOR_SECRET_FILE, "utf8") : "")).trim();
if (SECRET.length < 32) { console.error("Falta CONECTOR_SECRET_FILE (secreto de al menos 32 caracteres)."); process.exit(1); }
const log = (...m) => console.log(new Date().toISOString(), ...m);

let cola = Promise.resolve();   // gpt-headless atiende una pregunta a la vez
async function responder(ws, tarea) {
  const t0 = Date.now();
  let msg;
  try {
    const r = await fetch(GPT + "/v1/chat/completions", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: tarea.messages }), signal: AbortSignal.timeout(170000),
    });
    const j = await r.json();
    const texto = j?.choices?.[0]?.message?.content;
    if (!r.ok || !texto) throw new Error(j?.error?.message || `respuesta vacía (${r.status})`);
    msg = { type: "resultado", id: tarea.id, content: texto };
    log("ok", tarea.id.slice(0, 8), `${Date.now() - t0}ms`);
  } catch (e) {
    log("error", tarea.id.slice(0, 8), e.message);
    msg = { type: "resultado", id: tarea.id, error: "gpt-headless: " + String(e.message).slice(0, 200) };
  }
  try { ws.send(JSON.stringify(msg)); } catch { /* conexión caída: el Worker ya avisó al visitante */ }
}

let espera = 1000;
function conectar() {
  const ws = new WebSocket(SITIO.replace(/^http/, "ws") + "/gpt/ws", [SECRET]);
  let ping;
  ws.addEventListener("open", () => { log("conectado"); espera = 1000; ping = setInterval(() => { try { ws.send('{"type":"ping"}'); } catch {} }, 25000); });
  ws.addEventListener("message", (ev) => {
    try { const m = JSON.parse(String(ev.data)); if (m.type === "job") cola = cola.then(() => responder(ws, m)); } catch { /* ignorar */ }
  });
  ws.addEventListener("close", (ev) => { clearInterval(ping); log("desconectado", ev.code); setTimeout(conectar, espera); espera = Math.min(espera * 2, 30000); });
  ws.addEventListener("error", () => { /* 'close' se dispara después y reconecta */ });
}
log("conector iniciado ->", SITIO);
conectar();
