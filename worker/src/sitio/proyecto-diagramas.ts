// Gráficos y diagramas SVG de la página /proyecto. Todo en línea, con los tokens de color del sitio (claro y oscuro),
// sin librerías. Los números de la evaluación vienen de evaluacion-datos.ts (generado desde eval/resultados/).
import { esc } from "./layout";
import { EVAL } from "./evaluacion-datos";

export const nf = (v: number, d = 0) => { const [e, f] = v.toFixed(d).split("."); return e.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (f ? "," + f : ""); };
const svg = (id: string, vb: string, titulo: string, desc: string, cuerpo: string, cls = "gx") =>
  `<svg class="${cls}" viewBox="${vb}" role="img" aria-labelledby="${id}-t ${id}-d"><title id="${id}-t">${esc(titulo)}</title><desc id="${id}-d">${esc(desc)}</desc>${cuerpo}</svg>`;
const txt = (x: number, y: number, t: string, cls = "gx-t", anc = "start", extra = "") =>
  `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anc}"${extra}>${esc(t)}</text>`;

/* ---------- 1. Problema: inversiones por nivel y composición del costo ---------- */

export function graficoNiveles(): string {
  const filas: [string, number, string][] = [["Gobiernos locales", 511, "gx-b3"], ["Gobierno nacional", 93, "gx-b2"], ["Gobiernos regionales", 80, "gx-b1"]];
  const total = 684, x0 = 150, ancho = 150;
  const cuerpo = filas.map(([n, v, c], i) => {
    const y = 14 + i * 46, w = Math.max(3, (v / 511) * ancho);
    return txt(0, y + 19, n) + `<rect x="${x0}" y="${y}" width="${w.toFixed(1)}" height="26" rx="4" class="${c}"/>` +
      txt(x0 + w + 8, y + 19, `${v} · ${nf((v / total) * 100, 1)} %`, "gx-t gx-n");
  }).join("");
  return svg("gN", "0 0 430 160", "Inversiones vinculadas a obras paralizadas por nivel de gobierno",
    "Gráfico de barras horizontales. De 684 inversiones: 511 de gobiernos locales (74,7 %), 93 del gobierno nacional (13,6 %) y 80 de gobiernos regionales (11,7 %). Fuente: MEF, Nota Informativa N.° 02, julio 2026, con datos a marzo 2026.",
    cuerpo + txt(0, 154, "Total: 684 inversiones", "gx-m"));
}

export function graficoCosto(): string {
  const W = 420;
  const fila = (y: number, titulo: string, partes: [string, string, number, string][], total: number) => {
    let x = 0, s = txt(0, y + 14, titulo, "gx-t gx-b");
    partes.forEach(([nom, val, v, cls]) => {
      const w = (v / total) * W;
      s += `<rect x="${x.toFixed(1)}" y="${y + 24}" width="${(w - 2).toFixed(1)}" height="26" rx="4" class="${cls}"/>`;
      s += txt(x, y + 72, nom, "gx-m") + txt(x, y + 90, val, "gx-t gx-n");
      x += w;
    });
    return s;
  };
  const cuerpo = fila(0, "Costo actualizado: S/ 21 141 millones", [["Devengado", "S/ 13 100 M · 62,0 %", 13100, "gx-b4"], ["Saldo por ejecutar", "S/ 8 041 M · 38,0 %", 8041, "gx-b3"]], 21141) +
    fila(122, "Saldo por ejecutar: S/ 8 041 millones", [["Gobierno nacional", "S/ 4 364 M · 54,3 %", 4364, "gx-b2"], ["Regional y local", "S/ 3 677 M · 45,7 %", 3677, "gx-b1"]], 8041);
  return svg("gC", "0 0 420 232", "Composición del costo actualizado y del saldo de las obras paralizadas",
    "Dos barras apiladas. El costo actualizado de S/ 21 141 millones se compone de S/ 13 100 millones devengados (62,0 %) y S/ 8 041 millones de saldo (38,0 %). Del saldo, S/ 4 364 millones corresponden al gobierno nacional (54,3 %) y S/ 3 677 millones a gobiernos regionales y locales (45,7 %), diferencia calculada.",
    cuerpo);
}

