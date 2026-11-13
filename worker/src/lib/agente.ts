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
  // Último recurso: {"respuesta":"..."} con saltos de línea o comillas sin escapar (típico al devolver archivos): se rescata el texto.
  const lm = /^\s*(?:```(?:json)?\s*)?\{\s*"respuesta"\s*:\s*"([\s\S]*)"\s*\}\s*(?:```)?\s*$/.exec(s);
  if (lm) return { tipo: "respuesta", texto: lm[1].replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\") };
  return null;
}

/** Prompt de sistema: con MCP describe las herramientas y el protocolo JSON; sin MCP, chat simple. */
export function buildSystemPrompt(tools: Herramienta[], mcpOn: boolean): string {
  const archivos = "Si el usuario pide un archivo o documento (Word, PDF, código, texto, un proyecto), escríbelo completo en un bloque de código cuya línea de apertura sea ```archivo:ruta/nombre.ext (por ejemplo ```archivo:informe.md o ```archivo:src/app.py), un bloque por archivo; si el contenido lleva bloques de código propios, abre y cierra el bloque archivo con cuatro acentos graves. Para Word o PDF escribe el contenido en Markdown simple dentro de ```archivo:nombre.docx o ```archivo:nombre.pdf: el sitio ofrece botones de descarga. Añade una frase que diga qué contiene cada archivo.";
  if (!mcpOn) return "Responde en español. Si la pregunta trata de datos oficiales del Perú, cita la fuente y no inventes cifras. Si el usuario adjunta una imagen, descríbela con lo que se ve. Si adjunta documentos o proyectos, su texto viene en el mensaje bajo «[Adjunto: ...]»: úsalo como contexto. " + archivos;
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
    "Si el usuario adjunta documentos o proyectos, su texto viene en el mensaje bajo «[Adjunto: ...]»: úsalo como contexto.",
    archivos + " El bloque va dentro del texto de \"respuesta\": escribe los saltos de línea como \\n y escapa las comillas dobles como \\\".",
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
  const vacio = { conexiones: [] as Conexion[], activa: "servidor" };
  // Formato nuevo con una "activa" que ya no existe (p. ej. un nombre antiguo de la IA del servidor): vuelve a "servidor".
  if (old && typeof old === "object" && Array.isArray(old.conexiones) && typeof old.activa === "string" &&
      old.activa !== "servidor" && !old.conexiones.some((c: any) => c && c.id === old.activa)) return { conexiones: old.conexiones, activa: "servidor" };
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
  /** Adjuntos del mensaje de usuario (solo datos para mostrar chips) y su texto completo enviado al modelo. */
  adj?: { n: string; t: string; c: number }[];
  ctx?: string;
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
  if (m.rol === "u") {
    if (Array.isArray(m.adj) && m.adj.length) o.adj = m.adj.slice(0, 10).map((x: any) => ({ n: String((x && x.n) || "").slice(0, 100), t: String((x && x.t) || "").slice(0, 10), c: Number(x && x.c) || 0 }));
    if (typeof m.ctx === "string" && m.ctx) o.ctx = sinImagenes(m.ctx).slice(0, 70000);
  }
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

// ---- Adjuntos: documentos y proyectos (el texto se extrae en el navegador) ----
// Mismas reglas de sincronía: funciones de nivel superior que solo se llaman entre sí (se incrustan en el navegador).

export type AdjuntoArchivo = { ruta: string; texto?: string; nota?: string };
export type Adjunto = {
  nombre: string;
  tipo: "texto" | "pdf" | "docx" | "zip";
  texto?: string;
  paginas?: number;
  arbol?: string[];
  archivos?: AdjuntoArchivo[];
  avisos?: string[];
  ignorados?: number;
};
export type EntradaZip = { nombre: string; metodo: number; comp: number; tam: number; offset: number; cifrado: boolean; dir: boolean };

/** Límites de los adjuntos de documentos. */
export function limitesAdjuntos(): { maxBytes: number; maxCharsArchivo: number; maxCharsTotal: number; maxDocs: number; maxEntradasZip: number; maxPaginasPdf: number } {
  return { maxBytes: 15 * 1024 * 1024, maxCharsArchivo: 20000, maxCharsTotal: 60000, maxDocs: 5, maxEntradasZip: 400, maxPaginasPdf: 300 };
}

/** Acorta un texto a n caracteres y marca el recorte. */
export function recortarTexto(t: string, n: number): string {
  const s = String(t);
  return s.length > n ? s.slice(0, Math.max(0, n)) + "\n… [recortado]" : s;
}

/** Nombre de archivo para mostrar: sin ruta, sin caracteres de control ni de marcado. */
export function nombreSeguro(n: unknown): string {
  const t = String(n == null ? "" : n).replace(/[\u0000-\u001f\u007f<>"`\\]/g, "").replace(/^.*\//, "").trim().slice(0, 100);
  return t || "archivo";
}

/** Ruta segura (relativa, sin "..", sin "/" inicial, caracteres seguros). "" si no queda nada. */
export function rutaSegura(r: unknown): string {
  const partes = String(r == null ? "" : r).replace(/\\/g, "/").replace(/[\u0000-\u001f\u007f]/g, "").split("/")
    .map((p) => p.replace(/[^\p{L}\p{N}._\-()+@#,&=~\[\]! ']/gu, "_").trim())
    .filter((p) => p && p !== "." && p !== "..");
  return partes.join("/").slice(0, 200);
}

/** Extensión en minúsculas, sin punto ("" si no tiene). */
export function extensionArchivo(n: unknown): string {
  const m = /\.([A-Za-z0-9]+)$/.exec(String(n == null ? "" : n));
  return m ? m[1].toLowerCase() : "";
}

/** 'imagen' | 'pdf' | 'docx' | 'zip' | 'texto' (cualquier otro: se comprueba el contenido). */
export function tipoAdjunto(nombre: string, mime: string): "imagen" | "pdf" | "docx" | "zip" | "texto" {
  const m = String(mime || "").toLowerCase();
  const e = extensionArchivo(nombre);
  if (m.indexOf("image/") === 0) return "imagen";
  if (e === "pdf" || m === "application/pdf") return "pdf";
  if (e === "docx") return "docx";
  if (e === "zip" || m === "application/zip" || m === "application/x-zip-compressed") return "zip";
  return "texto";
}

/** "" si el documento se puede adjuntar; si no, el motivo en español. */
export function validarDocumento(nombre: string, bytes: number, actuales: number): string {
  const l = limitesAdjuntos();
  if (bytes > l.maxBytes) return "«" + nombreSeguro(nombre) + "» pesa más de 15 MB.";
  if (actuales >= l.maxDocs) return "Máximo " + l.maxDocs + " documentos por mensaje.";
  return "";
}

/** ¿Parece texto UTF-8? Sin bytes NUL en los primeros 8 KB y casi sin caracteres inválidos. */
export function esTextoBytes(b: Uint8Array): boolean {
  const n = Math.min(b.length, 8192);
  for (let i = 0; i < n; i++) if (b[i] === 0) return false;
  const s = new TextDecoder("utf-8").decode(b.subarray(0, n));
  let malos = 0;
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) === 0xfffd) malos++;
  return malos <= 3 + Math.floor(s.length / 100);
}

/** Dentro de un zip: 'ignorar' (basura: ni se lista), 'listar' (solo aparece en el árbol) o 'texto' (se intenta leer). */
export function clasificarRuta(ruta: string): "ignorar" | "listar" | "texto" {
  const partes = String(ruta).split("/");
  const archivo = (partes[partes.length - 1] || "").toLowerCase();
  const basura = ["node_modules", ".git", "__macosx", "dist", "build", ".venv", "venv", "__pycache__"];
  for (let i = 0; i < partes.length - 1; i++) if (basura.indexOf(partes[i].toLowerCase()) >= 0) return "ignorar";
  if (archivo === ".ds_store") return "ignorar";
  if (archivo === "package-lock.json" || /\.lock$/.test(archivo) || /\.min\.(js|css)$/.test(archivo) || /\.map$/.test(archivo)) return "listar";
  const bin = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico", "svg", "tif", "tiff", "heic", "pdf", "zip", "gz", "tgz", "tar", "rar", "7z", "bz2", "xz",
    "exe", "dll", "so", "dylib", "bin", "class", "jar", "o", "a", "obj", "pyc", "woff", "woff2", "ttf", "otf", "eot", "mp3", "mp4", "mov", "avi", "wav",
    "ogg", "webm", "mkv", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "sqlite", "db", "psd", "ai", "apk", "iso", "dmg"];
  return bin.indexOf(extensionArchivo(archivo)) >= 0 ? "listar" : "texto";
}

/** Directorio central de un ZIP (sin ZIP64). avisos en español si no se puede leer. */
export function zipEntradas(b: Uint8Array): { entradas: EntradaZip[]; avisos: string[] } {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 65535); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return { entradas: [], avisos: ["No es un ZIP válido (no se encontró el directorio central)."] };
  const total = dv.getUint16(eocd + 10, true);
  const tamDir = dv.getUint32(eocd + 12, true);
  const off = dv.getUint32(eocd + 16, true);
  if (total === 0xffff || tamDir === 0xffffffff || off === 0xffffffff) return { entradas: [], avisos: ["El ZIP usa ZIP64 (archivos enormes) y no se puede leer."] };
  const entradas: EntradaZip[] = [];
  let p = off;
  for (let k = 0; k < total; k++) {
    if (p + 46 > b.length || dv.getUint32(p, true) !== 0x02014b50) break;
    const flags = dv.getUint16(p + 8, true);
    const ln = dv.getUint16(p + 28, true);
    const nombre = new TextDecoder("utf-8").decode(b.subarray(p + 46, p + 46 + ln));
    entradas.push({
      nombre, metodo: dv.getUint16(p + 10, true), comp: dv.getUint32(p + 20, true), tam: dv.getUint32(p + 24, true),
      offset: dv.getUint32(p + 42, true), cifrado: (flags & 1) === 1, dir: nombre.slice(-1) === "/",
    });
    p += 46 + ln + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true);
  }
  return { entradas, avisos: [] };
}

/** Contenido de una entrada (máximo maxBytes). Método 0 (stored) y 8 (deflate); null si cifrada, no soportada o dañada. */
export async function zipExtraer(b: Uint8Array, e: EntradaZip, maxBytes: number): Promise<Uint8Array | null> {
  if (e.cifrado || e.dir) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const o = e.offset;
  if (o + 30 > b.length || dv.getUint32(o, true) !== 0x04034b50) return null;
  const ini = o + 30 + dv.getUint16(o + 26, true) + dv.getUint16(o + 28, true);
  if (e.metodo === 0) return b.subarray(ini, Math.min(ini + e.comp, ini + maxBytes));
  if (e.metodo !== 8) return null;
  const rd = new Blob([b.subarray(ini, ini + e.comp) as any]).stream().pipeThrough(new DecompressionStream("deflate-raw") as any).getReader();
  const trozos: Uint8Array[] = [];
  let n = 0;
  try {
    while (n < maxBytes) {
      const r = await rd.read();
      if (r.done) break;
      trozos.push(r.value as Uint8Array);
      n += (r.value as Uint8Array).length;
    }
  } catch (err) { if (!n) return null; }
  try { await rd.cancel(); } catch (err) { /* ya cerrado */ }
  const out = new Uint8Array(Math.min(n, maxBytes));
  let q = 0;
  for (const t of trozos) {
    const m = Math.min(t.length, out.length - q);
    out.set(t.subarray(0, m), q);
    q += m;
    if (q >= out.length) break;
  }
  return out;
}

/** Lee un .zip como proyecto: árbol de archivos + texto de los archivos de texto (con los límites de limitesAdjuntos). */
export async function leerProyectoZip(nombre: string, bytes: Uint8Array): Promise<Adjunto> {
  const L = limitesAdjuntos();
  const z = zipEntradas(bytes);
  const avisos = z.avisos.slice();
  const arbol: string[] = [];
  const archivos: AdjuntoArchivo[] = [];
  let ignorados = 0, usados = 0, cifrados = 0, sobran = 0;
  for (const e of z.entradas) {
    if (e.dir) continue;
    const ruta = rutaSegura(e.nombre);
    if (!ruta) continue;
    const cl = clasificarRuta(ruta);
    if (cl === "ignorar") { ignorados++; continue; }
    if (arbol.length >= L.maxEntradasZip) { sobran++; continue; }
    arbol.push(ruta);
    if (cl === "listar") continue;
    if (e.cifrado) { cifrados++; archivos.push({ ruta, nota: "cifrado, no se puede leer" }); continue; }
    if (e.metodo !== 0 && e.metodo !== 8) { archivos.push({ ruta, nota: "compresión no soportada" }); continue; }
    if (usados >= L.maxCharsTotal) { archivos.push({ ruta, nota: "omitido por tamaño" }); continue; }
    const tope = L.maxCharsArchivo * 4;
    const datos = await zipExtraer(bytes, e, tope);
    if (!datos) { archivos.push({ ruta, nota: "no se pudo leer" }); continue; }
    if (!esTextoBytes(datos)) continue; // binario: queda solo en el árbol
    let t = new TextDecoder("utf-8").decode(datos);
    if (t.length > L.maxCharsArchivo || datos.length >= tope) t = recortarTexto(t, L.maxCharsArchivo);
    usados += t.length;
    archivos.push({ ruta, texto: t });
  }
  if (sobran) avisos.push("Solo se leyeron las primeras " + L.maxEntradasZip + " entradas; " + sobran + " más no se muestran.");
  if (cifrados) avisos.push(cifrados + " archivo(s) cifrado(s) no se pudieron leer.");
  return { nombre: nombreSeguro(nombre), tipo: "zip", arbol, archivos, avisos, ignorados };
}

/** Texto de word/document.xml: párrafos en líneas, solo el texto de <w:t>. */
export function docxATexto(xml: string): string {
  return String(xml)
    .replace(/<w:instrText[^>]*>[\s\S]*?<\/w:instrText>/g, "")
    .replace(/<w:tab\s*\/>/g, "\t")
    .replace(/<w:(?:br|cr)\b[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => (parseInt(h, 16) < 0x110000 ? String.fromCodePoint(parseInt(h, 16)) : ""))
    .replace(/&#(\d+);/g, (m, d) => (+d < 0x110000 ? String.fromCodePoint(+d) : ""))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n").trim();
}

/** Lee un .docx (zip con word/document.xml). Lanza Error en español si no lo es o no tiene texto. */
export async function leerDocx(nombre: string, bytes: Uint8Array): Promise<Adjunto> {
  const z = zipEntradas(bytes);
  const e = z.entradas.filter((x) => x.nombre === "word/document.xml")[0];
  if (!e) throw new Error("no parece un archivo .docx válido.");
  const d = await zipExtraer(bytes, e, 20 * 1024 * 1024);
  if (!d) throw new Error("no se pudo leer el contenido del .docx.");
  const t = docxATexto(new TextDecoder("utf-8").decode(d));
  if (!t) throw new Error("el documento no tiene texto.");
  return { nombre: nombreSeguro(nombre), tipo: "docx", texto: t };
}

/** Texto de una página de pdf.js (items de getTextContent). */
export function textoPdfPagina(items: any[]): string {
  return (Array.isArray(items) ? items : []).map((i) => (i && typeof i.str === "string" ? i.str : "") + (i && i.hasEOL ? "\n" : " ")).join("")
    .replace(/[ \t]+\n/g, "\n").replace(/ {2,}/g, " ").trim();
}

/** Texto de un PDF: una sección «--- Página N ---» por página. */
export function textoPdf(paginas: string[]): string {
  return paginas.map((t, i) => "--- Página " + (i + 1) + " ---\n" + t).join("\n\n");
}

/** Texto de un adjunto para el modelo, de como máximo `resto` caracteres ("" si no cabe). */
export function textoAdjunto(a: Adjunto, resto: number): string {
  const L = limitesAdjuntos();
  if (a.tipo !== "zip") {
    const cab = "[Adjunto: " + a.nombre + " — " + (a.tipo === "pdf" ? "documento PDF" : a.tipo === "docx" ? "documento Word" : "archivo de texto") +
      (a.paginas ? ", " + a.paginas + " páginas" : "") + "]";
    if (resto <= cab.length + 50) return "";
    return cab + "\n" + recortarTexto(a.texto || "", Math.min(L.maxCharsTotal, resto - cab.length - 1));
  }
  const arbol = a.arbol || [];
  let s = "[Adjunto: " + a.nombre + " — proyecto, " + arbol.length + " archivos]\nÁrbol:\n" + arbol.join("\n");
  if (a.ignorados) s += "\n(Se ignoraron " + a.ignorados + " entradas: node_modules, .git, dist, build, etc.)";
  (a.avisos || []).forEach((x) => { s += "\n(Aviso: " + x + ")"; });
  const omit: string[] = [];
  (a.archivos || []).forEach((f) => {
    if (f.texto === undefined) { if (f.nota) omit.push(f.ruta + " (" + f.nota + ")"); return; }
    const bloque = "\n--- " + f.ruta + " ---\n" + recortarTexto(f.texto, L.maxCharsArchivo);
    if (s.length + bloque.length <= resto) s += bloque;
    else omit.push(f.ruta + " (omitido por tamaño)");
  });
  if (omit.length) s += "\n\nNo incluidos: " + omit.join(", ");
  return s.length > resto ? recortarTexto(s, resto) : s;
}

/** Une los adjuntos en un solo texto respetando el total por mensaje; lo que no cabe se menciona como omitido. */
export function componerAdjuntos(adjs: Adjunto[]): { texto: string; omitidos: string[] } {
  let resto = limitesAdjuntos().maxCharsTotal;
  const partes: string[] = [];
  const omitidos: string[] = [];
  (adjs || []).forEach((a) => {
    const t = textoAdjunto(a, resto);
    if (!t) { omitidos.push(a.nombre); return; }
    partes.push(t);
    resto -= t.length + 2;
  });
  let texto = partes.join("\n\n");
  if (omitidos.length) texto += (texto ? "\n\n" : "") + "[Adjuntos omitidos por tamaño: " + omitidos.join(", ") + "]";
  return { texto, omitidos };
}

/** Datos para mostrar un chip por adjunto: nombre, tipo y caracteres extraídos. */
export function metaAdjuntos(adjs: Adjunto[]): { n: string; t: string; c: number }[] {
  return (adjs || []).map((a) => ({ n: a.nombre, t: a.tipo, c: textoAdjunto(a, Infinity).length }));
}

/** Quita el texto completo de los adjuntos de los chats (para guardar sin pasar la cuota). */
export function sinContexto(chats: any[]): any[] {
  return (Array.isArray(chats) ? chats : []).map((c) => ({
    ...c,
    mensajes: (c && Array.isArray(c.mensajes) ? c.mensajes : []).map((m: any) => {
      if (!m || !m.ctx) return m;
      const o = { ...m };
      delete o.ctx;
      return o;
    }),
  }));
}

// ---- Recorte de la conversación para proveedores con límite ----

/** Cantidad de caracteres de texto de un contenido (string o arreglo de partes). */
export function largoContenido(c: any): number {
  if (typeof c === "string") return c.length;
  let n = 0;
  (Array.isArray(c) ? c : []).forEach((p: any) => { if (p && p.type === "text" && typeof p.text === "string") n += p.text.length; });
  return n;
}

/** Acorta el texto de un contenido a n caracteres (en un arreglo, la primera parte de texto). */
export function acortarContenido(c: any, n: number): any {
  if (typeof c === "string") return recortarTexto(c, n);
  let hecho = false;
  return (Array.isArray(c) ? c : []).map((p: any) => {
    if (!hecho && p && p.type === "text" && typeof p.text === "string") { hecho = true; return { ...p, text: recortarTexto(p.text, n) }; }
    return p;
  });
}

/** Deja la conversación en como máximo `max` caracteres: quita los mensajes más antiguos (salvo system y el último) y, si hace falta, acorta el último. */
export function recortarMensajes<T extends { role: string; content: any }>(m: T[], max: number): T[] {
  const out = m.slice();
  let total = 0;
  out.forEach((x) => { total += largoContenido(x.content); });
  let i = 0;
  while (total > max && i < out.length - 1) {
    if (out[i].role === "system") { i++; continue; }
    total -= largoContenido(out[i].content);
    out.splice(i, 1);
  }
  if (total > max && out.length) {
    const k = out.length - 1;
    const x = out[k];
    const quedan = Math.max(500, largoContenido(x.content) - (total - max));
    out[k] = { ...x, content: acortarContenido(x.content, quedan) };
  }
  return out;
}

// ---- Archivos que devuelve el asistente ----

/** Bloques ```archivo:ruta del texto: [{ruta, contenido}] con rutas saneadas y nombres repetidos numerados. */
export function extraerArchivos(texto: string): { ruta: string; contenido: string }[] {
  const out: { ruta: string; contenido: string }[] = [];
  const vistos: Record<string, number> = {};
  const lineas = String(texto == null ? "" : texto).replace(/\r/g, "").split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const ab = /^\s*(`{3,})\s*archivo\s*:\s*(\S.*?)\s*$/i.exec(lineas[i]);
    if (!ab) continue;
    const n = ab[1].length;
    const cuerpo: string[] = [];
    let j = i + 1;
    while (j < lineas.length) {
      const cierre = /^\s*(`{3,})\s*$/.exec(lineas[j]);
      if (cierre && cierre[1].length >= n) break;
      cuerpo.push(lineas[j]);
      j++;
    }
    i = j;
    let ruta = rutaSegura(ab[2]) || "archivo.txt";
    const clave = ruta.toLowerCase();
    vistos[clave] = (vistos[clave] || 0) + 1;
    if (vistos[clave] > 1) {
      const k = vistos[clave];
      ruta = ruta.replace(/(\.[^.\/]*)?$/, (m) => " (" + k + ")" + m);
    }
    out.push({ ruta, contenido: cuerpo.join("\n") });
  }
  return out;
}

// ---- Escritor ZIP (método stored) y generador de .docx propios ----

/** CRC32 (polinomio 0xEDB88320). */
export function crc32(b: Uint8Array): number {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < b.length; i++) crc = t[(crc ^ b[i]) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** ZIP sin compresión (stored, nombres UTF-8) con los archivos dados. */
export function crearZip(archivos: { ruta: string; datos: Uint8Array | string }[]): Uint8Array {
  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];
  const centrales: Uint8Array[] = [];
  let off = 0;
  archivos.forEach((a) => {
    const nombre = enc.encode(rutaSegura(a.ruta) || "archivo");
    const d = typeof a.datos === "string" ? enc.encode(a.datos) : a.datos;
    const crc = crc32(d);
    const lh = new Uint8Array(30 + nombre.length);
    const v = new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
    v.setUint16(10, 0, true); v.setUint16(12, 0x21, true); v.setUint32(14, crc, true); v.setUint32(18, d.length, true);
    v.setUint32(22, d.length, true); v.setUint16(26, nombre.length, true); v.setUint16(28, 0, true);
    lh.set(nombre, 30);
    const ch = new Uint8Array(46 + nombre.length);
    const c = new DataView(ch.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true);
    c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, nombre.length, true);
    c.setUint32(42, off, true);
    ch.set(nombre, 46);
    partes.push(lh, d);
    centrales.push(ch);
    off += lh.length + d.length;
  });
  let tamDir = 0;
  centrales.forEach((x) => { tamDir += x.length; });
  const fin = new Uint8Array(22);
  const f = new DataView(fin.buffer);
  f.setUint32(0, 0x06054b50, true); f.setUint16(8, archivos.length, true); f.setUint16(10, archivos.length, true);
  f.setUint32(12, tamDir, true); f.setUint32(16, off, true);
  const todo = partes.concat(centrales, [fin]);
  let total = 0;
  todo.forEach((x) => { total += x.length; });
  const out = new Uint8Array(total);
  let p = 0;
  todo.forEach((x) => { out.set(x, p); p += x.length; });
  return out;
}

