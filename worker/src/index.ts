import { createMcpHandler } from "agents/mcp/server";
import { noEncontrada, paginaSitio } from "./pagina";
import { crearServidor, ok } from "./server";
import { alertas, buscar, meta, type Db, type Filtros } from "./lib/queries";
import { CF_TEXTO, CF_VISION, ETIQUETA_RESPALDO, ErrorProveedor, GROQ_TEXTO, GROQ_VISION, Pausas, cadena, groq, tieneImagenes, validarMensajes, workersAI, type Msg, type Proveedor } from "./lib/cadena";
import { AGENTE_MAX_CUERPO, validarAgente } from "./lib/agenteapi";
import { RespaldoDb } from "./lib/remotedb";
import { COMP_MAX_CUERPO, borrarCompartido, guardarCompartido, leerCompartido, validarCompartir, type DbComp } from "./lib/compartir";
import { CABECERAS_COMPARTIDO, compartidoNoEncontrado, paginaCompartida } from "./compartido";
export { ColaIA } from "./cola";

interface Env {
  DB: D1Database;
  LIMITER: { limit(o: { key: string }): Promise<{ success: boolean }> };
  CHAT_LIMITER: { limit(o: { key: string }): Promise<{ success: boolean }> };
  CONECTOR_SECRET: string;
  GROQ_API_KEY?: string;
  AI: { run(model: string, input: unknown): Promise<unknown> };
  COLA: { idFromName(n: string): unknown; get(id: unknown): { fetch(req: Request | string, init?: RequestInit): Promise<Response> } };
}

