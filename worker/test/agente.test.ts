import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt, construirPeticion, extraerRespuesta, migrarConfig, normalizarConexion, parseSse, parseToolCall,
  presetsIA, truncate, validarConexion, limitesImagen, validarImagen, escalarImagen, construirContenido, aBloquesAnthropic,
  tituloChat, grupoFecha, recortarChats, serializarChats, deserializarChats, sinImagenes,
} from "../src/lib/agente";
import { demoScript } from "../src/demo";

describe("parseToolCall tolera escapes inválidos", () => {
  it("respuesta con \\! (como escriben algunos modelos)", () => {
    expect(parseToolCall('{"respuesta":"¡Hola\\! Soy ObraClara. ¿Qué te gustaría consultar?"}')).toEqual({ tipo: "respuesta", texto: "¡Hola! Soy ObraClara. ¿Qué te gustaría consultar?" });
  });
  it("sigue respetando escapes válidos", () => {
    expect(parseToolCall('{"respuesta":"línea1\\nlínea2 \\"cita\\""}')).toEqual({ tipo: "respuesta", texto: 'línea1\nlínea2 "cita"' });
  });
  it("llamada a herramienta con escape raro", () => {
    expect(parseToolCall('{"tool":"buscar_inversiones","args":{"texto":"hospital\\! Piura"}}')).toEqual({ tipo: "tool", tool: "buscar_inversiones", args: { texto: "hospital! Piura" } });
  });
});

describe("parseToolCall", () => {
  it("JSON simple", () => {
    expect(parseToolCall('{"tool":"buscar_inversiones","args":{"texto":"hospital"}}')).toEqual({ tipo: "tool", tool: "buscar_inversiones", args: { texto: "hospital" } });
  });
  it("con bloque de código y texto final", () => {
    const t = 'Voy a buscar.\n```json\n{"tool":"detalle_inversion","args":{"codigo_unico":"2716769"}}\n```\nListo.';
    expect(parseToolCall(t)).toEqual({ tipo: "tool", tool: "detalle_inversion", args: { codigo_unico: "2716769" } });
  });
  it("llaves dentro de cadenas y args anidados", () => {
    const r = parseToolCall('{"tool":"x","args":{"a":"}{","b":{"c":1}}} fin');
    expect(r).toEqual({ tipo: "tool", tool: "x", args: { a: "}{", b: { c: 1 } } });
  });
  it("respuesta final", () => {
    expect(parseToolCall('{"respuesta":"Hola.\\nFuente: MEF"}')).toEqual({ tipo: "respuesta", texto: "Hola.\nFuente: MEF" });
  });
  it("JSON inválido o sin protocolo da null", () => {
    expect(parseToolCall('{"tool": "x", args')).toBeNull();
    expect(parseToolCall("solo texto")).toBeNull();
    expect(parseToolCall('{"otro":1}')).toBeNull();
  });
  it("salta un objeto inválido y encuentra el válido", () => {
    expect(parseToolCall('{no json} {"respuesta":"ok"}')).toEqual({ tipo: "respuesta", texto: "ok" });
  });
});

describe("parseSse", () => {
  it("SSE", () => {
    const t = 'event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"tools":[]}}\n\n';
    expect(parseSse(t)).toEqual({ jsonrpc: "2.0", id: 1, result: { tools: [] } });
  });
  it("JSON plano y basura", () => {
    expect(parseSse('{"a":1}')).toEqual({ a: 1 });
    expect(parseSse("nada")).toBeNull();
  });
  it("toma el último mensaje", () => {
    expect(parseSse('data: {"n":1}\n\ndata: {"n":2}\n')).toEqual({ n: 2 });
  });
});

describe("buildSystemPrompt y truncate", () => {
  const tools = [{ name: "buscar_inversiones", description: "Busca", inputSchema: { properties: { texto: { type: "string", description: "palabras" } }, required: ["texto"] } }];
  it("MCP apagado", () => {
    expect(buildSystemPrompt(tools, false)).toBe("Responde en español. Si la pregunta trata de datos oficiales del Perú, cita la fuente y no inventes cifras. Si el usuario adjunta una imagen, descríbela con lo que se ve.");
  });
  it("MCP activado lista herramientas y protocolo", () => {
    const p = buildSystemPrompt(tools, true);
    expect(p).toContain("buscar_inversiones");
    expect(p).toContain("texto (string, obligatorio)");
    expect(p).toContain('{"tool":"<nombre>"');
    expect(p).toContain('{"respuesta":');
  });
  it("truncate", () => {
    expect(truncate("abc", 5)).toBe("abc");
    expect(truncate("abcdefgh", 3).startsWith("abc…")).toBe(true);
  });
});

