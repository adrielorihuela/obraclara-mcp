// Exporta 4 casos preparados para la página /demo: escribe worker/src/sitio/demo-datos.ts.
// Uso: node exportar_demo.mjs   (después de score_eval.mjs)
// corta y completa son Markdown (se muestran con evaluacion-md.ts); completa queda vacía si corta ya es la respuesta entera.
// Lee preguntas.csv, resultados/resultados.csv, raw_sin_mcp.jsonl, raw_con_mcp.jsonl y fuentes_con_mcp.json. No inventa nada.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { limpiarMd, recortarMd, claveRespuesta, claveReferencia, motivo } from './respuesta_md.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RES = path.join(AQUI, 'resultados');
const SALIDA = path.join(AQUI, '..', 'worker', 'src', 'sitio', 'demo-datos.ts');
// Un caso por herramienta, con contraste claro entre «IA sola» y «IA + MCP».
const CASOS = [['B02', 'buscar_inversiones'], ['D05', 'detalle_inversion'], ['A07', 'alertas_inversion'], ['R03', 'resumen_inversiones']];
const CAMPOS_LISTA = ['codigo_unico', 'nombre', 'entidad', 'nivel', 'costo_actualizado', 'monto_viable', 'sobrecosto_pct', 'meses_sin_devengado', 'avance_fisico'];

function csv(texto) {
  const filas = []; let f = [], c = '', q = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (q) { if (ch === '"') { if (texto[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { f.push(c); c = ''; }
    else if (ch === '\n') { f.push(c); filas.push(f); f = []; c = ''; }
    else if (ch !== '\r') c += ch;
  }
  if (c || f.length) { f.push(c); filas.push(f); }
  const [cab, ...resto] = filas;
  return resto.filter((r) => r.length > 1).map((r) => Object.fromEntries(cab.map((k, i) => [k, r[i] ?? ''])));
}
const jsonl = (f) => Object.fromEntries(fs.readFileSync(path.join(RES, f), 'utf8').split('\n').filter(Boolean).map((l) => { const o = JSON.parse(l); return [o.id, o]; }));

const preguntas = Object.fromEntries(csv(fs.readFileSync(path.join(AQUI, 'preguntas.csv'), 'utf8')).map((r) => [r.id, r]));
const filas = csv(fs.readFileSync(path.join(RES, 'resultados.csv'), 'utf8'));
const res = {}; for (const r of filas) (res[r.id] ??= {})[r.condicion] = r;
const rawSin = jsonl('raw_sin_mcp.jsonl'), rawCon = jsonl('raw_con_mcp.jsonl');
const fuentes = JSON.parse(fs.readFileSync(path.join(RES, 'fuentes_con_mcp.json'), 'utf8'));

// Respuesta en Markdown (sin el marcado interno del proveedor), recortada por bloques; la cifra clave que se compara.
const lado = (id, cond, raw) => {
  const r = res[id][cond], md = limpiarMd(raw[id].answer), exacta = r.exacta === '1', inventada = r.inventada === '1';
  const c = recortarMd(md, 380, 6), todo = recortarMd(md, 2400, 12);
  return { corta: c.md, completa: c.cortada ? todo.md : '', clave: claveRespuesta(preguntas[id], raw[id].answer, exacta), veredicto: motivo(preguntas[id], exacta, inventada), exacta, cita: r.cita === '1', inventada, latencia_s: Number(raw[id].latency_s) };
};

const casos = CASOS.map(([id, herramienta]) => {
  const p = preguntas[id];
  const llamada = fuentes[id].find((x) => x.name === herramienta);
  if (!llamada) throw new Error(`${id}: sin llamada a ${herramienta} en fuentes_con_mcp.json`);
  const sal = JSON.parse(llamada.result);
  const datos = { ...sal.datos };
  if (Array.isArray(datos.inversiones)) datos.inversiones = datos.inversiones.slice(0, 8).map((i) => Object.fromEntries(CAMPOS_LISTA.filter((k) => k in i).map((k) => [k, i[k]])));
  const args = { ...llamada.args };
  return { id, tipo: p.tipo, herramienta, pregunta: p.pregunta, referencia: p.respuesta_referencia, referencia_clave: claveReferencia(p), args, datos, fecha_corte: sal.fecha_descarga ?? p.fecha_corte, sin: lado(id, 'sin_mcp', rawSin), con: lado(id, 'con_mcp', rawCon) };
});

const todos = Object.keys(preguntas);
const cuenta = (cond, campo) => todos.filter((id) => res[id]?.[cond]?.[campo] === '1').length;
const resumen = { total: todos.length, sin: { exactas: cuenta('sin_mcp', 'exacta'), citas: cuenta('sin_mcp', 'cita'), inventadas: cuenta('sin_mcp', 'inventada') }, con: { exactas: cuenta('con_mcp', 'exacta'), citas: cuenta('con_mcp', 'cita'), inventadas: cuenta('con_mcp', 'inventada') } };

const ts = `// GENERADO por eval/exportar_demo.mjs desde eval/resultados. No editar a mano.\nexport interface LadoDemo { corta: string; completa: string; clave: string; veredicto: string; exacta: boolean; cita: boolean; inventada: boolean; latencia_s: number }\nexport interface CasoDemo { id: string; tipo: string; herramienta: string; pregunta: string; referencia: string; referencia_clave: string; args: Record<string, unknown>; datos: Record<string, unknown>; fecha_corte: string; sin: LadoDemo; con: LadoDemo }\nexport const CASOS_DEMO: CasoDemo[] = ${JSON.stringify(casos, null, 1)};\nexport const RESUMEN_DEMO = ${JSON.stringify(resumen)};\n`;
fs.writeFileSync(SALIDA, ts);
console.log(`demo-datos.ts: ${casos.length} casos, ${(ts.length / 1024).toFixed(1)} KB; resumen`, JSON.stringify(resumen));
