// Exporta tablas listas para Excel a partir de resultados/resultados.csv (generado por score_eval.mjs).
// Uso: node exportar_graficos.mjs
// Salida: resultados/graficos_global.csv, graficos_por_tipo.csv, graficos_latencia.csv
// Criterio igual que score_eval.mjs: porcentajes sobre todas las preguntas de cada grupo (40 por condición, 10 por tipo);
// la latencia media promedia solo las filas con latencia registrada.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'resultados');

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

const rows = parseCSV(fs.readFileSync(path.join(OUT, 'resultados.csv'), 'utf8'));
const conds = ['sin_mcp', 'con_mcp'];
const tipos = [...new Set(rows.map((r) => r.tipo))];
const pct = (xs, k) => (xs.length ? (100 * xs.filter((x) => x[k] === '1').length / xs.length).toFixed(0) : '');
// ejecutada = hay respuesta y no terminó con error (igual que la tabla de preguntas válidas de resumen.md)
const ejec = (xs) => xs.filter((x) => (x.respuesta_resumida || '') !== '' && !/\berror\b/.test(x.revisar || '')).length;
const lat = (xs) => { const v = xs.map((x) => x.latencia_s).filter((x) => x !== '' && x != null).map(Number); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : ''; };
const w = (name, head, lines) => fs.writeFileSync(path.join(OUT, name), [head, ...lines].join('\n') + '\n');

w('graficos_global.csv', 'condicion,exactitud_pct,citacion_pct,inventada_pct,ejecutadas,preguntas',
  conds.map((c) => { const xs = rows.filter((r) => r.condicion === c); return [c, pct(xs, 'exacta'), pct(xs, 'cita'), pct(xs, 'inventada'), ejec(xs), xs.length].join(','); }));

w('graficos_por_tipo.csv', 'tipo,condicion,exactitud_pct,citacion_pct,inventada_pct,ejecutadas,preguntas',
  tipos.flatMap((t) => conds.map((c) => { const xs = rows.filter((r) => r.tipo === t && r.condicion === c); return [t, c, pct(xs, 'exacta'), pct(xs, 'cita'), pct(xs, 'inventada'), ejec(xs), xs.length].join(','); })));

w('graficos_latencia.csv', 'condicion,latencia_media_s',
  conds.map((c) => [c, lat(rows.filter((r) => r.condicion === c))].join(',')));

console.log('Escrito en', OUT, ': graficos_global.csv, graficos_por_tipo.csv, graficos_latencia.csv');
