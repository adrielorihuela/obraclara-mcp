// Evaluación ObraClara: 40 preguntas sin MCP vs con MCP, usando gpt-headless (127.0.0.1:8765).
// Uso: node run_eval.mjs [--solo sin_mcp|con_mcp] [--ids B01,B02] [--max N]
// Reanudable: salta los ids que ya están en resultados/raw_<condicion>.jsonl.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'resultados');
const GPT = 'http://127.0.0.1:8765/v1/chat/completions';
const MCP = 'https://obraclara.adrielorihuela.net/mcp';
const MAX_STEPS = 5;
const MAX_TOOL_CHARS = 15000;
fs.mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const solo = opt('--solo');
const onlyIds = opt('--ids')?.split(',');
const maxN = Number(opt('--max') || Infinity);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- CSV ---
export function parseCSV(text) {
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

// --- gpt-headless ---
async function askOnce(messages) {
  const r = await fetch(GPT, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-anon', messages }), signal: AbortSignal.timeout(300000),
  });
  const j = await r.json().catch(() => ({ error: { message: 'respuesta no JSON (HTTP ' + r.status + ')' } }));
  if (!r.ok || j.error) throw new Error(j.error?.message || 'HTTP ' + r.status);
  return j.choices[0].message.content;
}
async function ask(messages, errors) {
  await sleep(2000);
  try { return await askOnce(messages); }
  catch (e) {
    errors.push('ask: ' + e.message);
    await sleep(5000);
    return await askOnce(messages); // un reintento; si falla, se propaga
  }
}

// --- MCP ---
async function mcp(method, params) {
  const r = await fetch(MCP, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }), signal: AbortSignal.timeout(60000),
  });
  const t = await r.text();
  const line = t.split('\n').find((l) => l.startsWith('data: '));
  const j = JSON.parse(line ? line.slice(6) : t);
  if (j.error) throw new Error('MCP ' + j.error.code + ': ' + j.error.message);
  return j.result;
}

function toolsText(tools) {
  return tools.map((t) => {
    const props = t.inputSchema?.properties || {};
    const req = t.inputSchema?.required || [];
    const ps = Object.entries(props).map(([k, v]) => {
      const extra = v.enum ? ` (uno de: ${v.enum.join(', ')})` : '';
      return `    - ${k} (${v.type}${req.includes(k) ? ', obligatorio' : ', opcional'})${extra}: ${v.description || ''}`;
    }).join('\n');
    return `- ${t.name}: ${t.description}\n  Parámetros:\n${ps}`;
  }).join('\n');
}

// --- parseo robusto de la salida del modelo ---
export function extractJSON(text) {
  const cands = [];
  for (const m of text.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)) cands.push(m[1]);
  // objetos balanceados en el texto
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue;
    let d = 0, s = false, esc = false;
    for (let k = i; k < text.length; k++) {
      const c = text[k];
      if (s) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') s = false; continue; }
      if (c === '"') s = true; else if (c === '{') d++;
      else if (c === '}') { d--; if (d === 0) { cands.push(text.slice(i, k + 1)); break; } }
    }
  }
  for (const c of cands) {
    try { const o = JSON.parse(c.trim()); if (o && typeof o === 'object' && (o.tool || 'respuesta' in o)) return o; } catch {}
  }
  return null;
}

const SYS_A = 'Responde en español, con datos oficiales del Perú y cita la fuente.';

function sysB(tools) {
  return `Eres un asistente que responde preguntas sobre inversión pública del Perú usando herramientas de ObraClara (datos del MEF).
Esta conversación la lee un programa conectado al servidor ObraClara: cuando respondes con un JSON {"tool":...}, el programa ejecuta esa herramienta de verdad y te envía el resultado en el siguiente mensaje. Por lo tanto SÍ tienes acceso a las herramientas a través de este protocolo; no digas que no tienes acceso. Empieza llamando a la herramienta adecuada.
Herramientas disponibles:
${toolsText(tools)}

Protocolo (obligatorio):
1. Para llamar a una herramienta responde SOLO con un objeto JSON, sin texto adicional: {"tool":"<nombre>","args":{...}}
2. Recibirás el resultado de la herramienta en el siguiente mensaje; entonces continúa (puedes llamar a otra herramienta).
3. Cuando termines responde SOLO con un objeto JSON: {"respuesta":"<respuesta final en español, citando la fuente y la fecha_descarga que devolvió la herramienta>"}
4. Si una herramienta no devuelve datos, dilo; no inventes cifras ni códigos.
Tienes como máximo ${MAX_STEPS} pasos.`;
}

