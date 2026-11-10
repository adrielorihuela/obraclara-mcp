import { describe, expect, it } from "vitest";
import { RespaldoDb } from "../src/lib/remotedb";
import type { Db } from "../src/lib/queries";

const d1 = (etiqueta: string): Db => ({ prepare: () => ({ bind: () => ({ all: async () => ({ results: [{ de: etiqueta }] as never[] }), first: async () => ({ de: etiqueta }) as never }) }) });
const resp = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status });

describe("RespaldoDb", () => {
  it("usa el servidor cuando responde", async () => {
    const db = new RespaldoDb(async () => resp({ rows: [{ de: "servidor" }], row: { de: "servidor" } }), d1("d1"));
    expect((await db.prepare("SELECT 1").bind().all()).results).toEqual([{ de: "servidor" }]);
    expect(await db.prepare("SELECT 1").bind().first()).toEqual({ de: "servidor" });
  });
  it("cae a D1 si el servidor no está y no insiste en esa petición", async () => {
    let llamadas = 0;
    const db = new RespaldoDb(async () => { llamadas++; return resp({ error: "sin servidor" }, 503); }, d1("d1"));
    expect((await db.prepare("SELECT 1").bind().all()).results).toEqual([{ de: "d1" }]);
    expect(await db.prepare("SELECT 2").bind().first()).toEqual({ de: "d1" });
    expect(llamadas).toBe(1);
  });
  it("cae a D1 si falla la red", async () => {
    const db = new RespaldoDb(async () => { throw new Error("red"); }, d1("d1"));
    expect(await db.prepare("SELECT 1").bind().first()).toEqual({ de: "d1" });
  });
  it("funciona sin servidor configurado", async () => {
    expect(await new RespaldoDb(null, d1("d1")).prepare("SELECT 1").bind().first()).toEqual({ de: "d1" });
  });
});
