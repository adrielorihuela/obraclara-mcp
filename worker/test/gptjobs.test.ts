import { describe, expect, it } from "vitest";
import { cancelar, conectorVivo, encolar, estado, guardarResultado, latido, MAX_PENDIENTES, reclamar, validarMensajes } from "../src/lib/gptjobs";
import { dbEnMemoria } from "./d1fake";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function nuevaDb() {
  const base = dbEnMemoria([]);
  // dbEnMemoria no expone el SQLite; se crea otra con la migración para estas pruebas.
  const raw = new DatabaseSync(":memory:");
  raw.exec(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../migrations/001_gpt.sql"), "utf-8"));
  void base;
  return {
    prepare(sql: string) {
      const st = raw.prepare(sql);
      return { bind: (...v: unknown[]) => ({
        all: async <T,>() => ({ results: st.all(...(v as never[])) as T[] }),
        first: async <T,>() => (st.get(...(v as never[])) as T) ?? null,
      }) };
    },
  };
}
const M = [{ role: "user", content: "hola" }];

describe("cola de gpt-headless", () => {
  it("valida mensajes", () => {
    expect(validarMensajes(M)).toBe(true);
    expect(validarMensajes([])).toBe(false);
    expect(validarMensajes([{ role: "tool", content: "x" }])).toBe(false);
    expect(validarMensajes([{ role: "user", content: "x".repeat(25000) }])).toBe(false);
  });
  it("flujo completo: encolar, reclamar, responder", async () => {
    const db = nuevaDb();
    expect(await encolar(db, M, 1000, "a")).toBe("a");
    expect((await estado(db, "a"))?.estado).toBe("pendiente");
    const t = await reclamar(db, 1100);
    expect(t).toEqual({ id: "a", messages: M });
    expect(await reclamar(db, 1200)).toBeNull(); // ya reclamada
    await guardarResultado(db, "a", "listo!", null);
    expect(await estado(db, "a")).toMatchObject({ estado: "listo", respuesta: "listo!" });
  });
  it("reclama en orden de llegada", async () => {
    const db = nuevaDb();
    await encolar(db, M, 2000, "b"); await encolar(db, M, 1000, "a");
    expect((await reclamar(db, 3000))?.id).toBe("a");
  });
  it("limita las pendientes", async () => {
    const db = nuevaDb();
    for (let i = 0; i < MAX_PENDIENTES; i++) await encolar(db, M, 1000 + i, "j" + i);
    expect(await encolar(db, M, 2000, "extra")).toBeNull();
  });
  it("cancelar y error", async () => {
    const db = nuevaDb();
    await encolar(db, M, 1000, "x"); await cancelar(db, "x", "tiempo agotado");
    expect(await estado(db, "x")).toMatchObject({ estado: "error", error: "tiempo agotado" });
    await encolar(db, M, 1001, "y"); await reclamar(db, 1002); await guardarResultado(db, "y", null, "falló");
    expect(await estado(db, "y")).toMatchObject({ estado: "error", error: "falló" });
  });
  it("latido del conector", async () => {
    const db = nuevaDb();
    expect(await conectorVivo(db, 5000)).toBe(false);
    await latido(db, 5000);
    expect(await conectorVivo(db, 15000)).toBe(true);
    expect(await conectorVivo(db, 30000)).toBe(false);
  });
});