async function runA(q) {
  const errors = []; const t0 = Date.now();
  let answer = null;
  try { answer = await ask([{ role: 'system', content: SYS_A }, { role: 'user', content: q.pregunta }], errors); }
  catch (e) { errors.push('final: ' + e.message); }
  return { id: q.id, tipo: q.tipo, condicion: 'sin_mcp', answer, tool_calls: [], steps: answer ? 1 : 0,
    latency_s: +((Date.now() - t0) / 1000).toFixed(1), errors, sin_json_final: false };
}

async function runB(q, tools, toolNames) {
  const errors = []; const t0 = Date.now(); const calls = [];
  const msgs = [{ role: 'system', content: sysB(tools) }, { role: 'user', content: q.pregunta }];
  let answer = null, lastText = null, steps = 0, noFinal = false;
  try {
    while (steps < MAX_STEPS) {
      steps++;
      const out = await ask(msgs, errors);
      lastText = out;
      msgs.push({ role: 'assistant', content: out });
      const o = extractJSON(out);
      if (o && 'respuesta' in o && !o.tool) { answer = String(o.respuesta); break; }
      if (o && o.tool) {
        const a = o.args && typeof o.args === 'object' ? o.args : {};
        const call = { name: o.tool, args: a };
        let res;
        if (!toolNames.has(o.tool)) { res = `Error: la herramienta «${o.tool}» no existe.`; call.error = 'herramienta inexistente'; }
        else {
          try {
            const r = await mcp('tools/call', { name: o.tool, arguments: a });
            res = (r.content || []).map((c) => c.text || '').join('\n');
            if (r.isError) call.error = res.slice(0, 300);
          } catch (e) { res = 'Error al llamar a la herramienta: ' + e.message; call.error = e.message; }
        }
        call.result_chars = res.length;
        calls.push(call);
        if (res.length > MAX_TOOL_CHARS) res = res.slice(0, MAX_TOOL_CHARS) + '\n[... resultado recortado por longitud]';
        const left = MAX_STEPS - steps;
        msgs.push({ role: 'user', content: `RESULTADO DE ${o.tool}:\n${res}\n\n${left > 0 ? `Te quedan ${left} pasos. Responde SOLO con JSON (otra llamada o {"respuesta":"..."}).` : 'No quedan pasos: responde ahora SOLO con {"respuesta":"..."}.'}` });
        if (left === 0) { // un último turno para la respuesta final
          const fin = await ask(msgs, errors); lastText = fin; steps++;
          const f = extractJSON(fin);
          if (f && 'respuesta' in f && !f.tool) answer = String(f.respuesta);
          break;
        }
        continue;
      }
      // ni llamada ni final: tratar como respuesta en texto libre
      break;
    }
  } catch (e) { errors.push('final: ' + e.message); }
  if (answer == null && lastText != null) { answer = lastText; noFinal = true; }
  return { id: q.id, tipo: q.tipo, condicion: 'con_mcp', answer, tool_calls: calls, steps,
    latency_s: +((Date.now() - t0) / 1000).toFixed(1), errors, sin_json_final: noFinal };
}

function done(file) {
  if (!fs.existsSync(file)) return new Set();
  return new Set(fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
    .filter((r) => r.answer != null).map((r) => r.id));
}

async function main() {
  let qs = parseCSV(fs.readFileSync(path.join(DIR, 'preguntas.csv'), 'utf8'));
  if (onlyIds) qs = qs.filter((q) => onlyIds.includes(q.id));
  const tools = (await mcp('tools/list', {})).tools;
  const toolNames = new Set(tools.map((t) => t.name));
  const conds = [['sin_mcp', runA], ['con_mcp', (q) => runB(q, tools, toolNames)]].filter(([c]) => !solo || c === solo);
  let n = 0, consecutiveFail = 0;
  for (const q of qs) {
    for (const [c, fn] of conds) {
      const file = path.join(OUT, `raw_${c}.jsonl`);
      if (done(file).has(q.id)) continue;
      if (n++ >= maxN) return;
      const r = await fn(q);
      fs.appendFileSync(file, JSON.stringify(r) + '\n');
      console.log(`${q.id} ${c} ${r.latency_s}s pasos=${r.steps} llamadas=${r.tool_calls.length}${r.errors.length ? ' errores=' + r.errors.length : ''}${r.answer == null ? ' SIN RESPUESTA' : ''}`);
      consecutiveFail = r.answer == null ? consecutiveFail + 1 : 0;
      if (consecutiveFail >= 3) { console.log('3 fallos seguidos: me detengo. Último error: ' + r.errors.at(-1)); process.exit(2); }
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
