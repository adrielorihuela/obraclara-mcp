import { describe, expect, it, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../src/index";
import { borrarCompartido, generarId, generarToken, guardarCompartido, hashToken, leerCompartido, validarCompartir } from "../src/lib/compartir";
import { prepararCompartir } from "../src/lib/agente";
import { paginaCompartida } from "../src/compartido";
import { demoScript } from "../src/demo";

const MIGRACION = join(dirname(fileURLToPath(import.meta.url)), "../migrations/0002_compartidos.sql");
vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }));

// D1 simulado sobre node:sqlite (con run), con o sin la tabla de la migración.
function d1(conTabla: boolean) {
  const raw = new DatabaseSync(":memory:");
  raw.exec("CREATE TABLE meta (clave TEXT PRIMARY KEY, valor TEXT NOT NULL); INSERT INTO meta VALUES ('fecha_descarga','2026-11-10')");
  if (conTabla) raw.exec(readFileSync(MIGRACION, "utf-8"));
  const db = {
    raw,
    prepare(sql: string) {
      return {
        bind: (...v: unknown[]) => ({
          all: async () => ({ results: raw.prepare(sql).all(...(v as never[])) as never[] }),
          first: async <T,>() => ((raw.prepare(sql).get(...(v as never[])) as T) ?? null),
          run: async () => raw.prepare(sql).run(...(v as never[])),
        }),
      };
    },
  };
  return db;
}

const ok = { titulo: "  Obras de salud ", mcp: true, mensajes: [{ rol: "u", texto: "Hola" }, { rol: "a", texto: "**Hola** a todos", modelo: "IA del servidor" }] };

function entorno(db: ReturnType<typeof d1>, permitir = true) {
  const lim = { limit: async () => ({ success: permitir }) };
  return { DB: db, LIMITER: lim, CHAT_LIMITER: lim, CONECTOR_SECRET: "x", AI: { run: async () => ({}) },
    COLA: { idFromName: () => "i", get: () => ({ fetch: async () => new Response("{}", { status: 503 }) }) } } as never;
}
const llamar = (env: never, ruta: string, init?: RequestInit) => worker.fetch(new Request("https://obraclara.adrielorihuela.net" + ruta, init), env, {} as never);

describe("validarCompartir", () => {
  it("acepta un chat válido y sanea el título", () => {
    const v = validarCompartir({ ...ok, titulo: "  Obras\u0000 de   salud " });
    expect(v.ok && v.valor.titulo).toBe("Obras de salud");
  });
  it("rechaza formas inválidas", () => {
    for (const x of [null, [], {}, { mcp: true }, { mcp: "si", mensajes: ok.mensajes }, { mcp: true, mensajes: [] },
      { mcp: true, mensajes: [{ rol: "x", texto: "a" }] }, { mcp: true, mensajes: [{ rol: "u", texto: "solo usuario" }] },
      { mcp: true, mensajes: [{ rol: "a", texto: 5 }] }]) expect(validarCompartir(x).ok).toBe(false);
  });
  it("limita mensajes, texto y tamaño total", () => {
    const m = (n: number) => Array.from({ length: n }, (_, i) => ({ rol: i % 2 ? "a" : "u", texto: "x" }));
    expect(validarCompartir({ mcp: false, mensajes: m(60) }).ok).toBe(true);
    expect(validarCompartir({ mcp: false, mensajes: m(61) }).ok).toBe(false);
    expect(validarCompartir({ mcp: false, mensajes: [{ rol: "a", texto: "x".repeat(20001) }] }).ok).toBe(false);
    const grande = Array.from({ length: 12 }, () => ({ rol: "a", texto: "y".repeat(19000) }));
    expect(validarCompartir({ mcp: false, mensajes: grande }).ok).toBe(false);
  });
  it("imágenes: solo jpeg/png/webp, ≤300 KB y máx. 3, solo del usuario", () => {
    const img = "data:image/png;base64,iVBORw0KGgo=";
    const con = (imagenes: unknown) => validarCompartir({ mcp: false, mensajes: [{ rol: "u", texto: "a", imagenes }, { rol: "a", texto: "b" }] }).ok;
    expect(con([img, img, img])).toBe(true);
    expect(con([img, img, img, img])).toBe(false);
    expect(con(["data:image/svg+xml;base64,AAAA"])).toBe(false);
    expect(con(["data:text/html;base64,AAAA"])).toBe(false);
    expect(con(["javascript:alert(1)"])).toBe(false);
    expect(con(["data:image/jpeg;base64," + "A".repeat(300 * 1024)])).toBe(false);
    expect(validarCompartir({ mcp: false, mensajes: [{ rol: "u", texto: "a" }, { rol: "a", texto: "b", imagenes: [img] }] }).ok).toBe(false);
  });
  it("adjuntos como chips y oculta claves de API", () => {
    const v = validarCompartir({ mcp: false, mensajes: [{ rol: "u", texto: "mi clave sk-abcdefghijklmnopqrstuvwxyz123456", adjuntos: [{ nombre: "a.pdf", tipo: "pdf", tamano: 1200 }] }, { rol: "a", texto: "ok" }] });
    expect(v.ok && v.valor.mensajes[0].texto).toContain("[clave oculta]");
    expect(v.ok && v.valor.mensajes[0].adjuntos).toEqual([{ nombre: "a.pdf", tipo: "pdf", tamano: 1200 }]);
    expect(validarCompartir({ mcp: false, mensajes: [{ rol: "u", texto: "a", adjuntos: [{ nombre: "a", tipo: "exe", tamano: 1 }] }, { rol: "a", texto: "b" }] }).ok).toBe(false);
  });
});