/* ---------- 2. CRISP-DM en ciclo ---------- */

export function cicloCrispDm(): string {
  const fases = ["1 Negocio", "2 Datos", "3 Preparación", "4 Modelado", "5 Evaluación", "6 Despliegue"];
  const cx = 210, cy = 188, rx = 140, ry = 138, w = 128, h = 38;
  const c = fases.map((_, i) => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as [number, number]; });
  // Punto donde el segmento entre centros sale de una caja (con margen).
  const borde = (p: [number, number], q: [number, number], m: number): [number, number] => {
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const t = Math.min(dx ? (w / 2 + m) / Math.abs(dx) : Infinity, dy ? (h / 2 + m) / Math.abs(dy) : Infinity);
    return [p[0] + dx * t, p[1] + dy * t];
  };
  const flechas = c.map((p, i) => {
    const q = c[(i + 1) % 6], a = borde(p, q, 5), b = borde(q, p, 7);
    return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" class="ar-ln" marker-end="url(#cr)"/>`;
  }).join("");
  const cajas = c.map((p, i) => `<g><rect x="${(p[0] - w / 2).toFixed(1)}" y="${(p[1] - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="19" class="${i === 4 ? "ar-box ar-ac" : "ar-box"}"/>${txt(+p[0].toFixed(1), +(p[1] + 5).toFixed(1), fases[i], "ar-t", "middle")}</g>`).join("");
  const defs = `<defs><marker id="cr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 1 9 5 0 9z" class="ar-hd"/></marker></defs>`;
  return svg("gK", "0 0 420 376", "Ciclo CRISP-DM del proyecto",
    "Seis fases en círculo, cada una lleva a la siguiente y la última vuelve a la primera: 1 comprensión del negocio, 2 comprensión de los datos, 3 preparación de los datos, 4 modelado, 5 evaluación y 6 despliegue.",
    defs + flechas + cajas + txt(cx, cy - 4, "CRISP-DM", "ar-t", "middle") + txt(cx, cy + 16, "iterativo", "gx-m", "middle"), "gx gx-ciclo");
}

/* ---------- 3. ETL: CSV → Python → SQL → SQLite + D1 ---------- */

export function flujoEtl(): string {
  const caja = (x: number, y: number, w: number, h: number, t: string, l: string[], cls = "ar-box") =>
    `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" class="${cls}"/>${txt(x + 14, y + 26, t, "ar-t")}` +
    l.map((s, i) => txt(x + 14, y + 49 + i * 19, s, "ar-s2")).join("") + `</g>`;
  const fl = (m: string) => (d: string) => `<path d="${d}" class="ar-ln" marker-end="url(#${m})"/>`;
  const defs = (m: string) => `<defs><marker id="${m}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 1 9 5 0 9z" class="ar-hd"/></marker></defs>`;
  const fa = fl("etA"), fb = fl("etB");
  const desc = "El archivo CSV del MEF (150 641 filas, 68 columnas, 247 MB) entra al ETL en Python, que quita 67 códigos repetidos, conserva 23 columnas y calcula los indicadores. Produce archivos SQL por lotes que se cargan en una base SQLite local de unos 141 MB y, como respaldo, en Cloudflare D1.";
  const ancho = svg("gE", "0 0 850 214", "Flujo del ETL de ObraClara", desc, defs("etA") +
    caja(0, 20, 190, 130, "CSV del MEF", ["DETALLE_INVERSIONES.csv", "150 641 filas · 68 columnas", "247 MB · ODC-BY"]) +
    caja(220, 20, 190, 130, "ETL en Python", ["etl/inversiones.py", "quita 67 repetidos", "23 columnas · alertas"], "ar-box ar-ac") +
    caja(440, 20, 190, 130, "SQL por lotes", ["build/data_*.sql", "150 574 inversiones", "meta.sql"]) +
    caja(660, 0, 190, 92, "SQLite local", ["≈ 141 MB · consultas"]) +
    caja(660, 112, 190, 92, "Cloudflare D1", ["respaldo, carga manual"]) +
    fa("M192 85H218") + fa("M412 85H438") + fa("M632 85H646V46H658") + fa("M646 85V158H658"), "gx gx-w");
  const alto = svg("gF", "0 0 360 520", "Flujo del ETL de ObraClara (vertical)", desc, defs("etB") +
    caja(10, 0, 340, 84, "CSV del MEF", ["150 641 filas · 68 columnas · 247 MB"]) + fb("M180 86V118") +
    caja(10, 120, 340, 84, "ETL en Python", ["quita 67 repetidos · 23 columnas · alertas"], "ar-box ar-ac") + fb("M180 206V238") +
    caja(10, 240, 340, 84, "SQL por lotes", ["150 574 inversiones · meta.sql"]) + fb("M95 326V358") + fb("M265 326V358") +
    caja(10, 360, 165, 100, "SQLite local", ["≈ 141 MB"]) + caja(185, 360, 165, 100, "Cloudflare D1", ["respaldo"]), "gx gx-v");
  return ancho + alto;
}

