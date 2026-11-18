// Exporta los resultados de la evaluación al sitio: escribe worker/src/sitio/evaluacion-datos.ts.
// Uso: node exportar_sitio.mjs   (ejecutar después de score_eval.mjs y exportar_graficos.mjs)
// Lee resultados/graficos_global.csv, graficos_por_tipo.csv, graficos_latencia.csv, resumen.md, resultados.csv,
// raw_*.jsonl y preguntas.csv. No inventa nada: todo número del sitio viene de esos archivos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
}));
const latencia = csv('graficos_latencia.csv').map((r) => ({ condicion: r.condicion, media: n(r.latencia_media_s) }));
const globalCsv = csv('graficos_global.csv').map((r) => ({
  condicion: r.condicion, exactitud: n(r.exactitud_pct), citacion: n(r.citacion_pct), inventada: n(r.inventada_pct), ejecutadas: n(r.ejecutadas), preguntas: n(r.preguntas),
}));
// Control cruzado: la tabla de resumen.md y los CSV de gráficos deben coincidir.
for (const g of globalCsv) {
  const m = global.find((x) => x.condicion === g.condicion);
  if (!m || m.exactitud !== g.exactitud || m.citacion !== g.citacion || m.inventada !== g.inventada) throw new Error(`resumen.md y graficos_global.csv no coinciden (${g.condicion}); ejecuta score_eval.mjs y exportar_graficos.mjs`);
}

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

const datos = { fecha, preguntas: globalCsv[0].preguntas, global, porTipo, latencia, herramientaEsperada: { usada: Number(herr?.[1]), total: Number(herr?.[2]) }, comoSePuntuo, advertencias, ejemplos };
fs.writeFileSync(SALIDA, `// GENERADO por eval/exportar_sitio.mjs a partir de eval/resultados/. No editar a mano: vuelve a ejecutar \`node eval/exportar_sitio.mjs\`.\nexport const EVAL = ${JSON.stringify(datos, null, 1)} as const;\n`);
console.log(`escrito ${path.relative(process.cwd(), SALIDA)} (${global.length} condiciones, ${porTipo.length} filas por tipo, ${ejemplos.length} ejemplos)`);
