#!/usr/bin/env node
// Conector: corre en la máquina del grupo y llama HACIA AFUERA al Worker (no abre puertos).
// Recoge las preguntas pendientes, las responde con el servicio local gpt-headless (127.0.0.1:8765) y devuelve la respuesta.
// Variables: CONECTOR_SECRET_FILE (o CONECTOR_SECRET), SITIO (por defecto https://obraclara.adrielorihuela.net), GPT_LOCAL.
import { readFileSync } from "node:fs";

const SITIO = process.env.SITIO || "https://obraclara.adrielorihuela.net";
const GPT = process.env.GPT_LOCAL || "http://127.0.0.1:8765";
const SECRET = (process.env.CONECTOR_SECRET || (process.env.CONECTOR_SECRET_FILE ? readFileSync(process.env.CONECTOR_SECRET_FILE, "utf8") : "")).trim();
if (SECRET.length < 32) { console.error("Falta CONECTOR_SECRET_FILE (secreto de al menos 32 caracteres)."); process.exit(1); }
const log = (...m) => console.log(new Date().toISOString(), ...m);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (ruta, cuerpo) => fetch(SITIO + ruta, {
  method: "POST", headers: { authorization: "Bearer " + SECRET, "content-type": "application/json" },
  body: JSON.stringify(cuerpo ?? {}), signal: AbortSignal.timeout(30000),
});

async function responder(tarea) {
  const t0 = Date.now();
  try {
    const r = await fetch(GPT + "/v1/chat/completions", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: tarea.messages }), signal: AbortSignal.timeout(170000),
    });
    const j = await r.json();
    const texto = j?.choices?.[0]?.message?.content;
    if (!r.ok || !texto) throw new Error(j?.error?.message || `respuesta vacía (${r.status})`);
    await post("/gpt/resultado", { id: tarea.id, content: texto });
    log("ok", tarea.id.slice(0, 8), `${Date.now() - t0}ms`);
  } catch (e) {
    log("error", tarea.id.slice(0, 8), e.message);
    await post("/gpt/resultado", { id: tarea.id, error: "gpt-headless: " + e.message }).catch(() => {});
  }
}

log("conector iniciado ->", SITIO);
let espera = 2000;
for (;;) {
  try {
    const r = await post("/gpt/siguiente");
    if (r.status === 200) { espera = 500; await responder(await r.json()); continue; }
    if (r.status === 401) { console.error("Secreto rechazado por el Worker."); process.exit(2); }
    espera = 2000;
  } catch (e) { log("sin conexión:", e.message); espera = Math.min(espera * 2, 30000); }
  await dormir(espera);
}
