#!/usr/bin/env node
// Conector: corre en la máquina del grupo y se conecta HACIA AFUERA (WebSocket) al Worker; no abre puertos.
// Recibe las preguntas del panel web, las responde con la API de IA privada del grupo (compatible con OpenAI) y devuelve
// la respuesta. La dirección de esa API NO está en el repositorio: se lee de IA_URL (y opcionalmente IA_KEY, IA_MODELO),
// normalmente desde ~/.config/obraclara/conector.env. Otras variables: CONECTOR_SECRET_FILE (o CONECTOR_SECRET), SITIO, DB_PATH.
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { DatabaseSync } from "node:sqlite";

const SITIO = process.env.SITIO || "https://obraclara.adrielorihuela.net";
const IA_URL = (process.env.IA_URL || "").replace(/\/+$/, "");
if (!IA_URL) { console.error("Falta IA_URL (API de IA compatible con OpenAI). Ver conector/LEEME.md."); process.exit(1); }
const IA_KEY = process.env.IA_KEY || "";
const IA_MODELO = process.env.IA_MODELO || "";
const ETIQUETA = process.env.IA_ETIQUETA || "IA del servidor";
const SECRET = (process.env.CONECTOR_SECRET || (process.env.CONECTOR_SECRET_FILE ? readFileSync(process.env.CONECTOR_SECRET_FILE, "utf8") : "")).trim();
if (SECRET.length < 32) { console.error("Falta CONECTOR_SECRET_FILE (secreto de al menos 32 caracteres)."); process.exit(1); }
const DB_PATH = process.env.DB_PATH || homedir() + "/.local/share/obraclara/inversiones.db";
let db = null;
function abrirDb() { try { if (existsSync(DB_PATH)) db = new DatabaseSync(DB_PATH, { readOnly: true }); } catch (e) { console.error("No se pudo abrir la base:", e.message); db = null; } }
abrirDb();
// Solo SELECT de una sentencia; las sentencias las escribe el Worker, no los visitantes.
function consultar(ws, m) {
  let msg;
  try {
    if (!db) throw new Error("base local no disponible");
    if (!/^\s*select\s/i.test(m.sql) || m.sql.includes(";")) throw new Error("solo se permite una sentencia SELECT");
    const st = db.prepare(m.sql);
    const filas = m.modo === "first" ? [st.get(...(m.params ?? []))] : st.all(...(m.params ?? []));
    msg = m.modo === "first" ? { type: "resultado", id: m.id, row: filas[0] ?? null } : { type: "resultado", id: m.id, rows: filas };
  } catch (e) { msg = { type: "resultado", id: m.id, error: String(e.message).slice(0, 200) }; }
  try { ws.send(JSON.stringify(msg)); } catch { /* conexión caída */ }
}
const log = (...m) => console.log(new Date().toISOString(), ...m);

// Varias preguntas a la vez (si la API las atiende en paralelo): CONCURRENCIA por defecto 3.
const CONCURRENCIA = Number(process.env.CONCURRENCIA || 3);
let activas = 0;
const enCola = [];
function lanzar(ws, tarea) {
  const correr = () => { activas++; responder(ws, tarea).finally(() => { activas--; const sig = enCola.shift(); if (sig) sig(); }); };
  if (activas < CONCURRENCIA) correr(); else enCola.push(correr);
}
async function responder(ws, tarea) {
  const t0 = Date.now();
  let msg;
  try {
    const r = await fetch(IA_URL + "/v1/chat/completions", {
      method: "POST", headers: { "content-type": "application/json", ...(IA_KEY ? { authorization: "Bearer " + IA_KEY } : {}) },
      body: JSON.stringify({ ...(IA_MODELO ? { model: IA_MODELO } : {}), messages: tarea.messages }), signal: AbortSignal.timeout(170000),
    });
    const j = await r.json();
    const texto = j?.choices?.[0]?.message?.content;
    if (!r.ok || !texto) throw new Error(j?.error?.message || `respuesta vacía (${r.status})`);
    // Al visitante solo se le muestra la etiqueta genérica; el modelo real queda en el registro local.
    msg = { type: "resultado", id: tarea.id, content: texto, modelo: ETIQUETA };
    log("ok", tarea.id.slice(0, 8), `${Date.now() - t0}ms`, typeof j.model === "string" ? j.model : "");
  } catch (e) {
    log("error", tarea.id.slice(0, 8), e.message);
    msg = { type: "resultado", id: tarea.id, error: "IA del servidor: " + String(e.message).slice(0, 200) };
  }
  try { ws.send(JSON.stringify(msg)); } catch { /* conexión caída: el Worker ya avisó al visitante */ }
}

let espera = 1000;
function conectar() {
  const ws = new WebSocket(SITIO.replace(/^http/, "ws") + "/conector/ws", [SECRET]);
  let ping;
  ws.addEventListener("open", () => { log("conectado", db ? "(SQL local activo)" : "(sin base local: el Worker usará D1)"); ws.send(JSON.stringify({ type: "hola", sql: !!db, imagenes: true })); espera = 1000; ping = setInterval(() => { try { ws.send('{"type":"ping"}'); } catch {} }, 25000); });
  ws.addEventListener("message", (ev) => {
    try { const m = JSON.parse(String(ev.data)); if (m.type === "job") lanzar(ws, m); else if (m.type === "sql") consultar(ws, m); } catch { /* ignorar */ }
  });
  ws.addEventListener("close", (ev) => { clearInterval(ping); log("desconectado", ev.code); setTimeout(conectar, espera); espera = Math.min(espera * 2, 30000); });
  ws.addEventListener("error", () => { /* 'close' se dispara después y reconecta */ });
}
log("conector iniciado ->", SITIO);
conectar();
