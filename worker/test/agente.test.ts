import { describe, expect, it } from "vitest";
import { buildSystemPrompt, parseSse, parseToolCall, truncate } from "../src/lib/agente";
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
      demoScript + "\nreturn {parseToolCall,parseSse,buildSystemPrompt,truncate};",
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
  });
});
