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

// Modo agente: el conector solo reenvía. La API local lleva toda la lógica (turnos, mensajes durante un turno, lectura y creación
// de archivos, reintentos, limpieza de la respuesta); aquí se añade el servidor MCP de ObraClara, se reenvía el POST /v1/agente
// tal cual, se descargan los `adjuntos` que declara la API y se empujan al Worker los eventos de progreso del turno.
const AGENTE_MAX_BYTES = 25 * 1024 * 1024; // descarga total de adjuntos hacia el navegador
const TIPOS = { txt: "text/plain", md: "text/markdown", csv: "text/csv", json: "application/json", html: "text/html", pdf: "application/pdf", zip: "application/zip", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
const cabIA = () => (IA_KEY ? { authorization: "Bearer " + IA_KEY } : {});
const enviar = (ws, msg) => { try { ws.send(JSON.stringify(msg)); } catch { /* conexión caída */ } };

// Una suscripción al SSE de eventos por chat mientras dura el turno; cada evento va al Worker por el WebSocket.
const turnos = new Map();
function suscribir(ws, chat, esperar) {
  const ctl = new AbortController();
  (async () => {
    try {
      const r = await fetch(`${IA_URL}/v1/agente/chats/${chat}/eventos${esperar ? "?esperar=1" : ""}`, { headers: { accept: "text/event-stream", ...cabIA() }, signal: ctl.signal });
      if (!r.ok || !r.body) return;
      const dec = new TextDecoder(); let buf = "";
      for await (const trozo of r.body) {
        buf += dec.decode(trozo, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const bloque = buf.slice(0, i); buf = buf.slice(i + 2);
          const datos = bloque.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).replace(/^ /, "")).join("");
          if (!datos) continue;
          let ev; try { ev = JSON.parse(datos); } catch { continue; }
          enviar(ws, { type: "evento", chat_id: chat, tipo: ev.tipo, texto: ev.texto });
          if (ev.tipo === "fin" || ev.tipo === "error") { ctl.abort(); return; }
        }
      }
    } catch { /* cerrada o caída: el progreso es opcional */ }
  })();
  return ctl;
}

