import { describe, expect, it } from "vitest";
import { demoComun } from "../src/demo";
import { textoPlano } from "../src/lib/agente";

// DOM mínimo: basta para comprobar qué nodos crea el renderizador en línea (ocInl).
type N = { tag: string; attrs: Record<string, string>; kids: N[]; text: string; className?: string; href?: string; target?: string; rel?: string; title?: string; textContent?: string };
const el = (tag: string): N & { appendChild(k: N): N; setAttribute(k: string, v: string): void } => {
  const n = { tag, attrs: {}, kids: [] as N[], text: "" } as N & { appendChild(k: N): N; setAttribute(k: string, v: string): void; textContent?: string };
  n.appendChild = (k) => { n.kids.push(k); return k; };
  n.setAttribute = (k, v) => { n.attrs[k] = v; };
  return n;
};
const doc = { createElement: el, createTextNode: (t: string) => ({ tag: "#t", attrs: {}, kids: [], text: t }) };
const ini = demoComun.indexOf("function ocCorta(");
const fin = demoComun.indexOf("// Marcas internas de cita");
// eslint-disable-next-line no-new-func
const ocInl = new Function("document", demoComun.slice(ini, fin) + "\nreturn ocInl;")(doc) as (n: N, s: string) => void;
const render = (s: string) => { const r = el("p"); ocInl(r, s); return r.kids; };
const enlaces = (k: N[]) => k.filter((x) => x.tag === "a");

describe("enlaces en las respuestas del chat", () => {
  it("[texto](url) se muestra como enlace seguro", () => {
    const [a] = enlaces(render("Mira [datos abiertos](https://www.datosabiertos.gob.pe/x) hoy"));
    expect(a).toMatchObject({ href: "https://www.datosabiertos.gob.pe/x", target: "_blank", rel: "noopener noreferrer", className: "enl" });
    expect(a.textContent).toBe("datos abiertos");
  });
  it("tolera un espacio entre ] y (", () => {
    expect(enlaces(render("[ver] (https://a.pe/b)")).length).toBe(1);
  });
  it("una URL suelta se vuelve enlace sin el punto o el paréntesis finales", () => {
    const k = render("Fuente (https://a.pe/b/c). Fin");
    const [a] = enlaces(k);
    expect(a.href).toBe("https://a.pe/b/c");
    expect(k.map((x) => x.text ?? "").join("")).toContain(").");
  });
  it("acorta visualmente las URL muy largas y deja la completa en title", () => {
    const u = "https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-inversiones-p%C3%BAblicas-2001%E2%80%932026-mef";
    const [a] = enlaces(render(u));
    expect(a.href).toBe(u);
    expect((a.textContent as string).length).toBeLessThan(60);
    expect(a.textContent).toContain("…");
    expect(a.title).toBe(u);
  });
  it("solo http, https y mailto: javascript: queda como texto", () => {
    expect(enlaces(render("[clic](javascript:alert(1))")).length).toBe(0);
    expect(enlaces(render("[clic](data:text/html,x)")).length).toBe(0);
    expect(enlaces(render("[correo](mailto:a@b.pe)")).length).toBe(1);
  });
  it("el texto del enlace nunca se interpreta como HTML", () => {
    const [a] = enlaces(render("[<img src=x onerror=alert(1)>](https://a.pe)"));
    expect(a?.textContent ?? "").not.toContain("<b>");
  });
  it("el script del navegador une «]» y «(url)» separados por un salto de línea", () => {
    expect(demoComun).toContain("replace(/\\]\\s*\\n\\s*\\((?=https?:\\/\\/|mailto:)/g,'](')");
  });
});

describe("textoPlano con enlaces", () => {
  const md = "[Consultar datos]\n(https://a.pe/x%20y). Listo";
  it("copiar: texto y URL entre paréntesis", () => {
    expect(textoPlano(md, false)).toBe("Consultar datos (https://a.pe/x%20y). Listo");
  });
  it("voz: solo el texto del enlace, sin leer la URL", () => {
    expect(textoPlano(md, true)).toBe("Consultar datos. Listo");
    expect(textoPlano("Ver https://a.pe/largo/ruta ahora", true)).toBe("Ver ahora");
  });
});

describe("leer en voz alta", () => {
  it("no hay dos funciones con el mismo nombre (la segunda anulaba a la primera y el botón fallaba)", async () => {
    const { demoScript } = await import("../src/demo");
    const nombres = [...demoScript.matchAll(/^(?:async )?function (\w+)\(/gm)].map((m) => m[1]);
    const rep = nombres.filter((n, i) => nombres.indexOf(n) !== i);
    expect(rep).toEqual([]);
    expect(demoScript).toContain("function ocVozLeer(");
  });
});
