// Consultas a D1. Todo el cálculo de indicadores vive en el ETL (etl/inversiones.py); aquí solo se filtra y se resume.

export interface Db {
  prepare(sql: string): {
    bind(...v: unknown[]): { all<T = Record<string, unknown>>(): Promise<{ results: T[] }>; first<T = Record<string, unknown>>(): Promise<T | null> };
  };
}

export const LIMITE_MAX = 20;

export interface Filtros {
  texto?: string;
  entidad?: string;
  departamento?: string;
  funcion?: string;
  nivel?: string;
}

export function normalizar(t: string): string {
  return t.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase().trim();
}

const NIVELES: Record<string, string> = {
  GL: "GL", LOCAL: "GL", LOCALES: "GL", MUNICIPAL: "GL", "GOBIERNO LOCAL": "GL", "GOBIERNOS LOCALES": "GL",
  GR: "GR", REGIONAL: "GR", REGIONALES: "GR", "GOBIERNO REGIONAL": "GR", "GOBIERNOS REGIONALES": "GR",
  GN: "GN", NACIONAL: "GN", "GOBIERNO NACIONAL": "GN",
};

export function codigoNivel(n: string): string | undefined {
  return NIVELES[normalizar(n)];
}

function like(v: string): string {
  return `%${normalizar(v).replace(/[%_]/g, "")}%`;
}

// Cada palabra se busca por separado (todas deben aparecer), para que "posta medica" encuentre "POSTA MEDICA DE X".
// Palabras de enlace que el usuario escribe pero los datos no tienen ("Gobierno Regional de Arequipa" = "GOBIERNO REGIONAL AREQUIPA").
const ENLACES = new Set(["DE", "DEL", "LA", "LAS", "LOS", "EL", "Y", "EN", "A"]);
function palabras(v: string): string[] {
  return normalizar(v).replace(/[%_]/g, "").split(/\s+/).filter((w) => (w.length > 1 || /\d/.test(w)) && !ENLACES.has(w));
}

export function construirWhere(f: Filtros, extra: string[] = []): { where: string; params: unknown[] } {
  const c = [...extra];
  const p: unknown[] = [];
  if (f.texto) for (const w of palabras(f.texto)) { c.push("busqueda LIKE ?"); p.push(`%${w}%`); }
  if (f.entidad) for (const w of palabras(f.entidad)) { c.push("entidad_n LIKE ?"); p.push(`%${w}%`); }
  if (f.departamento) { c.push("departamento_n = ?"); p.push(normalizar(f.departamento)); }
  // Coincidencia exacta: "Salud" no debe traer también "SALUD Y SANEAMIENTO" (función antigua del MEF).
  if (f.funcion) { c.push("funcion_n = ?"); p.push(normalizar(f.funcion)); }
  if (f.nivel) {
    const n = codigoNivel(f.nivel);
    if (!n) throw new Error(`Nivel no reconocido: "${f.nivel}". Use local, regional o nacional.`);
    c.push("nivel = ?"); p.push(n);
  }
  return { where: c.length ? "WHERE " + c.join(" AND ") : "", params: p };
}

const COLS_LISTA = `codigo_unico, nombre, entidad, nivel, departamento, funcion, costo_actualizado, monto_viable,
  avance_fisico, avance_ejecucion, ultimo_devengado, sobrecosto_pct, meses_sin_devengado, alerta_sobrecosto, alerta_paralizacion`;

export async function buscar(db: Db, f: Filtros, limite = LIMITE_MAX) {
  const lim = Math.min(Math.max(1, limite), LIMITE_MAX);
  const { where, params } = construirWhere(f);
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM inversiones ${where}`).bind(...params).first<{ n: number }>();
  const { results } = await db
    .prepare(`SELECT ${COLS_LISTA} FROM inversiones ${where} ORDER BY costo_actualizado DESC LIMIT ?`)
    .bind(...params, lim).all();
  return { total: total?.n ?? 0, mostrados: results.length, inversiones: results };
}

export async function detalle(db: Db, codigo: string) {
  const r = await db
    .prepare(`SELECT codigo_unico, nombre, entidad, nivel, sector, funcion, departamento, provincia, distrito, ubigeo,
      monto_viable, costo_actualizado, pim_anio, dev_anio, saldo_ejecutar, monto_laudo, avance_fisico, avance_ejecucion,
      ultimo_devengado, fec_ini_ejecucion, fec_fin_ejecucion, situacion, habitantes, sobrecosto_pct, meses_sin_devengado,
      alerta_sobrecosto, alerta_paralizacion FROM inversiones WHERE codigo_unico = ?`)
    .bind(codigo.trim()).first();
  return r;
}

export type TipoAlerta = "sobrecosto" | "paralizacion";

export async function alertas(db: Db, tipo: TipoAlerta, f: Filtros, limite = LIMITE_MAX) {
  const lim = Math.min(Math.max(1, limite), LIMITE_MAX);
  const flag = tipo === "sobrecosto" ? "alerta_sobrecosto = 1" : "alerta_paralizacion = 1";
  const orden = tipo === "sobrecosto" ? "sobrecosto_pct DESC" : "meses_sin_devengado DESC, costo_actualizado DESC";
  const { where, params } = construirWhere(f, [flag]);
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM inversiones ${where}`).bind(...params).first<{ n: number }>();
  const { results } = await db
    .prepare(`SELECT ${COLS_LISTA} FROM inversiones ${where} ORDER BY ${orden} LIMIT ?`)
    .bind(...params, lim).all();
  return { total: total?.n ?? 0, mostrados: results.length, inversiones: results };
}

export async function resumen(db: Db, f: Filtros) {
  const { where, params } = construirWhere(f);
  return db
    .prepare(`SELECT COUNT(*) AS inversiones, ROUND(SUM(costo_actualizado), 2) AS costo_actualizado_total,
      ROUND(SUM(dev_anio), 2) AS devengado_anio_actual, ROUND(SUM(CASE WHEN saldo_ejecutar > 0 THEN saldo_ejecutar ELSE 0 END), 2) AS saldo_por_ejecutar,
      SUM(alerta_sobrecosto) AS alertas_sobrecosto, SUM(alerta_paralizacion) AS alertas_paralizacion
      FROM inversiones ${where}`)
    .bind(...params).first();
}

export async function meta(db: Db): Promise<Record<string, string>> {
  const r = await db.prepare("SELECT clave, valor FROM meta").bind().all<{ clave: string; valor: string }>();
  return Object.fromEntries(r.results.map((x) => [x.clave, x.valor]));
}
