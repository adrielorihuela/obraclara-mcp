// Puntuación automática de resultados/raw_{sin,con}_mcp.jsonl -> resultados.csv y resumen.md
// Uso: node score_eval.mjs
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, extractNumbers, limpiarRespuesta, valoresDeTexto, cifrasNoSustentadas, percentil } from './cifras.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'resultados', ...(process.env.EVAL_MODELO_ID ? ['modelos', process.env.EVAL_MODELO_ID] : [])); // EVAL_MODELO_ID guarda la corrida de otro modelo en resultados/modelos/<id>/
const TOL = 0.01;

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

const MEF = /\bmef\b|ministerio de economia y finanzas|datosabiertos\.gob\.pe|detalle_inversiones|consulta amigable|invierte\.pe|banco de inversiones/;
const FECHA = /2026-11-10|10\/11\/2026|10-11-2026|10 de noviembre(?: del?)? 2026|fecha[_ ]de[_ ]descarga|fecha_descarga|descargad[oa]s? el|corte (?:al|del?) 10/;
const ABST = /no (?:he podido|pude|puedo|es posible) (?:verificar|confirmar|determinar|identificar|precisar|encontrar|ubicar)|no (?:tengo|dispongo de) (?:acceso|datos|informacion)|no seria correcto|prefiero no/;
const NODATA = /no he podido (?:identificar|encontrar|ubicar)|no (?:existen|hay|se (?:encontr|registr|identific|hall)|encontr|registra|tiene|figura|aparece|devolvi)|ningun[ao]?\b|sin resultados|0 (?:resultados|inversiones|proyectos|obras)|cero (?:resultados|inversiones|proyectos|obras)|no se dispone|no devuelve (?:datos|resultados)/;

