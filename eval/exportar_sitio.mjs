// Exporta los resultados de la evaluación al sitio: escribe worker/src/sitio/evaluacion-datos.ts.
// Uso: node exportar_sitio.mjs   (ejecutar después de score_eval.mjs y exportar_graficos.mjs)
// Lee resultados/graficos_global.csv, graficos_por_tipo.csv, graficos_latencia.csv, resumen.md, resultados.csv,
// raw_*.jsonl y preguntas.csv. No inventa nada: todo número del sitio viene de esos archivos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { limpiarMd, recortarMd, claveRespuesta, claveReferencia } from './respuesta_md.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RES = path.join(AQUI, 'resultados');
const SALIDA = path.join(AQUI, '..', 'worker', 'src', 'sitio', 'evaluacion-datos.ts');
const MAX = { 'R01|sin_mcp': 160, 'A01|sin_mcp': 216, 'B01|con_mcp': 226 }; // corta la respuesta sin MCP antes de que aparezca marcado interno del proveedor
const IDS_EJEMPLOS = ['B01', 'A01', 'R01']; // una de búsqueda, una de alertas y una de resumen

function parseCSV(t) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [h, ...b] = rows.filter((r) => r.length > 1);
  return b.map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}
const leer = (n) => fs.readFileSync(path.join(RES, n), 'utf8');
const csv = (n) => parseCSV(leer(n));
const jsonl = (n) => Object.fromEntries(leer(n).split('\n').filter(Boolean).map((l) => JSON.parse(l)).map((j) => [j.id, j]));
const n = (v) => parseFloat(String(v).replace(',', '.'));
const nn = (v) => { const x = n(v); return Number.isNaN(x) ? null : x; }; // vacío = no calculable (p. ej. precisión sin ningún código mencionado)

const resumen = leer('resumen.md');
const fecha = /Fecha: (\d{4}-\d{2}-\d{2})/.exec(resumen)?.[1];
const tablaGlobal = resumen.split('\n').filter((l) => /^\| (sin_mcp|con_mcp) \|/.test(l) && l.split('|').length > 10);
const global = tablaGlobal.map((l) => {
  const c = l.split('|').map((x) => x.trim()).filter(Boolean);
  return {
    condicion: c[0], exactitud: n(c[1]), citacion: n(c[2]), inventada: n(c[3]), revisar: n(c[4]),
    latTotal: n(c[5]), latSinReintentos: n(c[6]), llamadas: n(c[7]), reintentos: n(c[8]), ejecutadas: c[9],
  };
});
const herr = /herramienta esperada se usó en (\d+)\/(\d+)/.exec(resumen);
const advertencias = resumen.split('## Advertencias')[1]?.split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).replace(/\*\*/g, '').trim()) ?? [];
const comoSePuntuo = resumen.split('## Cómo se puntuó (automático)')[1]?.split('## ')[0].split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).replace(/\*\*/g, '').trim()) ?? [];

