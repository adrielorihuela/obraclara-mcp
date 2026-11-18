// Chats compartidos: validación, identificadores, token de borrado y acceso a D1.
// Un enlace cuesta 1 escritura en D1 (plan gratuito: 100 000/día); ver un enlace solo lee.

export const COMP_MAX_MENSAJES = 60;
export const COMP_MAX_TEXTO_MSG = 20000;
export const COMP_MAX_BYTES = 200 * 1024; // texto y metadatos (sin imágenes)
export const COMP_MAX_IMAGENES = 3;
export const COMP_MAX_IMAGEN = 300 * 1024; // caracteres del data URL de cada imagen
export const COMP_MAX_CUERPO = 1_200_000; // cuerpo completo de la petición

const TIPOS_ADJ = ["zip", "pdf", "docx", "texto", "imagen", "archivo"];
const RE_IMG = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const RE_ID = /^[0-9A-Za-z]{10,32}$/;
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export interface AdjuntoComp { nombre: string; tipo: string; tamano: number }
export interface MensajeComp { rol: "u" | "a" | "t"; texto: string; modelo?: string; adjuntos?: AdjuntoComp[]; imagenes?: string[] }
export interface Compartido { titulo: string; mensajes: MensajeComp[]; mcp: boolean }
export type Validacion = { ok: true; valor: Compartido } | { ok: false; error: string };