/** Escapa texto para XML (quita caracteres de control no válidos). */
export function xmlEscape(s: unknown): string {
  return String(s == null ? "" : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Runs de Word para un texto con **negrita** y `código`; sz en medios puntos. */
export function docxRuns(t: string, sz: number, negrita: boolean): string {
  return String(t).split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter((x) => x).map((x) => {
    let fuente = '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>';
    let b = negrita;
    let txt = x;
    if (x.length > 4 && x.slice(0, 2) === "**" && x.slice(-2) === "**") { b = true; txt = x.slice(2, -2); }
    else if (x.length > 2 && x.charAt(0) === "`" && x.slice(-1) === "`") { fuente = '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/>'; txt = x.slice(1, -1); }
    return "<w:r><w:rPr>" + fuente + (b ? "<w:b/>" : "") + '<w:sz w:val="' + sz + '"/></w:rPr><w:t xml:space="preserve">' + xmlEscape(txt) + "</w:t></w:r>";
  }).join("");
}

/** Cuerpo de word/document.xml a partir de Markdown básico (#, listas, **negrita**, `código`, bloques ```). */
export function docxCuerpo(md: string): string {
  const out: string[] = [];
  let cod = false;
  String(md == null ? "" : md).replace(/\r/g, "").split("\n").forEach((l) => {
    if (/^\s*`{3,}/.test(l)) { cod = !cod; return; }
    if (cod) {
      out.push('<w:p><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">' + xmlEscape(l) + "</w:t></w:r></w:p>");
      return;
    }
    const t = l.trim();
    if (!t) return;
    let m = /^(#{1,4})\s+(.*)$/.exec(t);
    if (m) { out.push('<w:p><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>' + docxRuns(m[2], [40, 32, 28, 24][m[1].length - 1], true) + "</w:p>"); return; }
    m = /^([-*•]|\d+[.)])\s+(.*)$/.exec(t);
    if (m) { out.push('<w:p><w:pPr><w:ind w:left="567" w:hanging="283"/><w:spacing w:after="60"/></w:pPr>' + docxRuns((/\d/.test(m[1]) ? m[1] : "•") + " " + m[2], 22, false) + "</w:p>"); return; }
    out.push('<w:p><w:pPr><w:spacing w:after="120"/></w:pPr>' + docxRuns(t, 22, false) + "</w:p>");
  });
  return out.join("") || "<w:p/>";
}

/** .docx mínimo ([Content_Types].xml, _rels/.rels, word/document.xml) a partir de Markdown básico. */
export function crearDocx(md: string): Uint8Array {
  const cab = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  return crearZip([
    { ruta: "[Content_Types].xml", datos: cab + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
    { ruta: "_rels/.rels", datos: cab + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
    { ruta: "word/document.xml", datos: cab + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + docxCuerpo(md) + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>' },
  ]);
}

// ---- PDF (jsPDF se carga en el navegador; aquí solo la preparación del texto) ----

/** Deja solo caracteres de la fuente estándar de PDF (Latin-1): conserva ñ, tildes, ¿ y ¡; cambia comillas y rayas tipográficas. */
export function textoLatin1(s: unknown): string {
  return String(s == null ? "" : s).replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/•/g, "-").replace(/…/g, "...").replace(/€/g, "EUR").replace(/→/g, "->").replace(/ /g, " ")
    .replace(/[^ -~¡-ÿ]/g, "?");
}

export type LineaPdf = { t: string; tam: number; neg: boolean; mono: boolean; sangria: number; despues: number };

/** Markdown básico a líneas lógicas de PDF (títulos más grandes, listas con sangría, código en monoespaciada). */
export function mdALineasPdf(md: string): LineaPdf[] {
  const out: LineaPdf[] = [];
  let cod = false;
  String(md == null ? "" : md).replace(/\r/g, "").split("\n").forEach((l) => {
    if (/^\s*`{3,}/.test(l)) { cod = !cod; if (!cod && out.length) out[out.length - 1].despues = 8; return; }
    if (cod) { out.push({ t: textoLatin1(l.replace(/\t/g, "    ")) || " ", tam: 9, neg: false, mono: true, sangria: 6, despues: 0 }); return; }
    const t = l.trim();
    if (!t) return;
    const lim = t.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
    let m = /^(#{1,4})\s+(.*)$/.exec(lim);
    if (m) { out.push({ t: textoLatin1(m[2]), tam: [20, 16, 14, 12][m[1].length - 1], neg: true, mono: false, sangria: 0, despues: 6 }); return; }
    m = /^([-*•]|\d+[.)])\s+(.*)$/.exec(lim);
    if (m) { out.push({ t: textoLatin1((/\d/.test(m[1]) ? m[1] : "-") + " " + m[2]), tam: 11, neg: false, mono: false, sangria: 12, despues: 3 }); return; }
    out.push({ t: textoLatin1(lim), tam: 11, neg: false, mono: false, sangria: 0, despues: 6 });
  });
  return out;
}
