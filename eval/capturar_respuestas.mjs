// Captura, en el chat real del sitio (/asistente), cada respuesta registrada en la evaluación: 40 preguntas × 2
// condiciones (sin MCP / con MCP) → worker/public/evaluacion/capturas/<id>-<sin|con>.webp e índice capturas/LEEME.md.
// NO vuelve a preguntar a la IA: abre el chat, le carga la conversación registrada (pregunta, herramientas con sus
// argumentos reales y respuesta) con la misma función con la que el chat reabre un chat guardado, y la fotografía.
// Las llamadas de red del chat se interceptan (page.route): ninguna petición llega a la IA.
//
// Uso (un comando; arranca `wrangler dev --local` en worker/ si no hay uno en el puerto 8791):
//   node eval/capturar_respuestas.mjs [http://localhost:8791] [B01,R02…]
// PW por defecto: el Playwright de Cortex (~/.local/share/cortex/versions/<current>/node_modules/playwright).
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RES = join(AQUI, 'resultados');
const SALIDA = join(AQUI, '..', 'worker', 'public', 'evaluacion', 'capturas');
const BASE = process.argv[2] || 'http://localhost:8791';
const SOLO = process.argv[3] ? new Set(process.argv[3].split(',')) : null;

function playwright() {
  if (process.env.PW) return process.env.PW;
  const raiz = join(homedir(), '.local/share/cortex');
  const v = readFileSync(join(raiz, 'current'), 'utf8').trim();
  process.env.PLAYWRIGHT_BROWSERS_PATH ||= join(raiz, 'runtime/browsers');
  return join(raiz, 'versions', v, 'node_modules/playwright');
}
const { chromium } = createRequire(import.meta.url)(playwright());

// CSV con comillas (mismo formato que escribe score_eval.mjs).
function csv(txt) {
  const filas = []; let f = [], c = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (q) { if (ch === '"' && txt[i + 1] === '"') { c += '"'; i++; } else if (ch === '"') q = false; else c += ch; continue; }
    if (ch === '"') q = true; else if (ch === ',') { f.push(c); c = ''; } else if (ch === '\n') { f.push(c); filas.push(f); f = []; c = ''; } else if (ch !== '\r') c += ch;
  }
  if (c || f.length) { f.push(c); filas.push(f); }
  const [cab, ...resto] = filas;
  return resto.filter((r) => r.length > 1).map((r) => Object.fromEntries(cab.map((k, i) => [k, r[i]])));
}

const preguntas = Object.fromEntries(csv(readFileSync(join(AQUI, 'preguntas.csv'), 'utf8')).map((p) => [p.id, p]));
const puntaje = Object.fromEntries(csv(readFileSync(join(RES, 'resultados.csv'), 'utf8')).map((r) => [`${r.id}-${r.condicion}`, r]));
const raw = (c) => readFileSync(join(RES, `raw_${c}.jsonl`), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const fuentes = JSON.parse(readFileSync(join(RES, 'fuentes_con_mcp.json'), 'utf8'));

// R02, R03 y R07–R10 se ejecutaron el 18/11/2026 (ver resultados/resumen.md); el resto, el 10/11/2026.
export const fechaDe = (id) => (['R02', 'R03', 'R07', 'R08', 'R09', 'R10'].includes(id) ? '18/11/2026' : '10/11/2026');
export function veredicto(s) {
  if (s.exacta !== '1') return '✗ no exacta' + (s.inventada === '1' ? ' · con cifras inventadas' : '');
  return s.estricta === '1' ? '✓ exacta' : '✓ exacta (laxa) · ✗ no exacta (estricta): otra cifra sin fuente';
}
// Mismo texto que guardó la evaluación; solo se quita el marcado interno del proveedor (etiquetas, saltos escapados),
// igual que en el resto del sitio. No se resume ni se corrige nada.
const textoChat = (t) => String(t ?? '')
  .replace(/\\+n/g, '\n').replace(/\\+$/gm, '').replace(/\\([:.\-()])/g, '$1')
  .replace(/<badge[^>]*>[\s\S]*?<\/badge>/g, '')
  .replace(/<(?:Link|Entity)\b[^<>]*?\b(?:title|value)="([^"]*)"[^<>]*\/>/g, '$1')
  .replace(/<[A-Za-z][^<>]*\/>/g, '').replace(/<\/?[A-Za-z][^<>]*>/g, '')
  .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();

