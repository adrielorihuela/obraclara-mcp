import { describe, expect, it } from "vitest";
import { paginaSitio } from "../src/pagina";

const meta = { fecha_descarga: "2026-11-10", total_inversiones: "150574", alertas_sobrecosto: "26387", alertas_paralizacion: "16502", fuente: "MEF", url: "https://x" };
const html = paginaSitio("/proyecto", meta) ?? "";

describe("página /proyecto", () => {
  it("existe y se sirve también con barra final", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(paginaSitio("/proyecto/", meta)).toBe(html);
    expect(html).toContain('<a href="/proyecto" aria-current="page">El proyecto</a>');
  });
  it("contiene todas las secciones y sus enlaces del índice", () => {
    for (const id of ["problema", "objetivo", "ods", "metodologia", "datos", "alertas", "arquitectura", "herramientas", "tecnologias", "evaluacion", "pruebas", "metricas", "limitaciones", "ia", "glosario", "exposicion", "referencias", "fuentes", "enlaces"]) {
      expect(html, id).toContain(`id="${id}"`);
      expect(html, id).toContain(`href="#${id}"`);
    }
  });
  it("incluye las cifras clave, las 4 herramientas y los gráficos accesibles", () => {
    for (const t of ["684", "21 141", "150 574", "16 502", "26 387", "CRISP-DM", "Ley N.° 31589", "buscar_inversiones", "detalle_inversion", "alertas_inversion", "resumen_inversiones", "Yao, S."]) expect(html, t).toContain(t);
    const svgs = html.match(/<svg class="gx[^>]*>/g) ?? [];
    expect(svgs.length).toBeGreaterThanOrEqual(9);
    expect((html.match(/<svg class="(?:gx|arq)[^>]*role="img"/g) ?? []).length).toBe((html.match(/<svg class="(?:gx|arq)/g) ?? []).length);
    expect((html.match(/<desc id=/g) ?? []).length).toBeGreaterThanOrEqual(svgs.length);
  });
  it("muestra los resultados de la evaluación y abre con una explicación sencilla", () => {
    expect(html).toContain("En palabras sencillas");
    expect(html).toContain("docs/EXPOSICION.md");
    expect(html).toContain("sin la conexión el asistente acertó 3 y con la conexión acertó las 40");
    expect((html.match(/Qué significa:/g) ?? []).length).toBeGreaterThanOrEqual(15);
    expect(html).toContain("fuentes/REFERENCIAS.md");
    expect(html).toContain("100 %");
    expect(html).toContain("22,1 s");
    expect(html).toContain("99,9 s");
  });
  it("es ligera y no nombra al proveedor de IA local ni expone datos internos", () => {
    expect(new TextEncoder().encode(html).length).toBeLessThan(150 * 1024);
    const prohibidas = [["head", "less"], ["chat", "gpt"], ["87", "65"]].map((p) => p.join(""));
    for (const p of prohibidas) expect(html.toLowerCase()).not.toContain(p);
  });
});