/* ---------- 4. Las 7 etapas de una consulta (con ciclo ReAct) ---------- */

export function flujoConsulta(): string {
  const etapas: [string, string, boolean][] = [
    ["El usuario pregunta", "en lenguaje natural", false],
    ["El asistente identifica", "entidad, región, sector y tipo", false],
    ["El asistente elige la herramienta", "y sus parámetros", false],
    ["El servidor MCP valida y busca", "con una consulta fija y segura", true],
    ["Devuelve los datos", "con fuente, enlace y fecha", true],
    ["El asistente puede consultar de nuevo", "si le falta información", false],
    ["El asistente redacta la respuesta", "con alertas y fuente", false],
  ];
  const x = 50, w = 340, h = 62, paso = 92;
  const cuerpo = etapas.map(([a, b, srv], i) => {
    const y = 8 + i * paso;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" class="${srv ? "ar-box ar-ac" : "ar-box"}"/>` +
      `<circle cx="${x + 30}" cy="${y + h / 2}" r="14" class="gx-num"/>` + txt(x + 30, y + h / 2 + 5, String(i + 1), "gx-numt", "middle") +
      txt(x + 58, y + 27, a, "ar-t2") + txt(x + 58, y + 47, b, "ar-s2") + `</g>` +
      (i < 6 ? `<path d="M${x + w / 2} ${y + h + 2}V${y + paso - 4}" class="ar-ln" marker-end="url(#qf)"/>` : "");
  }).join("");
  const y6 = 8 + 5 * paso + h / 2, y3 = 8 + 2 * paso + h / 2;
  const lazo = `<path d="M${x + w} ${y6}H416V${y3}H${x + w + 2}" class="ar-ln ar-dash" marker-end="url(#qf)"/>` +
    `<text x="430" y="${(y6 + y3) / 2}" class="gx-m" text-anchor="middle" transform="rotate(90 430 ${(y6 + y3) / 2})">repetir</text>`;
  const defs = `<defs><marker id="qf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 1 9 5 0 9z" class="ar-hd"/></marker></defs>`;
  return svg("gQ", "0 0 444 636", "Las siete etapas de una consulta",
    "Siete cuadros numerados de arriba abajo: 1 el usuario pregunta; 2 el modelo identifica entidad, región, sector y tipo de consulta; 3 elige la herramienta y sus parámetros; 4 el servidor MCP valida y ejecuta un SQL fijo; 5 devuelve datos con fuente, enlace y fecha; 6 el modelo puede encadenar otra consulta, y una flecha punteada vuelve a la etapa 3 (ciclo ReAct); 7 redacta la respuesta con alertas y fuente. Las etapas 4 y 5 las hace el servidor, el resto el modelo de lenguaje.",
    defs + cuerpo + lazo, "gx gx-q");
}

/* ---------- 5. Evaluación: barras agrupadas ---------- */