const porTipo = csv('graficos_por_tipo.csv').map((r) => ({
  tipo: r.tipo, condicion: r.condicion, exactitud: n(r.exactitud_pct), citacion: n(r.citacion_pct), inventada: n(r.inventada_pct),
  estricta: n(r.exacta_estricta_pct), noSustentadas: n(r.no_sustentadas_pct), recall: n(r.recall_pct), precision: nn(r.precision_pct), f1: n(r.f1_pct),
}));
const latencia = csv('graficos_latencia.csv').map((r) => ({
  condicion: r.condicion, media: n(r.latencia_media_s), mediana: n(r.latencia_mediana_s), p90: n(r.latencia_p90_s), max: n(r.latencia_max_s),
  medianaSinReintentos: n(r.mediana_sin_reintentos_s), p90SinReintentos: n(r.p90_sin_reintentos_s),
}));
const globalCsv = csv('graficos_global.csv').map((r) => ({
  condicion: r.condicion, exactitud: n(r.exactitud_pct), citacion: n(r.citacion_pct), inventada: n(r.inventada_pct), ejecutadas: n(r.ejecutadas), preguntas: n(r.preguntas),
  estricta: n(r.exacta_estricta_pct), noSustentadas: n(r.no_sustentadas_pct),
  recall: n(r.recall_pct), precision: nn(r.precision_pct), f1: n(r.f1_pct), conReferencia: n(r.preguntas_con_referencia),
}));
// Control cruzado: la tabla de resumen.md y los CSV de gráficos deben coincidir.
for (const g of globalCsv) {
  const m = global.find((x) => x.condicion === g.condicion);
  if (!m || m.exactitud !== g.exactitud || m.citacion !== g.citacion || m.inventada !== g.inventada) throw new Error(`resumen.md y graficos_global.csv no coinciden (${g.condicion}); ejecuta score_eval.mjs y exportar_graficos.mjs`);
}
for (const g of global) { const c = globalCsv.find((x) => x.condicion === g.condicion); g.estricta = c.estricta; g.noSustentadas = c.noSustentadas; Object.assign(g, { recall: c.recall, precision: c.precision, f1: c.f1, conReferencia: c.conReferencia }); }
// Casos que pasan de exacta a no estricta (resultados.csv)
const cambios = csv('resultados.csv').filter((r) => r.exacta === '1' && r.estricta !== '1').map((r) => ({ id: r.id, condicion: r.condicion, cifras: r.cifras_no_sustentadas.split('; ') }));

