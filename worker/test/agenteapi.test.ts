import { describe, expect, it } from "vitest";
import { sanearMemoria, validarAgente, validarRehacer } from "../src/lib/agenteapi";

describe("validarAgente (solo forma de la petición)", () => {
  it("exige un mensaje y deja pasar chat_id y mcp válidos", () => {
    expect(validarAgente(null).ok).toBe(false);
    expect(validarAgente({ mensaje: "  " }).ok).toBe(false);
    expect(validarAgente({ mensaje: "hola", chat_id: "../x" }).ok).toBe(false);
    expect(validarAgente({ mensaje: "a", mcp: "si" }).ok).toBe(false);
    expect(validarAgente({ mensaje: "hola", chat_id: "abcd1234", mcp: true })).toEqual({ ok: true, valor: { chat_id: "abcd1234", mensaje: "hola", archivos: [], mcp: true } });
  });
  it("reenvía los archivos tal cual (la API los valida y los lee)", () => {
    expect(validarAgente({ mensaje: "x", archivos: "no" }).ok).toBe(false);
    const v = validarAgente({ mensaje: "x", archivos: [{ nombre: "a.xlsx", datos: "data:application/x;base64,AAAA" }, null, { nombre: "b" }] });
    expect(v).toEqual({ ok: true, valor: { mensaje: "x", archivos: [{ nombre: "a.xlsx", datos: "data:application/x;base64,AAAA" }] } });
  });
  it("pasa las pistas de versiones (conocidos y subidos) y descarta lo que no tiene forma", () => {
    const v = validarAgente({ mensaje: "x", conocidos: { "a.pptx": 2, "b.pptx": "uno" }, subidos: ["a.docx", 5] });
    expect(v).toEqual({ ok: true, valor: { mensaje: "x", archivos: [], conocidos: { "a.pptx": 2 }, subidos: ["a.docx"] } });
  });
  it("normalizarMensaje conserva la versión de cada archivo entregado", async () => {
    const { normalizarMensaje } = await import("../src/lib/agente");
    const m = normalizarMensaje({ rol: "a", texto: "ok", arch: [{ id: "f1", n: "a.pptx", b: 5, v: 2 }, { id: "f2", n: "b.pptx", b: 5, v: 1 }] })!;
    expect(m.arch).toEqual([{ id: "f1", n: "a.pptx", b: 5, v: 2 }, { id: "f2", n: "b.pptx", b: 5 }]);
  });
});

describe("memoria del navegador", () => {
  it("pasa tal cual si viene (aunque sea []), se sanea y no aparece si falta", () => {
    const a = validarAgente({ mensaje: "hola", memoria: [] });
    expect(a.ok && a.valor.memoria).toEqual([]);
    const b = validarAgente({ mensaje: "hola" });
    expect(b.ok && "memoria" in b.valor).toBe(false);
    const c = validarRehacer({ chat_id: "abcdefgh12", desde: 0, memoria: [{ texto: "Me llamo Prueba", fecha: "2026-11-20" }] });
    expect(c.ok && c.valor.memoria).toEqual([{ texto: "Me llamo Prueba", fecha: "2026-11-20" }]);
  });
  it("máximo 30 notas de 300 caracteres y sin vacías", () => {
    const m = sanearMemoria(Array.from({ length: 40 }, (_, i) => ({ texto: "x".repeat(400) + i }))) ?? [];
    expect(m).toHaveLength(30);
    expect(m.every((n) => n.texto.length <= 300)).toBe(true);
    expect(sanearMemoria([{ texto: "  " }, 5, null])).toEqual([]);
    expect(sanearMemoria("no")).toBeUndefined();
  });
});
