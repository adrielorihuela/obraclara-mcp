// Cola en memoria de preguntas para la IA del servidor (Durable Object; no escribe en D1 ni en disco).
// El conector que corre en la máquina del grupo se conecta por WebSocket (llamada saliente), recibe las preguntas
// una a una y devuelve las respuestas. Si el conector no está conectado, el panel lo informa.
import { DurableObject } from "cloudflare:workers";
import { MAX_PENDIENTES, type Mensaje } from "./lib/gptjobs";

const TIEMPO_MAX_MS = 85_000;
type Resp = { codigo?: number; cuerpo?: unknown; content?: string; modelo?: string; error?: string; rows?: unknown[]; row?: unknown };
const TIEMPO_SQL_MS = 8_000;
const TIEMPO_AGENTE_MS = 300_000;
const MAX_AGENTES = 6; // turnos y mensajes al agente a la vez (la API decide qué hacer con cada uno)
const MAX_CHATS_EVENTOS = 40;
const MAX_EVENTOS = 300;
const TIPOS_EVENTO = new Set(["paso", "herramienta", "archivo", "mensaje_incorporado", "fin", "error"]);
type Evento = { n: number; tipo: string; texto: string };
type Agente = { chat_id?: string; resolver: (r: Resp) => void };

export class ColaIA extends DurableObject {
  private conn: WebSocket | null = null;
  private pendientes = new Map<string, (r: Resp) => void>();
  private consultas = new Map<string, (r: Resp) => void>();
  // Envíos al agente: canal aparte (un envío durante un turno no espera detrás del turno largo; la API decide y responde 202).
  private agentes = new Map<string, Agente>();
  // Progreso de los turnos por chat, solo en memoria; el conector lo empuja desde la API y el navegador lo consulta.
  private eventos = new Map<string, { n: number; lista: Evento[] }>();
  private sqlListo = false;
  private imagenes = false;
  private agente = false;

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      const pair = new WebSocketPair();
      const [cliente, servidor] = [pair[0], pair[1]];
      servidor.accept();
      try { this.conn?.close(1000, "reemplazado"); } catch { /* ya cerrado */ }
      this.conn = servidor;
      servidor.addEventListener("message", (ev) => {
        try {
          const m = JSON.parse(String(ev.data)) as { codigo?: number; cuerpo?: unknown; type?: string; id?: string; chat_id?: string; tipo?: string; texto?: string; content?: string; modelo?: string; error?: string; rows?: unknown[]; row?: unknown; sql?: boolean; imagenes?: boolean; agente?: unknown };
          if (m.type === "ping") return servidor.send(JSON.stringify({ type: "pong" }));
          if (m.type === "hola") { this.sqlListo = !!m.sql; this.imagenes = !!m.imagenes; this.agente = !!m.agente; return; }
          if (m.type === "evento") return this.guardarEvento(m.chat_id, m.tipo, m.texto);
          if (m.type === "resultado" && m.id) {
            const r = this.pendientes.get(m.id) ?? this.consultas.get(m.id) ?? this.agentes.get(m.id)?.resolver;
            r?.({ codigo: typeof m.codigo === "number" ? m.codigo : undefined, cuerpo: m.cuerpo, content: m.content, modelo: typeof m.modelo === "string" ? m.modelo.slice(0, 100) : undefined, error: m.error, rows: m.rows, row: m.row });
            this.pendientes.delete(m.id); this.consultas.delete(m.id); this.agentes.delete(m.id);
          }
        } catch { /* mensaje inválido: se ignora */ }
      });
      const caer = () => {
        if (this.conn === servidor) { this.conn = null; this.sqlListo = false; this.imagenes = false; this.agente = false; }
        for (const m of [this.pendientes, this.consultas]) for (const [id, r] of m) { r({ error: "El conector se desconectó." }); m.delete(id); }
        for (const [id, a] of this.agentes) { a.resolver({ error: "El conector se desconectó." }); this.agentes.delete(id); }
      };
      servidor.addEventListener("close", caer);
      servidor.addEventListener("error", caer);
      const proto = req.headers.get("sec-websocket-protocol");
      return new Response(null, { status: 101, webSocket: cliente, headers: proto ? { "sec-websocket-protocol": proto.split(",")[0].trim() } : {} });
    }
    if (url.pathname === "/estado") return Response.json({ conectado: !!this.conn, sql: !!this.conn && this.sqlListo, imagenes: !!this.conn && this.imagenes, agente: !!this.conn && this.agente, pendientes: this.pendientes.size });
    if (url.pathname === "/consultar" && req.method === "POST") {
      if (!this.conn || !this.sqlListo) return Response.json({ error: "sin servidor" }, { status: 503 });
      const { sql, params, modo } = (await req.json()) as { sql: string; params: unknown[]; modo: "all" | "first" };
      const id = crypto.randomUUID();
      const respuesta = new Promise<Resp>((resolve) => {
        this.consultas.set(id, resolve);
        setTimeout(() => { if (this.consultas.delete(id)) resolve({ error: "tiempo agotado" }); }, TIEMPO_SQL_MS);
      });
      try { this.conn.send(JSON.stringify({ type: "sql", id, sql, params, modo })); } catch { this.consultas.delete(id); return Response.json({ error: "no se pudo enviar" }, { status: 502 }); }
      const r = await respuesta;
      return r.error ? Response.json({ error: r.error }, { status: 502 }) : Response.json({ rows: r.rows, row: r.row ?? null });
    }
    if (url.pathname === "/preguntar" && req.method === "POST") {
      if (!this.conn) return Response.json({ error: "La IA del servidor no está conectada en este momento. Usa «Mi propia clave de API» o inténtalo más tarde." }, { status: 503 });
      if (this.pendientes.size >= MAX_PENDIENTES) return Response.json({ error: "La IA está ocupada con otras preguntas. Inténtalo en unos segundos." }, { status: 503 });
      const { messages } = (await req.json()) as { messages: Mensaje[] };
      const max = Math.min(Math.max(Number(url.searchParams.get("max")) || TIEMPO_MAX_MS, 5_000), TIEMPO_MAX_MS);
      const id = crypto.randomUUID();
      const respuesta = new Promise<Resp>((resolve) => {
        this.pendientes.set(id, resolve);
        setTimeout(() => { if (this.pendientes.delete(id)) resolve({ error: "La IA tardó demasiado en responder. Inténtalo de nuevo." }); }, max);
      });
      try { this.conn.send(JSON.stringify({ type: "job", id, messages })); }
      catch { this.pendientes.delete(id); return Response.json({ error: "No se pudo enviar la pregunta al conector." }, { status: 502 }); }
      const r = await respuesta;
      return r.content ? Response.json({ content: r.content, modelo: r.modelo || "IA del servidor" }) : Response.json({ error: r.error ?? "Error de la IA" }, { status: 502 });
    }
    if (url.pathname === "/agente" && req.method === "POST") {
      if (!this.conn || !this.agente) return Response.json({ error: "El modo agente del servidor no está disponible en este momento." }, { status: 503 });
      if (this.agentes.size >= MAX_AGENTES) return Response.json({ error: "El servidor está ocupado con otras preguntas. Inténtalo en unos segundos." }, { status: 503 });
      const { chat_id, mensaje, archivos, mcp } = (await req.json()) as { chat_id?: string; mensaje: string; archivos: unknown[]; mcp?: boolean };
      // Un turno nuevo (el chat no tiene otro en curso) empieza con el progreso en blanco; la numeración sigue para que el navegador no repita.
      if (chat_id && ![...this.agentes.values()].some((a) => a.chat_id === chat_id)) { const e = this.eventos.get(chat_id); if (e) e.lista = []; }
      const id = crypto.randomUUID();
      const respuesta = new Promise<Resp>((resolve) => {
        this.agentes.set(id, { chat_id, resolver: resolve });
        setTimeout(() => { if (this.agentes.delete(id)) resolve({ error: "El agente tardó demasiado en responder. Inténtalo de nuevo." }); }, TIEMPO_AGENTE_MS);
      });
      try { this.conn.send(JSON.stringify({ type: "agente", id, chat_id, mensaje, archivos, ...(mcp === true ? { mcp: true } : {}) })); }
      catch { this.agentes.delete(id); return Response.json({ error: "No se pudo enviar la tarea al conector." }, { status: 502 }); }
      const r = await respuesta;
      if (r.cuerpo && typeof r.cuerpo === "object" && (r.codigo === 200 || r.codigo === 202)) return Response.json(r.cuerpo, { status: r.codigo });
      return Response.json({ error: r.error ?? "Error del agente" }, { status: r.codigo && r.codigo >= 400 && r.codigo < 500 ? r.codigo : 502 });
    }
    if (url.pathname === "/eventos") {
      const chat = url.searchParams.get("chat_id") ?? "";
      const desde = Math.max(0, Number(url.searchParams.get("desde")) || 0);
      const e = this.eventos.get(chat);
      return Response.json({ eventos: (e?.lista ?? []).filter((x) => x.n > desde), siguiente: e?.n ?? 0, activo: [...this.agentes.values()].some((a) => a.chat_id === chat) });
    }
    return new Response("no encontrado", { status: 404 });
  }

  private guardarEvento(chat: unknown, tipo: unknown, texto: unknown) {
    if (typeof chat !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(chat) || typeof tipo !== "string" || !TIPOS_EVENTO.has(tipo)) return;
    let e = this.eventos.get(chat);
    if (!e) {
      if (this.eventos.size >= MAX_CHATS_EVENTOS) this.eventos.delete(this.eventos.keys().next().value as string);
      e = { n: 0, lista: [] };
      this.eventos.set(chat, e);
    }
    e.lista.push({ n: ++e.n, tipo, texto: typeof texto === "string" ? texto.slice(0, 200) : "" });
    if (e.lista.length > MAX_EVENTOS) e.lista.splice(0, e.lista.length - MAX_EVENTOS);
  }
}