const limpiar = (t) => String(t ?? '')
  .replace(/<[^>]*>/g, ' ').replace(/\\n/g, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').replace(/https?:\/\/\S+/g, '').trim();
function recortar(t, max = 330) {
  if (t.length <= max) return t;
  let c = t.slice(0, max);
  const corte = Math.max(c.lastIndexOf('. '), c.lastIndexOf(': '));
  c = corte > max * 0.5 ? c.slice(0, corte + 1) : c.slice(0, c.lastIndexOf(' '));
  return c + ' […]';
}
const preguntas = Object.fromEntries(csv_('preguntas.csv').map((r) => [r.id, r]));
function csv_(nombre) { return parseCSV(fs.readFileSync(path.join(AQUI, nombre), 'utf8')); }
const sin = jsonl('raw_sin_mcp.jsonl'), con = jsonl('raw_con_mcp.jsonl');
const punt = {};
for (const r of csv('resultados.csv')) punt[`${r.id}|${r.condicion}`] = r;
const ejemplos = IDS_EJEMPLOS.map((id) => {
  const q = preguntas[id];
  const lado = (raw, cond) => ({
    texto: recortar(limpiar(raw[id].answer), MAX[`${id}|${cond}`] ?? 330),
    exacta: punt[`${id}|${cond}`].exacta === '1', cita: punt[`${id}|${cond}`].cita === '1', inventada: punt[`${id}|${cond}`].inventada === '1',
    herramientas: raw[id].tool_calls.map((t) => t.name),
  });
  return { id, tipo: q.tipo, pregunta: q.pregunta, referencia: q.respuesta_referencia, sin: lado(sin, 'sin_mcp'), con: lado(con, 'con_mcp') };
});

const recallPreguntas = csv('graficos_recall.csv').map((r) => ({ id: r.id, condicion: r.condicion, esperados: n(r.elementos_esperados), mencionados: n(r.mencionados), aciertos: n(r.aciertos), recall: n(r.recall_pct) }));
const datos = { recallPreguntas, fecha, preguntas: globalCsv[0].preguntas, global, porTipo, latencia, cambios, herramientaEsperada: { usada: Number(herr?.[1]), total: Number(herr?.[2]) }, comoSePuntuo, advertencias, ejemplos };
fs.writeFileSync(SALIDA, `// GENERADO por eval/exportar_sitio.mjs a partir de eval/resultados/. No editar a mano: vuelve a ejecutar \`node eval/exportar_sitio.mjs\`.\nexport const EVAL = ${JSON.stringify(datos, null, 1)} as const;\n`);
console.log(`escrito ${path.relative(process.cwd(), SALIDA)} (${global.length} condiciones, ${porTipo.length} filas por tipo, ${ejemplos.length} ejemplos)`);

// --- Tabla de las 40 preguntas y comparación entre modelos (página /evaluacion) -> worker/src/sitio/evaluacion-tabla.ts ---
const SALIDA_TABLA = path.join(AQUI, '..', 'worker', 'src', 'sitio', 'evaluacion-tabla.ts');
const MAX_MD = 400; // con las 80 respuestas la página debe pesar menos de 230 KB (test/sitio.test.ts)
const lista = Object.values(preguntas);
// t: respuesta en Markdown recortada por bloques (tablas por filas); k: la cifra que se compara con la referencia (rk).
const fila = (raw, cond, id) => {
  const r = raw[id], p = punt[`${id}|${cond}`];
  return {
    e: p.exacta === '1', s: p.estricta === '1', c: p.cita === '1', i: p.inventada === '1',
    t: r?.answer ? recortarMd(limpiarMd(r.answer), MAX_MD, 4).md : '(sin respuesta)',
    k: claveRespuesta(preguntas[id], r?.answer, p.exacta === '1'),
    ...(cond === 'con_mcp' ? { h: (r?.tool_calls ?? []).map((t) => t.name) } : {}),
  };
};
const tabla = lista.map((q) => ({ id: q.id, tipo: q.tipo, p: q.pregunta, r: q.respuesta_referencia, rk: claveReferencia(q), esp: q.herramienta_esperada, sin: fila(sin, 'sin_mcp', q.id), con: fila(con, 'con_mcp', q.id) }));

// Modelos: la corrida principal («IA del servidor») más cada carpeta de resultados/modelos/<id>/ con su meta.json {nombre, nota}.
function resumenModelo(id, nombre, nota, dir) {
  const rd = (f) => parseCSV(fs.readFileSync(path.join(dir, f), 'utf8'));
  const g = rd('graficos_global.csv'), l = rd('graficos_latencia.csv');
  const por = (c) => {
    const x = g.find((r) => r.condicion === c), y = l.find((r) => r.condicion === c);
    return { exactitud: n(x.exactitud_pct), estricta: n(x.exacta_estricta_pct), citacion: n(x.citacion_pct), inventada: n(x.inventada_pct), noSustentadas: n(x.no_sustentadas_pct), recall: n(x.recall_pct), precision: nn(x.precision_pct), f1: n(x.f1_pct), ejecutadas: n(x.ejecutadas), mediana: n(y.latencia_mediana_s) };
  };
  return { id, nombre, nota, sin: por('sin_mcp'), con: por('con_mcp') };
}
const modelos = [resumenModelo('principal', 'IA del servidor', 'Corrida principal del proyecto; el proveedor puede cambiar de modelo entre preguntas.', RES)];
const dirModelos = path.join(RES, 'modelos');
if (fs.existsSync(dirModelos)) for (const id of fs.readdirSync(dirModelos).sort()) {
  const d = path.join(dirModelos, id);
  if (!fs.existsSync(path.join(d, 'meta.json')) || !fs.existsSync(path.join(d, 'graficos_global.csv'))) continue;
  const meta = JSON.parse(fs.readFileSync(path.join(d, 'meta.json'), 'utf8'));
  modelos.push(resumenModelo(id, meta.nombre, meta.nota ?? '', d));
}
fs.writeFileSync(SALIDA_TABLA, `// GENERADO por eval/exportar_sitio.mjs a partir de eval/resultados/. No editar a mano.\nexport interface Lado { e: boolean; s: boolean; c: boolean; i: boolean; t: string; k: string; h?: string[] }\nexport interface Fila { id: string; tipo: string; p: string; r: string; rk: string; esp: string; sin: Lado; con: Lado }\nexport interface Lote { exactitud: number; estricta: number; citacion: number; inventada: number; noSustentadas: number; recall: number; precision: number | null; f1: number; ejecutadas: number; mediana: number }\nexport interface Modelo { id: string; nombre: string; nota: string; sin: Lote; con: Lote }\nexport const PREGUNTAS: Fila[] = ${JSON.stringify(tabla)};\nexport const MODELOS: Modelo[] = ${JSON.stringify(modelos)};\n`);
console.log(`escrito ${path.relative(process.cwd(), SALIDA_TABLA)} (${tabla.length} preguntas, ${modelos.length} modelos)`);
