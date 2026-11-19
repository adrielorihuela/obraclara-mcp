// Prepara las respuestas de la IA para el sitio (/demo y /evaluacion): conserva el Markdown (tablas, listas, negritas),
// quita el marcado interno del proveedor, recorta por bloques sin partir tablas y extrae la cifra clave que se
// compara con la referencia oficial. Lo usan exportar_demo.mjs y exportar_sitio.mjs. Funciones puras.
import { cifrasDeRespuesta } from './cifras.mjs';

const TOL = 0.01; // misma tolerancia que score_eval.mjs

// Quita etiquetas internas (<badge>, <Cite/>, <AsyncImage…/>, <row>…), enlaces y URL; deja el Markdown.
export function limpiarMd(t) {
  return String(t ?? '')
    .replace(/\\n/g, '\n').replace(/\\([:.\-()])/g, '$1')
    .replace(/<badge[^>]*>[\s\S]*?<\/badge>/g, '')
    .replace(/<(?:Link|Entity)\b[^<>]*?\b(?:title|value)="([^"]*)"[^<>]*\/>/g, '$1')
    .replace(/<[A-Za-z][^<>]*\/>/g, '').replace(/<\/?[A-Za-z][^<>]*>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\(?https?:\/\/[^\s)]+\)?/g, '')
    .split('\n').map((l) => l.replace(/^\s+(?=[-*+] |\d{1,2}[.)] |\|)/, '').replace(/[ \t]+$/, '')).join('\n')
    .replace(/^\s*[-*+]\s*\.?\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

// Bloques separados por líneas en blanco; una tabla siempre es un bloque propio.
function bloques(md) {
  const out = []; let cur = [], tipo = null;
  const cierra = () => { if (cur.length) out.push({ tipo, lineas: cur }); cur = []; tipo = null; };
  for (const l of md.split('\n')) {
    if (!l.trim()) { cierra(); continue; }
    const t = /^\|/.test(l.trim()) ? 'tabla' : 'texto';
    if (tipo && t !== tipo) cierra();
    tipo = t; cur.push(l);
  }
  cierra();
  return out;
}

// Cierra negritas o código que quedaron abiertos al cortar.
const equilibrar = (s) => {
  let r = s;
  if ((r.match(/\*\*/g) ?? []).length % 2) r = r.replace(/\*\*(?!.*\*\*)/, '');
  if ((r.match(/`/g) ?? []).length % 2) r = r.replace(/`(?!.*`)/, '');
  return r;
};
const cortarPalabra = (s, n) => equilibrar(s.slice(0, Math.max(s.slice(0, n).lastIndexOf(' '), n * 0.6)).replace(/[\s,;:.(*_-]+$/, '')) + '…';

// Recorta a unos `max` caracteres por bloques. Las tablas se cortan por filas (cabecera siempre completa).
export function recortarMd(md, max, filasMax = 6) {
  const res = []; let n = 0, cortada = false;
  for (const b of bloques(md)) {
    if (n >= max) { cortada = true; break; }
    if (b.tipo === 'tabla') {
      const [cab, sep, ...cuerpo] = b.lineas;
      if (!sep || !/^\|?[\s:|-]+\|?$/.test(sep.trim())) { res.push(b.lineas.join('\n')); n += b.lineas.join('').length; continue; }
      const filas = [cab, sep]; let len = cab.length;
      let i = 0;
      for (; i < cuerpo.length && i < filasMax; i++) { if (i >= 2 && n + len + cuerpo[i].length > max * 1.2) break; filas.push(cuerpo[i]); len += cuerpo[i].length; }
      res.push(filas.join('\n'));
      if (i < cuerpo.length) { res.push(`_(… y ${cuerpo.length - i} ${cuerpo.length - i === 1 ? 'fila' : 'filas'} más)_`); cortada = true; }
      n += len * 0.7; // las tablas se leen más compactas que el texto corrido
      continue;
    }
    const txt = b.lineas.join('\n');
    if (n + txt.length <= max) { res.push(txt); n += txt.length; continue; }
    cortada = true;
    if (n > max * 0.55) break;
    // texto o lista: líneas enteras mientras quepan; la última se corta por palabra
    const dentro = []; let m = n;
    for (const l of b.lineas) {
      if (m + l.length <= max) { dentro.push(l); m += l.length; continue; }
      if (max - m > 40 || !dentro.length) dentro.push(cortarPalabra(l, Math.max(40, max - m)));
      else dentro[dentro.length - 1] = dentro[dentro.length - 1].replace(/[\s.,;:]*$/, '') + '…';
      break;
    }
    res.push(dentro.join('\n'));
    break;
  }
  return { md: res.join('\n\n'), cortada };
}

// Formato de cifras: espacio fino para miles y coma decimal («S/ 162 507 128,65»).
const grp = (v, dec) => {
  const [e, d] = Math.abs(v).toFixed(dec).split('.');
  return (v < 0 ? '−' : '') + e.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + (d ? ',' + d : '');
};
export const formatoValor = (v, unidad, pct = false) =>
  pct || unidad === '%' ? `${grp(v, Number.isInteger(v) ? 0 : 1)} %`
    : unidad === 'S/' ? `S/ ${grp(v, Number.isInteger(v) ? 0 : 2)}`
      : grp(v, Number.isInteger(v) ? 0 : 1);
// Montos escritos «en millones» se muestran igual, pero con el mismo formato que la referencia.
const millones = (v) => { const m = v / 1e6, dec = Number.isInteger(m) ? 0 : Number.isInteger(m * 10) ? 1 : 2; return `${grp(m, dec)} millones`; };
const mostrar = (x, unidad) => /[a-z]/i.test(x.raw) && !x.pct && x.v >= 1e6
  ? `${unidad === 'S/' ? 'S/ ' : ''}${millones(x.v)}`
  : formatoValor(x.v, unidad, x.pct);

const titulo = (s) => s.toLowerCase().replace(/(^|[\s(«-])([a-záéíóúñ])/g, (_, a, b) => a + b.toUpperCase())
  .replace(/\b(De|Del|La|Las|Los|Y|En|El)\b/g, (w) => w.toLowerCase());
const recorta = (s, n = 46) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n) > 20 ? s.lastIndexOf(' ', n) : n) + '…' : s);

const esSinDatos = (q) => /no existen resultados/i.test(q.respuesta_referencia) || (q.valor_oficial !== '' && Number(q.valor_oficial) === 0);
const esNumerica = (q) => q.valor_oficial !== '' && Number.isFinite(Number(q.valor_oficial)) && q.unidad !== 'texto';
const entidadesRef = (q) => q.respuesta_referencia.match(/\b[A-ZÁÉÍÓÚÑ]{3,}(?: (?:DE |DEL |Y |LA |LOS |LAS )?[A-ZÁÉÍÓÚÑ-]{2,})+/g) ?? [];

// Palabra que acompaña a un conteo en la referencia («74 inversiones», «167 meses») para que el chip se entienda solo.
function palabraConteo(q) {
  if (q.unidad !== 'cantidad') return '';
  const v = Number(q.valor_oficial);
  for (const f of [v.toLocaleString('en-US'), String(v), v.toLocaleString('es-PE')]) {
    const m = new RegExp(`(?<![\\d.,])${f.replace(/[.,]/g, '\\$&')}\\s+([a-záéíóúñ]{3,})`, 'i').exec(q.respuesta_referencia);
    if (m && !/^(de|del|en|y|con|por|para|que|al)$/i.test(m[1])) return ' ' + m[1].toLowerCase();
  }
  return '';
}

// La cifra (o entidad) de la referencia oficial, en el mismo formato que la de la respuesta.
export function claveReferencia(q) {
  if (esSinDatos(q)) return 'Sin resultados';
  if (esNumerica(q)) return formatoValor(Number(q.valor_oficial), q.unidad) + palabraConteo(q);
  const ent = entidadesRef(q)[0];
  const cod = /\b2\d{6}\b/.exec(q.respuesta_referencia)?.[0];
  return ent ? recorta(titulo(ent)) : cod ? `Código ${cod}` : recorta(String(q.valor_oficial || q.respuesta_referencia));
}

// La cifra de la respuesta que se compara con la referencia. `exacta` viene de resultados.csv (score_eval.mjs).
export function claveRespuesta(q, answer, exacta) {
  if (!answer) return 'Sin respuesta';
  const nums = cifrasDeRespuesta(answer, q.pregunta);
  if (esSinDatos(q)) {
    if (exacta) return 'Sin resultados';
    const x = nums.find((y) => y.v > 0);
    return x ? `Dio cifras: ${mostrar(x, q.unidad)}` : 'No dijo que no hay datos';
  }
  if (!esNumerica(q)) {
    if (exacta) return claveReferencia(q);
    const otra = /(?:ministerio|gobierno regional|municipalidad|programa nacional|essalud)[^.,;:\n|*()]{0,40}/i.exec(answer.replace(/\*\*/g, ''))?.[0];
    return otra ? `Otra: ${recorta(titulo(otra.trim()), 40)}` : 'No nombró la entidad';
  }
  const v = Number(q.valor_oficial);
  const dist = (x) => Math.abs(Math.log(Math.abs(x.v) / Math.abs(v)));
  if (exacta) {
    const hit = nums.filter((x) => Math.abs(x.v - v) <= TOL * Math.abs(v)).sort((a, b) => Math.abs(a.v - v) - Math.abs(b.v - v))[0];
    return (hit ? mostrar(hit, q.unidad) : formatoValor(v, q.unidad)) + palabraConteo(q);
  }
  const rel = nums.filter((x) => x.v > 0 && (q.unidad === '%' ? x.pct : !x.pct) && (q.unidad !== 'S/' || x.v >= 1000) && (q.unidad === 'S/' || dist(x) < Math.log(50)));
  // Primero la primera cifra en negrita (la que la IA destaca como respuesta); si no hay, la más cercana a la referencia.
  const negritas = new Set(cifrasDeRespuesta((answer.match(/\*\*[^*]+\*\*/g) ?? []).join(' ; '), q.pregunta).map((x) => x.raw));
  const primera = rel.find((x) => negritas.has(x.raw));
  const best = primera ? rel.filter((x) => x.raw === primera.raw).sort((a, b) => dist(a) - dist(b))[0] : rel.sort((a, b) => dist(a) - dist(b))[0];
  return best ? mostrar(best, q.unidad) + palabraConteo(q) : 'No dio la cifra';
}

// Una línea para el veredicto: el motivo cuando no es correcta.
export const motivo = (q, exacta, inventada) => exacta ? 'Correcta'
  : !inventada ? 'Incorrecta: no dio la cifra oficial'
    : esSinDatos(q) ? 'Incorrecta: dio cifras donde no hay datos'
      : esNumerica(q) ? 'Incorrecta: inventó cifras' : 'Incorrecta: nombró otra entidad';
