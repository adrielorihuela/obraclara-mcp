// Puntuación automática de resultados/raw_{sin,con}_mcp.jsonl -> resultados.csv y resumen.md
// Uso: node score_eval.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'resultados');
const TOL = 0.01;

function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [h, ...rest] = rows;
  return rest.filter((r) => r.length > 1).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ''])));
}

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Interpretaciones posibles de un token numérico (formatos es/en). Devuelve varias si es ambiguo.
function readings(tok) {
  const t = tok.replace(/[\s  ]/g, ' ').trim();
  const out = new Set();
  const plain = (s) => { const v = Number(s); if (Number.isFinite(v)) out.add(v); };
  if (/^\d{1,3}( \d{3})+([.,]\d+)?$/.test(t)) { plain(t.replace(/ /g, '').replace(',', '.')); return [...out]; }
  const s = t.replace(/ /g, '');
  const hasC = s.includes(','), hasD = s.includes('.');
  if (hasC && hasD) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) plain(s.replace(/\./g, '').replace(',', '.')); // 1.234,56
    else plain(s.replace(/,/g, '')); // 1,234.56
  } else if (hasC || hasD) {
    const sep = hasC ? ',' : '.';
    const parts = s.split(sep);
    if (parts.length > 2) plain(parts.join('')); // 1,234,567 o 1.234.567
    else {
      plain(parts.join('.')); // decimal
      if (parts[1].length === 3) plain(parts.join('')); // o miles
    }
  } else plain(s);
  return [...out];
}