function score(q, r) {
  const a = r.answer || '';
  const na = norm(a);
  const notes = [];
  let exacta = false, inventada = false, revisar = false;
  const cita = MEF.test(na) && FECHA.test(na);
  if (!r.answer) return { exacta, cita: false, inventada, revisar: true, notes: ['sin respuesta'] };

  const isNoData = /no existen resultados/i.test(q.respuesta_referencia) || (q.valor_oficial !== '' && Number(q.valor_oficial) === 0);
  const qNums = new Set(extractNumbers(q.pregunta).map((x) => x.v));
  const clean = limpiarRespuesta(a);
  const nums = extractNumbers(clean).filter((x) => !qNums.has(x.v) && !(Number.isInteger(x.v) && x.v >= 1990 && x.v <= 2035 && !x.pct));
  const codes = (a.match(/\b2\d{6}\b/g) || []).filter((c) => !q.pregunta.includes(c));

  if (isNoData) {
    const says = NODATA.test(na);
    exacta = says;
    inventada = !says && (codes.length > 0 || nums.some((x) => x.v > 0));
    if (says && codes.length) { revisar = true; notes.push('dice que no hay datos pero cita códigos'); }
    if (!says && !inventada) { revisar = true; notes.push('ni dice "sin datos" ni da cifras'); }
  } else if (q.unidad === 'texto') {
    // entidad o código esperado: lo escrito en mayúsculas dentro de la referencia
    const exp = (q.respuesta_referencia.match(/\b[A-ZÁÉÍÓÚÑ]{3,}(?: (?:DE |DEL |Y |LA |LOS |LAS )?[A-ZÁÉÍÓÚÑ-]{2,})+/g) || []).map(norm);
    const alias = exp.flatMap((e) => (e === 'ministerio de salud' ? [e, 'minsa'] : [e]));
    exacta = alias.some((e) => na.includes(e));
    if (!exacta) {
      const asserts = /ministerio|gobierno regional|municipalidad|essalud|programa nacional|pronis/.test(na);
      inventada = asserts; revisar = true; notes.push(asserts ? 'nombra otra entidad' : 'no nombra entidad');
    }
  } else {
    const val = Number(q.valor_oficial);
    const hit = nums.find((x) => Math.abs(x.v - val) <= TOL * Math.abs(val));
    exacta = !!hit;
    const at = hit ? clean.search(new RegExp('(?<![\\d.,])' + hit.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) : -1;
    const ctx = hit && clean.slice(Math.max(0, at - 2), at + hit.raw.length + 40);
    const clear = ctx && (hit.pct || /^\*\*/.test(ctx) || /^\S*\s*(?:\*\*)?\s*(?:%|inversion|proyecto|obra|mes|persona|habitante|colegio)/.test(norm(ctx.slice(2 + hit.raw.length))));
    if (hit && val < 100 && nums.length > 4 && !clear) { revisar = true; notes.push('valor pequeño con muchas cifras (posible coincidencia)'); }
    if (!hit) {
      const relevant = q.unidad === 'S/' ? nums.filter((x) => x.v >= 1000) : nums;
      inventada = relevant.length > 0;
      if (inventada && ABST.test(na)) { inventada = false; revisar = true; notes.push('se abstiene pero menciona cifras'); }
      else if (!inventada) { revisar = true; notes.push(ABST.test(na) ? 'se abstiene' : 'no da cifra comparable'); }
      if (inventada && NODATA.test(na)) { revisar = true; notes.push('da cifras pero también dice que no hay datos'); }
    }
  }
  if (r.sin_json_final) { revisar = true; notes.push('sin JSON final'); }
  if (r.errors?.some((e) => e.startsWith('final'))) { revisar = true; notes.push('error'); }
  return { exacta, cita, inventada, revisar, notes };
}

function lastById(file) {
  const m = new Map();
  if (!fs.existsSync(file)) return m;
  for (const l of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(l);
    const ok = (x) => x.answer != null && !(x.errors || []).some((e) => e.startsWith('final'));
    if (!m.has(r.id) || ok(r) || !ok(m.get(r.id))) m.set(r.id, r);
  }
  return m;
}

const qs = parseCSV(fs.readFileSync(path.join(DIR, 'preguntas.csv'), 'utf8'));
const conds = ['sin_mcp', 'con_mcp'];
const rows = [];

// Fuente de cada respuesta para comprobar sus cifras (ver «Exacta estricta» en resumen.md).
// Con MCP: el texto de los resultados de las herramientas de esa respuesta (fuentes_con_mcp.json, de reconstruir_fuentes.mjs).
// Sin MCP: no hay herramientas; se usa la fila de la base para el código de la pregunta (detalle) y la referencia.
// En ambos casos se suman los números de la referencia y de su nota.
const fuentesFile = path.join(OUT, 'fuentes_con_mcp.json');
if (!fs.existsSync(fuentesFile)) { console.error('Falta resultados/fuentes_con_mcp.json: ejecuta antes node reconstruir_fuentes.mjs'); process.exit(1); }
const fuentesMcp = JSON.parse(fs.readFileSync(fuentesFile, 'utf8'));
const dbFile = path.join(os.homedir(), '.local/share/obraclara/inversiones.db');
const db = fs.existsSync(dbFile) ? new DatabaseSync(dbFile, { readOnly: true }) : null;
function fuenteDe(q, cond) {
  const v = [...valoresDeTexto(q.respuesta_referencia, 'es'), ...valoresDeTexto(q.nota, 'es')];
  if (q.valor_oficial !== '') v.push(Number(q.valor_oficial));
  if (cond === 'con_mcp') {
    v.push(...valoresDeTexto(fuentesMcp._herramientas, 'es'));
    for (const c of fuentesMcp[q.id] || []) v.push(...valoresDeTexto(c.result, 'json'));
  }
  else {
    const cui = /\b2\d{6}\b/.exec(q.pregunta)?.[0];
    if (cui && db) { const fila = db.prepare('SELECT * FROM inversiones WHERE codigo_unico = ?').get(cui); if (fila) for (const x of Object.values(fila)) if (typeof x === 'number') v.push(Math.abs(x)); }
  }
  return v;
}
// Precisión y recall de elementos (códigos únicos de obra): referencia = códigos que devuelve la herramienta esperada con los filtros correctos (reconstruir_referencia.mjs).
const refFile = path.join(DIR, 'resultados', 'referencia_items.json');
const refItems = fs.existsSync(refFile) ? JSON.parse(fs.readFileSync(refFile, 'utf8')) : {};
function itemsPR(q, r) {
  const ref = refItems[q.id]; if (!ref) return {};
  const esp = new Set(ref.codigos);
  const delaPregunta = new Set(q.pregunta.match(/\b2\d{6}\b/g) || []);
  const mencionados = new Set((r.answer || '').match(/(?<![\d.,])2\d{6}(?![\d.,]\d|\d)/g) || []);
  for (const x of delaPregunta) mencionados.delete(x);
  const aciertos = [...mencionados].filter((x) => esp.has(x)).length;
  const recall = esp.size ? aciertos / esp.size : null;
  const precision = mencionados.size ? aciertos / mencionados.size : null;
  const p = precision ?? 0;
  const f1 = esp.size ? (p + recall ? (2 * p * recall) / (p + recall) : 0) : null;
  return { items_ref: esp.size, items_mencionados: mencionados.size, items_aciertos: aciertos, recall, precision, f1 };
}
for (const c of conds) {
  const raw = lastById(path.join(OUT, `raw_${c}.jsonl`));
  for (const q of qs) {
    const r = raw.get(q.id) || { answer: null, tool_calls: [], steps: 0, latency_s: null, errors: ['no ejecutada'] };
    const s = score(q, r);
    const noSust = r.answer ? cifrasNoSustentadas(r.answer, q.pregunta, fuenteDe(q, c)) : [];
    s.no_sustentada = noSust.length > 0; s.cifras_no_sustentadas = noSust.join('; ');
    s.estricta = s.exacta && !s.no_sustentada;
    Object.assign(s, itemsPR(q, r));
    rows.push({ id: q.id, tipo: q.tipo, condicion: c, ...s, llamadas: r.tool_calls.length, pasos: r.steps, latencia_s: r.latency_s, latencia_ok_s: r.ask_ok_s ?? null, reintentos: (r.errors || []).filter((e) => e.startsWith('ask')).length,
      herramientas: r.tool_calls.map((t) => t.name).join('+'), esperada: q.herramienta_esperada,
      respuesta_resumida: (r.answer || '').replace(/\s+/g, ' ').slice(0, 300), ejecutada: r.answer != null });
  }
}

const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const head = ['id', 'tipo', 'condicion', 'exacta', 'cita', 'inventada', 'revisar', 'estricta', 'no_sustentada', 'cifras_no_sustentadas', 'llamadas', 'pasos', 'latencia_s', 'latencia_ok_s', 'items_ref', 'items_mencionados', 'items_aciertos', 'recall', 'precision', 'f1', 'respuesta_resumida'];
fs.writeFileSync(path.join(OUT, 'resultados.csv'),
  [head.join(','), ...rows.map((r) => head.map((k) => esc(k === 'revisar' && r.notes.length ? (r.revisar ? 'sí: ' + r.notes.join('; ') : '') : typeof r[k] === 'boolean' ? (r[k] ? 1 : 0) : typeof r[k] === 'number' && ['recall', 'precision', 'f1'].includes(k) ? r[k].toFixed(3) : r[k])).join(','))].join('\n') + '\n');

const pct = (xs, k) => (xs.length ? ((100 * xs.filter((x) => x[k]).length) / xs.length).toFixed(0) + ' %' : '-');
const mean = (xs, k) => { const v = xs.map((x) => x[k]).filter((x) => x != null); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '-'; };
let md = `# Evaluación ObraClara: sin MCP vs con MCP\n\nFecha: ${new Date().toISOString().slice(0, 10)} · 40 preguntas (\`preguntas.csv\`) · modelo: ${process.env.EVAL_MODELO_NOMBRE || 'IA del servidor del grupo (API privada compatible con OpenAI, con respaldo automático)'} · una corrida${process.env.EVAL_MODELO_ID ? ' (todas las preguntas, mismo día, con el modelo fijo)' : ' (R02, R03 y R07–R10 se ejecutaron el 2026-11-18: R02 y R03 de nuevo tras corregir la búsqueda por entidad, y R07–R10 porque faltaban; el resto, el 2026-11-10)'}.\n\n`;
md += '## Resultado global (porcentaje de las 40 preguntas)\n\n| Condición | Exacta | Cita fuente y fecha | Inventada | Revisar | Latencia media total (s) | Latencia media sin reintentos (s) | Llamadas medias | Reintentos | Ejecutadas |\n|---|---|---|---|---|---|---|---|---|---|\n';
for (const c of conds) {
  const xs = rows.filter((r) => r.condicion === c);
  md += `| ${c} | ${pct(xs, 'exacta')} | ${pct(xs, 'cita')} | ${pct(xs, 'inventada')} | ${xs.filter((x) => x.revisar).length} | ${mean(xs, 'latencia_s')} | ${mean(xs, 'latencia_ok_s')} | ${mean(xs, 'llamadas')} | ${xs.reduce((a, x) => a + x.reintentos, 0)} | ${xs.filter((x) => x.ejecutada).length}/40 |\n`;
}
md += '\n## Exacta estricta y cifras no sustentadas (métricas añadidas; «Exacta» e «Inventada» no cambian)\n\n| Condición | Exacta | Exacta estricta | Cifras no sustentadas |\n|---|---|---|---|\n';
for (const c of conds) {
  const xs = rows.filter((r) => r.condicion === c);
  md += `| ${c} | ${pct(xs, 'exacta')} | ${pct(xs, 'estricta')} | ${pct(xs, 'no_sustentada')} |\n`;
}
const conRef = (c) => rows.filter((r) => r.condicion === c && r.recall != null);
const prom = (xs, k) => { const v = xs.map((x) => x[k]).filter((x) => x != null); return v.length ? (100 * v.reduce((a, b) => a + b, 0) / v.length).toFixed(0) + ' %' : '-'; };
md += `\n## Precisión y recall de elementos (preguntas que piden contar o listar obras)\n
Se aplican a las ${Object.keys(refItems).filter((id) => refItems[id].codigos.length).length} preguntas de búsqueda y alertas cuya respuesta es un conteo o una lista (las de una sola obra, como «la más cara», no entran). **Referencia**: los códigos únicos de obra que devuelve la herramienta esperada con los filtros correctos (\`reconstruir_referencia.mjs\` -> \`resultados/referencia_items.json\`; la herramienta muestra como máximo 20, aunque el total sea mayor). **Mencionados**: códigos únicos (7 dígitos, empiezan con 2) que aparecen en la respuesta (sin contar los de la pregunta).

- **Recall** = aciertos / elementos esperados, donde aciertos = mencionados que están en la referencia. Responde: «de las obras que debía encontrar, ¿qué porcentaje encontró?». Una respuesta que solo da el total y no nombra obras tiene recall 0.
- **Precisión** = aciertos / mencionados. Responde: «de las obras que nombró, ¿qué porcentaje es correcto?». Solo se calcula si la respuesta menciona al menos un código; en las preguntas sin datos (B10, A10) cualquier código mencionado es un error.
- **F1** = 2 · precisión · recall / (precisión + recall), con 0 si ambos son 0 (una precisión sin calcular cuenta como 0).
- Promedio simple entre preguntas (cada pregunta pesa igual).

| Condición | Preguntas con referencia | Recall medio | Precisión media (con códigos mencionados) | F1 medio |\n|---|---|---|---|---|\n`;
for (const c of conds) { const xs = conRef(c); md += `| ${c} | ${xs.length} | ${prom(xs, 'recall')} | ${prom(rows.filter((r) => r.condicion === c && r.precision != null), 'precision')} | ${prom(xs, 'f1')} |\n`; }
const cambian = rows.filter((r) => r.exacta && !r.estricta);
md += '\nRespuestas que pasan de exacta a **no estricta** (la cifra de la referencia aparece, pero otra cifra no se sustenta en la fuente):\n\n';
md += cambian.length ? '| Pregunta | Condición | Cifras no sustentadas |\n|---|---|---|\n' + cambian.map((r) => `| ${r.id} | ${r.condicion} | ${r.cifras_no_sustentadas} |`).join('\n') + '\n' : '(ninguna)\n';
const lt = (c, k) => rows.filter((r) => r.condicion === c).map((r) => r[k]);
const f1 = (v) => (v == null ? '-' : v.toFixed(1));
md += '\n## Latencia: mediana y p90 por condición (segundos)\n\n| Condición | Mediana total | p90 total | Máximo total | Respuestas > 300 s | Mediana sin reintentos | p90 sin reintentos |\n|---|---|---|---|---|---|---|\n';
for (const c of conds) {
  const t = lt(c, 'latencia_s'), o = lt(c, 'latencia_ok_s');
  md += `| ${c} | ${f1(percentil(t, 0.5))} | ${f1(percentil(t, 0.9))} | ${f1(Math.max(...t.filter((x) => x != null)))} | ${t.filter((x) => x > 300).length} | ${f1(percentil(o, 0.5))} | ${f1(percentil(o, 0.9))} |\n`;
}
md += '\nLos máximos (más de 300 s) se deben a reintentos: el proveedor de IA a veces tarda varios minutos en responder, el ejecutor espera y repite la consulta una vez, y la latencia total suma ambos intentos. La mediana y el p90 describen mejor el tiempo típico que la media. Percentil por rango más cercano; «sin reintentos» solo existe desde B08.\n';
const okIds = qs.map((q) => q.id).filter((id) => rows.filter((r) => r.id === id && r.ejecutada && !r.notes.includes('error')).length === 2);
if (okIds.length < 40) {
  md += `\n### Solo las ${okIds.length} preguntas con respuesta válida en ambas condiciones\n\n| Condición | Exacta | Cita | Inventada |\n|---|---|---|---|\n`;
  for (const c of conds) { const xs = rows.filter((r) => r.condicion === c && okIds.includes(r.id)); md += `| ${c} | ${pct(xs, 'exacta')} | ${pct(xs, 'cita')} | ${pct(xs, 'inventada')} |\n`; }
  md += `\nFaltan: ${qs.map((q) => q.id).filter((id) => !okIds.includes(id)).join(', ')} (el proveedor de IA alcanzó su límite de uso; en la tabla global cuentan como no acertadas).\n`;
}
md += '\n## Por tipo de pregunta (10 preguntas cada uno)\n\n| Tipo | Condición | Exacta | Cita | Inventada | Revisar |\n|---|---|---|---|---|---|\n';
for (const t of [...new Set(qs.map((q) => q.tipo))]) for (const c of conds) {
  const xs = rows.filter((r) => r.condicion === c && r.tipo === t);
  md += `| ${t} | ${c} | ${pct(xs, 'exacta')} | ${pct(xs, 'cita')} | ${pct(xs, 'inventada')} | ${xs.filter((x) => x.revisar).length} |\n`;
}
const cm = rows.filter((r) => r.condicion === 'con_mcp');
const right = cm.filter((r) => r.herramientas.split('+').includes(r.esperada)).length;
md += `\nCon MCP, la herramienta esperada se usó en ${right}/40 preguntas; ${cm.filter((r) => r.llamadas === 0).length} respuestas no llamaron a ninguna herramienta.\n`;
md += `\n## Cómo se puntuó (automático)\n
- **Exacta**: si el valor oficial es numérico, se extraen los números de la respuesta (formatos «1 234,56», «1,234.56», «1.234,56», «S/ 2,5 millones», «mil millones»; los separadores ambiguos se leen de las dos formas) sin contar años ni números que ya estaban en la pregunta, y basta que uno quede a ±1 % del valor oficial. Texto: aparece la entidad esperada. Sin datos (B10, D10, A10): la respuesta dice que no hay resultados.
- **Cita**: menciona MEF / Ministerio de Economía y Finanzas / datosabiertos.gob.pe / el dataset **y** la fecha de corte 2026-11-10 o la fecha de descarga.
- **Inventada**: da cifras (en preguntas en soles, cifras ≥ 1000) y ninguna coincide con la referencia; o afirma resultados en una pregunta sin datos; o nombra otra entidad.
- **Exacta estricta**: exacta según la regla anterior **y** ninguna cifra relevante de la respuesta queda sin sustento. Cifra relevante: porcentaje o cantidad/monto ≥ 1000; se ignoran años, fechas, códigos únicos, números de la pregunta y conteos pequeños. Una cifra está sustentada si aparece en la fuente, o es la suma, diferencia o cociente (también en %) de dos cifras de la fuente que la propia respuesta cita, o coincide con la referencia. Fuente con MCP: el texto de los resultados de las herramientas de esa respuesta (\`fuentes_con_mcp.json\`, reproducido con \`reconstruir_fuentes.mjs\` porque \`raw_con_mcp.jsonl\` solo guardaba el largo del resultado; coincide en las 40). Fuente sin MCP: no hay herramientas, así que se usan la referencia y su nota y, en detalle, los campos de la fila de la base para el código de la pregunta. La tolerancia depende de la precisión con que se escribe la cifra (hasta 1 %: «40,7 millones» admite 0,12 %; «40,682,184.89», solo redondeo de 0,05 %); con ±1 % fijo, una cifra errónea como 40,279,184.89 pasaría por cercana a 40,682,184.89.
- **Cifras no sustentadas**: porcentaje de respuestas con al menos una cifra relevante sin sustento según la definición anterior. No es lo mismo que «inventada»: «inventada» exige que ninguna cifra coincida con la referencia; «no sustentada» basta con una cifra suelta sin respaldo, aunque otra sea correcta. Sin MCP incluye cifras reales de otras fuentes (web, Contraloría) que simplemente no están en los datos del MEF al corte.
- **Revisar**: casos dudosos para revisión manual (columna \`revisar\` de \`resultados.csv\` con el motivo).

## Advertencias
${process.env.EVAL_MODELO_ID ? '- Modelo fijo (sin cadena de respaldo) servido con una cuenta gratuita: puede haber esperas por límite de uso; el ejecutor espera a que se libere y no cambia de modelo. Sin MCP el modelo responde de memoria, sin búsqueda web.' : `- El proveedor de IA es un servicio de uso gratuito con límite de uso; no se controla qué modelo responde y puede cambiar entre preguntas. En «sin MCP» el modelo puede usar búsqueda web.`}
- Con MCP se usa un protocolo de herramientas **en texto** (JSON en la respuesta), no llamadas nativas; resultados de más de ${15000} caracteres se recortan.
- Puntuación **automática** con reglas simples: puede contar como exacta una coincidencia casual o perder respuestas correctas con otro formato. Los casos «revisar» deben verificarlos a mano dos integrantes del grupo.
- La latencia total incluye los reintentos: el proveedor a veces tarda hasta 3 min en responder y el ejecutor reintenta una vez; «sin reintentos» suma solo los intentos exitosos (medida desde B08; antes no se registraba).
- «Inventada» es una cota superior: sin MCP el chat suele citar otras fuentes reales (Contraloría, notas de prensa, otras fechas) cuyas cifras no coinciden con el MEF al 2026-11-10; la regla las cuenta como inventadas aunque no sean fabricadas. Conviene revisarlas a mano.
${process.env.EVAL_MODELO_ID ? '' : `- Cuando el modelo usa búsqueda web, algunas respuestas sin MCP llegan con marcado interno (<Cite>, imágenes) o empiezan a mitad de texto. Afecta sobre todo a «cita» sin MCP.`}
- Abstenciones («no he podido verificar…») no cuentan como exactas ni como inventadas (se marcan «revisar»).
- «Exacta estricta» sigue siendo automática y aproximada: no entiende el contexto de cada cifra (una cifra correcta con otro significado cuenta como sustentada; una derivación válida que la respuesta no explicita puede contarse como no sustentada) y no mide si la conclusión es correcta. La «Exacta» original sigue publicada para comparar y sobrestima el acierto porque basta con que una cifra coincida.
- **Una sola corrida** por condición: no mide la variabilidad entre corridas.
- Datos de referencia con corte 2026-11-10; el chat sin herramientas puede tener datos de otra fecha.
`;
fs.writeFileSync(path.join(OUT, 'resumen.md'), md);
console.log(md.split('## Cómo')[0]);
