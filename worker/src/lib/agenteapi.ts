// Comprobación mínima de POST /api/agente. ObraClara es un cliente: toda la lógica del agente (turnos, cola de mensajes,
// lectura de archivos, límites) vive en la API del servidor. Aquí solo se descarta lo que no tiene forma de petición.
export const AGENTE_MAX_CUERPO = 25 * 1024 * 1024; // protección: la API acepta cuerpos de unos 25 MB

export type PeticionAgente = { chat_id?: string; mensaje: string; archivos: { nombre: string; datos: string }[]; mcp?: true; conocidos?: Record<string, number>; subidos?: string[] };
export type ValidacionAgente = { ok: true; valor: PeticionAgente } | { ok: false; error: string };

export const MENSAJE_SOLO_ARCHIVOS = "Revisa los archivos adjuntos y resume su contenido.";

export const chatIdSeguro = (s: unknown): s is string => typeof s === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(s);

export function validarAgente(b: unknown): ValidacionAgente {
  if (!b || typeof b !== "object") return { ok: false, error: "Cuerpo no válido." };
  const o = b as Record<string, unknown>;
  // Solo archivos (sin texto): la API exige `mensaje`, así que va una petición por defecto en vez de un mensaje vacío.
  const hayArchivos = Array.isArray(o.archivos) && o.archivos.length > 0;
  if (typeof o.mensaje !== "string" || !o.mensaje.trim()) { if (!hayArchivos || (o.mensaje !== undefined && o.mensaje !== null && typeof o.mensaje !== "string")) return { ok: false, error: "Escribe un mensaje." }; o.mensaje = MENSAJE_SOLO_ARCHIVOS; }
  if (o.chat_id !== undefined && o.chat_id !== null && o.chat_id !== "" && !chatIdSeguro(o.chat_id)) return { ok: false, error: "chat_id no válido." };
  if (o.mcp !== undefined && typeof o.mcp !== "boolean") return { ok: false, error: "mcp debe ser verdadero o falso." };
  if (o.archivos !== undefined && o.archivos !== null && !Array.isArray(o.archivos)) return { ok: false, error: "archivos debe ser una lista." };
  const archivos = ((o.archivos as unknown[]) ?? []).filter((a): a is { nombre: string; datos: string } => !!a && typeof (a as { datos?: unknown }).datos === "string");
  // Pistas para que el conector no baje de nuevo lo que el navegador ya tiene (versión conocida por ruta y archivos recién subidos).
  const conocidos: Record<string, number> = {};
  if (o.conocidos && typeof o.conocidos === "object" && !Array.isArray(o.conocidos)) for (const [k, v] of Object.entries(o.conocidos as Record<string, unknown>).slice(0, 100)) if (typeof v === "number" && Number.isFinite(v)) conocidos[k.slice(0, 200)] = v;
  const subidos = Array.isArray(o.subidos) ? (o.subidos as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 50).map((x) => x.slice(0, 200)) : [];
  return { ok: true, valor: { ...(chatIdSeguro(o.chat_id) ? { chat_id: o.chat_id } : {}), mensaje: o.mensaje as string, archivos: archivos.map((a) => ({ nombre: String(a.nombre ?? "archivo").slice(0, 200), datos: a.datos })), ...(Object.keys(conocidos).length ? { conocidos } : {}), ...(subidos.length ? { subidos } : {}), ...(o.mcp === true ? { mcp: true as const } : {}) } };
}

