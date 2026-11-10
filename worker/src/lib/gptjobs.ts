// Cola de preguntas para gpt-headless. El Worker las guarda en D1; un conector que corre en la máquina del grupo
// (gpt-bridge/conector.mjs) las recoge llamando hacia afuera, las responde con gpt-headless y devuelve el resultado.
// Así no se abre ningún puerto de esa máquina a internet.
import type { Db } from "./queries";

export interface Mensaje { role: string; content: string }
export const MAX_PENDIENTES = 5;
export const VIGENCIA_CONECTOR_S = 20;

const q = <T = Record<string, unknown>>(db: Db, sql: string, ...p: unknown[]) => db.prepare(sql).bind(...p).all<T>();

export function validarMensajes(m: unknown): m is Mensaje[] {
  return Array.isArray(m) && m.length > 0 && m.length <= 24 &&
    m.every((x) => x && ["system", "user", "assistant"].includes(x.role) && typeof x.content === "string") &&
    m.reduce((n: number, x: Mensaje) => n + x.content.length, 0) <= 24000;
}

export async function conectorVivo(db: Db, ahora: number): Promise<boolean> {
  const r = await db.prepare("SELECT valor FROM gpt_estado WHERE clave = 'visto'").bind().first<{ valor: string }>();
  return !!r && ahora - Number(r.valor) <= VIGENCIA_CONECTOR_S * 1000;
}

export async function latido(db: Db, ahora: number) {
  await q(db, "INSERT OR REPLACE INTO gpt_estado (clave, valor) VALUES ('visto', ?)", String(ahora));
}

/** Devuelve el id de la tarea, o null si ya hay demasiadas pendientes. */
export async function encolar(db: Db, mensajes: Mensaje[], ahora: number, id: string): Promise<string | null> {
  await q(db, "DELETE FROM gpt_jobs WHERE creado < ?", ahora - 10 * 60 * 1000);
  const n = await db.prepare("SELECT COUNT(*) AS n FROM gpt_jobs WHERE estado IN ('pendiente','en_curso')").bind().first<{ n: number }>();
  if ((n?.n ?? 0) >= MAX_PENDIENTES) return null;
  await q(db, "INSERT INTO gpt_jobs (id, estado, mensajes, creado) VALUES (?, 'pendiente', ?, ?)", id, JSON.stringify(mensajes), ahora);
  return id;
}

/** El conector reclama la tarea pendiente más antigua (de forma atómica). */
export async function reclamar(db: Db, ahora: number) {
  const { results } = await q<{ id: string; mensajes: string }>(
    db,
    "UPDATE gpt_jobs SET estado = 'en_curso', iniciado = ? WHERE id = (SELECT id FROM gpt_jobs WHERE estado = 'pendiente' ORDER BY creado LIMIT 1) RETURNING id, mensajes",
    ahora,
  );
  const r = results[0];
  return r ? { id: r.id, messages: JSON.parse(r.mensajes) as Mensaje[] } : null;
}

export async function guardarResultado(db: Db, id: string, contenido: string | null, error: string | null) {
  await q(db, "UPDATE gpt_jobs SET estado = ?, respuesta = ?, error = ? WHERE id = ? AND estado = 'en_curso'",
    error ? "error" : "listo", contenido, error, id);
}

export async function estado(db: Db, id: string) {
  return db.prepare("SELECT estado, respuesta, error FROM gpt_jobs WHERE id = ?").bind(id).first<{ estado: string; respuesta: string | null; error: string | null }>();
}

export async function cancelar(db: Db, id: string, motivo: string) {
  await q(db, "UPDATE gpt_jobs SET estado = 'error', error = ? WHERE id = ? AND estado IN ('pendiente','en_curso')", motivo, id);
}
