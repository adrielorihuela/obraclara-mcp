// Reproduce las llamadas a herramientas ya registradas en raw_con_mcp.jsonl (mismo nombre y argumentos) contra el servidor MCP
// público y guarda los resultados en resultados/fuentes_con_mcp.json. NO consulta a la IA: solo al servidor de datos (determinista,
// corte 2026-11-10). Sirve para puntuar la «exacta estricta» y las «cifras no sustentadas». Comprueba que result_chars coincida.
// Uso: node reconstruir_fuentes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'resultados', ...(process.env.EVAL_MODELO_ID ? ['modelos', process.env.EVAL_MODELO_ID] : [])); // EVAL_MODELO_ID guarda la corrida de otro modelo en resultados/modelos/<id>/
const MCP = 'https://obraclara.adrielorihuela.net/mcp';

async function rpc(method, params) {
  const r = await fetch(MCP, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }), signal: AbortSignal.timeout(60000),
  });
  const t = await r.text();
  const line = t.split('\n').find((l) => l.startsWith('data: '));
  const j = JSON.parse(line ? line.slice(6) : t);
  if (j.error) throw new Error(j.error.message);
  return j.result;
}
const llamar = async (name, args) => ((await rpc('tools/call', { name, arguments: args })).content || []).map((c) => c.text || '').join('\n');

const last = new Map();
for (const l of fs.readFileSync(path.join(OUT, 'raw_con_mcp.jsonl'), 'utf8').split('\n').filter(Boolean)) {
  const r = JSON.parse(l);
  const ok = r.answer != null && !(r.errors || []).some((e) => e.startsWith('final'));
  if (!last.has(r.id) || ok) last.set(r.id, r);
}
// Descripciones de las herramientas: el modelo las recibe en su instrucción; traen los umbrales de las alertas (40 %, 99 %, 50 %).
const salida = { _herramientas: ((await rpc('tools/list', {})).tools || []).map((t) => `${t.name}: ${t.description}`).join('\n') };
let iguales = 0, total = 0;
for (const [id, r] of last) {
  salida[id] = [];
  for (const c of r.tool_calls || []) {
    let texto = null, error = null;
    try { texto = await llamar(c.name, c.args); } catch (e) { error = e.message; }
    total++;
    const mismo = texto != null && texto.length === c.result_chars;
    if (mismo) iguales++;
    else console.log(`${id} ${c.name}: ${error || `largo ${texto?.length} != registrado ${c.result_chars}`}`);
    salida[id].push({ name: c.name, args: c.args, result: texto, mismo_largo: mismo, error });
  }
}
fs.writeFileSync(path.join(OUT, 'fuentes_con_mcp.json'), JSON.stringify(salida));
console.log(`${iguales}/${total} resultados con el mismo largo que el registrado`);
