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
          try {
            const o = JSON.parse(s.slice(i, j + 1));
            if (o && typeof o === "object") {
              if (typeof o.respuesta === "string") return { tipo: "respuesta", texto: o.respuesta };
              if (typeof o.tool === "string" && o.tool) {
                const a = o.args && typeof o.args === "object" && !Array.isArray(o.args) ? o.args : {};
                return { tipo: "tool", tool: o.tool, args: a };
              }
            }
          } catch (e) { /* no era JSON; sigue buscando */ }
          break;
        }
      }
    }
  }
  return null;
}

/** Prompt de sistema: con MCP describe las herramientas y el protocolo JSON; sin MCP, chat simple. */
export function buildSystemPrompt(tools: Herramienta[], mcpOn: boolean): string {
  if (!mcpOn) return "Responde en español, con datos oficiales del Perú y cita la fuente.";
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
