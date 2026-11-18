// Exporta las métricas al sitio: escribe worker/src/sitio/metricas-datos.ts a partir de metricas/resultados/*.csv.
// Uso: node metricas/exportar_sitio.mjs   (después de ejecutar las mediciones, ver LEEME.md). No inventa nada: cada número sale de los CSV.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RES = path.join(AQUI, 'resultados');
const SALIDA = path.join(AQUI, '..', 'worker', 'src', 'sitio', 'metricas-datos.ts');

function parseCSV(t) {
  t = t.replace(/^﻿/, '');
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
const csv = (n) => parseCSV(fs.readFileSync(path.join(RES, n), 'utf8'));
const N = (v) => Number(v);

const nulos = csv('calidad_nulos.csv');
const CLAVE = ['avance_fisico', 'ultimo_devengado', 'avance_ejecucion', 'habitantes', 'fec_ini_ejecucion', 'monto_viable', 'ubigeo', 'departamento', 'costo_actualizado'];
const por_nivel = csv('calidad_por_nivel.csv'), al_nivel = csv('alertas_por_nivel.csv');
const pruebas = csv('pruebas.csv'), cob = csv('cobertura.csv');
const tot = pruebas.find((r) => r.archivo === 'TOTAL');
const exh = csv('exactitud_herramientas.csv'), exa = csv('exactitud_alertas.csv'), exr = csv('exactitud_resumenes.csv'), exd = csv('exactitud_detalle.csv');
const meta = JSON.parse(fs.readFileSync(path.join(RES, 'metricas.json'), 'utf8'));

const D = {
  generado: meta.generado,
  corte: meta.corte_datos,
  filas: por_nivel.reduce((s, r) => s + N(r.inversiones), 0),
  vacios: CLAVE.map((c) => { const r = nulos.find((x) => x.columna === c); return { columna: c, nulos: N(r.nulos), pct: N(r.pct_nulos) }; }),
  porNivel: por_nivel.map((r) => ({ nivel: r.nivel, inversiones: N(r.inversiones), pct: N(r.pct) })),
  topDepartamentos: csv('calidad_por_departamento_top10.csv').map((r) => ({ departamento: r.departamento, inversiones: N(r.inversiones), pct: N(r.pct) })),
  alertasTotales: csv('alertas_totales.csv').map((r) => ({ alerta: r.alerta, inversiones: N(r.inversiones), pct: N(r.pct_del_total) })),
  alertasPorNivel: al_nivel.map((r) => ({ nivel: r.nivel, inversiones: N(r.inversiones), sobrecosto: N(r.sobrecosto), pctSobrecosto: N(r.pct_sobrecosto), paralizacion: N(r.paralizacion), pctParalizacion: N(r.pct_paralizacion) })),
  alertasTopDepartamentos: csv('alertas_por_departamento_top10.csv').map((r) => ({ departamento: r.departamento, sobrecosto: N(r.sobrecosto), pctSobrecosto: N(r.pct_sobrecosto), paralizacion: N(r.paralizacion), pctParalizacion: N(r.pct_paralizacion) })),
  histSobrecosto: csv('alertas_hist_sobrecosto.csv').map((r) => ({ tramo: r.tramo, inversiones: N(r.inversiones), pct: N(r.pct) })),
  histMeses: csv('alertas_hist_meses_sin_devengado.csv').map((r) => ({ tramo: r.tramo, inversiones: N(r.inversiones), pct: N(r.pct) })),
  rendimiento: csv('rendimiento_mcp.csv').map((r) => ({ prueba: r.prueba, llamadas: N(r.llamadas), exitosas: N(r.exitosas), exito: N(r.tasa_exito_pct), p50: N(r.lat_p50_ms), p95: N(r.lat_p95_ms), max: N(r.lat_max_ms) })),
  exactitud: {
    detalle: { casos: N(exh[0].casos), coinciden: N(exh[0].coinciden), campos: N(exh[0].campos_comparados), camposIguales: N(exh[0].campos_iguales) },
    resumen: { casos: N(exh[1].casos), coinciden: N(exh[1].coinciden), campos: N(exh[1].campos_comparados), camposIguales: N(exh[1].campos_iguales) },
    alertas: { casos: exa.length, coinciden: exa.filter((r) => r.coincide === 'True').length },
    resumenes: exr.length, detalles: exd.length,
  },
  pruebas: { total: N(tot.pruebas), pasan: N(tot.pasan), fallan: N(tot.fallan), archivos: pruebas.length - 1, coberturaLineas: N(cob.find((r) => r.archivo === 'TOTAL').lineas_pct), coberturaLogica: N(cob.find((r) => r.archivo.startsWith('TOTAL solo')).lineas_pct) },
  asistente: csv('asistente_resumen.csv').map((r) => ({ modo: r.modo, preguntas: N(r.preguntas), exitosas: N(r.exitosas), media: N(r.media_s), p50: N(r.p50_s), max: N(r.max_s) })),
};
fs.writeFileSync(SALIDA, '// GENERADO por metricas/exportar_sitio.mjs a partir de metricas/resultados/. No editar a mano: vuelve a ejecutar `node metricas/exportar_sitio.mjs`.\nexport const METRICAS = ' + JSON.stringify(D, null, 1) + ' as const;\n');
console.log('escrito', SALIDA);
