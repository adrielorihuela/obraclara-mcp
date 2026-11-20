import { describe, expect, it } from "vitest";
import {
  aTsv, cambiarVersion, contextoConversacion, deserializarChats, graficoFilas, graficosMd, indiceUsuario, inicioTurno,
  normalizarChat, nuevaVersion, recortarChats, serializarChats, tablasMd, textoPlano, tiempoRelativo, versionesGuardadas,
} from "../src/lib/agente";
import { validarRama, validarRehacer } from "../src/lib/agenteapi";
import { validarGrafico } from "../src/lib/grafico";
import { demoScript } from "../src/demo";

const u = (t: string) => ({ rol: "u" as const, texto: t });
const a = (t: string) => ({ rol: "a" as const, texto: t });

describe("versiones al editar o reintentar", () => {
  it("nuevaVersion guarda la cola desde p y deja lo anterior", () => {
    const ms = [u("hola"), a("r1"), u("pregunta"), a("r2")];
    const v = nuevaVersion(ms, [], 2, "ag1")!;
    expect(v.msgs).toEqual([u("hola"), a("r1")]);
    expect(v.ramas).toEqual([{ p: 2, a: 1, vs: [{ m: [u("pregunta"), a("r2")], r: [], ag: "ag1" }, null] }]);
    expect(v.guardada).toBe(v.ramas[0].vs[0]);
  });
  it("cambiarVersion alterna entre versiones y devuelve la elegida", () => {
    const ms = [u("hola"), a("r1"), u("pregunta"), a("r2")];
    const v = nuevaVersion(ms, [], 2, "ag1")!;
    v.guardada.k = 0;
    const vivos = v.msgs.concat([u("editada"), a("r3")]);
    const c = cambiarVersion(vivos, v.ramas, 2, 0, { ag: "ag1", k: 0 })!;
    expect(c.msgs).toEqual(ms);
    expect(c.des.k).toBe(0);
    expect(c.ramas[0].a).toBe(0);
    expect(c.ramas[0].vs[1]).toEqual({ m: [u("editada"), a("r3")], r: [], ag: "ag1", k: 0 });
    const d = cambiarVersion(c.msgs, c.ramas, 2, 1, { ag: "ag1" })!;
    expect(d.msgs).toEqual(vivos);
    expect(cambiarVersion(d.msgs, d.ramas, 2, 1, { ag: "" })).toBeNull();
  });
  it("las versiones anidadas viajan con su versión y se listan todas", () => {
    const ms = [u("a"), a("1"), u("b"), a("2")];
    const v1 = nuevaVersion(ms, [], 2, "x")!; // editar b
    const m1 = v1.msgs.concat([u("b2"), a("2b")]);
    const v2 = nuevaVersion(m1, v1.ramas, 0, "x")!; // editar a (guarda también la rama de b)
    expect(v2.ramas.length).toBe(1);
    expect(v2.guardada.r.length).toBe(1);
    expect(versionesGuardadas(v2.ramas).length).toBe(2);
    const c = cambiarVersion([u("a2"), a("1b")], v2.ramas, 0, 0, { ag: "" })!;
    expect(c.msgs).toEqual(m1);
    expect(c.ramas.map((e) => e.p)).toEqual([0, 2]);
  });
  it("se guardan, se normalizan y se corren al recortar los mensajes antiguos", () => {
    const ms = [u("hola"), a("r1"), u("pregunta"), a("r2")];
    const v = nuevaVersion(ms, [], 2, "ag1")!;
    v.guardada.k = 3;
    const chat = { id: "c1", titulo: "t", creado: 1, actualizado: 2, fijado: true, mensajes: v.msgs.concat([u("otra"), a("r3")]), ramas: v.ramas };
    const n = deserializarChats(serializarChats([chat]))[0];
    expect(n.fijado).toBe(true);
    expect(n.ramas![0].vs[0]!.k).toBe(3);
    const r = recortarChats([chat], 50, 3)[0];
    expect(r.mensajes.length).toBe(3);
    expect(r.ramas![0].p).toBe(1);
    expect(recortarChats([chat], 50, 1)[0].ramas).toBeUndefined();
    expect(normalizarChat({ ...chat, ramas: [{ p: 1, a: 0, vs: [null, { m: [u("x")] }] }] })!.ramas).toBeUndefined();
  });
  it("los fijados no se pierden al recortar", () => {
    const cs = [{ id: "v", titulo: "viejo", creado: 1, actualizado: 1, fijado: true, mensajes: [] }, { id: "n", titulo: "nuevo", creado: 5, actualizado: 5, mensajes: [] }];
    expect(recortarChats(cs, 1).map((c) => c.id)).toEqual(["v"]);
  });
  it("índices de rehacer y contexto de respaldo", () => {
    const ms = [u("a"), a("1"), u("b"), u("b+"), { rol: "t", texto: "" }, a("2")];
    expect(indiceUsuario(ms, 3)).toBe(2);
    expect(inicioTurno(ms, 5)).toBe(2);
    expect(inicioTurno(ms, 1)).toBe(0);
    expect(contextoConversacion(ms.slice(0, 2))).toBe("Contexto de la conversación:\n\nUsuario: a\n\nAsistente: 1");
    expect(contextoConversacion([])).toBe("");
    expect(contextoConversacion([u("x".repeat(100))], 10)).toMatch(/^Contexto de la conversación:\n\n…x{10}$/);
  });
});