// POST /api/agente/rehacer: editar un mensaje del usuario o reintentar una respuesta. La API recorta su historial desde el mensaje
// del usuario N (0 = el primero) y responde como POST /v1/agente; sin `mensaje`, repite el texto original.
export type PeticionRehacer = { chat_id: string; desde: number; mensaje?: string; archivos: { nombre: string; datos: string }[]; mcp?: true; conocidos?: Record<string, number> };
export function validarRehacer(b: unknown): { ok: true; valor: PeticionRehacer } | { ok: false; error: string } {
  if (!b || typeof b !== "object") return { ok: false, error: "Cuerpo no válido." };
  const o = b as Record<string, unknown>;
  if (!chatIdSeguro(o.chat_id)) return { ok: false, error: "chat_id no válido." };
  if (typeof o.desde !== "number" || !Number.isInteger(o.desde) || o.desde < 0 || o.desde > 10000) return { ok: false, error: "desde debe ser un número entero." };
  if (o.mensaje !== undefined && o.mensaje !== null && (typeof o.mensaje !== "string" || !o.mensaje.trim())) return { ok: false, error: "Escribe un mensaje." };
  if (o.mcp !== undefined && typeof o.mcp !== "boolean") return { ok: false, error: "mcp debe ser verdadero o falso." };
  if (o.archivos !== undefined && o.archivos !== null && !Array.isArray(o.archivos)) return { ok: false, error: "archivos debe ser una lista." };
  const archivos = ((o.archivos as unknown[]) ?? []).filter((a): a is { nombre: string; datos: string } => !!a && typeof (a as { datos?: unknown }).datos === "string");
  const conocidos: Record<string, number> = {};
  if (o.conocidos && typeof o.conocidos === "object" && !Array.isArray(o.conocidos)) for (const [k, v] of Object.entries(o.conocidos as Record<string, unknown>).slice(0, 100)) if (typeof v === "number" && Number.isFinite(v)) conocidos[k.slice(0, 200)] = v;
  return { ok: true, valor: { ...(Object.keys(conocidos).length ? { conocidos } : {}), chat_id: o.chat_id, desde: o.desde, ...(typeof o.mensaje === "string" ? { mensaje: o.mensaje } : {}), archivos: archivos.map((a) => ({ nombre: String(a.nombre ?? "archivo").slice(0, 200), datos: a.datos })), ...(o.mcp === true ? { mcp: true as const } : {}) } };
}

// POST /api/agente/rama: volver a una versión guardada (k = la rama de la API que guarda esa versión).
export function validarRama(b: unknown): { ok: true; valor: { chat_id: string; rama: number; archivos: never[]; conocidos?: Record<string, number> } } | { ok: false; error: string } {
  if (!b || typeof b !== "object") return { ok: false, error: "Cuerpo no válido." };
  const o = b as Record<string, unknown>;
  if (!chatIdSeguro(o.chat_id)) return { ok: false, error: "chat_id no válido." };
  if (typeof o.rama !== "number" || !Number.isInteger(o.rama) || o.rama < 0 || o.rama > 10000) return { ok: false, error: "rama debe ser un número entero." };
  const conocidos: Record<string, number> = {};
  if (o.conocidos && typeof o.conocidos === "object" && !Array.isArray(o.conocidos)) for (const [k, v] of Object.entries(o.conocidos as Record<string, unknown>).slice(0, 100)) if (typeof v === "number" && Number.isFinite(v)) conocidos[k.slice(0, 200)] = v;
  return { ok: true, valor: { chat_id: o.chat_id, rama: o.rama, archivos: [], ...(Object.keys(conocidos).length ? { conocidos } : {}) } };
}

// POST /api/agente/recuperar: tras una reconexión del conector o un tiempo agotado, espera a que termine el turno en curso de ese
// chat en la API y devuelve su última respuesta (sin volver a mandar el mensaje, que la API ya tiene).
export function validarRecuperar(b: unknown): { ok: true; valor: { chat_id: string; recuperar: true; mensaje?: string; archivos: never[]; conocidos?: Record<string, number> } } | { ok: false; error: string } {
  if (!b || typeof b !== "object") return { ok: false, error: "Cuerpo no válido." };
  const o = b as Record<string, unknown>;
  if (!chatIdSeguro(o.chat_id)) return { ok: false, error: "chat_id no válido." };
  const conocidos: Record<string, number> = {};
  if (o.conocidos && typeof o.conocidos === "object" && !Array.isArray(o.conocidos)) for (const [k, v] of Object.entries(o.conocidos as Record<string, unknown>).slice(0, 100)) if (typeof v === "number" && Number.isFinite(v)) conocidos[k.slice(0, 200)] = v;
  return { ok: true, valor: { chat_id: o.chat_id, recuperar: true, ...(typeof o.mensaje === "string" && o.mensaje.trim() ? { mensaje: o.mensaje.slice(0, 20000) } : {}), archivos: [], ...(Object.keys(conocidos).length ? { conocidos } : {}) } };
}