/** Quita caracteres de control (menos salto de línea y tabulador) y oculta cadenas que parecen claves de API. */
export function sanearTexto(v: unknown): string {
  return String(typeof v === "string" ? v : "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]*/gi, "[imagen adjunta]")
    .replace(/\b(?:sk|gsk|xai|pk)[-_][A-Za-z0-9_-]{20,}/g, "[clave oculta]")
    .replace(/\bAIza[0-9A-Za-z_-]{30,}/g, "[clave oculta]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{20,}/gi, "Bearer [clave oculta]");
}

const una = (v: unknown, max: number) => sanearTexto(v).replace(/\s+/g, " ").trim().slice(0, max);

export function validarCompartir(c: unknown): Validacion {
  const no = (error: string): Validacion => ({ ok: false, error });
  if (!c || typeof c !== "object" || Array.isArray(c)) return no("Solicitud no válida.");
  const o = c as Record<string, unknown>;
  if (typeof o.mcp !== "boolean") return no("Falta indicar si se usó MCP.");
  if (!Array.isArray(o.mensajes) || !o.mensajes.length) return no("El chat no tiene mensajes.");
  if (o.mensajes.length > COMP_MAX_MENSAJES) return no(`Un chat compartido admite hasta ${COMP_MAX_MENSAJES} mensajes.`);
  const mensajes: MensajeComp[] = [];
  let imgs = 0, hayRespuesta = false;
  for (const raw of o.mensajes) {
    if (!raw || typeof raw !== "object") return no("Mensaje no válido.");
    const m = raw as Record<string, unknown>;
    if (m.rol !== "u" && m.rol !== "a" && m.rol !== "t") return no("Rol de mensaje no válido.");
    if (typeof m.texto !== "string") return no("Mensaje sin texto.");
    if (m.texto.length > COMP_MAX_TEXTO_MSG) return no("Un mensaje es demasiado largo para compartirlo.");
    const out: MensajeComp = { rol: m.rol, texto: m.rol === "t" ? una(m.texto, 80) : sanearTexto(m.texto).trim() };
    if (m.rol === "a" && out.texto) hayRespuesta = true;
    if (m.modelo !== undefined) {
      if (typeof m.modelo !== "string") return no("Modelo no válido.");
      const mod = una(m.modelo, 120);
      if (mod) out.modelo = mod;
    }
    if (m.adjuntos !== undefined) {
      if (!Array.isArray(m.adjuntos) || m.adjuntos.length > 10) return no("Adjuntos no válidos.");
      out.adjuntos = [];
      for (const a of m.adjuntos) {
        if (!a || typeof a !== "object") return no("Adjunto no válido.");
        const x = a as Record<string, unknown>;
        const tam = Number(x.tamano);
        if (typeof x.nombre !== "string" || !TIPOS_ADJ.includes(String(x.tipo)) || !Number.isFinite(tam) || tam < 0) return no("Adjunto no válido.");
        out.adjuntos.push({ nombre: una(x.nombre, 100) || "archivo", tipo: String(x.tipo), tamano: Math.min(Math.floor(tam), 1e9) });
      }
    }
    if (m.imagenes !== undefined) {
      if (!Array.isArray(m.imagenes)) return no("Imágenes no válidas.");
      out.imagenes = [];
      for (const im of m.imagenes) {
        if (typeof im !== "string" || !RE_IMG.test(im)) return no("Solo se admiten imágenes JPEG, PNG o WebP.");
        if (im.length > COMP_MAX_IMAGEN) return no("Una imagen supera los 300 KB.");
        if (++imgs > COMP_MAX_IMAGENES) return no(`Se pueden compartir hasta ${COMP_MAX_IMAGENES} imágenes.`);
        out.imagenes.push(im);
      }
      if (m.rol !== "u" && out.imagenes.length) return no("Solo los mensajes del usuario llevan imágenes.");
    }
    mensajes.push(out);
  }
  if (!hayRespuesta) return no("El chat aún no tiene respuestas.");
  const valor: Compartido = { titulo: una(o.titulo, 80) || "Conversación", mensajes, mcp: o.mcp };
  const sinImg = JSON.stringify({ ...valor, mensajes: mensajes.map((m) => ({ ...m, imagenes: undefined })) });
  if (new TextEncoder().encode(sinImg).length > COMP_MAX_BYTES) return no("El chat supera los 200 KB permitidos para compartir.");
  return { ok: true, valor };
}

function aleatorios(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

/** Id de 12 caracteres base62 (~71 bits) sin sesgo de módulo. */
export function generarId(largo = 12): string {
  let s = "";
  while (s.length < largo) for (const b of aleatorios(largo * 2)) if (b < 248 && s.length < largo) s += BASE62[b % 62];
  return s;
}

/** Token de borrado de 192 bits en base64url. */
export function generarToken(): string {
  let bin = "";
  for (const b of aleatorios(24)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashToken(t: string): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)));
  return [...h].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export const idValido = (id: string) => RE_ID.test(id);

// ---- D1 ----
interface Stmt { bind(...v: unknown[]): { run(): Promise<unknown>; first<T>(): Promise<T | null> } }
export interface DbComp { prepare(sql: string): Stmt }

const CREAR = "CREATE TABLE IF NOT EXISTS compartidos (id TEXT PRIMARY KEY, creado TEXT, titulo TEXT, datos TEXT, token_hash TEXT)";

/** Ejecuta `f`; si la tabla no existe todavía la crea (una sola vez) y repite. */
async function conTabla<T>(db: DbComp, f: () => Promise<T>): Promise<T> {
  try { return await f(); }
  catch (e) {
    if (!/no such table/i.test(String((e as Error)?.message ?? e))) throw e;
    await db.prepare(CREAR).bind().run();
    return await f();
  }
}

export async function guardarCompartido(db: DbComp, v: Compartido): Promise<{ id: string; token: string }> {
  const token = generarToken(), th = await hashToken(token);
  const datos = JSON.stringify({ m: v.mensajes, mcp: v.mcp });
  for (let i = 0; i < 3; i++) {
    const id = generarId();
    try {
      await conTabla(db, () => db.prepare("INSERT INTO compartidos (id, creado, titulo, datos, token_hash) VALUES (?, ?, ?, ?, ?)")
        .bind(id, new Date().toISOString(), v.titulo, datos, th).run());
      return { id, token };
    } catch (e) { if (!/UNIQUE|constraint/i.test(String((e as Error)?.message ?? e))) throw e; }
  }
  throw new Error("No se pudo crear el enlace.");
}

export interface CompartidoLeido extends Compartido { id: string; creado: string }

export async function leerCompartido(db: DbComp, id: string): Promise<CompartidoLeido | null> {
  if (!idValido(id)) return null;
  let f: { id: string; creado: string; titulo: string; datos: string } | null;
  try { f = await db.prepare("SELECT id, creado, titulo, datos FROM compartidos WHERE id = ?").bind(id).first(); }
  catch (e) { if (/no such table/i.test(String((e as Error)?.message ?? e))) return null; throw e; }
  if (!f) return null;
  try {
    const d = JSON.parse(f.datos) as { m: MensajeComp[]; mcp: boolean };
    return { id: f.id, creado: f.creado, titulo: f.titulo, mensajes: Array.isArray(d.m) ? d.m : [], mcp: d.mcp === true };
  } catch { return null; }
}

/** Borra el chat si el token coincide. Devuelve "ok", "no_existe" o "token". */
export async function borrarCompartido(db: DbComp, id: string, token: string): Promise<"ok" | "no_existe" | "token"> {
  if (!idValido(id)) return "no_existe";
  let f: { token_hash: string } | null;
  try { f = await db.prepare("SELECT token_hash FROM compartidos WHERE id = ?").bind(id).first(); }
  catch (e) { if (/no such table/i.test(String((e as Error)?.message ?? e))) return "no_existe"; throw e; }
  if (!f) return "no_existe";
  if (!token || !iguales(await hashToken(token), f.token_hash)) return "token";
  await db.prepare("DELETE FROM compartidos WHERE id = ?").bind(id).run();
  return "ok";
}