describe("script incrustado en el navegador", () => {
  it("define las mismas funciones y se comporta igual", () => {
    expect(demoScript).not.toContain("__name");
    const fn = new Function(
      "document", "window", "navigator", "sessionStorage", "localStorage", "fetch",
      demoScript + "\nreturn {parseToolCall,parseSse,buildSystemPrompt,truncate,presetsIA,normalizarConexion,validarConexion,migrarConfig,construirPeticion,extraerRespuesta,limitesImagen,validarImagen,escalarImagen,construirContenido,aBloquesAnthropic,tituloChat,grupoFecha,recortarChats,serializarChats,deserializarChats,sinImagenes};",
    );
    const el: any = new Proxy(function () {}, { get: () => el, apply: () => el, set: () => true });
    const api = fn(el, {}, {}, { getItem: () => null, setItem() {} }, { getItem: () => null, setItem() {} }, async () => ({}));
    const t = '```json\n{"tool":"a","args":{"x":1}}\n```';
    expect(api.parseToolCall(t)).toEqual(parseToolCall(t));
    expect(api.parseSse('data: {"n":2}')).toEqual(parseSse('data: {"n":2}'));
    expect(api.truncate("abcdefgh", 3)).toBe(truncate("abcdefgh", 3));
    const tools = [{ name: "n", description: "d", inputSchema: { properties: { p: { type: "string" } } } }];
    expect(api.buildSystemPrompt(tools, true)).toBe(buildSystemPrompt(tools, true));
    expect(api.buildSystemPrompt(tools, false)).toBe(buildSystemPrompt(tools, false));
    expect(api.presetsIA()).toEqual(presetsIA());
    const c = { nombre: " X ", baseUrl: "https://a.b/v1/", modelo: "m", clave: "k" };
    expect(api.normalizarConexion(c)).toEqual(normalizarConexion(c));
    expect(api.validarConexion(c)).toEqual(validarConexion(c));
    const msgs = [{ role: "system", content: "s" }, { role: "user", content: "u" }];
    expect(api.construirPeticion(c, msgs)).toEqual(construirPeticion(c, msgs));
    expect(api.migrarConfig({ modo: "clave", prov: "groq", model: "m", key: "k" })).toEqual(migrarConfig({ modo: "clave", prov: "groq", model: "m", key: "k" }));
    expect(api.extraerRespuesta("openai", { choices: [{ message: { content: "ok" } }] })).toBe("ok");
    expect(api.construirContenido("a", ["data:image/jpeg;base64,QQ=="])).toEqual(construirContenido("a", ["data:image/jpeg;base64,QQ=="]));
    expect(api.escalarImagen(2560, 1280, 1280)).toEqual({ w: 1280, h: 640 });
    expect(api.validarImagen("image/png", 1, 0)).toBe("");
    expect(api.tituloChat("  hola\n mundo ")).toBe(tituloChat("  hola\n mundo "));
    expect(api.grupoFecha(1, 2e12)).toBe("Anteriores");
    const cc = [{ id: "a", titulo: "t", creado: 1, actualizado: 2, mensajes: [{ rol: "u", texto: "x" }] }];
    expect(api.deserializarChats(api.serializarChats(cc))).toEqual(deserializarChats(serializarChats(cc)));
  });
});

