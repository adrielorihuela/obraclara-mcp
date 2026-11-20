import { describe, expect, it } from "vitest";
import { MENSAJE_SOLO_ARCHIVOS, validarAgente, validarRecuperar } from "../src/lib/agenteapi";
import { duracionCorta, nombreModelo, normalizarMensaje, normalizarProceso, resumenProceso, tipoPaso } from "../src/lib/agente";

describe("peticiones al agente tras la clase del 20/11", () => {
  it("solo archivos: manda un texto por defecto (la API exige mensaje)", () => {
    const v = validarAgente({ mensaje: "", archivos: [{ nombre: "a.xlsx", datos: "AAAA" }] });
    expect(v.ok && v.valor.mensaje).toBe(MENSAJE_SOLO_ARCHIVOS);
    expect(validarAgente({ mensaje: "", archivos: [] }).ok).toBe(false);
  });
  it("recuperar: chat válido, mensaje opcional para comprobar que la API lo recibió", () => {
    expect(validarRecuperar({ chat_id: "../x" }).ok).toBe(false);
    expect(validarRecuperar({ chat_id: "abcd1234", mensaje: "hola", conocidos: { "a.xlsx": 2 } })).toEqual({ ok: true, valor: { chat_id: "abcd1234", recuperar: true, mensaje: "hola", archivos: [], conocidos: { "a.xlsx": 2 } } });
    expect(validarRecuperar({ chat_id: "abcd1234", mensaje: " " })).toEqual({ ok: true, valor: { chat_id: "abcd1234", recuperar: true, archivos: [] } });
  });
});

describe("proceso del agente (línea de tiempo)", () => {
  it("clasifica los pasos por tipo", () => {
    expect(tipoPaso("paso", "Pensando")).toBe("pensar");
    expect(tipoPaso("paso", "Cambiando a otro modelo…")).toBe("modelo");
    expect(tipoPaso("herramienta", "Consultando obraclara__buscar_inversiones (región: Cajamarca)")).toBe("mcp");
    expect(tipoPaso("paso", "Adjuntando obras_saneamiento_cajamarca.xlsx")).toBe("archivo");
    expect(tipoPaso("paso", "Analizando resultados")).toBe("analizar");
    expect(tipoPaso("error", "falló")).toBe("error");
  });
  it("nombre legible del modelo, duración y resumen", () => {
    expect(nombreModelo("Gemini · gemini-3.1-flash-lite")).toBe("Gemini 3.1 Flash-Lite");
    expect(nombreModelo("")).toBe("");
    expect(duracionCorta(850)).toBe("850 ms");
    expect(duracionCorta(42000)).toBe("42 s");
    expect(duracionCorta(125000)).toBe("2 min 05 s");
    expect(resumenProceso({ p: [{}, {}, {}, {}, {}, {}, {}], ms: 42000, mo: "Gemini · gemini-3.1-flash-lite" })).toBe("Proceso · 7 pasos · 42 s · Gemini 3.1 Flash-Lite");
  });
  it("se guarda con la respuesta y descarta lo que no tiene forma", () => {
    expect(normalizarProceso({ p: [] })).toBeNull();
    const m = normalizarMensaje({ rol: "a", texto: "ok", proc: { p: [{ t: "mcp", x: "Consultando", ms: 1200.4 }, { x: 5 }], ms: 3000, mo: "Gemini" } });
    expect(m?.proc).toEqual({ p: [{ t: "mcp", x: "Consultando", ms: 1200 }], ms: 3000, mo: "Gemini" });
    expect(normalizarMensaje({ rol: "u", texto: "x", proc: { p: [{ x: "a" }], ms: 1 } })?.proc).toBeUndefined();
  });
});
