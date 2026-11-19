// Exporta 4 casos preparados para la página /demo: escribe worker/src/sitio/demo-datos.ts.
// Uso: node exportar_demo.mjs   (después de score_eval.mjs)
// Lee preguntas.csv, resultados/resultados.csv, raw_sin_mcp.jsonl, raw_con_mcp.jsonl y fuentes_con_mcp.json. No inventa nada.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RES = path.join(AQUI, 'resultados');
const SALIDA = path.join(AQUI, '..', 'worker', 'src', 'sitio', 'demo-datos.ts');
// Un caso por herramienta, con contraste claro entre «IA sola» y «IA + MCP».
const CASOS = [['B02', 'buscar_inversiones'], ['D04', 'detalle_inversion'], ['A07', 'alertas_inversion'], ['R03', 'resumen_inversiones']];
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

// Texto plano: quita el marcado interno que a veces trae la respuesta de la IA sola y el Markdown.
function limpiar(t) {
  return String(t ?? '')
    .replace(/\\n/g, '\n').replace(/\\([:.\-()])/g, '$1')
    .replace(/<badge[^>]*>[\s\S]*?<\/badge>/g, '').replace(/<Link[^>]*title="([^"]*)"[^>]*\/>/g, '$1')
    .replace(/<[A-Za-z][^<>]*\/>/g, '').replace(/<\/?[A-Za-z][^<>]*>/g, '')
    .replace(/^\*\s/gm, '- ').replace(/\*+|__/g, '').replace(/^#{1,6}\s+/gm, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
const corta = (t, n) => { if (t.length <= n) return t; const c = t.slice(0, n); return c.slice(0, Math.max(c.lastIndexOf(' '), n * 0.6)).replace(/[\s,;:.]+$/, '') + '…'; };

const preguntas = Object.fromEntries(csv(fs.readFileSync(path.join(AQUI, 'preguntas.csv'), 'utf8')).map((r) => [r.id, r]));
const filas = csv(fs.readFileSync(path.join(RES, 'resultados.csv'), 'utf8'));
const res = {}; for (const r of filas) (res[r.id] ??= {})[r.condicion] = r;
const rawSin = jsonl('raw_sin_mcp.jsonl'), rawCon = jsonl('raw_con_mcp.jsonl');
const fuentes = JSON.parse(fs.readFileSync(path.join(RES, 'fuentes_con_mcp.json'), 'utf8'));

const lado = (id, cond, raw) => {
  const r = res[id][cond], txt = limpiar(raw[id].answer);
  return { corta: corta(txt, 300), completa: corta(txt, 2200), exacta: r.exacta === '1', cita: r.cita === '1', inventada: r.inventada === '1', latencia_s: Number(raw[id].latency_s) };
};

const casos = CASOS.map(([id, herramienta]) => {
  const p = preguntas[id];
  const llamada = fuentes[id].find((x) => x.name === herramienta);
  if (!llamada) throw new Error(`${id}: sin llamada a ${herramienta} en fuentes_con_mcp.json`);
  const sal = JSON.parse(llamada.result);
  const datos = { ...sal.datos };
  if (Array.isArray(datos.inversiones)) datos.inversiones = datos.inversiones.slice(0, 8).map((i) => Object.fromEntries(CAMPOS_LISTA.filter((k) => k in i).map((k) => [k, i[k]])));
  const args = { ...llamada.args };
  return { id, tipo: p.tipo, herramienta, pregunta: p.pregunta, referencia: p.respuesta_referencia, args, datos, fecha_corte: sal.fecha_descarga ?? p.fecha_corte, sin: lado(id, 'sin_mcp', rawSin), con: lado(id, 'con_mcp', rawCon) };
});

const todos = Object.keys(preguntas);
const cuenta = (cond, campo) => todos.filter((id) => res[id]?.[cond]?.[campo] === '1').length;
const resumen = { total: todos.length, sin: { exactas: cuenta('sin_mcp', 'exacta'), citas: cuenta('sin_mcp', 'cita'), inventadas: cuenta('sin_mcp', 'inventada') }, con: { exactas: cuenta('con_mcp', 'exacta'), citas: cuenta('con_mcp', 'cita'), inventadas: cuenta('con_mcp', 'inventada') } };

const ts = `// GENERADO por eval/exportar_demo.mjs desde eval/resultados. No editar a mano.\nexport interface LadoDemo { corta: string; completa: string; exacta: boolean; cita: boolean; inventada: boolean; latencia_s: number }\nexport interface CasoDemo { id: string; tipo: string; herramienta: string; pregunta: string; referencia: string; args: Record<string, unknown>; datos: Record<string, unknown>; fecha_corte: string; sin: LadoDemo; con: LadoDemo }\nexport const CASOS_DEMO: CasoDemo[] = ${JSON.stringify(casos, null, 1)};\nexport const RESUMEN_DEMO = ${JSON.stringify(resumen)};\n`;
fs.writeFileSync(SALIDA, ts);
console.log(`demo-datos.ts: ${casos.length} casos, ${(ts.length / 1024).toFixed(1)} KB; resumen`, JSON.stringify(resumen));