// Detección simple de una respuesta registrada que empieza a medias (minúscula, o un ítem o título numerado > 1).
export function incompleta(t) {
  const m = /^(?:#+\s*)?(\d+)[.)]\s/.exec(t);
  return (m && Number(m[1]) > 1) || /^[a-záéíóúñ]/.test(t);
}

const casos = [];
for (const cond of ['sin_mcp', 'con_mcp']) {
  for (const r of raw(cond)) {
    if (SOLO && !SOLO.has(r.id)) continue;
    const s = puntaje[`${r.id}-${cond}`];
    const res = cond === 'con_mcp' ? (fuentes[r.id] ?? []) : [];
    casos.push({
      id: r.id, cond, corto: cond === 'sin_mcp' ? 'sin' : 'con', pregunta: preguntas[r.id].pregunta,
      respuesta: textoChat(r.answer),
      herramientas: (r.tool_calls ?? []).map((t, i) => ({ nombre: t.name, args: t.args ?? {}, resultado: String(res[i]?.result ?? '') })),
      veredicto: veredicto(s), fecha: fechaDe(r.id), incompleta: incompleta(textoChat(r.answer)),
    });
  }
}

mkdirSync(SALIDA, { recursive: true });
// Si no hay servidor local, arranca `wrangler dev --local` en worker/ y lo cierra al terminar.
const vivo = async () => { try { return (await fetch(`${BASE}/asistente`)).ok; } catch { return false; } };
let dev = null;
if (!(await vivo())) {
  const { spawn } = await import('node:child_process');
  const puerto = new URL(BASE).port || '8791';
  dev = spawn('npx', ['wrangler', 'dev', '--local', '--port', puerto], { cwd: join(AQUI, '..', 'worker'), stdio: 'ignore', detached: true });
  for (let i = 0; i < 90 && !(await vivo()); i++) await new Promise((r) => setTimeout(r, 1000));
  if (!(await vivo())) { process.kill(-dev.pid); throw new Error('No arrancó wrangler dev'); }
}
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1600, height: 900 }, colorScheme: 'light', deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.setItem('oc_tema', 'light'); } catch (e) { /* sin almacenamiento */ } });
// Nada sale hacia la IA ni al MCP: el chat solo muestra lo registrado.
await ctx.route(/\/(api\/(chat|agente|ia-estado)|mcp)(\/|\?|$)/, (r) => {
  const u = r.request().url();
  if (u.includes('/api/ia-estado')) return r.fulfill({ json: { agente: true } });
  if (u.includes('/api/agente/eventos')) return r.fulfill({ json: { eventos: [], siguiente: 0 } });
  return r.fulfill({ status: 503, json: { error: 'captura sin red' } });
});
const page = await ctx.newPage();
await page.goto(`${BASE}/asistente`, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: `
  html,body,main,.chat,.conv,#oc-scroll{height:auto!important;max-height:none!important;overflow:visible!important}
  .col{width:1100px!important;max-width:none!important}
  #oc-log{width:1100px;box-sizing:border-box;padding:32px 36px 24px;background:var(--bg,#f6f5f1)}
  #oc-log .tc{display:block}
  #oc-log .tc summary{align-items:flex-start}
  #oc-log .tc .tc-a{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere}
  .cap-pie{margin-top:20px;padding:10px 14px;border-radius:10px;font:500 13px/1.45 var(--sans,system-ui),sans-serif;
    background:var(--ink,#1a1a1a);color:var(--bg,#fff);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  .cap-pie b{font-weight:700}.cap-pie .ok{color:#7fe0a8}.cap-pie .no{color:#ffb4a8}
  .cap-mcp{display:block;width:max-content;font:600 11px/1 ui-monospace,monospace;letter-spacing:.04em;padding:5px 8px;border-radius:6px;margin-bottom:14px}
  .cap-mcp.on{background:#dff3e7;color:#0b5d3b}.cap-mcp.off{background:#eee;color:#555}` });
