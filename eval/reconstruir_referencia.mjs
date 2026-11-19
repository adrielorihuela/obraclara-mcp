// Conjunto de referencia para precisión y recall de elementos (códigos únicos de obras).
// Para cada pregunta de búsqueda o alertas cuya respuesta es un conteo o una lista (unidad «cantidad»), llama a la herramienta esperada con los
// parámetros esperados (los filtros correctos) y guarda los códigos únicos que devuelve (hasta 20, el tope de la herramienta) y el total.
// Resultado: resultados/referencia_items.json (común a todos los modelos). Uso: node reconstruir_referencia.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const DIR = path.dirname(fileURLToPath(import.meta.url));
const MCP = 'https://obraclara.adrielorihuela.net/mcp';
async function llamar(name, args) {
  const r = await fetch(MCP, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name, arguments: args } }), signal: AbortSignal.timeout(60000) });
  const t = await r.text(); const line = t.split('\n').find((l) => l.startsWith('data: ')); const j = JSON.parse(line ? line.slice(6) : t);
  if (j.error) throw new Error(j.error.message);
  return JSON.parse((j.result.content || []).map((c) => c.text || '').join('\n'));
}
const out = {};
for (const q of parseCSV(fs.readFileSync(path.join(DIR, 'preguntas.csv'), 'utf8'))) {
  if (!['busqueda', 'alertas'].includes(q.tipo) || q.unidad !== 'cantidad') continue;
  const d = (await llamar(q.herramienta_esperada, { ...JSON.parse(q.parametros_esperados), limite: 20 })).datos || {};
  if (d.total !== Number(q.valor_oficial)) { console.log(q.id, 'omitida: el total', d.total, 'no es el valor oficial (no es un conteo/lista)'); continue; }
  out[q.id] = { total: d.total ?? 0, valor_oficial: Number(q.valor_oficial), codigos: (d.inversiones || []).map((i) => String(i.codigo_unico)) };
  console.log(q.id, 'total', out[q.id].total, 'oficial', q.valor_oficial, 'codigos', out[q.id].codigos.length);
}
fs.writeFileSync(path.join(DIR, 'resultados', 'referencia_items.json'), JSON.stringify(out, null, 1) + '\n');
