// Validación pura de POST /api/agente (modo agente del servidor). Sin dependencias del runtime.
import { nombreSeguro } from "./agente";

export const AGENTE_MAX_MENSAJE = 30_000;
export const AGENTE_MAX_ARCHIVOS = 5;
export const AGENTE_MAX_BASE64 = 10 * 1024 * 1024; // suma de los datos en base64
export const AGENTE_MAX_CUERPO = AGENTE_MAX_BASE64 + 256 * 1024;

export type ArchivoAgente = { nombre: string; datos: string };
export type PeticionAgente = { chat_id?: string; mensaje: string; archivos: ArchivoAgente[] };
export type ValidacionAgente = { ok: true; valor: PeticionAgente } | { ok: false; error: string };

export const chatIdSeguro = (s: unknown): s is string => typeof s === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(s);

export function validarAgente(b: unknown): ValidacionAgente {
  if (!b || typeof b !== "object") return { ok: false, error: "Cuerpo no válido." };
  const o = b as Record<string, unknown>;
  if (typeof o.mensaje !== "string" || !o.mensaje.trim()) return { ok: false, error: "Escribe un mensaje." };
  if (o.mensaje.length > AGENTE_MAX_MENSAJE) return { ok: false, error: `El mensaje supera los ${AGENTE_MAX_MENSAJE} caracteres.` };
  let chat_id: string | undefined;
  if (o.chat_id !== undefined && o.chat_id !== null && o.chat_id !== "") {
    if (!chatIdSeguro(o.chat_id)) return { ok: false, error: "chat_id no válido." };
    chat_id = o.chat_id;
  }
  const lista = o.archivos === undefined || o.archivos === null ? [] : o.archivos;
  if (!Array.isArray(lista)) return { ok: false, error: "archivos debe ser una lista." };
  if (lista.length > AGENTE_MAX_ARCHIVOS) return { ok: false, error: `Máximo ${AGENTE_MAX_ARCHIVOS} archivos.` };
  const archivos: ArchivoAgente[] = [];
  let total = 0;
  for (const a of lista) {
    if (!a || typeof a !== "object" || typeof (a as ArchivoAgente).datos !== "string") return { ok: false, error: "Archivo no válido." };
    const datos = (a as ArchivoAgente).datos.replace(/^data:[^,]*,/, "").replace(/\s+/g, "");
    if (!datos || !/^[A-Za-z0-9+/]+={0,2}$/.test(datos)) return { ok: false, error: "Los datos del archivo no son base64 válido." };
    total += datos.length;
    if (total > AGENTE_MAX_BASE64) return { ok: false, error: "Los archivos superan 10 MB en total." };
    archivos.push({ nombre: nombreSeguro((a as ArchivoAgente).nombre), datos });
  }
  return { ok: true, valor: { ...(chat_id ? { chat_id } : {}), mensaje: o.mensaje, archivos } };
}
