import { describe, expect, it } from "vitest";
import { ETIQUETAS_SUGERENCIA, SUGERENCIAS, elegirSugerencias } from "../src/lib/sugerencias";
import { demoHtml, demoScript } from "../src/demo";

function semilla(n: number) { let x = n; return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; }

describe("banco de sugerencias", () => {
  it("tiene al menos 40, sin repetidas, de todos los formatos y con etiqueta", () => {
    expect(SUGERENCIAS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(SUGERENCIAS.map((s) => s.texto)).size).toBe(SUGERENCIAS.length);
    for (const t of ["xlsx", "docx", "pdf", "pptx", "rapida"] as const) {
      expect(SUGERENCIAS.filter((s) => s.t === t).length).toBeGreaterThanOrEqual(5);
      expect(ETIQUETAS_SUGERENCIA[t]).toBeTruthy();
    }
    expect(SUGERENCIAS.every((s) => s.texto.length <= 160)).toBe(true);
  });

  it("elige n distintas con al menos una de archivo y una rápida, de tipos variados", () => {
    for (let k = 1; k < 200; k++) {
      const el = elegirSugerencias(SUGERENCIAS, 4, semilla(k));
      expect(el).toHaveLength(4);
      expect(new Set(el.map((s) => s.texto)).size).toBe(4);
      expect(el.some((s) => s.t === "rapida")).toBe(true);
      expect(el.some((s) => s.t !== "rapida")).toBe(true);
      expect(new Set(el.map((s) => s.t)).size).toBe(4);
    }
  });

  it("al barajar evita las recién mostradas y cambia entre visitas", () => {
    const a = elegirSugerencias(SUGERENCIAS, 4, semilla(7));
    const b = elegirSugerencias(SUGERENCIAS, 4, semilla(8), a.map((s) => s.texto));
    expect(b.some((s) => a.includes(s))).toBe(false);
    const vistas = new Set<string>();
    for (let k = 1; k < 60; k++) elegirSugerencias(SUGERENCIAS, 3, semilla(k)).forEach((s) => vistas.add(s.texto));
    expect(vistas.size).toBeGreaterThan(30);
  });

  it("casos borde: banco vacío o pequeño", () => {
    expect(elegirSugerencias([], 4)).toEqual([]);
    expect(elegirSugerencias([{ t: "pdf", texto: "x" }], 4)).toHaveLength(1);
    expect(elegirSugerencias(SUGERENCIAS, 0)).toEqual([]);
  });

  it("se incrusta en el script del navegador y funciona allí", () => {
    expect(demoScript).not.toContain("__name");
    expect(demoHtml).toContain('id="oc-barajar"');
    const f = new Function(demoScript.slice(0, demoScript.indexOf("var ocSugVistas")) + "\nreturn {elegirSugerencias,OC_SUG,OC_SUG_ET};");
    const g = f();
    expect(g.OC_SUG.length).toBe(SUGERENCIAS.length);
    const el = g.elegirSugerencias(g.OC_SUG, 3, semilla(3));
    expect(el).toHaveLength(3);
    expect(el.some((s: { t: string }) => s.t === "rapida")).toBe(true);
  });
});