describe("imágenes", () => {
  const u = "data:image/jpeg;base64,QUJD";
  it("límites y validación", () => {
    expect(limitesImagen().maxImagenes).toBe(3);
    expect(validarImagen("image/webp", 100, 0)).toBe("");
    expect(validarImagen("image/bmp", 100, 0)).toMatch(/PNG/);
    expect(validarImagen("image/png", 10 * 1024 * 1024 + 1, 0)).toMatch(/10 MB/);
    expect(validarImagen("image/png", 100, 3)).toMatch(/Máximo 3/);
  });
  it("escala sin ampliar", () => {
    expect(escalarImagen(800, 600, 1280)).toEqual({ w: 800, h: 600 });
    expect(escalarImagen(1000, 4000, 1280)).toEqual({ w: 320, h: 1280 });
  });
  it("contenido: string sin imágenes, arreglo con texto primero", () => {
    expect(construirContenido("hola", [])).toBe("hola");
    expect(construirContenido("hola", [u])).toEqual([{ type: "text", text: "hola" }, { type: "image_url", image_url: { url: u } }]);
  });
  it("Anthropic: image_url a bloque image", () => {
    expect(aBloquesAnthropic(construirContenido("q", [u]))).toEqual([
      { type: "text", text: "q" }, { type: "image", source: { type: "base64", media_type: "image/jpeg", data: "QUJD" } },
    ]);
  });
  it("petición: OpenAI deja el arreglo; Anthropic convierte y fusiona", () => {
    const c = { id: "a", nombre: "n", tipo: "openai", baseUrl: "https://x.y/v1", modelo: "m", clave: "k" };
    const msgs = [{ role: "system", content: "s" }, { role: "user", content: construirContenido("q", [u]) }];
    expect(construirPeticion(c, msgs).body.messages[1].content[1].image_url.url).toBe(u);
    const q = construirPeticion({ ...c, tipo: "anthropic" }, [...msgs, { role: "user", content: "más" }]);
    expect(q.body.messages).toHaveLength(1);
    expect(q.body.messages[0].content.map((b: any) => b.type)).toEqual(["text", "image", "text"]);
  });
});