type Par = { etiqueta: string; sin: number; con: number };
export function barrasAgrupadas(id: string, titulo: string, desc: string, grupos: Par[], vb: [number, number], bw: number): string {
  const [W, H] = vb, izq = 34, arriba = 22, abajo = 34, alto = H - arriba - abajo, gw = (W - izq - 6) / grupos.length;
  const y = (v: number) => arriba + alto - (v / 100) * alto;
  let s = [0, 50, 100].map((g) => `<line x1="${izq}" x2="${W}" y1="${y(g).toFixed(1)}" y2="${y(g).toFixed(1)}" class="gx-g"/>` + txt(izq - 6, y(g) + 4, String(g), "gx-m", "end")).join("");
  grupos.forEach((g, i) => {
    const cx = izq + gw * i + gw / 2;
    ([["sin", g.sin, "gx-sin", -bw - 2], ["con", g.con, "gx-con", 2]] as const).forEach(([, v, cls, dx]) => {
      const alt = Math.max(1.5, (v / 100) * alto);
      s += `<rect x="${(cx + dx).toFixed(1)}" y="${(y(v) - (v === 0 ? 1.5 : 0)).toFixed(1)}" width="${bw}" height="${alt.toFixed(1)}" rx="3" class="${cls}"/>`;
      s += txt(cx + dx + bw / 2, y(v) - 6, `${v} %`, "gx-t gx-n", "middle");
    });
    s += txt(cx, H - 10, g.etiqueta, "gx-t", "middle");
  });
  return svg(id, `0 0 ${W} ${H}`, titulo, desc, s);
}

const G = (c: string) => EVAL.global.find((x) => x.condicion === c)!;
export function graficoGlobal(): string {
  const a = G("sin_mcp"), b = G("con_mcp");
  return barrasAgrupadas("gG", "De 40 preguntas: respuestas correctas, con fuente e inventadas, sin y con la conexión (MCP)",
    `Barras agrupadas sobre ${EVAL.preguntas} preguntas. Respuestas correctas: ${a.exactitud} % sin la conexión y ${b.exactitud} % con ella. Respuestas que citan fuente y fecha: ${a.citacion} % y ${b.citacion} %. Respuestas con datos inventados: ${a.inventada} % y ${b.inventada} %. Respuestas correctas con el criterio estricto: ${a.estricta} % y ${b.estricta} %. Respuestas con alguna cifra sin sustento: ${a.noSustentadas} % y ${b.noSustentadas} %.`,
    [{ etiqueta: "Correctas", sin: a.exactitud, con: b.exactitud }, { etiqueta: "Estrictas", sin: a.estricta, con: b.estricta }, { etiqueta: "Citan fuente", sin: a.citacion, con: b.citacion }, { etiqueta: "Inventadas", sin: a.inventada, con: b.inventada }, { etiqueta: "Sin sustento", sin: a.noSustentadas, con: b.noSustentadas }],
    [540, 290], 36);
}

const TIPOS: [string, string][] = [["busqueda", "Búsqueda"], ["detalle", "Detalle"], ["alertas", "Alertas"], ["resumen", "Resumen"]];
export function graficosPorTipo(): string {
  const f = (t: string, c: string) => EVAL.porTipo.find((x) => x.tipo === t && x.condicion === c)!;
  const m = (v: number) => Math.round(v / 10); // 10 preguntas por tipo: porcentaje -> cantidad de 10
  const defs = [
    ["exactitud", "Respuestas correctas", "Sin la conexión, el asistente acertó 0 a 2 de cada 10 preguntas según el tipo; con la conexión acertó 10 de 10 en los cuatro tipos."],
    ["citacion", "Respuestas que citan la fuente y la fecha", "Sin la conexión casi nunca dijo de dónde sacó el dato (0 a 3 de cada 10); con la conexión lo dijo siempre."],
    ["estricta", "Respuestas correctas con criterio estricto", "Quitando las respuestas que mezclan una cifra buena con otra errónea: sin la conexión, 0 a 2 de cada 10; con la conexión, 9 de 10 en detalle y 10 de 10 en los demás tipos."],
    ["inventada", "Respuestas con datos inventados", "Sin la conexión inventó cifras en 8 de 10 búsquedas y en 7 de 10 alertas; con la conexión, en ninguna."],
    ["noSustentadas", "Respuestas con alguna cifra sin sustento", "Sin la conexión, entre 4 y 7 de cada 10 respuestas traían alguna cifra que no se puede comprobar en el registro; con la conexión, solo 1 de 10 en detalle y ninguna en los otros tipos."],
  ] as const;
  return defs.map(([k, nom, que]) => {
    const g = TIPOS.map(([t, e]) => ({ etiqueta: e, sin: f(t, "sin_mcp")[k], con: f(t, "con_mcp")[k] }));
    const detalle = g.map((x) => `${x.etiqueta}: ${m(x.sin)} de 10 sin la conexión y ${m(x.con)} de 10 con ella`).join("; ");
    return `<figure class="rv">${barrasAgrupadas(`gT${k}`, `${nom}, por tipo de pregunta`, `Barras agrupadas por tipo de pregunta (10 preguntas cada una). ${nom}. ${detalle}.`, g, [320, 260], 26)}<figcaption>${nom}, por tipo de pregunta (10 de cada tipo)</figcaption><p class="que"><b>Qué significa:</b> ${que}</p></figure>`;
  }).join("");
}