// Extrae números del texto con multiplicadores (millones, mil millones, billones...).
export function extractNumbers(text) {
  const res = [];
  const re = /(\d{1,3}(?:[   ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)*)(\s*(?:%|mil\s+millones|miles\s+de\s+millones|millones|mill\.?|mm\b|millon|billones|billon|billion|million|mil\b|k\b|m\b))?/gi;
  for (const m of String(text || '').matchAll(re)) {
    const base = readings(m[1]);
    const suf = norm(m[2] || '').trim().replace(/\s+/g, ' ');
    let mult = [1];
    if (/^(mil millones|miles de millones|billion)$/.test(suf)) mult = [1e9];
    else if (/^(millones|mill\.?|millon|million)$/.test(suf)) mult = [1e6];
    else if (/^(mm|m)$/.test(suf)) mult = [1e6, 1];
    else if (/^(billones|billon)$/.test(suf)) mult = [1e12, 1e9]; // billón es 1e12; se acepta el uso inglés
    else if (/^(mil|k)$/.test(suf)) mult = [1e3];
    for (const b of base) for (const k of mult) res.push({ v: b * k, raw: m[0].trim(), pct: suf === '%' });
  }
  return res;
}

const MEF = /\bmef\b|ministerio de economia y finanzas|datosabiertos\.gob\.pe|detalle_inversiones|consulta amigable|invierte\.pe|banco de inversiones/;
const FECHA = /2026-11-10|10\/11\/2026|10-11-2026|10 de noviembre(?: del?)? 2026|fecha[_ ]de[_ ]descarga|fecha_descarga|descargad[oa]s? el|corte (?:al|del?) 10/;
const NODATA = /no (?:existen|hay|se (?:encontr|registr|identific|hall)|encontr|registra|tiene|figura|aparece|devolvi)|ningun[ao]?\b|sin resultados|0 (?:resultados|inversiones|proyectos|obras)|cero (?:resultados|inversiones|proyectos|obras)|no se dispone|no devuelve (?:datos|resultados)/;

function score(q, r) {
  const a = r.answer || '';
  const na = norm(a);
  const notes = [];
  let exacta = false, inventada = false, revisar = false;
  const cita = MEF.test(na) && FECHA.test(na);
  if (!r.answer) return { exacta, cita: false, inventada, revisar: true, notes: ['sin respuesta'] };

  const isNoData = /no existen resultados/i.test(q.respuesta_referencia) || (q.valor_oficial !== '' && Number(q.valor_oficial) === 0);
  const qNums = new Set(extractNumbers(q.pregunta).map((x) => x.v));
  const clean = a.replace(/https?:\/\/\S+|www\.\S+/g, ' ').replace(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, ' ');
  const nums = extractNumbers(clean).filter((x) => !qNums.has(x.v) && !(Number.isInteger(x.v) && x.v >= 1990 && x.v <= 2035 && !x.pct));
  const codes = (a.match(/\b2\d{6}\b/g) || []).filter((c) => !q.pregunta.includes(c));

  if (isNoData) {
    const says = NODATA.test(na);
    exacta = says;
    inventada = !says && (codes.length > 0 || nums.some((x) => x.v > 0));
    if (says && codes.length) { revisar = true; notes.push('dice que no hay datos pero cita códigos'); }
    if (!says && !inventada) { revisar = true; notes.push('ni dice "sin datos" ni da cifras'); }
  } else if (q.unidad === 'texto') {
    // entidad o código esperado: lo escrito en mayúsculas dentro de la referencia
    const exp = (q.respuesta_referencia.match(/\b[A-ZÁÉÍÓÚÑ]{3,}(?: (?:DE |DEL |Y |LA |LOS |LAS )?[A-ZÁÉÍÓÚÑ-]{2,})+/g) || []).map(norm);
    const alias = exp.flatMap((e) => (e === 'ministerio de salud' ? [e, 'minsa'] : [e]));
    exacta = alias.some((e) => na.includes(e));
    if (!exacta) {
      const asserts = /ministerio|gobierno regional|municipalidad|essalud|programa nacional|pronis/.test(na);
      inventada = asserts; revisar = true; notes.push(asserts ? 'nombra otra entidad' : 'no nombra entidad');
    }
  } else {
    const val = Number(q.valor_oficial);
    const hit = nums.find((x) => Math.abs(x.v - val) <= TOL * Math.abs(val));
    exacta = !!hit;
    const at = hit ? clean.search(new RegExp('(?<![\\d.,])' + hit.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) : -1;
    const ctx = hit && clean.slice(Math.max(0, at - 2), at + hit.raw.length + 40);
    const clear = ctx && (hit.pct || /^\*\*/.test(ctx) || /^\S*\s*(?:\*\*)?\s*(?:%|inversion|proyecto|obra|mes|persona|habitante|colegio)/.test(norm(ctx.slice(2 + hit.raw.length))));
    if (hit && val < 100 && nums.length > 4 && !clear) { revisar = true; notes.push('valor pequeño con muchas cifras (posible coincidencia)'); }
    if (!hit) {
      const relevant = q.unidad === 'S/' ? nums.filter((x) => x.v >= 1000) : nums;
      inventada = relevant.length > 0;
      if (!inventada) { revisar = true; notes.push('no da cifra comparable'); }
      if (inventada && NODATA.test(na)) { revisar = true; notes.push('da cifras pero también dice que no hay datos'); }
    }
  }
  if (r.sin_json_final) { revisar = true; notes.push('sin JSON final'); }
  if (r.errors?.some((e) => e.startsWith('final'))) { revisar = true; notes.push('error'); }
  return { exacta, cita, inventada, revisar, notes };
}

function lastById(file) {
  const m = new Map();
  if (!fs.existsSync(file)) return m;
  for (const l of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(l);
    const ok = (x) => x.answer != null && !(x.errors || []).some((e) => e.startsWith('final'));
    if (!m.has(r.id) || ok(r) || !ok(m.get(r.id))) m.set(r.id, r);
  }
  return m;
}

const qs = parseCSV(fs.readFileSync(path.join(DIR, 'preguntas.csv'), 'utf8'));
const conds = ['sin_mcp', 'con_mcp'];
const rows = [];
for (const c of conds) {
  const raw = lastById(path.join(OUT, `raw_${c}.jsonl`));
  for (const q of qs) {
    const r = raw.get(q.id) || { answer: null, tool_calls: [], steps: 0, latency_s: null, errors: ['no ejecutada'] };
    const s = score(q, r);
    rows.push({ id: q.id, tipo: q.tipo, condicion: c, ...s, llamadas: r.tool_calls.length, pasos: r.steps, latencia_s: r.latency_s, latencia_ok_s: r.ask_ok_s ?? null, reintentos: (r.errors || []).filter((e) => e.startsWith('ask')).length,
      herramientas: r.tool_calls.map((t) => t.name).join('+'), esperada: q.herramienta_esperada,
      respuesta_resumida: (r.answer || '').replace(/\s+/g, ' ').slice(0, 300), ejecutada: r.answer != null });
  }
}

const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const head = ['id', 'tipo', 'condicion', 'exacta', 'cita', 'inventada', 'revisar', 'llamadas', 'pasos', 'latencia_s', 'respuesta_resumida'];
fs.writeFileSync(path.join(OUT, 'resultados.csv'),
  [head.join(','), ...rows.map((r) => head.map((k) => esc(k === 'revisar' && r.notes.length ? (r.revisar ? 'sí: ' + r.notes.join('; ') : '') : typeof r[k] === 'boolean' ? (r[k] ? 1 : 0) : r[k])).join(','))].join('\n') + '\n');

const pct = (xs, k) => (xs.length ? ((100 * xs.filter((x) => x[k]).length) / xs.length).toFixed(0) + ' %' : '-');
const mean = (xs, k) => { const v = xs.map((x) => x[k]).filter((x) => x != null); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '-'; };
let md = `# Evaluación ObraClara: sin MCP vs con MCP\n\nFecha: ${new Date().toISOString().slice(0, 10)} · 40 preguntas (\`preguntas.csv\`) · modelo: chatgpt.com anónimo vía gpt-headless · una corrida.\n\n`;
md += '## Resultado global (porcentaje de las 40 preguntas)\n\n| Condición | Exacta | Cita fuente y fecha | Inventada | Revisar | Latencia media total (s) | Latencia media sin reintentos (s) | Llamadas medias | Reintentos | Ejecutadas |\n|---|---|---|---|---|---|---|---|---|---|\n';
for (const c of conds) {
  const xs = rows.filter((r) => r.condicion === c);
  md += `| ${c} | ${pct(xs, 'exacta')} | ${pct(xs, 'cita')} | ${pct(xs, 'inventada')} | ${xs.filter((x) => x.revisar).length} | ${mean(xs, 'latencia_s')} | ${mean(xs, 'latencia_ok_s')} | ${mean(xs, 'llamadas')} | ${xs.reduce((a, x) => a + x.reintentos, 0)} | ${xs.filter((x) => x.ejecutada).length}/40 |\n`;
}
md += '\n## Por tipo de pregunta (10 preguntas cada uno)\n\n| Tipo | Condición | Exacta | Cita | Inventada | Revisar |\n|---|---|---|---|---|---|\n';
for (const t of [...new Set(qs.map((q) => q.tipo))]) for (const c of conds) {
  const xs = rows.filter((r) => r.condicion === c && r.tipo === t);
  md += `| ${t} | ${c} | ${pct(xs, 'exacta')} | ${pct(xs, 'cita')} | ${pct(xs, 'inventada')} | ${xs.filter((x) => x.revisar).length} |\n`;
}
const cm = rows.filter((r) => r.condicion === 'con_mcp');
const right = cm.filter((r) => r.herramientas.split('+').includes(r.esperada)).length;
md += `\nCon MCP, la herramienta esperada se usó en ${right}/40 preguntas; ${cm.filter((r) => r.llamadas === 0).length} respuestas no llamaron a ninguna herramienta.\n`;
md += `\n## Cómo se puntuó (automático)\n
- **Exacta**: si el valor oficial es numérico, se extraen los números de la respuesta (formatos «1 234,56», «1,234.56», «1.234,56», «S/ 2,5 millones», «mil millones»; los separadores ambiguos se leen de las dos formas) sin contar años ni números que ya estaban en la pregunta, y basta que uno quede a ±1 % del valor oficial. Texto: aparece la entidad esperada. Sin datos (B10, D10, A10): la respuesta dice que no hay resultados.
- **Cita**: menciona MEF / Ministerio de Economía y Finanzas / datosabiertos.gob.pe / el dataset **y** la fecha de corte 2026-11-10 o la fecha de descarga.
- **Inventada**: da cifras (en preguntas en soles, cifras ≥ 1000) y ninguna coincide con la referencia; o afirma resultados en una pregunta sin datos; o nombra otra entidad.
- **Revisar**: casos dudosos para revisión manual (columna \`revisar\` de \`resultados.csv\` con el motivo).

## Advertencias
- chatgpt.com **anónimo** (sin cuenta) a través de un navegador headless; no se sabe qué modelo responde y puede cambiar entre preguntas. En «sin MCP» el chat puede usar su búsqueda web.
- Con MCP se usa un protocolo de herramientas **en texto** (JSON en la respuesta), no llamadas nativas; resultados de más de ${15000} caracteres se recortan.
- Puntuación **automática** con reglas simples: puede contar como exacta una coincidencia casual o perder respuestas correctas con otro formato. Los casos «revisar» deben verificarlos a mano dos integrantes del grupo.
- La latencia total incluye los reintentos: gpt-headless a veces se queda 3 min sin leer la respuesta y el ejecutor reintenta una vez; «sin reintentos» suma solo los intentos exitosos (medida desde B08; antes no se registraba).
- «Inventada» es una cota superior: sin MCP el chat suele citar otras fuentes reales (Contraloría, notas de prensa, otras fechas) cuyas cifras no coinciden con el MEF al 2026-11-10; la regla las cuenta como inventadas aunque no sean fabricadas. Conviene revisarlas a mano.
- **Una sola corrida** por condición: no mide la variabilidad entre corridas.
- Datos de referencia con corte 2026-11-10; el chat sin herramientas puede tener datos de otra fecha.
`;
fs.writeFileSync(path.join(OUT, 'resumen.md'), md);
console.log(md.split('## Cómo')[0]);
