// Gráficos dentro de la respuesta del asistente: bloques ```grafico con JSON
// {"tipo":"barras|columnas|lineas|torta|dispersion","titulo","x":[…],"series":[{"nombre","valores":[…]}],"unidad"}.
// Funciones puras: el script del navegador las incrusta con toString() (sin funciones con nombre anidadas).

export type TipoGrafico = "barras" | "columnas" | "lineas" | "torta" | "dispersion";
export interface SerieGrafico { nombre: string; valores: (number | null)[] }
export interface Grafico { tipo: TipoGrafico; titulo: string; x: string[]; series: SerieGrafico[]; unidad: string }

/** Lee y valida el JSON de un bloque ```grafico. Devuelve null si no sirve (entonces se muestra como código). */
export function validarGrafico(texto: string): Grafico | null {
  let o: any;
  try { o = JSON.parse(String(texto).trim()); } catch (e) { return null; }
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const alias: Record<string, TipoGrafico> = {
    barras: "barras", barh: "barras", horizontal: "barras", columnas: "columnas", bar: "columnas", barra: "columnas", column: "columnas",
    lineas: "lineas", "líneas": "lineas", linea: "lineas", line: "lineas", torta: "torta", pie: "torta", pastel: "torta", dona: "torta",
    dispersion: "dispersion", "dispersión": "dispersion", scatter: "dispersion",
  };
  const tipo = alias[String(o.tipo || "").toLowerCase().trim()];
  if (!tipo || !Array.isArray(o.x) || !Array.isArray(o.series)) return null;
  const n = o.x.length;
  if (n < 1 || n > 80 || o.series.length < 1 || o.series.length > 8) return null;
  const x: string[] = [];
  for (let i = 0; i < n; i++) {
    const v = o.x[i];
    if (v === null || v === undefined || typeof v === "object") return null;
    x.push(String(v).slice(0, 120));
  }
  const series: SerieGrafico[] = [];
  for (let j = 0; j < o.series.length; j++) {
    const s = o.series[j];
    if (!s || typeof s !== "object" || !Array.isArray(s.valores) || s.valores.length !== n) return null;
    const vals: (number | null)[] = [];
    let hay = false;
    for (let i = 0; i < n; i++) {
      const v = s.valores[i];
      if (v === null || v === undefined || v === "") { vals.push(null); continue; }
      const num = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[\s,]/g, "")) : NaN;
      if (!Number.isFinite(num)) return null;
      vals.push(num); hay = true;
    }
    if (!hay) return null;
    series.push({ nombre: String(s.nombre ?? "").trim().slice(0, 80) || "Serie " + (j + 1), valores: vals });
  }
  if (tipo === "torta") {
    let suma = 0;
    for (const v of series[0].valores) { if (v !== null && v < 0) return null; suma += v || 0; }
    if (!(suma > 0)) return null;
  }
  return {
    tipo, x, series,
    titulo: typeof o.titulo === "string" ? o.titulo.trim().slice(0, 160) : "",
    unidad: typeof o.unidad === "string" ? o.unidad.trim().slice(0, 16) : "",
  };
}

/** Agrupa miles con espacio fino: 42897 → «42 897». Hasta `dec` decimales, coma decimal. */
export function agruparMiles(v: number, dec: number): string {
  const neg = v < 0, a = Math.abs(v);
  const f = Math.pow(10, dec), r = Math.round(a * f) / f;
  const partes = r.toFixed(dec).split(".");
  const ent = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const fr = partes[1] ? partes[1].replace(/0+$/, "") : "";
  return (neg ? "−" : "") + ent + (fr ? "," + fr : "");
}

/** Valor con unidad. corto=true abrevia millones y miles de millones: 42 897 000 000 → «S/ 42 897 M». */
export function formatoValor(v: number, unidad: string, corto: boolean): string {
  const a = Math.abs(v), u = String(unidad || "").trim();
  let s: string;
  if (u === "%") corto = false;
  if (corto && a >= 1e6) s = agruparMiles(v / 1e6, a >= 1e8 ? 0 : 1) + " M";
  else if (corto && a >= 1e4) s = agruparMiles(v / 1e3, a >= 1e5 ? 0 : 1) + " mil";
  else s = agruparMiles(v, a >= 100 ? 0 : 2);
  if (!u) return s;
  if (/^(S\/|US\$|\$|€)\.?$/i.test(u)) return u + " " + s;
  if (u === "%") return s + " %";
  return s + " " + u;
}

/** Marcas «redondas» del eje entre min y max (incluye el 0 si el rango lo cruza). */
export function marcasEje(min: number, max: number, cuantas: number): number[] {
  if (!(max > min)) { if (max === 0 && min === 0) { max = 1; } else { const d = Math.abs(max || 1) * 0.1; min -= d; max += d; } }
  const paso0 = (max - min) / Math.max(1, cuantas);
  const pot = Math.pow(10, Math.floor(Math.log10(paso0)));
  const r = paso0 / pot;
  const paso = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * pot;
  const ini = Math.floor(min / paso) * paso, fin = Math.ceil(max / paso) * paso;
  const out: number[] = [];
  for (let k = 0, v = ini; v <= fin + paso * 1e-9 && k < 50; k++, v = ini + k * paso) out.push(Math.round(v / paso) * paso);
  return out;
}
