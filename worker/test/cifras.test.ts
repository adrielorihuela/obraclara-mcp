import { describe, expect, it } from "vitest";
import { paginaSitio } from "../src/pagina";

const meta = { fecha_descarga: "2026-11-10", total_inversiones: "150574", alertas_sobrecosto: "26387", alertas_paralizacion: "16502", fuente: "MEF", url: "https://x" };
const html = paginaSitio("/", meta) ?? "";

describe("franja de cifras del inicio", () => {
  it("muestra cifras reales de los datos generados, con enlace", () => {
    for (const t of ["150 574", "26 387", "16 502", "1,37", "40</span><span> de 40", "810</span><span> de 810", "120</span><span> de 120"]) expect(html, t).toContain(t);
    expect(html).toContain('href="/evaluacion"');
    expect(html).toContain('href="/proyecto#metricas"');
  });
  it("es accesible: una sola cifra visible por casilla y el duplicado de la marquesina oculto", () => {
    expect(html).toContain('<dl aria-live="polite">');
    expect((html.match(/class="it [^"]*on"/g) ?? []).length).toBe(4);
    expect(html).toContain('<ul class="mq-g" aria-hidden="true">');
    expect(html).toContain("prefers-reduced-motion");
  });
  it("no afirma una recarga semanal", () => {
    expect(html).not.toContain("cada lunes");
    expect(html).toContain("desde el archivo oficial del MEF");
    expect(paginaSitio("/conectar", meta) ?? "").not.toContain("cada lunes");
  });
});
