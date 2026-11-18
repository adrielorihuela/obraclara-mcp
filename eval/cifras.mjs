// Funciones puras para leer cifras de una respuesta y comprobar si se sustentan en la fuente.
// Las usa score_eval.mjs; se prueban en cifras.test.mjs (node --test eval/).
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Interpretaciones posibles de un token numérico (formatos es/en). Devuelve varias si es ambiguo.
export function readings(tok) {
  const t = tok.replace(/[\s  ]/g, ' ').trim();
  const out = new Set();
  const plain = (s) => { const v = Number(s); if (Number.isFinite(v)) out.add(v); };
  if (/^\d{1,3}( \d{3})+([.,]\d+)?$/.test(t)) { plain(t.replace(/ /g, '').replace(',', '.')); return [...out]; }
  const s = t.replace(/ /g, '');
  const hasC = s.includes(','), hasD = s.includes('.');
  if (hasC && hasD) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) plain(s.replace(/\./g, '').replace(',', '.')); // 1.234,56
    else plain(s.replace(/,/g, '')); // 1,234.56
  } else if (hasC || hasD) {
    const sep = hasC ? ',' : '.';
    const parts = s.split(sep);
    if (parts.length > 2) plain(parts.join('')); // 1,234,567 o 1.234.567
    else {
      plain(parts.join('.')); // decimal
      if (parts[1].length === 3) plain(parts.join('')); // o miles
    }
  } else plain(s);
  return [...out];
}

// Extrae números del texto con multiplicadores (millones, mil millones, billones...).
export function extractNumbers(text) {
  const res = [];
  const re = /(\d{1,3}(?:[   ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)*)(\s*(?:%|mil\s+millones|miles\s+de\s+millones|millones|mill\.?|mm\b|millon|billones|billon|billion|million|mil\b|k\b|m\b))?/gi;
  for (const m of String(text || '').matchAll(re)) {
    const base = readings(m[1]);
    const suf = norm(m[2] || '').trim().replace(/\s+/g, ' ');
    let mult = [1];
    if (/^(mil millones|miles de millones|billion)$/.test(suf)) mult = [1e9];
    else if (/^(millones|mill\.?|millon|million)$/.test(suf)) mult = [1e6];
    else if (/^(mm|m)$/.test(suf)) mult = [1e6, 1];
    else if (/^(billones|billon)$/.test(suf)) mult = [1e12, 1e9]; // billón es 1e12; se acepta el uso inglés
    else if (/^(mil|k)$/.test(suf)) mult = [1e3];
    for (const b of base) for (const k of mult) res.push({ v: b * k, raw: m[0].trim(), pct: suf === '%' });
  }
  return res;
}


// Quita de la respuesta lo que no es una cifra de la respuesta: enlaces, fechas, numeración de listas.
export function limpiarRespuesta(a) {
  return String(a || '').replace(/https?:\/\/\S+|www\.\S+/g, ' ').replace(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, ' ')
    .replace(/\b\d{1,2}(?:°|º)? de (?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/gi, ' ')
    .replace(/^\s*(?:#+\s*)?\d{1,2}[.)]\s/gm, ' ');
}

// Cifras de la respuesta sin contar años ni números que ya estaban en la pregunta (regla de «exacta»).
export function cifrasDeRespuesta(answer, pregunta) {
  const qNums = new Set(extractNumbers(pregunta).map((x) => x.v));
  return extractNumbers(limpiarRespuesta(answer)).filter((x) => !qNums.has(x.v) && !(Number.isInteger(x.v) && x.v >= 1990 && x.v <= 2035 && !x.pct));
}

// Cifras relevantes para la sustentación: porcentajes o cantidades >= 1000 (montos, conteos grandes).
// Se ignoran años, códigos únicos (2xxxxxx), números de la pregunta y conteos pequeños. Agrupa las lecturas ambiguas de un mismo texto.
export function cifrasRelevantes(answer, pregunta) {
  const porRaw = new Map();
  // el marcado interno del proveedor (<Link ref="turn975701…">) no es una cifra de la respuesta
  for (const x of cifrasDeRespuesta(String(answer || '').replace(/<[^>]*>/g, ' '), pregunta)) {
    if (/^2\d{6}$/.test(x.raw)) continue;
    if (!x.pct && x.v < 1000) continue;
    if (!porRaw.has(x.raw)) porRaw.set(x.raw, { raw: x.raw, pct: x.pct, valores: [] });
    porRaw.get(x.raw).valores.push(x.v);
  }
  return [...porRaw.values()];
}

// Tolerancia relativa según la precisión con que se escribió la cifra: «40.7 millones» admite ~0,12 %;
// «40,682,184.89» solo redondeo (0,05 %). Nunca más de 1 %.
export function tolerancia(raw) {
  const mant = (/\d[\d.,\s  ]*/.exec(raw)?.[0] || '').replace(/[^\d]/g, '').replace(/^0+/, '').replace(/0+$/, '');
  const n = Number(mant || '1');
  return Math.min(0.01, Math.max(0.0005, 0.5 / n));
}
const cerca = (x, y, tol) => Math.abs(x - y) <= tol * Math.abs(y);

// Valores numéricos de un texto. formato 'json': decimales con punto (resultados de herramientas y filas de la base);
// 'es': formatos de la referencia («S/ 7,033,676.00», «578.39 %»).
export function valoresDeTexto(texto, formato = 'es') {
  if (formato === 'json') return [...String(texto || '').matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Math.abs(Number(m[0])));
  return extractNumbers(texto).map((x) => x.v);
}

// ¿Está x (con sus lecturas) entre los valores de la fuente, o es una diferencia, suma o cociente simple de dos cifras
// de la fuente que la propia respuesta cita? Devuelve 'directa' | 'derivada' | null.
export function sustento(cifra, fuente, otrasCifras = []) {
  const tol = tolerancia(cifra.raw);
  const hay = (x, t) => fuente.some((g) => cerca(x, g, t));
  if (cifra.valores.some((x) => hay(x, tol))) return 'directa';
  // operandos: valores de la fuente que otra cifra de la respuesta cita
  const ops = [...new Set(fuente.filter((g) => g !== 0 && otrasCifras.some((o) => o.valores.some((v) => cerca(v, g, tolerancia(o.raw))))))];
  for (const a of ops) for (const b of ops) {
    if (a === b) continue;
    const cand = [a - b, a + b, b !== 0 ? a / b : NaN, b !== 0 ? (a * 100) / b : NaN, b !== 0 ? ((a - b) * 100) / b : NaN];
    if (cand.some((c) => Number.isFinite(c) && cifra.valores.some((x) => cerca(x, c, tol)))) return 'derivada';
  }
  return null;
}

// Cifras relevantes que no se sustentan. `fuente` = valores numéricos de resultados de herramientas / base de datos / referencia.
export function cifrasNoSustentadas(answer, pregunta, fuente) {
  const rel = cifrasRelevantes(answer, pregunta);
  return rel.filter((c) => !sustento(c, fuente, rel.filter((o) => o !== c))).map((c) => c.raw);
}

// Percentil por rango más cercano (p = 0.5 mediana, 0.9 p90).
export function percentil(valores, p) {
  const v = valores.filter((x) => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  return v.length ? v[Math.max(0, Math.ceil(p * v.length) - 1)] : null;
}
