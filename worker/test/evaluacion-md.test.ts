import { describe, expect, it } from "vitest";
import { mdHtml, tarjetaRespuesta } from "../src/sitio/evaluacion-md";
import { PREGUNTAS } from "../src/sitio/evaluacion-tabla";
import { paginaSitio } from "../src/pagina";

describe("Markdown seguro de las respuestas", () => {
  it("escapa todo el HTML de la respuesta", () => {
    const h = mdHtml('<script>alert(1)</script> **<img src=x onerror=alert(1)>**\n\n| a | <b>b</b> |\n|---|---|\n| <i>1</i> | 2 |');
    expect(h).not.toMatch(/<script|<img|<b>|<i>/);
    expect(h).toContain("&lt;script&gt;");
    expect(h).toContain("<strong>&lt;img");
  });
  it("convierte párrafos, negritas, listas, código y tablas con alineación", () => {
    const h = mdHtml("### Título\n\nTexto con **negrita** y `codigo`.\n\n- uno\n- dos\n\n1. a\n2. b\n\n| Concepto | Importe |\n|---|---:|\n| PIM | S/ 3,562,294 |");
    expect(h).toContain('<p class="md-h">Título</p>');
    expect(h).toContain("<strong>negrita</strong>");
    expect(h).toContain("<code>codigo</code>");
    expect(h).toContain('<ul class="md-l"><li>uno</li><li>dos</li></ul>');
    expect(h).toContain('<ol class="md-l">');
    expect(h).toContain('<th scope="col">Concepto</th><th scope="col" class="md-r">Importe</th>');
    expect(h).toContain('<td class="md-r">S/ 3,562,294</td>');
  });
  it("la tarjeta destaca veredicto, cifra respondida y referencia", () => {
    const h = tarjetaRespuesta({ cond: "sin", titulo: "IA sola", sub: "x", ok: false, veredicto: "Incorrecta: inventó cifras", clave: "S/ 1", referencia: "S/ 2", md: "hola" });
    expect(h).toContain('class="rs-ver mal"');
    expect(h).toContain('<p class="rs-chip mal"><span>Respondió</span><b>S/ 1</b></p>');
    expect(h).toContain("Lo que respondió la IA");
  });
});

describe("respuestas en /evaluacion", () => {
  const ev = paginaSitio("/evaluacion", { fecha_descarga: "2026-11-10" }) ?? "";
  it("cada pregunta trae la cifra clave y las tablas se ven como tabla", () => {
    for (const q of PREGUNTAS) {
      expect(q.rk.length).toBeGreaterThan(0);
      expect(q.con.k).toBe(q.rk);
    }
    expect((ev.match(/Lo que respondió la IA/g) ?? []).length).toBe(80);
    expect(ev).toContain('<table class="md-t">');
    expect(ev).not.toMatch(/\|\s*-{3}\s*\|/);
  });
});
