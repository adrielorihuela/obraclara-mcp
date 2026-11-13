import { describe, expect, it } from "vitest";
import { ErrorProveedor, Pausas, cadena, groq, soloTexto, tieneImagenes, validarMensajes, type Proveedor } from "../src/lib/cadena";

const IMG = "data:image/png;base64,iVBORw0KGgo=";
const U = [{ role: "user", content: "hola" }];
const prov = (id: string, f: Proveedor["ejecutar"]): Proveedor => ({ id, modelo: id, ejecutar: f });

describe("validación con imágenes", () => {
  it("acepta texto, y texto con imágenes data URL", () => {
    expect(validarMensajes(U)).toBe(true);
    expect(validarMensajes([{ role: "user", content: [{ type: "text", text: "mira" }, { type: "image_url", image_url: { url: IMG } }] }])).toBe(true);
  });
  it("rechaza urls remotas, más de 3 imágenes, partes raras y roles que no son user con imágenes", () => {
    expect(validarMensajes([{ role: "user", content: [{ type: "image_url", image_url: { url: "https://x/y.png" } }] }])).toBe(false);
    const cuatro = Array(4).fill({ type: "image_url", image_url: { url: IMG } });
    expect(validarMensajes([{ role: "user", content: cuatro }])).toBe(false);
    expect(validarMensajes([{ role: "user", content: [{ type: "video", x: 1 }] }])).toBe(false);
    expect(validarMensajes([{ role: "assistant", content: [{ type: "text", text: "x" }] }])).toBe(false);
  });
  it("detecta imágenes y las quita para modelos de solo texto", () => {
    const m = [{ role: "user", content: [{ type: "text" as const, text: "mira" }, { type: "image_url" as const, image_url: { url: IMG } }] }];
    expect(tieneImagenes(m)).toBe(true);
    expect(soloTexto(m)[0].content).toBe("mira\n[imagen omitida]");
    expect(tieneImagenes(U)).toBe(false);
  });
});

describe("cadena de proveedores", () => {
  it("usa el primero que responde", async () => {
    const r = await cadena([prov("a", async () => "uno"), prov("b", async () => "dos")], U, new Pausas());
    expect(r).toEqual({ content: "uno", modelo: "a" });
  });
  it("cae al siguiente y deja en pausa al que falló", async () => {
    let t = 1000, llamadasA = 0;
    const pausas = new Pausas();
    const a = prov("a", async () => { llamadasA++; throw new ErrorProveedor("límite", 60_000); });
    const b = prov("b", async () => "respaldo");
    expect((await cadena([a, b], U, pausas, () => t)).content).toBe("respaldo");
    await cadena([a, b], U, pausas, () => t);
    expect(llamadasA).toBe(1);                // en pausa: no se vuelve a llamar
    t += 61_000;
    await cadena([a, b], U, pausas, () => t);
    expect(llamadasA).toBe(2);                // pasó la pausa
  });
  it("trata una respuesta vacía como fallo", async () => {
    expect((await cadena([prov("a", async () => "  "), prov("b", async () => "ok")], U, new Pausas())).modelo).toBe("b");
  });
  it("un proveedor puede devolver {content, modelo} y cambiar la etiqueta", async () => {
    const r = await cadena([prov("a", async () => ({ content: " hola ", modelo: "IA del servidor · Groq · x" }))], U, new Pausas());
    expect(r).toEqual({ content: "hola", modelo: "IA del servidor · Groq · x" });
    expect((await cadena([prov("a", async () => ({ content: "t" }))], U, new Pausas())).modelo).toBe("a");
  });
  it("si todas fallan, explica por qué", async () => {
    await expect(cadena([prov("a", async () => { throw new Error("x"); })], U, new Pausas())).rejects.toThrow(/Ninguna IA/);
  });
});

describe("groq", () => {
  const f = (status: number, cuerpo: unknown, h: Record<string, string> = {}) => (async () => new Response(JSON.stringify(cuerpo), { status, headers: h })) as unknown as typeof fetch;
  it("devuelve el texto", async () => expect(await groq("k", "m", false, f(200, { choices: [{ message: { content: "hola" } }] })).ejecutar(U)).toBe("hola"));
  it("aprovecha failed_generation del 400", async () => expect(await groq("k", "m", false, f(400, { error: { failed_generation: '{"tool":"x"}' } })).ejecutar(U)).toBe('{"tool":"x"}'));
  it("429 pausa según retry-after", async () => {
    await expect(groq("k", "m", false, f(429, {}, { "retry-after": "7" })).ejecutar(U)).rejects.toMatchObject({ pausaMs: 7000 });
  });
});

describe("límites de conversación", () => {
  it("acepta hasta 150 000 caracteres y rechaza más", () => {
    expect(validarMensajes([{ role: "user", content: "x".repeat(149_000) }])).toBe(true);
    expect(validarMensajes([{ role: "user", content: "x".repeat(150_001) }])).toBe(false);
  });
  it("un proveedor con límite recibe la conversación recortada en vez de fallar", async () => {
    let visto = 0;
    const p: Proveedor = { id: "p", modelo: "p", maxChars: 1000, async ejecutar(m) { visto = JSON.stringify(m).length; return "ok"; } };
    const largo = [{ role: "user", content: "viejo ".repeat(500) }, { role: "assistant", content: "r" }, { role: "user", content: "pregunta " + "z".repeat(4000) }];
    expect((await cadena([p], largo, new Pausas())).content).toBe("ok");
    expect(visto).toBeLessThan(1700);
  });
});