const SITIO = "https://obraclara.adrielorihuela.net";
const pausas = new Pausas(); // en memoria de este isolate: pausa a quien dio límite o error
const HTML = { "content-type": "text/html; charset=utf-8", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin" };

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" } });

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const cola = env.COLA.get(env.COLA.idFromName("gpt"));
    const db: Db = new RespaldoDb((r, i) => cola.fetch(r, i), env.DB as unknown as Db);
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
      const mensajes = cuerpo.messages as Msg[];
      const vision = tieneImagenes(mensajes);
      const proveedores: Proveedor[] = [];
      // 1) IA del servidor (API privada compatible con OpenAI en un equipo del grupo), para todo (también imágenes). Ya tiene sus propios respaldos:
      //    espera hasta 60 s y la etiqueta muestra quién respondió.
      proveedores.push({ id: "servidor", modelo: "IA del servidor", async ejecutar(m) {
        const r = await cola.fetch("https://cola/preguntar?max=60000", { method: "POST", body: JSON.stringify({ messages: m }) });
        const j = (await r.json()) as { content?: string; modelo?: string; error?: string };
        if (!r.ok || !j.content) throw new ErrorProveedor(j.error ?? "sin respuesta", r.status === 503 ? 15_000 : 30_000);
        return { content: j.content, modelo: j.modelo || "IA del servidor" };
      } });
      // 2) Solo si el conector no está disponible, falló o está en pausa: respaldo de emergencia del Worker.
      const respaldo = (p: Proveedor): Proveedor => ({ ...p, modelo: ETIQUETA_RESPALDO + p.modelo });
      proveedores.push(respaldo(workersAI(env.AI, vision ? CF_VISION : CF_TEXTO, vision)));
      // 3) Groq, rotando de modelo cuando uno llega a su límite
      if (env.GROQ_API_KEY) for (const mod of vision ? GROQ_VISION : GROQ_TEXTO) proveedores.push(respaldo(groq(env.GROQ_API_KEY, mod, vision)));
      try { return json(await cadena(proveedores, mensajes, pausas)); }
      catch (e) { return json({ error: (e as Error).message }, 502); }
    }
    if (url.pathname === "/api/agente" && req.method === "POST") {
      const origen = req.headers.get("origin");
      if (origen && origen !== SITIO) return json({ error: "Origen no permitido" }, 403);
      if (!(await env.CHAT_LIMITER.limit({ key: clave })).success) return json({ error: "Demasiadas preguntas seguidas. Espera un minuto." }, 429);
      if (Number(req.headers.get("content-length") ?? 0) > AGENTE_MAX_CUERPO) return json({ error: "Los archivos superan 17 MB en total." }, 413);
      let cuerpo: unknown;
      try { const t = await req.text(); if (t.length > AGENTE_MAX_CUERPO) return json({ error: "Los archivos superan 17 MB en total." }, 413); cuerpo = JSON.parse(t); } catch { return json({ error: "JSON inválido" }, 400); }
      const v = validarAgente(cuerpo);
      if (!v.ok) return json({ error: v.error }, 400);
      const r = await cola.fetch("https://cola/agente", { method: "POST", body: JSON.stringify(v.valor) });
      return new Response(r.body, { status: r.status, headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" } });
    }
    if (url.pathname === "/api/compartir" && req.method === "POST") {
      const origen = req.headers.get("origin");
      if (origen && origen !== SITIO && origen !== url.origin) return json({ error: "Origen no permitido" }, 403);
      if (!(await env.CHAT_LIMITER.limit({ key: "compartir:" + clave })).success) return json({ error: "Demasiados enlaces seguidos. Espera un minuto." }, 429);
      if (Number(req.headers.get("content-length") ?? 0) > COMP_MAX_CUERPO) return json({ error: "El chat es demasiado grande para compartirlo." }, 413);
      let cuerpo: unknown;
      try { const t = await req.text(); if (t.length > COMP_MAX_CUERPO) return json({ error: "El chat es demasiado grande para compartirlo." }, 413); cuerpo = JSON.parse(t); } catch { return json({ error: "JSON inválido" }, 400); }
      const v = validarCompartir(cuerpo);
      if (!v.ok) return json({ error: v.error }, 400);
      try {
        const { id, token } = await guardarCompartido(env.DB as unknown as DbComp, v.valor);
        return json({ id, url: `${url.origin}/c/${id}`, token });
      } catch { return json({ error: "No se pudo crear el enlace. Inténtalo de nuevo." }, 500); }
    }
    const mc = /^\/api\/compartir\/([^/]+)$/.exec(url.pathname);
    if (mc) {
      const id = mc[1];
      if (req.method === "GET") {
        const c = await leerCompartido(env.DB as unknown as DbComp, id);
        return c ? json({ id: c.id, creado: c.creado, titulo: c.titulo, mcp: c.mcp, mensajes: c.mensajes }) : json({ error: "No existe o fue eliminado." }, 404);
      }
      if (req.method === "DELETE") {
        const origen = req.headers.get("origin");
        if (origen && origen !== SITIO && origen !== url.origin) return json({ error: "Origen no permitido" }, 403);
        if (!(await env.CHAT_LIMITER.limit({ key: "compartir:" + clave })).success) return json({ error: "Demasiadas solicitudes. Espera un minuto." }, 429);
        const r = await borrarCompartido(env.DB as unknown as DbComp, id, req.headers.get("x-token") ?? "");
        return r === "ok" ? json({ ok: true }) : r === "token" ? json({ error: "Token incorrecto." }, 403) : json({ error: "No existe o ya fue eliminado." }, 404);
      }
    }
    const pc = /^\/c\/([^/]+)\/?$/.exec(url.pathname);
    if (pc && (req.method === "GET" || req.method === "HEAD")) {
      if (!(await env.LIMITER.limit({ key: clave })).success) return new Response("Demasiadas solicitudes, intenta en un minuto.", { status: 429, headers: { "content-type": "text/plain; charset=utf-8" } });
      const c = await leerCompartido(env.DB as unknown as DbComp, pc[1]);
      const m = await meta(db);
      return c ? new Response(paginaCompartida(c, m, url.origin), { headers: CABECERAS_COMPARTIDO })
        : new Response(compartidoNoEncontrado(m), { status: 404, headers: { ...CABECERAS_COMPARTIDO, "cache-control": "no-store" } });
    }
    // Conector de la máquina del grupo: se conecta por WebSocket (llamada saliente) con la contraseña como subprotocolo.
    if (url.pathname === "/conector/ws") {
      const t = (req.headers.get("sec-websocket-protocol") ?? "").split(",")[0].trim();
      const ok = !!env.CONECTOR_SECRET && t.length === env.CONECTOR_SECRET.length &&
        crypto.subtle.timingSafeEqual(new TextEncoder().encode(t), new TextEncoder().encode(env.CONECTOR_SECRET));
      if (!ok) return json({ error: "no autorizado" }, 401);
      if (req.headers.get("upgrade") !== "websocket") return json({ error: "se esperaba WebSocket" }, 426);
      return cola.fetch(new Request("https://cola/ws", req));
    }
    if (url.pathname === "/api/ia-estado") return cola.fetch("https://cola/estado");
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
    if (req.method === "GET" || req.method === "HEAD") {
      const html = paginaSitio(url.pathname, await meta(db));
      if (html) return new Response(html, { headers: HTML });
      if ((req.headers.get("accept") ?? "").includes("text/html")) return new Response(noEncontrada(await meta(db)), { status: 404, headers: HTML });
    }
    return json({ error: "No encontrado" }, 404);
  },
};
