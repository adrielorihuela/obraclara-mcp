import { createMcpHandler } from "agents/mcp/server";
import { pagina } from "./pagina";
import { crearServidor, ok } from "./server";
import { alertas, buscar, meta, type Db, type Filtros } from "./lib/queries";

interface Env {
  DB: D1Database;
  LIMITER: { limit(o: { key: string }): Promise<{ success: boolean }> };
}

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