const conv = await nav.newPage();

const indice = [];
for (const c of casos) {
  await page.evaluate((c) => {
    /* global ocMcp:writable, ocChats:writable, ocAgUi, ocAbrir */
    ocMcp = c.cond === 'con_mcp'; ocAgUi();
    const id = 'eval-' + c.id + '-' + c.corto, t = Date.now();
    const mensajes = [{ rol: 'u', texto: c.pregunta, mcp: ocMcp }]
      .concat(c.herramientas.map((h) => ({ rol: 't', texto: '', herramienta: { nombre: h.nombre, args: h.args, resultado: h.resultado.slice(0, 2400) } })))
      .concat([{ rol: 'a', texto: c.respuesta, modelo: '', mcp: ocMcp }]);
    ocChats = [{ id, titulo: c.pregunta, creado: t, actualizado: t, mensajes }];
    ocAbrir(id);
    const log = document.getElementById('oc-log');
    const chip = document.createElement('div');
    chip.className = 'cap-mcp ' + (ocMcp ? 'on' : 'off'); chip.textContent = ocMcp ? 'MCP: ACTIVADO' : 'MCP: DESACTIVADO';
    log.prepend(chip);
    const pie = document.createElement('div'); pie.className = 'cap-pie';
    const ok = !c.veredicto.includes('✗');
    pie.innerHTML = '<span><b></b> · <span class="c"></span> · respuesta registrada en la evaluación del <span class="f"></span><span class="i"></span></span><span class="v"></span>';
    pie.querySelector('b').textContent = 'Pregunta ' + c.id;
    pie.querySelector('.c').textContent = c.cond === 'con_mcp' ? 'con MCP' : 'sin MCP';
    pie.querySelector('.f').textContent = c.fecha;
    if (c.incompleta) pie.querySelector('.i').textContent = ' · respuesta registrada incompleta (empieza a mitad de texto)';
    const v = pie.querySelector('.v'); v.className = ok ? 'ok' : 'no'; v.textContent = c.veredicto;
    log.appendChild(pie);
  }, c);
  // La ventana se agranda al alto del chat para que nada quede fuera del área pintada.
  const alto = await page.evaluate(() => document.getElementById('oc-log').getBoundingClientRect().bottom + window.scrollY + 200);
  await page.setViewportSize({ width: 1600, height: Math.max(900, Math.ceil(alto)) });
  await page.waitForTimeout(150);
  const png = await page.locator('#oc-log').screenshot({ animations: 'disabled' });
  // Grande (2×, WebP 90) para el visor y miniatura (480 px de ancho, parte superior en 4:3, WebP 80) para la tabla.
  const out = await conv.evaluate(async (b64) => {
    const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const lienzo = (w, h, sw, sh, q) => {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(im, 0, 0, sw, sh, 0, 0, w, h); return cv.toDataURL('image/webp', q);
    };
    const W = im.naturalWidth, H = im.naturalHeight, mw = 480, mh = Math.min(360, Math.round(H * mw / W));
    return { grande: lienzo(W, H, W, H, 0.9), mini: lienzo(mw, mh, W, Math.round(mh * W / mw), 0.8), w: W, h: H };
  }, png.toString('base64'));
  if (!out.grande.startsWith('data:image/webp')) throw new Error('El navegador no generó WebP');
  const archivo = `${c.id}-${c.corto}.webp`, mini = `${c.id}-${c.corto}-mini.webp`;
  writeFileSync(join(SALIDA, archivo), Buffer.from(out.grande.split(',')[1], 'base64'));
  writeFileSync(join(SALIDA, mini), Buffer.from(out.mini.split(',')[1], 'base64'));
  indice.push({ ...c, archivo, mini, w: out.w, h: out.h, kb: Math.round((statSync(join(SALIDA, archivo)).size + statSync(join(SALIDA, mini)).size) / 1024) });
  console.log(archivo, `${out.w}×${out.h}`, c.veredicto);
}
await nav.close();
if (dev) process.kill(-dev.pid);

