// Comprobación mínima de POST /api/agente. ObraClara es un cliente: toda la lógica del agente (turnos, cola de mensajes,
// lectura de archivos, límites) vive en la API del servidor. Aquí solo se descarta lo que no tiene forma de petición.
export const AGENTE_MAX_CUERPO = 25 * 1024 * 1024; // protección: la API acepta cuerpos de unos 25 MB

export type PeticionAgente = { chat_id?: string; mensaje: string; archivos: { nombre: string; datos: string }[]; mcp?: true };
export type ValidacionAgente = { ok: true; valor: PeticionAgente } | { ok: false; error: string };

export const chatIdSeguro = (s: unknown): s is string => typeof s === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(s);

export function validarAgente(b: unknown): ValidacionAgente {
  if (!b || typeof b !== "object") return { ok: false, error: "Cuerpo no válido." };
  const o = b as Record<string, unknown>;
  if (typeof o.mensaje !== "string" || !o.mensaje.trim()) return { ok: false, error: "Escribe un mensaje." };
  if (o.chat_id !== undefined && o.chat_id !== null && o.chat_id !== "" && !chatIdSeguro(o.chat_id)) return { ok: false, error: "chat_id no válido." };
  if (o.mcp !== undefined && typeof o.mcp !== "boolean") return { ok: false, error: "mcp debe ser verdadero o falso." };
  if (o.archivos !== undefined && o.archivos !== null && !Array.isArray(o.archivos)) return { ok: false, error: "archivos debe ser una lista." };
  const archivos = ((o.archivos as unknown[]) ?? []).filter((a): a is { nombre: string; datos: string } => !!a && typeof (a as { datos?: unknown }).datos === "string");
  return { ok: true, valor: { ...(chatIdSeguro(o.chat_id) ? { chat_id: o.chat_id } : {}), mensaje: o.mensaje, archivos: archivos.map((a) => ({ nombre: String(a.nombre ?? "archivo").slice(0, 200), datos: a.datos })), ...(o.mcp === true ? { mcp: true as const } : {}) } };
}