export function graficoLatencia(): string {
  const a = G("sin_mcp"), b = G("con_mcp");
  const filas: [string, number, number][] = [["Tiempo medio total (con reintentos)", a.latTotal, b.latTotal], ["Tiempo medio sin reintentos", a.latSinReintentos, b.latSinReintentos]];
  const max = Math.max(...filas.flatMap((f) => [f[1], f[2]])), x0 = 0, ancho = 290;
  const cuerpo = filas.map(([n, s, c], i) => {
    const y = 8 + i * 92;
    const barra = (v: number, cls: string, dy: number) => `<rect x="${x0}" y="${y + 24 + dy}" width="${Math.max(3, (v / max) * ancho).toFixed(1)}" height="22" rx="4" class="${cls}"/>` + txt(x0 + Math.max(3, (v / max) * ancho) + 8, y + 41 + dy, `${nf(v, 1)} s`, "gx-t gx-n");
    return txt(0, y + 14, n, "gx-m") + barra(s, "gx-sin", 0) + barra(c, "gx-con", 26);
  }).join("");
  return svg("gL", "0 0 400 190", "Cuánto tarda en responder cada pregunta, sin y con la conexión (MCP)",
    `Barras horizontales. Tiempo medio total: ${nf(a.latTotal, 1)} s sin la conexión y ${nf(b.latTotal, 1)} s con ella. Sin contar los reintentos: ${nf(a.latSinReintentos, 1)} s y ${nf(b.latSinReintentos, 1)} s.`, cuerpo);
}

export const diagramasCss = String.raw`
.gx{width:100%;max-width:560px;margin:0 auto;font-family:var(--sans)}
.gx-w{max-width:none}.gx-v{display:none;max-width:400px}
@media (max-width:760px){.gx-w{display:none}.gx-v{display:block}}
.gx-ciclo{max-width:440px}.gx-q{max-width:460px}
.gx-t{fill:var(--ink);font-size:13.5px}.gx-m{fill:var(--mut);font-size:12.5px}.gx-b{font-weight:600}.gx-n{font-variant-numeric:tabular-nums;font-weight:600}
.gx-g{stroke:var(--line);stroke-width:1}
.gx-sin,.gx-b1{fill:var(--mut)}.gx-con,.gx-b4{fill:var(--accent)}.gx-b2{fill:var(--risk)}.gx-b3{fill:var(--warn)}
.ar-t2{fill:var(--ink);font-size:14.5px;font-weight:600}.ar-s2{fill:var(--mut);font-size:13.5px}
.gx-num{fill:var(--ink)}.gx-numt{fill:var(--bg);font-size:14px;font-weight:600}
.gx-ciclo .ar-t{font-size:14.5px}
.leyenda{display:flex;flex-wrap:wrap;gap:6px 22px;justify-content:center;margin:10px 0 0;padding:0;list-style:none;font-size:var(--s-1);color:var(--ink-2)}
.leyenda li{display:flex;align-items:center;gap:8px}.leyenda i{width:12px;height:12px;border-radius:3px;display:block}
`;
