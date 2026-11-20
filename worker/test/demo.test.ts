import { describe, expect, it } from "vitest";
import { paginaSitio } from "../src/pagina";
import { CASOS_DEMO, RESUMEN_DEMO } from "../src/sitio/demo-datos";
import { scriptDemo } from "../src/sitio/demo-pagina";

const meta = { fecha_descarga: "2026-11-10", total_inversiones: "150574", alertas_sobrecosto: "26387", alertas_paralizacion: "16502", fuente: "MEF", url: "https://x" };
const html = paginaSitio("/demo", meta) ?? "";

describe("datos de /demo (generados desde la evaluación)", () => {
  it("hay un caso por herramienta, con datos reales de la herramienta", () => {
    expect(CASOS_DEMO.map((c) => c.herramienta).sort()).toEqual(["alertas_inversion", "buscar_inversiones", "detalle_inversion", "resumen_inversiones"]);
    for (const c of CASOS_DEMO) {
      expect(c.pregunta.length).toBeGreaterThan(10);
      expect(c.referencia.length).toBeGreaterThan(10);
      expect(c.con.exacta && c.con.cita).toBe(true);
      expect(c.sin.exacta).toBe(false);
      expect(c.sin.corta).not.toMatch(/<[A-Za-z]/);
      expect(c.con.clave).toBe(c.referencia_clave);
      expect(c.sin.clave).not.toBe(c.referencia_clave);
    }
    const detalle = CASOS_DEMO.find((c) => c.id === "D05")!;
    expect(detalle.datos).toMatchObject({ codigo_unico: "2110581" });
    const alertas = CASOS_DEMO.find((c) => c.id === "A07")!;
    expect(((alertas.datos as { inversiones: unknown[] }).inversiones).length).toBeLessThanOrEqual(8);
  });
  it("el resumen es 40/40 con MCP y 3/40 sin MCP", () => {
    expect(RESUMEN_DEMO.total).toBe(40);
    expect(RESUMEN_DEMO.con.exactas).toBe(40);
    expect(RESUMEN_DEMO.sin.exactas).toBe(3);
  });
});

describe("página /demo", () => {
  it("existe, está en el menú y se sirve con barra final", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(paginaSitio("/demo/", meta)).toBe(html);
    expect(html).toContain('<a href="/demo" aria-current="page">Demo</a>');
  });
  it("muestra el flujo en 4 pasos, 4 casos lado a lado y la referencia", () => {
    expect((html.match(/<li><svg/g) ?? []).length).toBe(4);
    expect((html.match(/class="dm-caso"/g) ?? []).length).toBe(4);
    expect((html.match(/IA sola \(sin MCP\)/g) ?? []).length).toBe(4);
    expect((html.match(/<h3>IA \+ MCP<\/h3>/g) ?? []).length).toBe(4);
    expect((html.match(/Lo que respondió la IA/g) ?? []).length).toBe(8);
    expect((html.match(/Respuesta oficial de referencia/g) ?? []).length).toBe(4);
    expect((html.match(/Qué significa:/g) ?? []).length).toBe(4);
    expect((html.match(/El MCP con gráficas/g) ?? []).length).toBe(4);
    for (const c of CASOS_DEMO) expect(html).toContain(c.herramienta);
    expect((html.match(/class="rs-ver ok"/g) ?? []).length).toBe(4);
    expect((html.match(/class="rs-ver mal"/g) ?? []).length).toBe(4);
    const d05 = CASOS_DEMO.find((c) => c.id === "D05")!;
    expect(d05.referencia_clave).toBe("S/ 162\u00a0507\u00a0128,65");
    expect(html).toContain(`<b>${d05.referencia_clave}</b>`);
  });
  it("muestra las tablas de la respuesta como tabla, no como texto con barras", () => {
    expect(html).toContain('<table class="md-t">');
    expect(html).not.toMatch(/\|\s*-{3}\s*\|/);
  });
  it("incluye «Probar en vivo», el enlace al asistente y el resumen 40/40 frente a 3/40", () => {
    expect((html.match(/data-vivo=/g) ?? []).length).toBe(4);
    expect((html.match(/Preguntarle al asistente/g) ?? []).length).toBe(4);
    expect(html).toContain("tools/call");
    expect(html).toContain("40/40");
    expect(html).toContain("3/40");
    expect(html).toContain('href="/evaluacion"');
  });
  it("es ligera y no nombra al proveedor de IA local", () => {
    expect(new TextEncoder().encode(html).length).toBeLessThan(150 * 1024);
    for (const p of [["head", "less"], ["chat", "gpt"], ["87", "65"]].map((x) => x.join(""))) expect(html.toLowerCase()).not.toContain(p);
  });
  it("tiene el panel doble en vivo, el lanzador y el enlace que envía la pregunta al asistente", () => {
    expect(html).toContain('id="dv" role="dialog" aria-modal="true"');
    expect((html.match(/class="dv-col (sin|con)"/g) ?? []).length).toBe(2);
    expect(html).toContain("Ver la comparación en vivo");
    expect((html.match(/<option value="\d">/g) ?? []).length).toBe(4);
    expect(html).toContain(`href="/asistente?q=${encodeURIComponent(CASOS_DEMO[0].pregunta)}"`);
    expect(scriptDemo).toContain("function ocMd(");
    expect(scriptDemo).toContain("function ocAlmEscribir(");
    expect(scriptDemo).toContain("/api/agente/eventos");
    expect(scriptDemo).not.toContain("__name");
    expect(() => new Function(scriptDemo)).not.toThrow();
  });
});