async function agente(ws, tarea) {
  const t0 = Date.now();
  const chat = /^[A-Za-z0-9_-]{1,64}$/.test(String(tarea.chat_id)) ? tarea.chat_id : "";
  let sub = chat ? turnos.get(chat) : null, propia = false;
  if (chat && !sub) { sub = suscribir(ws, chat, true); turnos.set(chat, sub); propia = true; }
  let msg;
  try {
    const r = await fetch(IA_URL + "/v1/agente", {
      method: "POST", headers: { "content-type": "application/json", ...cabIA() },
      body: JSON.stringify({ ...(chat ? { chat_id: chat } : {}), mensaje: tarea.mensaje, archivos: tarea.archivos ?? [], ...(tarea.mcp === true ? { mcp: [{ url: SITIO + "/mcp", nombre: "obraclara" }] } : {}) }), signal: AbortSignal.timeout(300000),
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 202) {
      // Había un turno en curso: la API ya guardó el mensaje. Si este conector no seguía ese turno, empieza a seguirlo.
      if (propia) { sub.abort(); turnos.delete(chat); propia = false; sub = suscribir(ws, chat, false); turnos.set(chat, sub); setTimeout(() => { if (turnos.get(chat) === sub) turnos.delete(chat); sub.abort(); }, 300000); }
      msg = { type: "resultado", id: tarea.id, codigo: 202, cuerpo: { estado: j.estado ?? "inyectado", chat_id: j.chat_id ?? chat, ...(Number.isFinite(j.pendientes) ? { pendientes: j.pendientes } : {}) } };
      log("agente 202", tarea.id.slice(0, 8));
    } else if (!r.ok || typeof j?.respuesta !== "string") {
      throw new Error(j?.error?.message || (typeof j?.error === "string" ? j.error : "") || `respuesta vacía (${r.status})`);
    } else {
      const archivos = []; const omitidos = []; const pendientes = []; let total = 0;
      const adjuntos = (Array.isArray(j.adjuntos) ? j.adjuntos : []).slice(0, 20);
      const vigentes = (Array.isArray(j.archivos_chat) ? j.archivos_chat : []).slice(0, 100);
      const conocidos = tarea.conocidos && typeof tarea.conocidos === "object" ? tarea.conocidos : {};
      const subidos = new Set(Array.isArray(tarea.subidos) ? tarea.subidos : []);
      // Primero lo entregado en este turno; después lo vigente del chat que el navegador aún no tiene (versiones nuevas).
      const bajar = async (a, obligatorio) => {
        try {
          if (typeof a?.url !== "string" || !a.url.startsWith("/") || a.url.startsWith("//")) return;
          if (total + (Number(a.bytes) || 0) > AGENTE_MAX_BYTES) { (obligatorio ? omitidos : pendientes).push(a.ruta); return; }
          const d = await fetch(IA_URL + a.url, { headers: cabIA(), signal: AbortSignal.timeout(60000) });
          if (!d.ok) { (obligatorio ? omitidos : pendientes).push(a.ruta); return; }
          const b = Buffer.from(await d.arrayBuffer());
          if (total + b.length > AGENTE_MAX_BYTES) { (obligatorio ? omitidos : pendientes).push(a.ruta); return; }
          total += b.length;
          const ext = String(a.ruta).split(".").pop().toLowerCase();
          archivos.push({ nombre: String(a.ruta), ...(typeof a.titulo === "string" && a.titulo ? { titulo: a.titulo.slice(0, 100) } : {}), ...(Number.isFinite(a.version) ? { version: a.version } : {}), tipo: TIPOS[ext] || "application/octet-stream", datos: b.toString("base64") });
        } catch { (obligatorio ? omitidos : pendientes).push(a?.ruta); }
      };
      for (const a of adjuntos) await bajar(a, true);
      for (const a of vigentes) {
        if (archivos.some((x) => x.nombre === a?.ruta && x.version === a?.version) || (a?.origen === "usuario" && subidos.has(a?.ruta)) || conocidos[a?.ruta] === a?.version) continue;
        await bajar(a, false);
      }
      // Solo se reenvían los campos que el sitio usa (sin direcciones internas ni datos del proveedor).
      const meta = (a) => ({ ruta: a.ruta, titulo: a.titulo, bytes: a.bytes, tipo: a.tipo, ...(Number.isFinite(a.version) ? { version: a.version } : {}), ...(a.origen === "usuario" || a.origen === "agente" ? { origen: a.origen } : {}), ...(a.actualizado ? { actualizado: a.actualizado } : {}) });
      const cuerpo = { chat_id: j.chat_id ?? chat, respuesta: j.respuesta, adjuntos: adjuntos.map(meta), ...(Array.isArray(j.archivos_chat) ? { archivos_chat: vigentes.map(meta) } : {}), mensajes_incorporados: Number(j.mensajes_incorporados) || 0, archivos, ...(omitidos.length ? { omitidos } : {}), ...(pendientes.length ? { pendiente: true, pendientes } : {}) };
      msg = { type: "resultado", id: tarea.id, codigo: 200, cuerpo };
      log("agente ok", tarea.id.slice(0, 8), `${Date.now() - t0}ms`, `archivos=${archivos.length}`);
    }
  } catch (e) {
    log("agente error", tarea.id.slice(0, 8), e.message);
    msg = { type: "resultado", id: tarea.id, error: "Agente del servidor: " + String(e.message).slice(0, 200) };
  }
  // El turno terminó: se deja un momento para que llegue el último evento y se libera el chat para el siguiente turno.
  if (propia) { turnos.delete(chat); setTimeout(() => sub.abort(), 4000); }
  enviar(ws, msg);
}

// .zip con los archivos vigentes del chat, bajo demanda (lo arma la API local).
async function zipChat(ws, m) {
  let msg;
  try {
    const chat = /^[A-Za-z0-9_-]{1,64}$/.test(String(m.chat_id)) ? m.chat_id : "";
    if (!chat) throw new Error("chat no válido");
    const d = await fetch(`${IA_URL}/v1/agente/chats/${chat}/archivos-chat.zip`, { headers: cabIA(), signal: AbortSignal.timeout(50000) });
    if (!d.ok) throw new Error(`respuesta ${d.status}`);
    const b = Buffer.from(await d.arrayBuffer());
    if (b.length > AGENTE_MAX_BYTES) throw new Error("el .zip supera el límite de descarga");
    msg = { type: "resultado", id: m.id, zip: b.toString("base64") };
  } catch (e) { msg = { type: "resultado", id: m.id, error: "No se pudo preparar el .zip: " + String(e.message).slice(0, 150) }; }
  enviar(ws, msg);
}

let espera = 1000;
function conectar() {
  const ws = new WebSocket(SITIO.replace(/^http/, "ws") + "/conector/ws", [SECRET]);
  let ping;
  ws.addEventListener("open", () => { log("conectado", db ? "(SQL local activo)" : "(sin base local: el Worker usará D1)"); ws.send(JSON.stringify({ type: "hola", sql: !!db, imagenes: true, agente: true })); espera = 1000; ping = setInterval(() => { try { ws.send('{"type":"ping"}'); } catch {} }, 25000); });
  ws.addEventListener("message", (ev) => {
    try { const m = JSON.parse(String(ev.data)); if (m.type === "job") lanzar(ws, m); else if (m.type === "agente") agente(ws, m); else if (m.type === "zip") zipChat(ws, m); else if (m.type === "sql") consultar(ws, m); } catch { /* ignorar */ }
  });
  ws.addEventListener("close", (ev) => { clearInterval(ping); log("desconectado", ev.code); setTimeout(conectar, espera); espera = Math.min(espera * 2, 30000); });
  ws.addEventListener("error", () => { /* 'close' se dispara después y reconecta */ });
}
log("conector iniciado ->", SITIO);
conectar();
