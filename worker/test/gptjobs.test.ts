import { describe, expect, it } from "vitest";
import { validarMensajes } from "../src/lib/gptjobs";

describe("validarMensajes", () => {
  it("acepta mensajes válidos", () => expect(validarMensajes([{ role: "user", content: "hola" }])).toBe(true));
  it("rechaza vacío, roles raros y exceso de tamaño", () => {
    expect(validarMensajes([])).toBe(false);
    expect(validarMensajes([{ role: "tool", content: "x" }])).toBe(false);
    expect(validarMensajes([{ role: "user", content: "x".repeat(25000) }])).toBe(false);
    expect(validarMensajes("hola")).toBe(false);
  });
});
