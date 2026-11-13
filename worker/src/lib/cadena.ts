// Cadena de IAs del servidor: la IA del servidor primero (ya tiene sus propios respaldos); solo si el conector no responde,
// respaldo de emergencia en el Worker: Workers AI y luego Groq rotando de modelo.
// Cada proveedor que falla (límite, error, apagado) queda en pausa un rato y se pasa al siguiente.

import { recortarMensajes } from "./agente";

export type Parte = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
export interface Msg { role: string; content: string | Parte[] }

export const MAX_IMAGENES = 3;
const DATA_URL = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const MAX_IMAGEN_B64 = 2_800_000;   // ≈ 2 MB por imagen
const MAX_TEXTO = 150_000;   // texto total de la conversación (incluye el texto de documentos y proyectos adjuntos)

export function validarMensajes(m: unknown): m is Msg[] {
  if (!Array.isArray(m) || m.length === 0 || m.length > 24) return false;
  let texto = 0, imagenes = 0;
  for (const x of m) {
    if (!x || !["system", "user", "assistant"].includes(x.role)) return false;
    if (typeof x.content === "string") { texto += x.content.length; continue; }
    if (!Array.isArray(x.content) || x.content.length === 0 || x.role !== "user") return false;
    for (const p of x.content) {
      if (p?.type === "text" && typeof p.text === "string") texto += p.text.length;
      else if (p?.type === "image_url" && typeof p.image_url?.url === "string" && p.image_url.url.length <= MAX_IMAGEN_B64 && DATA_URL.test(p.image_url.url)) imagenes++;
      else return false;
    }
  }
  return texto <= MAX_TEXTO && imagenes <= MAX_IMAGENES;
}

export const tieneImagenes = (m: Msg[]) => m.some((x) => Array.isArray(x.content) && x.content.some((p) => p.type === "image_url"));

/** Mensajes solo de texto (las imágenes se sustituyen por una marca) para modelos sin visión. */
export function soloTexto(m: Msg[]): { role: string; content: string }[] {
  return m.map((x) => ({
    role: x.role,
    content: typeof x.content === "string" ? x.content
      : x.content.map((p) => (p.type === "text" ? p.text : "[imagen omitida]")).join("\n"),
  }));
}

export class ErrorProveedor extends Error {
  constructor(mensaje: string, public pausaMs = 30_000) { super(mensaje); }
}

/** Un proveedor devuelve el texto, o {content, modelo} si quiere cambiar la etiqueta (p. ej. quién respondió dentro de la IA del servidor). */
export interface Proveedor { id: string; modelo: string; maxChars?: number; ejecutar(m: Msg[]): Promise<string | { content: string; modelo?: string }> }

export class Pausas {
  private hasta = new Map<string, number>();
  activo(id: string, ahora: number) { return (this.hasta.get(id) ?? 0) <= ahora; }
  pausar(id: string, ahora: number, ms: number) { this.hasta.set(id, ahora + ms); }
}

/** Prueba los proveedores en orden, saltando los que están en pausa. Devuelve el texto y el nombre de quien respondió. */
export async function cadena(proveedores: Proveedor[], m: Msg[], pausas: Pausas, ahora: () => number = Date.now) {
  const errores: string[] = [];
  for (const p of proveedores) {
    if (!pausas.activo(p.id, ahora())) continue;
    try {
      // Si la conversación excede lo que admite el proveedor, se recortan los mensajes más antiguos / el adjunto en vez de fallar.
      const r = await p.ejecutar(p.maxChars ? recortarMensajes(m, p.maxChars) : m);
      const t = (typeof r === "string" ? r : r.content ?? "").trim();
      if (t) return { content: t, modelo: (typeof r === "string" ? undefined : r.modelo) || p.modelo };
      errores.push(`${p.modelo}: sin texto`);
      pausas.pausar(p.id, ahora(), 15_000);
    } catch (e) {
      errores.push(`${p.modelo}: ${(e as Error).message}`);
      pausas.pausar(p.id, ahora(), e instanceof ErrorProveedor ? e.pausaMs : 30_000);
    }
  }
  throw new Error(errores.length ? "Ninguna IA pudo responder. " + errores.join(" · ").slice(0, 300) : "Todas las IAs están en pausa por límites de uso. Inténtalo en un minuto.");
}

// ---- Proveedores concretos ----
export function textoDeIA(r: unknown): string {
  const o = r as Record<string, any> | null;
  if (!o) return "";
  if (typeof o.response === "string") return o.response;
  const ch = o.choices?.[0]?.message?.content;
  if (typeof ch === "string") return ch;
  for (const it of Array.isArray(o.output) ? o.output : []) if (it?.type === "message") for (const c of it.content ?? []) if (typeof c?.text === "string") return c.text;
  return "";
}

export function workersAI(ai: { run(model: string, input: unknown): Promise<unknown> }, modelo: string, vision: boolean): Proveedor {
  return {
    id: "cf:" + modelo, modelo: "Workers AI · " + modelo.replace("@cf/", ""), maxChars: 100_000,
    async ejecutar(m) {
      try { return textoDeIA(await ai.run(modelo, { messages: vision ? m : soloTexto(m), max_tokens: 1200, temperature: 0.2 })); }
      catch (e) { throw new ErrorProveedor((e as Error).message.slice(0, 120), /limit|quota|exceed|429/i.test((e as Error).message) ? 10 * 60_000 : 30_000); }
    },
  };
}

export function groq(clave: string, modelo: string, vision: boolean, f: typeof fetch = fetch): Proveedor {
  return {
    id: "groq:" + modelo, modelo: "Groq · " + modelo, maxChars: LIMITE_GROQ[modelo] ?? 24_000,
    async ejecutar(m) {
      const r = await f("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { authorization: "Bearer " + clave, "content-type": "application/json" },
        body: JSON.stringify({ model: modelo, messages: vision ? m : soloTexto(m), max_tokens: 1200, temperature: 0.2 }),
        signal: AbortSignal.timeout(40_000),
      });
      const j = (await r.json().catch(() => ({}))) as Record<string, any>;
      // gpt-oss intenta llamar herramientas con su formato propio y Groq responde 400 con lo generado: se aprovecha.
      if (r.status === 400 && typeof j.error?.failed_generation === "string") return j.error.failed_generation;
      if (r.status === 429) {
        const seg = Number(r.headers.get("retry-after"));
        throw new ErrorProveedor("límite de uso", Number.isFinite(seg) && seg > 0 ? Math.min(seg, 600) * 1000 : 60_000);
      }
      if (!r.ok) throw new ErrorProveedor(`error ${r.status}`, 30_000);
      return j.choices?.[0]?.message?.content ?? "";
    },
  };
}

/** Caracteres de conversación que admite cada modelo de Groq (el plan gratuito limita los tokens por minuto; allam-2-7b tiene 4k de contexto). */
const LIMITE_GROQ: Record<string, number> = { "allam-2-7b": 8_000 };
export const GROQ_TEXTO = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "allam-2-7b"];
export const GROQ_VISION = ["qwen/qwen3.8-27b"];
/** Etiqueta del respaldo de emergencia del Worker (cuando el conector no está disponible). */
export const ETIQUETA_RESPALDO = "respaldo de ObraClara · ";
export const CF_TEXTO = "@cf/openai/gpt-oss-20b";
export const CF_VISION = "@cf/meta/llama-4-scout-17b-16e-instruct";