describe("conexiones de IA", () => {
  const ok = { id: "a", nombre: "Mi Groq", tipo: "openai", baseUrl: "https://api.groq.com/openai/v1/", modelo: "m", clave: "k" };
  it("presets: los siete, con base y modelo salvo 'otro'", () => {
    const ps = presetsIA();
    expect(ps.map((p) => p.id)).toEqual(["openai", "groq", "gemini", "nvidia", "openrouter", "anthropic", "otro"]);
    ps.filter((p) => p.id !== "otro").forEach((p) => {
      expect(p.baseUrl).toMatch(/^https:\/\//);
      expect(p.modelo).not.toBe("");
    });
    expect(ps.find((p) => p.id === "anthropic")!.tipo).toBe("anthropic");
    expect(ps.find((p) => p.id === "otro")!.baseUrl).toBe("");
  });
  it("normaliza: recorta, quita / final, tipo por defecto", () => {
    const n = normalizarConexion({ ...ok, nombre: "  Mi Groq ", tipo: "raro" });
    expect(n).toMatchObject({ nombre: "Mi Groq", tipo: "openai", baseUrl: "https://api.groq.com/openai/v1", recordar: false });
    expect(normalizarConexion(null).nombre).toBe("");
  });
  it("valida campos obligatorios y esquema de la URL", () => {
    expect(validarConexion(ok)).toEqual([]);
    expect(validarConexion({}).length).toBe(4);
    expect(validarConexion({ ...ok, baseUrl: "http://evil.com/v1" })[0]).toContain("https://");
    expect(validarConexion({ ...ok, baseUrl: "http://localhost:11434/v1" })).toEqual([]);
  });
  it("migra la config antigua", () => {
    expect(migrarConfig({ modo: "cf" })).toEqual({ conexiones: [], activa: "servidor" });
    expect(migrarConfig({ modo: "local" })).toEqual({ conexiones: [], activa: "servidor" });
    expect(migrarConfig(null).activa).toBe("servidor");
    expect(migrarConfig({ conexiones: [], activa: "nombre-antiguo" })).toEqual({ conexiones: [], activa: "servidor" });
    expect(migrarConfig({ modo: "clave", prov: "groq", model: "m", key: "" }).conexiones).toEqual([]);
    const m = migrarConfig({ modo: "clave", prov: "groq", base: "", model: "llama", key: "k", rec: true });
    expect(m.activa).toBe("migrada");
    expect(m.conexiones[0]).toMatchObject({ nombre: "Groq", tipo: "openai", baseUrl: "https://api.groq.com/openai/v1", modelo: "llama", clave: "k", recordar: true });
    const o = migrarConfig({ modo: "clave", prov: "otro", base: "https://x.y/v1/", model: "m", key: "k" });
    expect(o.conexiones[0]).toMatchObject({ nombre: "Otro (cualquier API compatible con OpenAI)", baseUrl: "https://x.y/v1" });
  });
  it("petición OpenAI", () => {
    const q = construirPeticion(ok, [{ role: "system", content: "s" }, { role: "user", content: "u" }]);
    expect(q.url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(q.headers.authorization).toBe("Bearer k");
    expect(q.body.messages).toHaveLength(2);
    expect(q.body.model).toBe("m");
  });
  it("petición Anthropic: system aparte y roles seguidos fusionados", () => {
    const q = construirPeticion({ ...ok, tipo: "anthropic", baseUrl: "https://api.anthropic.com/v1" }, [
      { role: "system", content: "s" }, { role: "user", content: "a" }, { role: "user", content: "b" }, { role: "assistant", content: "c" },
    ]);
    expect(q.url).toBe("https://api.anthropic.com/v1/messages");
    expect(q.headers["x-api-key"]).toBe("k");
    expect(q.headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
    expect(q.body.system).toBe("s");
    expect(q.body.messages).toEqual([{ role: "user", content: "a\n\nb" }, { role: "assistant", content: "c" }]);
  });
  it("extrae la respuesta según el tipo", () => {
    expect(extraerRespuesta("anthropic", { content: [{ text: "a" }, { text: "b" }] })).toBe("ab");
    expect(extraerRespuesta("openai", { choices: [{ message: { content: "x" } }] })).toBe("x");
    expect(extraerRespuesta("openai", {})).toBe("");
  });
});

describe("chats guardados", () => {
  const msg = (t: string) => ({ rol: "u" as const, texto: t });
  it("título: primera pregunta, 60 caracteres, sin saltos", () => {
    expect(tituloChat("  ¿Qué obras\n  hay?  ")).toBe("¿Qué obras hay?");
    expect(tituloChat("a".repeat(100))).toHaveLength(60);
    expect(tituloChat("")).toBe("Conversación");
    expect(tituloChat(null)).toBe("Conversación");
  });
  it("grupos Hoy / Ayer / Anteriores", () => {
    const ahora = new Date(2026, 10, 10, 15, 0).getTime();
    expect(grupoFecha(new Date(2026, 10, 10, 0, 1).getTime(), ahora)).toBe("Hoy");
    expect(grupoFecha(new Date(2026, 10, 9, 23, 59).getTime(), ahora)).toBe("Ayer");
    expect(grupoFecha(new Date(2026, 10, 8, 23, 59).getTime(), ahora)).toBe("Anteriores");
  });
  it("recorta a 50 chats y 80 mensajes, quitando lo más antiguo", () => {
    const chats = Array.from({ length: 55 }, (_, i) => ({ id: "c" + i, titulo: "t", creado: i, actualizado: i, mensajes: [msg("x")] }));
    const r = recortarChats(chats);
    expect(r).toHaveLength(50);
    expect(r[0].id).toBe("c54");
    expect(r.some((c) => c.id === "c4")).toBe(false);
    const largo = { id: "g", titulo: "t", creado: 1, actualizado: 1, mensajes: Array.from({ length: 100 }, (_, i) => msg("m" + i)) };
    const m = recortarChats([largo])[0].mensajes;
    expect(m).toHaveLength(80);
    expect(m[0].texto).toBe("m20");
    expect(m[79].texto).toBe("m99");
  });
  it("serializa sin imágenes y deserializa de forma tolerante", () => {
    const c = { id: "a", titulo: "T", creado: 1, actualizado: 2, mensajes: [
      msg("mira data:image/jpeg;base64,QUJDRA== listo"),
      { rol: "t" as const, texto: "", herramienta: { nombre: "x", args: { q: 1 }, resultado: "r".repeat(5000) } },
      { rol: "a" as const, texto: "ok", modelo: "Groq · m", mcp: true },
    ] };
    const txt = serializarChats([c]);
    expect(txt).not.toContain("base64");
    const [r] = deserializarChats(txt);
    expect(r.mensajes[0].texto).toBe("mira [imagen adjunta] listo");
    expect(r.mensajes[1].herramienta?.resultado).toHaveLength(2500);
    expect(r.mensajes[2]).toEqual({ rol: "a", texto: "ok", modelo: "Groq · m", mcp: true });
    expect(deserializarChats("no json")).toEqual([]);
    expect(deserializarChats('[{"x":1},null,{"id":"z","mensajes":[{"rol":"q"}]}]')).toEqual([{ id: "z", titulo: "Conversación", creado: 0, actualizado: 0, mensajes: [] }]);
    expect(sinImagenes("a")).toBe("a");
  });
});