describe("copiar y leer en voz alta", () => {
  const md = "## Título\n\nTexto con **negrita** y `código`.\n\n| Obra | Monto |\n|---|---|\n| **A** | 10 |\n| B | 20 |\n\n```grafico\n{\"tipo\":\"barras\",\"titulo\":\"Monto\",\"x\":[\"A\",\"B\"],\"series\":[{\"nombre\":\"Soles\",\"valores\":[10,20]}],\"unidad\":\"S/\"}\n```\n\n- uno";
  it("texto plano y para voz", () => {
    expect(textoPlano(md, false)).toContain("Título\n\nTexto con negrita y código.\n\nObra\tMonto\nA\t10");
    const v = textoPlano(md, true);
    expect(v).not.toContain("grafico");
    expect(v).not.toContain("{");
    expect(v).toContain("Obra, Monto");
    expect(v.endsWith("uno")).toBe(true);
  });
  it("tablas y datos del gráfico en TSV", () => {
    const t = tablasMd(md);
    expect(t).toEqual([[["Obra", "Monto"], ["A", "10"], ["B", "20"]]]);
    expect(aTsv(t[0])).toBe("Obra\tMonto\nA\t10\nB\t20");
    const g = validarGrafico(graficosMd(md)[0]);
    expect(aTsv(graficoFilas(g))).toBe("Monto\tSoles (S/)\nA\t10\nB\t20");
  });
  it("hora relativa", () => {
    const ahora = new Date(2026, 10, 20, 12, 0).getTime();
    expect(tiempoRelativo(ahora - 10_000, ahora)).toBe("ahora");
    expect(tiempoRelativo(ahora - 120_000, ahora)).toBe("hace 2 min");
    expect(tiempoRelativo(ahora - 3 * 3600_000, ahora)).toBe("hace 3 h");
    expect(tiempoRelativo(new Date(2026, 10, 2).getTime(), ahora)).toBe("2 nov");
  });
});

describe("POST /api/agente/rehacer y /api/agente/rama (forma de la petición)", () => {
  it("valida chat, desde y mensaje opcional", () => {
    expect(validarRehacer({ desde: 0 }).ok).toBe(false);
    expect(validarRehacer({ chat_id: "abc", desde: -1 }).ok).toBe(false);
    expect(validarRehacer({ chat_id: "abc", desde: 1.5 }).ok).toBe(false);
    expect(validarRehacer({ chat_id: "abc", desde: 0, mensaje: " " }).ok).toBe(false);
    expect(validarRehacer({ chat_id: "abc", desde: 2, mcp: true })).toEqual({ ok: true, valor: { chat_id: "abc", desde: 2, archivos: [], mcp: true } });
    expect(validarRehacer({ chat_id: "abc", desde: 0, mensaje: "nuevo" })).toEqual({ ok: true, valor: { chat_id: "abc", desde: 0, mensaje: "nuevo", archivos: [] } });
  });
  it("rama", () => {
    expect(validarRama({ chat_id: "abc", rama: "1" }).ok).toBe(false);
    expect(validarRama({ chat_id: "abc", rama: 1 })).toEqual({ ok: true, valor: { chat_id: "abc", rama: 1, archivos: [] } });
  });
  it("el navegador usa las rutas nuevas y no nombra al proveedor", () => {
    expect(demoScript).toContain("/api/agente/rehacer");
    expect(demoScript).toContain("/api/agente/rama");
    expect(demoScript).not.toMatch(new RegExp(["head", "less"].join("") + "|" + ["87", "65"].join(""), "i"));
  });
});