describe("id y token", () => {
  it("ids base62 de 12 caracteres, distintos entre sí", () => {
    const ids = new Set(Array.from({ length: 500 }, () => generarId()));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id).toMatch(/^[0-9A-Za-z]{12}$/);
  });
  it("token largo y hash SHA-256 conocido", async () => {
    expect(generarToken()).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(await hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("almacenamiento", () => {
  it("la migración existe sin columna de vistas y la tabla se crea de forma perezosa si falta", async () => {
    expect(readFileSync(MIGRACION, "utf-8")).not.toMatch(/vistas/);
    const db = d1(false); // sin migración
    expect(await leerCompartido(db, "AAAAAAAAAAAA")).toBeNull(); // leer sin tabla no falla
    const v = validarCompartir(ok); if (!v.ok) throw new Error();
    const { id, token } = await guardarCompartido(db, v.valor);
    const fila = db.raw.prepare("SELECT token_hash, datos FROM compartidos WHERE id = ?").get(id) as { token_hash: string; datos: string };
    expect(fila.token_hash).toBe(await hashToken(token));
    expect(fila.datos).not.toContain(token);
    expect((await leerCompartido(db, id))?.titulo).toBe("Obras de salud");
  });
  it("borra solo con el token correcto", async () => {
    const db = d1(true);
    const v = validarCompartir(ok); if (!v.ok) throw new Error();
    const { id, token } = await guardarCompartido(db, v.valor);
    expect(await borrarCompartido(db, id, "")).toBe("token");
    expect(await borrarCompartido(db, id, "otro")).toBe("token");
    expect(await borrarCompartido(db, "ZZZZZZZZZZZZ", token)).toBe("no_existe");
    expect(await leerCompartido(db, id)).not.toBeNull();
    expect(await borrarCompartido(db, id, token)).toBe("ok");
    expect(await leerCompartido(db, id)).toBeNull();
  });
});

describe("rutas HTTP", () => {
  it("crear, ver /c/:id, API GET, borrar con token", async () => {
    const env = entorno(d1(true));
    const r = await llamar(env, "/api/compartir", { method: "POST", headers: { "content-type": "application/json", origin: "https://obraclara.adrielorihuela.net" }, body: JSON.stringify({ ...ok, titulo: "<b>x</b> \"t\"" }) });
    expect(r.status).toBe(200);
    const { id, url, token } = (await r.json()) as { id: string; url: string; token: string };
    expect(url).toBe(`https://obraclara.adrielorihuela.net/c/${id}`);

    const p = await llamar(env, `/c/${id}`);
    expect(p.status).toBe(200);
    expect(p.headers.get("x-robots-tag")).toContain("noindex");
    const h = await p.text();
    expect(h).toContain('<meta name="robots" content="noindex');
    expect(h).toContain('property="og:title" content="&lt;b&gt;x&lt;/b&gt; ');
    expect(h).toContain("Chat compartido");
    expect(h).toContain("Continuar este chat");
    expect(h).not.toContain("<b>x</b>");
    expect(h).not.toContain(token);

    const g = await (await llamar(env, `/api/compartir/${id}`)).json() as { mensajes: unknown[] };
    expect(g.mensajes).toHaveLength(2);

    expect((await llamar(env, `/api/compartir/${id}`, { method: "DELETE", headers: { "x-token": "mal" } })).status).toBe(403);
    expect((await llamar(env, `/api/compartir/${id}`, { method: "DELETE" })).status).toBe(403);
    expect((await llamar(env, `/api/compartir/${id}`, { method: "DELETE", headers: { "x-token": token } })).status).toBe(200);
    expect((await llamar(env, `/c/${id}`)).status).toBe(404);
    expect((await llamar(env, `/api/compartir/${id}`)).status).toBe(404);
  });
  it("404 amable (noindex), origen ajeno, límite de uso y cuerpo inválido", async () => {
    const env = entorno(d1(true));
    const nf = await llamar(env, "/c/noexiste12345");
    expect(nf.status).toBe(404);
    expect(await nf.text()).toContain("ya no está disponible");
    const post = (e: never, body: string, origin?: string) => llamar(e, "/api/compartir", { method: "POST", headers: origin ? { origin } : {}, body });
    expect((await post(env, JSON.stringify(ok), "https://malo.example")).status).toBe(403);
    expect((await post(env, "{no json")).status).toBe(400);
    expect((await post(env, JSON.stringify({ mcp: true, mensajes: [] }))).status).toBe(400);
    expect((await post(entorno(d1(true), false), JSON.stringify(ok))).status).toBe(429);
  });
});

describe("página y cliente", () => {
  it("incrusta los datos sin permitir cerrar el script", () => {
    const h = paginaCompartida({ id: "AAAAAAAAAAAA", creado: "2026-11-18T10:00:00Z", titulo: "t", mcp: false, mensajes: [{ rol: "a", texto: "</script><img src=x onerror=alert(1)>" }] }, {}, "https://x");
    const bloque = h.split('id="cmp-datos">')[1].split("</script>")[0];
    expect(bloque).not.toContain("<");
    expect(JSON.parse(bloque).m[0].texto).toContain("</script>");
    expect(h.match(/<img src=x/g)).toBeNull();
  });
  it("prepararCompartir: chips en vez de texto, imágenes opcionales (máx. 3)", () => {
    const ms = [{ rol: "u", texto: "mira [imagen adjunta]", adj: [{ n: "a.pdf", t: "pdf", c: 500 }], ctx: "TEXTO SECRETO" }, { rol: "t", herramienta: { nombre: "buscar_inversiones", args: {}, resultado: "r" } }, { rol: "a", texto: "ok", modelo: "M", mcp: true }];
    const sin = prepararCompartir(ms, null, false);
    expect(JSON.stringify(sin)).not.toContain("SECRETO");
    expect(sin[0]).toEqual({ rol: "u", texto: "mira", adjuntos: [{ nombre: "a.pdf", tipo: "pdf", tamano: 500 }, { nombre: "Imagen adjunta", tipo: "imagen", tamano: 0 }] });
    expect(sin[1]).toEqual({ rol: "t", texto: "buscar_inversiones" });
    const img = "data:image/jpeg;base64,AAAA";
    expect(prepararCompartir(ms, [[img, img, img, img]], true)[0].imagenes).toHaveLength(3);
    expect(prepararCompartir(ms, [[img]], false)[0].imagenes).toBeUndefined();
  });
  it("el script del asistente trae el diálogo de compartir", () => {
    expect(demoScript).toContain("/api/compartir");
    expect(demoScript).toContain("x-token");
    expect(demoScript).not.toContain("__name");
  });
});
