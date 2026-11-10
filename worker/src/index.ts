import { createMcpHandler } from "agents/mcp/server";
import { pagina } from "./pagina";
import { crearServidor, ok } from "./server";
import { alertas, buscar, meta, type Db, type Filtros } from "./lib/queries";
import { cancelar, conectorVivo, encolar, estado, guardarResultado, latido, reclamar, validarMensajes } from "./lib/gptjobs";

interface Env {
  DB: D1Database;
  LIMITER: { limit(o: { key: string }): Promise<{ success: boolean }> };
  CHAT_LIMITER: { limit(o: { key: string }): Promise<{ success: boolean }> };
  GPT_CONECTOR_SECRET: string;
}

const SITIO = "https://obraclara.adrielorihuela.net";

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" } });

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const db = env.DB as unknown as Db;
    const clave = req.headers.get("cf-connecting-ip") ?? "anonimo";

    if (url.pathname === "/mcp") {
      if (!(await env.LIMITER.limit({ key: clave })).success) return json({ error: "Demasiadas solicitudes, intenta en un minuto." }, 429);
      // Los clientes sin navegador no envían Origin y siempre son válidos; los navegadores solo desde esta misma página (o localhost).
      return createMcpHandler(() => crearServidor(db), { allowedOriginHostnames: ["obraclara.adrielorihuela.net", "localhost", "127.0.0.1"] })(req, env, ctx);
    }
    if (url.pathname === "/api/chat" && req.method === "POST") {
      const origen = req.headers.get("origin");
      if (origen && origen !== SITIO) return json({ error: "Origen no permitido" }, 403);
      if (!(await env.CHAT_LIMITER.limit({ key: clave })).success) return json({ error: "Demasiadas preguntas seguidas. Espera un minuto." }, 429);
      let cuerpo: { messages?: unknown };
      try { cuerpo = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }
      if (!validarMensajes(cuerpo.messages)) return json({ error: "Mensajes no válidos o demasiado largos" }, 400);
      if (!(await conectorVivo(db, Date.now()))) return json({ error: "La IA gpt-headless no está conectada en este momento. Usa «Mi propia clave de API» o inténtalo más tarde." }, 503);
      const id = await encolar(db, cuerpo.messages, Date.now(), crypto.randomUUID());
      if (!id) return json({ error: "La IA está ocupada con otras preguntas. Inténtalo en unos segundos." }, 503);
      const limite = Date.now() + 85_000;
      while (Date.now() < limite) {
        await new Promise((r) => setTimeout(r, 1000));
        const e = await estado(db, id);
        if (e?.estado === "listo" && e.respuesta) return json({ content: e.respuesta, modelo: "gpt-headless" });
        if (e?.estado === "error") return json({ error: e.error ?? "Error de la IA" }, 502);
      }
      await cancelar(db, id, "tiempo agotado");
      return json({ error: "La IA tardó demasiado en responder. Inténtalo de nuevo." }, 504);
    }
    // Conector de la máquina del grupo (solo con contraseña): recoge una pregunta y devuelve la respuesta.
    if (url.pathname.startsWith("/gpt/") && req.method === "POST") {
      const t = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
      if (!env.GPT_CONECTOR_SECRET || t.length !== env.GPT_CONECTOR_SECRET.length || !crypto.subtle.timingSafeEqual(new TextEncoder().encode(t), new TextEncoder().encode(env.GPT_CONECTOR_SECRET))) return json({ error: "no autorizado" }, 401);
      if (url.pathname === "/gpt/siguiente") {
        await latido(db, Date.now());
        const tarea = await reclamar(db, Date.now());
        return tarea ? json(tarea) : new Response(null, { status: 204 });
      }
      if (url.pathname === "/gpt/resultado") {
        const r = (await req.json().catch(() => ({}))) as { id?: string; content?: string; error?: string };
        if (!r.id || (!r.content && !r.error)) return json({ error: "datos incompletos" }, 400);
        await guardarResultado(db, r.id, r.content ?? null, r.error ? String(r.error).slice(0, 300) : null);
        return json({ ok: true });
      }
    }
    if (url.pathname === "/salud") return json({ estado: "ok", ...(await meta(db)) });
    if (url.pathname === "/api/buscar" || url.pathname === "/api/alertas") {
      if (!(await env.LIMITER.limit({ key: clave })).success) return json({ error: "Demasiadas solicitudes, intenta en un minuto." }, 429);
      const p = url.searchParams;
      const f: Filtros = { texto: p.get("texto") || undefined, entidad: p.get("entidad") || undefined, departamento: p.get("departamento") || undefined, funcion: p.get("funcion") || undefined, nivel: p.get("nivel") || undefined };
      try {
        const m = await meta(db);
        if (url.pathname === "/api/buscar") return json(JSON.parse(ok(await buscar(db, f), m).content[0].text));
        const tipo = p.get("tipo") === "paralizacion" ? "paralizacion" : "sobrecosto";
        return json(JSON.parse(ok(await alertas(db, tipo, f), m).content[0].text));
      } catch (e) { return json({ error: (e as Error).message }, 400); }
    }
    if (url.pathname === "/") return new Response(pagina(await meta(db)), { headers: { "content-type": "text/html; charset=utf-8" } });
    return json({ error: "No encontrado" }, 404);
  },
};