// Índice para el repositorio (solo cuando se capturan las 80).
if (!SOLO) {
  const orden = (a, b) => a.id.localeCompare(b.id) || (a.corto === 'sin' ? -1 : 1);
  let md = '# Capturas de las respuestas de la evaluación\n\n';
  md += 'Cada imagen muestra, en el chat del sitio (`/asistente`), una de las 40 preguntas de la evaluación y la respuesta de la IA **tal como se registró** en `resultados/raw_sin_mcp.jsonl` y `raw_con_mcp.jsonl`. ';
  md += '**No se volvieron a preguntar**: el script abre el chat, le carga la conversación registrada (con las herramientas y argumentos reales que usó la IA, en «con MCP») y la fotografía. ';
  md += 'Solo se quita el marcado interno del proveedor (etiquetas y saltos de línea escapados), como en el resto del sitio. El veredicto sale de `resultados/resultados.csv`.\n\n';
  md += 'Fechas: R02, R03 y R07–R10 se ejecutaron el 18/11/2026; el resto, el 10/11/2026.\n\n';
  md += 'Regenerar las 80 de una vez (desde la raíz del repo; si no hay un `wrangler dev` en el puerto 8791, el script lo arranca y lo cierra al terminar):\n\n```bash\nnode eval/capturar_respuestas.mjs            # las 80, este LEEME.md e indice.json\nnode eval/capturar_respuestas.mjs "" B01,R02  # solo algunas (no reescribe el índice)\n```\n\n`indice.json` lista cada captura con `{id, condicion, archivo, miniatura, veredicto, fecha}`.\n\n';
  md += 'Las imágenes están en `worker/public/evaluacion/capturas/` y se ven en https://obraclara.adrielorihuela.net/evaluacion (tabla de las 40 preguntas).\n\n';
  const total = indice.reduce((a, x) => a + x.kb, 0);
  md += `Total: ${indice.length} capturas, ${(total / 1024).toFixed(1)} MB (WebP: grande a 2× y calidad 90 para el visor; miniatura de 480 px y calidad 80 para la tabla).\n\n`;
  md += '| Pregunta | Condición | Herramientas | Veredicto | Fecha | Captura |\n|---|---|---|---|---|---|\n';
  for (const x of indice.sort(orden)) {
    const h = x.herramientas.map((t) => '`' + t.nombre + '`').join(', ') || '—';
    md += `| ${x.id} | ${x.cond === 'con_mcp' ? 'con MCP' : 'sin MCP'} | ${h} | ${x.veredicto} | ${x.fecha} | [${x.archivo}](../../worker/public/evaluacion/capturas/${x.archivo}) (${x.kb} KB) |\n`;
  }
  mkdirSync(join(AQUI, 'capturas'), { recursive: true });
  writeFileSync(join(AQUI, 'capturas', 'LEEME.md'), md);
  writeFileSync(join(AQUI, 'capturas', 'indice.json'), JSON.stringify(indice.map((x) => ({
    id: x.id, condicion: x.cond, archivo: `worker/public/evaluacion/capturas/${x.archivo}`, miniatura: `worker/public/evaluacion/capturas/${x.mini}`, veredicto: x.veredicto, fecha: x.fecha,
  })), null, 1) + '\n');
  console.log('Total', (total / 1024).toFixed(2), 'MB');
}
if (!existsSync(SALIDA)) process.exit(1);
