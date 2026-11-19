// Markdown seguro para mostrar las respuestas grabadas de la IA en /demo y /evaluacion.
// Todo texto se escapa con esc() ANTES de añadir etiquetas propias; solo se generan p, strong, em, code, ul/ol/li,
// table y pre. No hay enlaces, imágenes ni HTML de la respuesta: nada externo llega sin escapar al navegador.
import { esc } from "./layout";

// Negritas, cursivas y código en línea sobre texto ya escapado (esc() no toca *, _ ni `).
export function mdLinea(t: string): string {
  return t
    .split(/(`[^`\n]+`)/)
    .map((p) =>
      p.startsWith("`") && p.endsWith("`") && p.length > 1
        ? `<code>${esc(p.slice(1, -1))}</code>`
        : esc(p)
            .replace(/\*\*(?=\S)([^*]+?)\*\*/g, "<strong>$1</strong>")
            .replace(/(^|[^\w*])\*(?=\S)([^*\n]+?)\*(?!\w)/g, "$1<em>$2</em>")
            .replace(/(^|[^\w])_(?=\S)([^_\n]+?)_(?!\w)/g, "$1<em>$2</em>"),
    )
    .join("");
}

const celdas = (l: string) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
const esSep = (l: string) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(l.trim());
const LISTA = /^\s*(?:[-*+•]|\d{1,2}[.)])\s+/;

function tabla(lineas: string[]): string {
  const cab = celdas(lineas[0]);
  const al = celdas(lineas[1]).map((c) => (/:$/.test(c) ? (/^:/.test(c) ? "c" : "r") : ""));
  const td = (c: string, i: number, tag: "th" | "td") => {
    const a = al[i] || (tag === "td" && /^[\s*S/.,%\d−-]+$/.test(c) && /\d/.test(c) ? "r" : "");
    return `<${tag}${tag === "th" ? ' scope="col"' : ""}${a ? ` class="md-${a}"` : ""}>${mdLinea(c)}</${tag}>`;
  };
  const filas = lineas.slice(2).map((l) => `<tr>${celdas(l).slice(0, cab.length).map((c, i) => td(c, i, "td")).join("")}</tr>`).join("");
  return `<div class="md-tw"><table class="md-t"><thead><tr>${cab.map((c, i) => td(c, i, "th")).join("")}</tr></thead><tbody>${filas}</tbody></table></div>`;
}

// Convierte el Markdown de una respuesta en HTML seguro.
export function mdHtml(md: string): string {
  const ls = String(md ?? "").replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < ls.length) {
    const l = ls[i];
    if (!l.trim()) { i++; continue; }
    if (/^\s*```/.test(l)) {
      const cod: string[] = [];
      i++;
      while (i < ls.length && !/^\s*```/.test(ls[i])) cod.push(ls[i++]);
      i++;
      out.push(`<pre class="md-pre"><code>${esc(cod.join("\n"))}</code></pre>`);
      continue;
    }
    if (/^\s*\|/.test(l) && i + 1 < ls.length && esSep(ls[i + 1])) {
      const t: string[] = [];
      while (i < ls.length && /^\s*\|/.test(ls[i])) t.push(ls[i++]);
      out.push(tabla(t));
      continue;
    }
    const h = /^\s*#{1,6}\s+(.*)$/.exec(l);
    if (h) { out.push(`<p class="md-h">${mdLinea(h[1].replace(/\s*#+\s*$/, ""))}</p>`); i++; continue; }
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { out.push('<hr class="md-hr">'); i++; continue; }
    if (LISTA.test(l)) {
      const ord = /^\s*\d/.test(l);
      const it: string[] = [];
      while (i < ls.length && ls[i].trim() && !/^\s*\|/.test(ls[i])) {
        if (LISTA.test(ls[i])) it.push(ls[i].replace(LISTA, ""));
        else if (it.length) it[it.length - 1] += " " + ls[i].trim();
        else break;
        i++;
      }
      const tag = ord ? "ol" : "ul";
      out.push(`<${tag} class="md-l">${it.map((x) => `<li>${mdLinea(x)}</li>`).join("")}</${tag}>`);
      continue;
    }
    if (/^\s*>/.test(l)) {
      const q: string[] = [];
      while (i < ls.length && /^\s*>/.test(ls[i])) q.push(ls[i++].replace(/^\s*>\s?/, ""));
      out.push(`<blockquote class="md-q">${q.map(mdLinea).join("<br>")}</blockquote>`);
      continue;
    }
    const p: string[] = [];
    while (i < ls.length && ls[i].trim() && !LISTA.test(ls[i]) && !/^\s*(?:#{1,6}\s|```|\||>)/.test(ls[i])) p.push(ls[i++].trim());
    if (!p.length) { p.push(l.trim()); i++; }
    out.push(`<p>${p.map(mdLinea).join("<br>")}</p>`);
  }
  return out.join("");
}

// Estilos del Markdown, con prefijo propio. `raiz` es el selector del contenedor (p. ej. ".dm-burbuja").
export const mdCss = (raiz: string) => String.raw`
${raiz}{font-size:var(--s-1);line-height:1.6;color:var(--ink);overflow-wrap:anywhere}
${raiz}>*+*{margin-top:.7em}
${raiz} .md-h{font:650 var(--s0)/1.35 var(--sans);color:var(--ink);margin-top:1em}
${raiz} .md-h:first-child{margin-top:0}
${raiz} strong{font-weight:650;color:var(--ink)}
${raiz} em{font-style:italic;color:var(--ink-2)}
${raiz} code{font:500 .92em/1.4 var(--mono);background:var(--bg-2);border:1px solid var(--line);border-radius:5px;padding:0 .3em}
${raiz} .md-pre{background:var(--code-bg);color:var(--code-ink);border-radius:8px;padding:10px 12px;overflow:auto;font:400 12px/1.5 var(--mono)}
${raiz} .md-pre code{background:none;border:0;padding:0;color:inherit}
${raiz} .md-l{margin:0;padding-left:1.25em}
${raiz} .md-l li+li{margin-top:.3em}
${raiz} .md-l li::marker{color:var(--mut)}
${raiz} .md-q{margin:0;border-left:3px solid var(--line-2);padding:2px 0 2px 12px;color:var(--ink-2)}
${raiz} .md-hr{border:0;border-top:1px solid var(--line);margin:1em 0}
${raiz} .md-tw{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--surface);max-width:100%}
${raiz} .md-t{border-collapse:collapse;width:100%;font-size:.95em;line-height:1.4}
${raiz} .md-t th,${raiz} .md-t td{padding:7px 10px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line);overflow-wrap:normal;word-break:normal}
${raiz} .md-t th{background:var(--surface-2);font:600 12px/1.3 var(--sans);color:var(--ink-2);white-space:nowrap}
${raiz} .md-t tr:last-child td{border-bottom:0}
${raiz} .md-t tbody tr:nth-child(even) td{background:color-mix(in srgb,var(--surface-2) 45%,transparent)}
${raiz} .md-t .md-r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
${raiz} .md-t .md-c{text-align:center}
`;

// Tarjeta de una respuesta grabada: quién respondió, veredicto grande, la cifra que dio frente a la referencia oficial
// y la respuesta como burbuja de chat. La usan /demo (casos) y /evaluacion («Ver respuesta»).
export interface Tarjeta {
  cond: "sin" | "con";
  titulo: string;
  sub: string;
  ok: boolean;
  veredicto: string;
  clave: string;
  referencia: string;
  md: string;
  mdCompleta?: string;
  pie?: string;
}
const ICO_SIN = `<path d="M12 4a6 6 0 0 0-6 6c0 2.2 1.2 3.6 2.4 4.6.6.5.6 1 .6 1.4V18h6v-2c0-.4 0-.9.6-1.4C16.8 13.6 18 12.2 18 10a6 6 0 0 0-6-6Z"/><path d="M10 21h4"/>`;
const ICO_CON = `<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7Z"/><path d="M12 17v5"/>`;
const ICO_CHAT = `<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>`;
// Los iconos se definen una vez por página (tarjetaSprite) y cada tarjeta los usa con <use>, para que /evaluacion pese poco.
export const tarjetaSprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="rs-i-sin" viewBox="0 0 24 24">${ICO_SIN}</symbol><symbol id="rs-i-con" viewBox="0 0 24 24">${ICO_CON}</symbol><symbol id="rs-i-chat" viewBox="0 0 24 24">${ICO_CHAT}</symbol></defs></svg>`;
const svg = (id: string, cls: string) => `<svg class="${cls}" aria-hidden="true"><use href="#rs-i-${id}"/></svg>`;

export function tarjetaRespuesta(t: Tarjeta, nivel: "h3" | "h4" = "h3"): string {
  const est = t.ok ? "ok" : "mal";
  return `<div class="rs ${t.cond}">
<div class="rs-h">${svg(t.cond, "rs-av")}<div><${nivel}>${esc(t.titulo)}</${nivel}><p>${esc(t.sub)}</p></div></div>
<p class="rs-ver ${est}"><span class="rs-vi" aria-hidden="true">${t.ok ? "✓" : "✗"}</span>${esc(t.veredicto)}</p>
<div class="rs-cmp"><p class="rs-chip ${est}"><span>Respondió</span><b>${esc(t.clave)}</b></p><p class="rs-chip ref"><span>Referencia oficial</span><b>${esc(t.referencia)}</b></p></div>
<p class="rs-qr">${svg("chat", "rs-qi")}Lo que respondió la IA</p>
<div class="rs-b">${mdHtml(t.md)}</div>
${t.mdCompleta ? `<details class="rs-mas"><summary>Ver la respuesta completa</summary><div class="rs-b">${mdHtml(t.mdCompleta)}</div></details>` : ""}
${t.pie ?? ""}</div>`;
}

export const tarjetaCss = String.raw`
.rs{border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);padding:18px;display:flex;flex-direction:column;gap:14px;min-width:0;position:relative;overflow:hidden}
.rs::before{content:"";position:absolute;inset:0 0 auto;height:3px;background:var(--risk)}
.rs.con::before{background:var(--accent)}
.rs-h{display:flex;gap:12px;align-items:center}
.rs-av,.rs-qi{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.rs-av{flex:none;width:38px;height:38px;padding:8px;border-radius:50%;border:1px solid var(--line-2);color:var(--risk)}
.rs.con .rs-av{color:var(--accent)}
.rs-h h3,.rs-h h4{margin:0;font:650 var(--s1)/1.2 var(--sans);color:var(--ink)}
.rs-h p{margin:2px 0 0;font-size:var(--s-1);color:var(--mut)}
.rs-ver{margin:0;display:flex;gap:10px;align-items:center;font:650 clamp(1.05rem,1rem + .4vw,1.3rem)/1.25 var(--sans)}
.rs-ver.ok{color:var(--accent)}.rs-ver.mal{color:var(--risk)}
.rs-vi{flex:none;display:grid;place-items:center;width:1.6em;height:1.6em;border-radius:50%;font-size:.85em;color:var(--bg);background:var(--risk)}
.rs-ver.ok .rs-vi{background:var(--accent)}
.rs-cmp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.rs-chip{margin:0;border:1.5px solid var(--line-2);border-radius:12px;padding:9px 12px;min-width:0;transition:transform .35s ease,opacity .35s ease}
.rs-chip span{display:block;font:500 12px/1.3 var(--sans);color:var(--mut);margin-bottom:3px}
.rs-chip b{display:block;font:650 clamp(1rem,.95rem + .35vw,1.2rem)/1.25 var(--sans);font-variant-numeric:tabular-nums;color:var(--ink);overflow-wrap:anywhere}
.rs-chip.ok{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 7%,transparent)}.rs-chip.ok b{color:var(--accent)}
.rs-chip.mal{border-color:var(--risk);background:color-mix(in srgb,var(--risk) 7%,transparent)}.rs-chip.mal b{color:var(--risk)}
.rs-chip.ref{border-style:dashed}
.rs-qr{margin:2px 0 -6px;display:flex;gap:8px;align-items:center;font:600 var(--s-1)/1.3 var(--sans);color:var(--ink-2)}
.rs-qi{width:18px;height:18px;color:var(--mut)}
.rs-b{background:var(--bg-2);border:1px solid var(--line);border-radius:4px 16px 16px 16px;padding:14px 16px;min-width:0}
.rs-mas summary{cursor:pointer;font-size:var(--s-1);font-weight:600;color:var(--ink-2);width:max-content;max-width:100%}
.rs-mas summary:hover{color:var(--ink)}
.rs-mas .rs-b{margin-top:10px;max-height:420px;overflow:auto}
@media (max-width:420px){.rs{padding:14px}.rs-cmp{grid-template-columns:minmax(0,1fr)}}
${mdCss(".rs-b")}`;
