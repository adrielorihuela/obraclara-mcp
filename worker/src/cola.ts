// Cola en memoria de preguntas para gpt-headless (Durable Object; no escribe en D1 ni en disco).
// El conector que corre en la máquina del grupo se conecta por WebSocket (llamada saliente), recibe las preguntas
// una a una y devuelve las respuestas. Si el conector no está conectado, el panel lo informa.
import { DurableObject } from "cloudflare:workers";
import { MAX_PENDIENTES, type Mensaje } from "./lib/gptjobs";

const TIEMPO_MAX_MS = 85_000;
type Resp = { content?: string; error?: string; rows?: unknown[]; row?: unknown };
const TIEMPO_SQL_MS = 8_000;

export class ColaGpt extends DurableObject {
  private conn: WebSocket | null = null;
  private pendientes = new Map<string, (r: Resp) => void>();
  private consultas = new Map<string, (r: Resp) => void>();
  private sqlListo = false;

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
          const m = JSON.parse(String(ev.data)) as { type?: string; id?: string; content?: string; error?: string; rows?: unknown[]; row?: unknown; sql?: boolean };
          if (m.type === "ping") return servidor.send(JSON.stringify({ type: "pong" }));
          if (m.type === "hola") { this.sqlListo = !!m.sql; return; }
          if (m.type === "resultado" && m.id) {
            const r = this.pendientes.get(m.id) ?? this.consultas.get(m.id);
            r?.({ content: m.content, error: m.error, rows: m.rows, row: m.row });
            this.pendientes.delete(m.id); this.consultas.delete(m.id);
          }
        } catch { /* mensaje inválido: se ignora */ }
      });
      const caer = () => {
        if (this.conn === servidor) { this.conn = null; this.sqlListo = false; }
        for (const m of [this.pendientes, this.consultas]) for (const [id, r] of m) { r({ error: "El conector se desconectó." }); m.delete(id); }
      };
      servidor.addEventListener("close", caer);
      servidor.addEventListener("error", caer);
      const proto = req.headers.get("sec-websocket-protocol");
      return new Response(null, { status: 101, webSocket: cliente, headers: proto ? { "sec-websocket-protocol": proto.split(",")[0].trim() } : {} });
    }
    if (url.pathname === "/estado") return Response.json({ conectado: !!this.conn, sql: !!this.conn && this.sqlListo, pendientes: this.pendientes.size });
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
      if (!this.conn) return Response.json({ error: "La IA gpt-headless no está conectada en este momento. Usa «Mi propia clave de API» o inténtalo más tarde." }, { status: 503 });
      if (this.pendientes.size >= MAX_PENDIENTES) return Response.json({ error: "La IA está ocupada con otras preguntas. Inténtalo en unos segundos." }, { status: 503 });
      const { messages } = (await req.json()) as { messages: Mensaje[] };
      const id = crypto.randomUUID();
      const respuesta = new Promise<Resp>((resolve) => {
        this.pendientes.set(id, resolve);
        setTimeout(() => { if (this.pendientes.delete(id)) resolve({ error: "La IA tardó demasiado en responder. Inténtalo de nuevo." }); }, TIEMPO_MAX_MS);
      });
      try { this.conn.send(JSON.stringify({ type: "job", id, messages })); }
      catch { this.pendientes.delete(id); return Response.json({ error: "No se pudo enviar la pregunta al conector." }, { status: 502 }); }
      const r = await respuesta;
      return r.content ? Response.json({ content: r.content, modelo: "gpt-headless" }) : Response.json({ error: r.error ?? "Error de la IA" }, { status: 502 });
    }
    return new Response("no encontrado", { status: 404 });
  }
}
