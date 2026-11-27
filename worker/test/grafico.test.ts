import { describe, expect, it } from "vitest";
import { agruparMiles, formatoValor, marcasEje, validarGrafico } from "../src/lib/grafico";
import { demoComun, demoCss, demoScript } from "../src/demo";

const barras = { tipo: "barras", titulo: "Sobrecosto por provincia", x: ["Piura", "Sullana"], series: [{ nombre: "Sobrecosto", valores: [42897000000, 1200000] }], unidad: "S/" };

describe("validarGrafico", () => {
  it("acepta un gráfico válido y normaliza", () => {
    const g = validarGrafico(JSON.stringify(barras))!;
    expect(g.tipo).toBe("barras");
    expect(g.x).toEqual(["Piura", "Sullana"]);
    expect(g.series[0].valores).toEqual([42897000000, 1200000]);
    expect(g.unidad).toBe("S/");
  });
  it("acepta alias, cifras en texto y vacíos", () => {
    const g = validarGrafico('{"tipo":"pie","x":["a","b",3],"series":[{"valores":["1 000",null,2]}]}')!;
    expect(g.tipo).toBe("torta");
    expect(g.x).toEqual(["a", "b", "3"]);
    expect(g.series[0]).toEqual({ nombre: "Serie 1", valores: [1000, null, 2] });
  });
  it("rechaza JSON roto o incoherente", () => {
    expect(validarGrafico("{tipo:barras")).toBeNull();
    expect(validarGrafico("[]")).toBeNull();
    expect(validarGrafico('{"tipo":"radar","x":["a"],"series":[{"valores":[1]}]}')).toBeNull();
    expect(validarGrafico('{"tipo":"barras","x":["a","b"],"series":[{"valores":[1]}]}')?.series[0].valores).toEqual([1, null]); // serie corta: se completa con vacíos
    expect(validarGrafico('{"tipo":"barras","x":["a"],"series":[{"valores":["x"]}]}')).toBeNull();
    expect(validarGrafico('{"tipo":"barras","x":[],"series":[]}')).toBeNull();
    expect(validarGrafico('{"tipo":"torta","x":["a","b"],"series":[{"valores":[-1,2]}]}')).toBeNull();
    expect(validarGrafico('{"tipo":"torta","x":["a"],"series":[{"valores":[0]}]}')).toBeNull();
    expect(validarGrafico('{"tipo":"barras","x":[{"a":1}],"series":[{"valores":[1]}]}')).toBeNull();
  });
});

describe("formato de cifras", () => {
  it("agrupa miles y abrevia millones", () => {
    expect(agruparMiles(42897, 0)).toBe("42 897");
    expect(agruparMiles(-1.5, 2)).toBe("−1,5");
    expect(formatoValor(42897000000, "S/", true)).toBe("S/ 42 897 M");
    expect(formatoValor(2500000, "S/", true)).toBe("S/ 2,5 M");
    expect(formatoValor(42897000000, "S/", false)).toBe("S/ 42 897 000 000");
    expect(formatoValor(12.5, "%", true)).toBe("12,5 %");
    expect(formatoValor(11522, "%", true)).toBe("11\u202f522 %");
    expect(formatoValor(350, "obras", true)).toBe("350 obras");
    expect(formatoValor(0, "", true)).toBe("0");
  });
  it("marcas del eje redondas e incluyen los extremos", () => {
    expect(marcasEje(0, 95, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    const m = marcasEje(-3, 7, 4);
    expect(m[0]).toBeLessThanOrEqual(-3);
    expect(m[m.length - 1]).toBeGreaterThanOrEqual(7);
    expect(m).toContain(0);
    expect(marcasEje(5, 5, 4).length).toBeGreaterThan(1);
  });
});

describe("gráficos en el script del navegador", () => {
  it("incrusta las funciones sin helpers del empaquetador y las conecta al Markdown", () => {
    expect(demoComun).not.toContain("__name");
    expect(demoScript).toContain("function validarGrafico");
    expect(demoScript).toContain("function ocGrafico");
    expect(demoScript).toContain("validarGrafico(cod.pre.textContent)");
    expect(demoCss).toContain(".ocg-tip");
    expect(demoCss).toContain("prefers-reduced-motion");
    // El gráfico se define antes de ocMd para que /demo (que copia desde OC_FENCE hasta ocTam) también lo tenga.
    const i = demoComun.indexOf("var OC_FENCE"), j = demoComun.indexOf("function ocGrafico("), k = demoComun.indexOf("function ocTam(");
    expect(i).toBeGreaterThanOrEqual(0);
    expect(j).toBeGreaterThan(i);
    expect(j).toBeLessThan(k);
    const fn = new Function(demoComun.slice(demoComun.indexOf("function validarGrafico"), demoComun.indexOf("var OC_GNS")) + "\nreturn {validarGrafico,formatoValor};");
    const api = fn();
    expect(api.validarGrafico(JSON.stringify(barras))).toEqual(validarGrafico(JSON.stringify(barras)));
    expect(api.formatoValor(42897000000, "S/", true)).toBe("S/ 42 897 M");
  });
  it("no usa innerHTML en el renderizador de gráficos", () => {
    const g = demoComun.slice(demoComun.indexOf("var OC_GNS"), demoComun.indexOf("function ocMd("));
    expect(g).not.toMatch(/innerHTML|insertAdjacentHTML|outerHTML/);
  });
});

describe("validarGrafico tolerante", () => {
  const base = '{"tipo":"barras","titulo":"T","x":["Cusco","Lima"],"series":[{"nombre":"A","valores":[2782,2275]}]}';
  it("acepta comentarios, comas finales, comillas tipográficas y texto alrededor", () => {
    expect(validarGrafico('{"tipo":"barras", // c\n "x":["A","B",],"series":[{"nombre":"s","valores":[1,2],},], /* x */}')).toMatchObject({ x: ["A", "B"] });
    expect(validarGrafico(base.replace(/"/g, (m, i) => (i === 1 ? "“" : m)))).not.toBeNull();
    expect(validarGrafico("Aquí va:\n" + base + "\nlisto")).toMatchObject({ series: [{ valores: [2782, 2275] }] });
  });
  it("acepta alias en inglés y largos distintos", () => {
    expect(validarGrafico('{"type":"bar","labels":["A","B"],"datasets":[{"label":"s","data":[1,2,3]}]}')).toMatchObject({ tipo: "columnas", series: [{ nombre: "s", valores: [1, 2] }] });
    expect(validarGrafico('{"grafico":' + base + "}")).not.toBeNull();
  });
});
