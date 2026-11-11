// Lógica pura del agente del panel "Prueba el asistente".
// SINCRONÍA: src/demo.ts incrusta estas funciones en el script del navegador con Function.prototype.toString().
// Por eso deben ser funciones de nivel superior SIN funciones anidadas con nombre ni dependencias externas
// (los callbacks anónimos están bien). test/agente.test.ts evalúa el script incrustado y comprueba que se
// comporta igual que estas exportaciones.

export type Llamada =
  | { tipo: "tool"; tool: string; args: Record<string, unknown> }
  | { tipo: "respuesta"; texto: string };

export type Herramienta = {
  name: string;
  description?: string;
  inputSchema?: { properties?: Record<string, { type?: string; description?: string }>; required?: string[] };
};

/** Acorta un texto a n caracteres. */
export function truncate(s: unknown, n: number): string {
  const t = typeof s === "string" ? s : String(s);
  return t.length > n ? t.slice(0, n) + "… [recortado " + (t.length - n) + " caracteres]" : t;
}

/** Extrae el objeto JSON-RPC de una respuesta SSE ("data: {...}") o de JSON plano. null si no hay. */
export function parseSse(text: string): any {
  const t = String(text).trim();
  if (t.charAt(0) === "{") {
    try { return JSON.parse(t); } catch (e) { /* sigue con SSE */ }
  }
  const lineas = t.split(/\r?\n/);
  let ultimo: any = null;
  let buf = "";
  for (let i = 0; i <= lineas.length; i++) {
    const l = i < lineas.length ? lineas[i] : "";
    if (l.indexOf("data:") === 0) {
      buf += l.slice(5).replace(/^ /, "");
    } else if (buf !== "") {
      try { ultimo = JSON.parse(buf); } catch (e) { /* línea no JSON */ }
      buf = "";
    }
  }
  return ultimo;
}

