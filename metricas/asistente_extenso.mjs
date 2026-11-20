// Tiempo de respuesta del asistente de extremo a extremo (con las herramientas MCP) y % de respuestas correctas.
// Uso: node metricas/asistente_extenso.mjs [--por-tipo 6] [--pausa 8]
// Envía en SERIE (una a la vez, con pausa) preguntas variadas del banco de 40 (eval/preguntas.csv) a POST /api/agente del sitio público.
// Verificador: la misma regla de «respuesta exacta» de eval/score_eval.mjs (cifra oficial con tolerancia del 1 %, entidad esperada o «sin datos»).
// Si un proveedor está en su límite (p. ej. «Sign in to continue») NO se esquiva: se registra el error y se sigue con la siguiente pregunta.
// Salida: metricas/resultados/asistente_extenso.csv (una fila por pregunta), asistente_extenso_resumen.csv y partes/asistente_extenso.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, extractNumbers, limpiarRespuesta, percentil } from '../eval/cifras.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RES = path.join(DIR, 'resultados');
const BASE = process.env.OBRACLARA_URL || 'https://obraclara.adrielorihuela.net';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : d; };
const POR_TIPO = opt('--por-tipo', 6), PAUSA = opt('--pausa', 8) * 1000, ESPERA = 300000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TOL = 0.01;
const NODATA = /no he podido (?:identificar|encontrar|ubicar)|no (?:existen|hay|se (?:encontr|registr|identific|hall)|encontr|registra|tiene|figura|aparece|devolvi)|ningun[ao]?\b|sin resultados|0 (?:resultados|inversiones|proyectos|obras)|cero (?:resultados|inversiones|proyectos|obras)|no se dispone|no devuelve (?:datos|resultados)/;
const MEF = /\bmef\b|ministerio de economia y finanzas|datosabiertos\.gob\.pe|detalle_inversiones|consulta amigable|invierte\.pe|banco de inversiones/;
const FECHA = /2026-11-10|10\/11\/2026|10-11-2026|10 de noviembre(?: del?)? 2026|fecha[_ ]de[_ ]descarga|fecha_descarga|descargad[oa]s? el|corte (?:al|del?) 10/;

// Misma regla de «exacta» que eval/score_eval.mjs (versión mínima: no marca «revisar» ni «inventada»).
function exacta(q, answer) {
  const a = norm(answer);
  if (!answer) return false;
  const isNoData = /no existen resultados/i.test(q.respuesta_referencia) || (q.valor_oficial !== '' && Number(q.valor_oficial) === 0);
  if (isNoData) return NODATA.test(a);
  if (q.unidad === 'texto') {
    const exp = (q.respuesta_referencia.match(/\b[A-ZÁÉÍÓÚÑ]{3,}(?: (?:DE |DEL |Y |LA |LOS |LAS )?[A-ZÁÉÍÓÚÑ-]{2,})+/g) || []).map(norm);
    return exp.flatMap((e) => (e === 'ministerio de salud' ? [e, 'minsa'] : [e])).some((e) => a.includes(e));
  }
  const val = Number(q.valor_oficial);
  const qNums = new Set(extractNumbers(q.pregunta).map((x) => x.v));
  const nums = extractNumbers(limpiarRespuesta(answer)).filter((x) => !qNums.has(x.v) && !(Number.isInteger(x.v) && x.v >= 1990 && x.v <= 2035 && !x.pct));
  return nums.some((x) => Math.abs(x.v - val) <= TOL * Math.abs(val));
}

// Nombre público del modelo: el servicio propio del grupo se llama «IA del servidor»; los respaldos conservan su nombre.
const modeloPublico = (m) => (!m || /chatgpt|gpt-headless/i.test(m) ? 'IA del servidor' : m);

// Lector de CSV mínimo (el de eval/run_eval.mjs no se puede importar: ejecuta la evaluación al cargarse).
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
const banco = parseCSV(fs.readFileSync(path.join(DIR, '..', 'eval', 'preguntas.csv'), 'utf8'));
const elegidas = [];
for (const tipo of ['busqueda', 'detalle', 'alertas', 'resumen']) {
  const g = banco.filter((q) => q.tipo === tipo);
  const paso = g.length / POR_TIPO;
  for (let i = 0; i < POR_TIPO; i++) elegidas.push(g[Math.floor(i * paso)]); // reparto uniforme y reproducible
}
// Intercalar tipos para que ninguna categoría coincida con una hora distinta
const orden = []; for (let i = 0; i < POR_TIPO; i++) for (let t = 0; t < 4; t++) orden.push(elegidas[t * POR_TIPO + i]);

