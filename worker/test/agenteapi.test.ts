import { describe, expect, it } from "vitest";
import { AGENTE_MAX_BASE64, validarAgente } from "../src/lib/agenteapi";

describe("validarAgente", () => {
  it("acepta mensaje simple y chat_id opcional", () => {
    expect(validarAgente({ mensaje: "hola" })).toEqual({ ok: true, valor: { mensaje: "hola", archivos: [] } });
    expect(validarAgente({ mensaje: "hola", chat_id: "abc123_-" })).toMatchObject({ ok: true, valor: { chat_id: "abc123_-" } });
  });
  it("rechaza mensaje vacío, largo o chat_id inseguro", () => {
    expect(validarAgente({ mensaje: "  " }).ok).toBe(false);
    expect(validarAgente({ mensaje: "x".repeat(30_001) }).ok).toBe(false);
    expect(validarAgente({ mensaje: "a", chat_id: "../x" }).ok).toBe(false);
    expect(validarAgente(null).ok).toBe(false);
  });
  it("sanea nombres y acepta data URL", () => {
    const r = validarAgente({ mensaje: "a", archivos: [{ nombre: "../a<b>.txt", datos: "data:text/plain;base64,aG9sYQ==" }] });
    expect(r).toEqual({ ok: true, valor: { mensaje: "a", archivos: [{ nombre: "ab.txt", datos: "aG9sYQ==" }] } });
  });
  it("limita cantidad, formato y tamaño", () => {
    const f = { nombre: "a", datos: "aG9sYQ==" };
    expect(validarAgente({ mensaje: "a", archivos: Array(11).fill(f) }).ok).toBe(false);
    expect(validarAgente({ mensaje: "a", archivos: [{ nombre: "a", datos: "no es base64!" }] }).ok).toBe(false);
    expect(validarAgente({ mensaje: "a", archivos: [{ nombre: "a", datos: "A".repeat(AGENTE_MAX_BASE64 + 1) }] }).ok).toBe(false);
    expect(validarAgente({ mensaje: "a", archivos: [{ nombre: "a", datos: "A".repeat(AGENTE_MAX_BASE64) }] }).ok).toBe(true);
  });
});
