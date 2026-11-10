import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt, construirPeticion, extraerRespuesta, migrarConfig, normalizarConexion, parseSse, parseToolCall,
  presetsIA, truncate, validarConexion,
} from "../src/lib/agente";
import { demoScript } from "../src/demo";

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
    expect(buildSystemPrompt(tools, false)).toBe("Responde en español, con datos oficiales del Perú y cita la fuente.");
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
      demoScript + "\nreturn {parseToolCall,parseSse,buildSystemPrompt,truncate,presetsIA,normalizarConexion,validarConexion,migrarConfig,construirPeticion,extraerRespuesta};",
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
    expect(migrarConfig({ modo: "cf" })).toEqual({ conexiones: [], activa: "gpt-headless" });
    expect(migrarConfig({ modo: "local" })).toEqual({ conexiones: [], activa: "gpt-headless" });
    expect(migrarConfig(null).activa).toBe("gpt-headless");
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