const inicio = new Date().toISOString();
const filas = [];
for (const q of orden) {
  const t = performance.now(); let est = 0, cuerpo = {}, err = '';
  try {
    const r = await fetch(BASE + '/api/agente', {
      method: 'POST', headers: { 'content-type': 'application/json', origin: BASE, 'user-agent': 'obraclara-metricas/1.0' },
      body: JSON.stringify({ mensaje: q.pregunta, mcp: true }), signal: AbortSignal.timeout(ESPERA),
    });
    est = r.status; const txt = await r.text();
    try { cuerpo = JSON.parse(txt); } catch { err = txt.slice(0, 120); }
    if (est !== 200) err = (cuerpo.error || err || 'HTTP ' + est).toString().slice(0, 160);
  } catch (e) { err = String(e.message || e).slice(0, 160); }
  const seg = (performance.now() - t) / 1000;
  const ans = est === 200 ? (cuerpo.respuesta || '') : '';
  const ok = est === 200 && !!ans;
  const fila = { id: q.id, tipo: q.tipo, estado_http: est, exito: ok ? 1 : 0, segundos: +seg.toFixed(1), correcta: ok && exacta(q, ans) ? 1 : 0,
    cita_fuente: ok && MEF.test(norm(ans)) && FECHA.test(norm(ans)) ? 1 : 0, modelo: ok ? modeloPublico(cuerpo.modelo) : '', error: ok ? '' : err || 'respuesta vacía', pregunta: q.pregunta, respuesta: ans.replace(/\s+/g, ' ').slice(0, 400) };
  filas.push(fila);
  console.log(`${q.id} ${fila.estado_http} ${fila.segundos}s correcta=${fila.correcta} ${fila.modelo}${fila.error ? ' ERROR ' + fila.error : ''}`);
  await sleep(PAUSA);
}
const fin = new Date().toISOString();

const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const writeCsv = (name, rows) => fs.writeFileSync(path.join(RES, name), '﻿' + [Object.keys(rows[0]).join(','), ...rows.map((r) => Object.values(r).map(csvCell).join(','))].join('\n') + '\n');
const resumen = (nombre, xs) => {
  const ok = xs.filter((x) => x.exito), s = ok.map((x) => x.segundos);
  const f = (v) => (v == null ? '' : +v.toFixed(1));
  return { grupo: nombre, preguntas: xs.length, con_respuesta: ok.length, errores: xs.length - ok.length, correctas: ok.filter((x) => x.correcta).length,
    pct_correctas: ok.length ? +(100 * ok.filter((x) => x.correcta).length / ok.length).toFixed(1) : '', pct_correctas_sobre_total: +(100 * xs.filter((x) => x.correcta).length / xs.length).toFixed(1),
    media_s: ok.length ? f(s.reduce((a, b) => a + b, 0) / s.length) : '', mediana_s: f(percentil(s, 0.5)), p90_s: f(percentil(s, 0.9)), min_s: s.length ? f(Math.min(...s)) : '', max_s: s.length ? f(Math.max(...s)) : '' };
};
const res = [resumen('todas', filas), ...['busqueda', 'detalle', 'alertas', 'resumen'].map((t) => resumen(t, filas.filter((x) => x.tipo === t)))];
const modelos = {}; for (const x of filas) if (x.exito) modelos[x.modelo] = (modelos[x.modelo] || 0) + 1;
fs.mkdirSync(path.join(RES, 'partes'), { recursive: true });
writeCsv('asistente_extenso.csv', filas); writeCsv('asistente_extenso_resumen.csv', res);
fs.writeFileSync(path.join(RES, 'partes', 'asistente_extenso.json'), JSON.stringify({ inicio, fin, url: BASE, endpoint: 'POST /api/agente (mcp: true)', pausa_s: PAUSA / 1000, modelos, resumen: res, detalle: filas,
  nota: 'Preguntas en serie con pausa; tiempo de punta a punta desde Lima, incluye cola y reintentos de la IA del servidor. Los límites de un proveedor no se esquivan: se registran como error.' }, null, 2));
console.log(JSON.stringify(res[0]), modelos);
