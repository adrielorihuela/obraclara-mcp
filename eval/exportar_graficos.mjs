// Exporta tablas listas para Excel a partir de resultados/resultados.csv (generado por score_eval.mjs).
// Uso: node exportar_graficos.mjs
// Salida: resultados/graficos_global.csv, graficos_por_tipo.csv, graficos_latencia.csv
// Criterio igual que score_eval.mjs: porcentajes sobre todas las preguntas de cada grupo (40 por condición, 10 por tipo);
// la latencia media promedia solo las filas con latencia registrada.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { percentil } from './cifras.mjs';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'resultados', ...(process.env.EVAL_MODELO_ID ? ['modelos', process.env.EVAL_MODELO_ID] : []));

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
const p1 = (v) => (v == null ? '' : v.toFixed(1));
const lats = (xs, k) => xs.map((x) => x[k]).filter((x) => x !== '' && x != null).map(Number);
// Precisión y recall: promedio en % entre las preguntas que lo tienen definido (columna vacía en resultados.csv = no aplica).
// recall/precision/f1 = definición vigente («lo que la pregunta pide»); *_listado = primera definición (códigos listados / hasta 20).
const nums = (xs, k) => xs.map((x) => x[k]).filter((x) => x !== '' && x != null).map(Number);
const prom = (xs, k) => { const v = nums(xs, k); return v.length ? (100 * v.reduce((a, b) => a + b, 0) / v.length).toFixed(0) : ''; };
const prHead = ',recall_pct,precision_pct,f1_pct,preguntas_con_referencia,recall_listado_pct,precision_listado_pct,f1_listado_pct,preguntas_listado';
const pr = (xs) => [prom(xs, 'recall'), prom(xs, 'precision'), prom(xs, 'f1'), nums(xs, 'recall').length, prom(xs, 'recall_listado'), prom(xs, 'precision_listado'), prom(xs, 'f1_listado'), nums(xs, 'recall_listado').length].join(',');
const w = (name, head, lines) => fs.writeFileSync(path.join(OUT, name), [head, ...lines].join('\n') + '\n');

w('graficos_global.csv', 'condicion,exactitud_pct,citacion_pct,inventada_pct,ejecutadas,preguntas,exacta_estricta_pct,no_sustentadas_pct' + prHead,
  conds.map((c) => { const xs = rows.filter((r) => r.condicion === c); return [c, pct(xs, 'exacta'), pct(xs, 'cita'), pct(xs, 'inventada'), ejec(xs), xs.length, pct(xs, 'estricta'), pct(xs, 'no_sustentada')].join(',') + ',' + pr(xs); }));

w('graficos_por_tipo.csv', 'tipo,condicion,exactitud_pct,citacion_pct,inventada_pct,ejecutadas,preguntas,exacta_estricta_pct,no_sustentadas_pct' + prHead,
  tipos.flatMap((t) => conds.map((c) => { const xs = rows.filter((r) => r.tipo === t && r.condicion === c); return [t, c, pct(xs, 'exacta'), pct(xs, 'cita'), pct(xs, 'inventada'), ejec(xs), xs.length, pct(xs, 'estricta'), pct(xs, 'no_sustentada')].join(',') + ',' + pr(xs); })));

w('graficos_latencia.csv', 'condicion,latencia_media_s,latencia_mediana_s,latencia_p90_s,latencia_max_s,mediana_sin_reintentos_s,p90_sin_reintentos_s',
  conds.map((c) => { const xs = rows.filter((r) => r.condicion === c), t = lats(xs, 'latencia_s'), o = lats(xs, 'latencia_ok_s');
    return [c, lat(xs), p1(percentil(t, 0.5)), p1(percentil(t, 0.9)), p1(Math.max(...t)), p1(percentil(o, 0.5)), p1(percentil(o, 0.9))].join(','); }));

const pc = (v) => (v === '' || v == null ? '' : (100 * Number(v)).toFixed(0));
w('graficos_recall.csv', 'id,condicion,tipo_pedido,recall_pct,precision_pct,f1_pct,listado_esperados,listado_mencionados,listado_aciertos,recall_listado_pct,precision_listado_pct,f1_listado_pct',
  rows.filter((r) => r.tipo_pedido !== '').map((r) => [r.id, r.condicion, r.tipo_pedido, pc(r.recall), pc(r.precision), pc(r.f1), r.items_ref, r.items_mencionados, r.items_aciertos, pc(r.recall_listado), pc(r.precision_listado), pc(r.f1_listado)].join(',')));

console.log('Escrito en', OUT, ': graficos_global.csv, graficos_por_tipo.csv, graficos_latencia.csv, graficos_recall.csv');