/** Interpreta la salida del modelo: {"tool","args"} o {"respuesta"}; tolera ``` y texto extra. null si no hay. */
export function parseToolCall(text: string): Llamada | null {
  const s = String(text);
  for (let i = 0; i < s.length; i++) {
    if (s.charAt(i) !== "{") continue;
    let prof = 0;
    let enStr = false;
    let esc = false;
    for (let j = i; j < s.length; j++) {
      const c = s.charAt(j);
      if (enStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') enStr = false;
        continue;
      }
      if (c === '"') enStr = true;
      else if (c === "{") prof++;
      else if (c === "}") {
        prof--;
        if (prof === 0) {
          const crudo = s.slice(i, j + 1);
          let o: any = null;
          try { o = JSON.parse(crudo); } catch (e) {
            // Los modelos a veces escriben escapes que JSON no permite (p. ej. "¡Hola\!"): se quita la barra y se reintenta.
            try { o = JSON.parse(crudo.replace(/\\(?!["\\\/bfnrtu])/g, "")); } catch (e2) { /* no era JSON; sigue buscando */ }
          }
          if (o && typeof o === "object") {
            if (typeof o.respuesta === "string") return { tipo: "respuesta", texto: o.respuesta };
            if (typeof o.tool === "string" && o.tool) {
              const a = o.args && typeof o.args === "object" && !Array.isArray(o.args) ? o.args : {};
              return { tipo: "tool", tool: o.tool, args: a };
            }
          }
          break;
        }
      }
    }
  }
  return null;
}

/** Prompt de sistema: con MCP describe las herramientas y el protocolo JSON; sin MCP, chat simple. */
export function buildSystemPrompt(tools: Herramienta[], mcpOn: boolean): string {
  if (!mcpOn) return "Responde en español. Si la pregunta trata de datos oficiales del Perú, cita la fuente y no inventes cifras. Si el usuario adjunta una imagen, descríbela con lo que se ve.";
  const lista = (tools || []).map((t) => {
    const p = (t.inputSchema && t.inputSchema.properties) || {};
    const req = (t.inputSchema && t.inputSchema.required) || [];
    const ps = Object.keys(p).map((k) =>
      k + " (" + (p[k].type || "any") + (req.indexOf(k) >= 0 ? ", obligatorio" : "") + ")" + (p[k].description ? ": " + p[k].description : "")
    );
    return "- " + t.name + ": " + (t.description || "") + (ps.length ? "\n  Parámetros: " + ps.join("; ") : "");
  });
  return [
    "Eres ObraClara, asistente de datos de inversión pública del Perú (fuente: MEF). Respondes en español.",
    "Tienes estas herramientas:",
    lista.join("\n"),
    "Protocolo: para llamar una herramienta responde SOLO con JSON, sin texto adicional: {\"tool\":\"<nombre>\",\"args\":{...}}.",
    "Recibirás el resultado y podrás llamar otra herramienta o terminar. Para terminar responde SOLO con JSON: {\"respuesta\":\"<respuesta final en español, citando fuente y fecha_descarga>\"}.",
    "Nunca inventes datos: usa únicamente lo que devuelvan las herramientas. Las alertas son indicadores técnicos, no prueban irregularidades.",
  ].join("\n");
}

// ---- Conexiones de IA propias (panel "Configuración") ----
// Mismas reglas de sincronía: funciones de nivel superior que solo se llaman entre sí (todas se incrustan en el navegador).

export type Conexion = {
  id: string;
  nombre: string;
  tipo: "openai" | "anthropic";
  baseUrl: string;
  modelo: string;
  clave: string;
  recordar?: boolean;
};

/** Plantillas del formulario: base y modelo típicos por proveedor. */
export function presetsIA(): { id: string; nombre: string; tipo: "openai" | "anthropic"; baseUrl: string; modelo: string }[] {
  return [
    { id: "openai", nombre: "OpenAI", tipo: "openai", baseUrl: "https://api.openai.com/v1", modelo: "gpt-4o-mini" },
    { id: "groq", nombre: "Groq", tipo: "openai", baseUrl: "https://api.groq.com/openai/v1", modelo: "openai/gpt-oss-20b" },
    { id: "gemini", nombre: "Google Gemini", tipo: "openai", baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai", modelo: "gemini-2.5-flash" },
    { id: "nvidia", nombre: "NVIDIA NIM", tipo: "openai", baseUrl: "https://integrate.api.nvidia.com/v1", modelo: "meta/llama-3.3-70b-instruct" },
    { id: "openrouter", nombre: "OpenRouter", tipo: "openai", baseUrl: "https://openrouter.ai/api/v1", modelo: "openai/gpt-4o-mini" },
    { id: "anthropic", nombre: "Anthropic", tipo: "anthropic", baseUrl: "https://api.anthropic.com/v1", modelo: "claude-haiku-4-5" },
    { id: "otro", nombre: "Otro (cualquier API compatible con OpenAI)", tipo: "openai", baseUrl: "", modelo: "" },
  ];
}

/** Texto recortado o "" si no es texto. */
export function textoLimpio(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Limpia una conexión: recorta textos, quita "/" finales de la URL, tipo por defecto "openai". */
export function normalizarConexion(c: any): Conexion {
  const o = c && typeof c === "object" ? c : {};
  return {
    id: textoLimpio(o.id),
    nombre: textoLimpio(o.nombre).slice(0, 60),
    tipo: o.tipo === "anthropic" ? "anthropic" : "openai",
    baseUrl: textoLimpio(o.baseUrl).replace(/\/+$/, ""),
    modelo: textoLimpio(o.modelo),
    clave: textoLimpio(o.clave),
    recordar: !!o.recordar,
  };
}

/** Lista de problemas (en español) de una conexión; vacía si es válida. */
export function validarConexion(c: any): string[] {
  const n = normalizarConexion(c);
  const e: string[] = [];
  if (!n.nombre) e.push("Falta el nombre.");
  if (!n.baseUrl) e.push("Falta la URL base.");
  else if (!/^https:\/\/[^\s/]+/i.test(n.baseUrl) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(n.baseUrl)) e.push("La URL base debe empezar con https://");
  if (!n.modelo) e.push("Falta el nombre del modelo.");
  if (!n.clave) e.push("Falta la clave de API.");
  return e;
}

/** Convierte la config antigua (modo cf/local/clave) al formato nuevo: { conexiones, activa }. */
export function migrarConfig(old: any): { conexiones: Conexion[]; activa: string } {
  const vacio = { conexiones: [] as Conexion[], activa: "gpt-headless" };
  if (!old || typeof old !== "object" || old.modo !== "clave") return vacio;
  const ps = presetsIA();
  const p = ps.filter((x) => x.id === old.prov)[0];
  const base = p && p.id !== "otro" ? p.baseUrl : typeof old.base === "string" ? old.base : "";
  const c = normalizarConexion({
    id: "migrada",
    nombre: p ? p.nombre : "Mi API",
    tipo: p ? p.tipo : "openai",
    baseUrl: base,
    modelo: old.model,
    clave: old.key,
    recordar: old.rec,
  });
  if (!c.clave) return vacio;
  return { conexiones: [c], activa: c.id };
}

// ---- Imágenes adjuntas ----

export type ParteContenido = { type: string; text?: string; image_url?: { url: string }; source?: any };

/** Límites de las imágenes adjuntas. */
export function limitesImagen(): { maxImagenes: number; maxBytes: number; ladoMax: number; calidad: number; tipos: string[] } {
  return { maxImagenes: 3, maxBytes: 10 * 1024 * 1024, ladoMax: 1280, calidad: 0.82, tipos: ["image/png", "image/jpeg", "image/webp", "image/gif"] };
}

/** "" si el archivo se puede adjuntar; si no, el motivo en español. */
export function validarImagen(tipo: string, bytes: number, actuales: number): string {
  const l = limitesImagen();
  if (l.tipos.indexOf(String(tipo).toLowerCase()) < 0) return "Solo se aceptan imágenes PNG, JPEG, WebP o GIF.";
  if (bytes > l.maxBytes) return "La imagen pesa más de 10 MB. Elige una más liviana.";
  if (actuales >= l.maxImagenes) return "Máximo " + l.maxImagenes + " imágenes por mensaje.";
  return "";
}

/** Tamaño reducido (sin ampliar) para que el lado mayor sea como máximo `max`. */
export function escalarImagen(w: number, h: number, max: number): { w: number; h: number } {
  const m = Math.max(w, h);
  if (!(m > max) || !(w > 0) || !(h > 0)) return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
  const k = max / m;
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

/** Contenido de un mensaje de usuario: texto simple, o arreglo estilo OpenAI (texto primero, luego imágenes) si hay imágenes. */
export function construirContenido(texto: string, urls: string[]): string | ParteContenido[] {
  const t = typeof texto === "string" ? texto : "";
  if (!urls || !urls.length) return t;
  const partes: ParteContenido[] = [];
  if (t) partes.push({ type: "text", text: t });
  urls.forEach((u) => { partes.push({ type: "image_url", image_url: { url: u } }); });
  return partes;
}

/** Bloques de Anthropic para un contenido (texto o arreglo OpenAI): image_url con data: URL pasa a {type:'image',source}. */
export function aBloquesAnthropic(content: any): any[] {
  if (typeof content === "string") return [{ type: "text", text: content }];
  const out: any[] = [];
  (Array.isArray(content) ? content : []).forEach((p: any) => {
    if (!p) return;
    if (p.type === "text") out.push({ type: "text", text: String(p.text || "") });
    else if (p.type === "image_url" && p.image_url && typeof p.image_url.url === "string") {
      const m = /^data:([^;,]+);base64,(.*)$/.exec(p.image_url.url);
      if (m) out.push({ type: "image", source: { type: "base64", media_type: m[1], data: m[2] } });
    } else if (p.type === "image" && p.source) out.push(p);
  });
  return out;
}

/** Arma la petición HTTP (url, headers, body) para una conexión y una lista de mensajes [{role, content}] con el system primero. */
export function construirPeticion(c: any, msgs: { role: string; content: any }[]): { url: string; headers: Record<string, string>; body: any } {
  const n = normalizarConexion(c);
  if (n.tipo === "anthropic") {
    const m2: { role: string; content: any }[] = [];
    msgs.slice(1).forEach((m) => {
      const l = m2[m2.length - 1];
      if (l && l.role === m.role) {
        if (typeof l.content === "string" && typeof m.content === "string") l.content += "\n\n" + m.content;
        else l.content = aBloquesAnthropic(l.content).concat(aBloquesAnthropic(m.content));
      } else m2.push({ role: m.role, content: typeof m.content === "string" ? m.content : aBloquesAnthropic(m.content) });
    });
    return {
      url: n.baseUrl + "/messages",
      headers: {
        "content-type": "application/json",
        "x-api-key": n.clave,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: { model: n.modelo, max_tokens: 1024, system: msgs[0] ? msgs[0].content : "", messages: m2 },
    };
  }
  return {
    url: n.baseUrl + "/chat/completions",
    headers: { "content-type": "application/json", authorization: "Bearer " + n.clave },
    body: { model: n.modelo, messages: msgs, temperature: 0.2 },
  };
}

/** Texto de la respuesta del proveedor según el tipo ("" si no hay). */
export function extraerRespuesta(tipo: string, j: any): string {
  if (tipo === "anthropic") return ((j && j.content) || []).map((c: any) => c.text || "").join("");
  const ch = j && j.choices && j.choices[0];
  return (ch && ch.message && ch.message.content) || "";
}

// ---- Chats guardados en el navegador (solo en este dispositivo) ----

export type MensajeGuardado = {
  rol: "u" | "a" | "t";
  texto: string;
  modelo?: string;
  mcp?: boolean;
  herramienta?: { nombre: string; args: unknown; resultado: string };
};
export type ChatGuardado = { id: string; titulo: string; creado: number; actualizado: number; mensajes: MensajeGuardado[] };

/** Título de un chat: la primera pregunta, sin saltos de línea, a 60 caracteres. */
export function tituloChat(texto: unknown): string {
  const t = (typeof texto === "string" ? texto : "").replace(/\s+/g, " ").trim();
  return t ? t.slice(0, 60) : "Conversación";
}

/** Cambia cualquier data URL de imagen por la marca "[imagen adjunta]" (no se guardan imágenes). */
export function sinImagenes(texto: unknown): string {
  return String(typeof texto === "string" ? texto : "").replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+\/=]*/gi, "[imagen adjunta]");
}

/** Mensaje válido y acotado, o null. */
export function normalizarMensaje(m: any): MensajeGuardado | null {
  if (!m || typeof m !== "object" || (m.rol !== "u" && m.rol !== "a" && m.rol !== "t")) return null;
  const o: MensajeGuardado = { rol: m.rol, texto: sinImagenes(m.texto).slice(0, 20000) };
  if (typeof m.modelo === "string" && m.modelo) o.modelo = m.modelo.slice(0, 120);
  if (typeof m.mcp === "boolean") o.mcp = m.mcp;
  if (m.rol === "t") {
    const h = m.herramienta && typeof m.herramienta === "object" ? m.herramienta : {};
    let a: unknown = {};
    try { a = JSON.parse(JSON.stringify(h.args && typeof h.args === "object" ? h.args : {})); } catch (e) { a = {}; }
    o.herramienta = { nombre: String(h.nombre || "").slice(0, 80), args: a, resultado: sinImagenes(h.resultado).slice(0, 2500) };
  }
  return o;
}

/** Chat válido con mensajes normalizados, o null si no tiene id. */
export function normalizarChat(c: any): ChatGuardado | null {
  if (!c || typeof c !== "object" || typeof c.id !== "string" || !c.id) return null;
  const ms: MensajeGuardado[] = [];
  (Array.isArray(c.mensajes) ? c.mensajes : []).forEach((m: any) => { const n = normalizarMensaje(m); if (n) ms.push(n); });
  const cr = typeof c.creado === "number" && isFinite(c.creado) ? c.creado : 0;
  const ac = typeof c.actualizado === "number" && isFinite(c.actualizado) ? c.actualizado : cr;
  return { id: c.id.slice(0, 40), titulo: tituloChat(c.titulo), creado: cr, actualizado: ac, mensajes: ms };
}

/** "Hoy", "Ayer" o "Anteriores" según el día local de `ts` respecto de `ahora`. */
export function grupoFecha(ts: number, ahora: number): string {
  const d = new Date(ahora);
  const hoy = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const ayer = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1).getTime();
  if (ts >= hoy) return "Hoy";
  if (ts >= ayer) return "Ayer";
  return "Anteriores";
}

/** Orden más reciente primero; deja como máximo maxChats chats (50) y maxMsgs mensajes por chat (80), quitando los más antiguos. */
export function recortarChats(chats: any[], maxChats?: number, maxMsgs?: number): ChatGuardado[] {
  const mc = maxChats || 50;
  const mm = maxMsgs || 80;
  const out: ChatGuardado[] = [];
  (Array.isArray(chats) ? chats : []).forEach((c) => { const n = normalizarChat(c); if (n) out.push(n); });
  out.sort((a, b) => b.actualizado - a.actualizado);
  return out.slice(0, mc).map((c) => ({ ...c, mensajes: c.mensajes.slice(-mm) }));
}

/** Texto JSON listo para guardar (recortado y sin imágenes). */
export function serializarChats(chats: any[]): string {
  return JSON.stringify(recortarChats(chats));
}

/** Lee el texto guardado; [] si está vacío o dañado. */
export function deserializarChats(txt: unknown): ChatGuardado[] {
  if (typeof txt !== "string" || !txt) return [];
  try {
    const j = JSON.parse(txt);
    return recortarChats(Array.isArray(j) ? j : []);
  } catch (e) { return []; }
}
