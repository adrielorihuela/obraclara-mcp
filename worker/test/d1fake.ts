// Adaptador mínimo que imita la interfaz de D1 sobre node:sqlite, para probar las consultas con SQL real.
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Db } from "../src/lib/queries";

export function dbEnMemoria(filas: Record<string, unknown>[]): Db {
  const raw = new DatabaseSync(":memory:");
  raw.exec(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../etl/schema.sql"), "utf-8"));
  for (const f of filas) {
    const cols = Object.keys(f);
    raw.prepare(`INSERT INTO inversiones (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`).run(...(Object.values(f) as never[]));
  }
  raw.exec(`INSERT INTO meta VALUES ('fecha_descarga','2026-11-10'),('fuente','MEF'),('url','https://x')`);
  return {
    prepare(sql: string) {
      const st = raw.prepare(sql);
      return {
        bind: (...v: unknown[]) => ({
          all: async <T,>() => ({ results: st.all(...(v as never[])) as T[] }),
          first: async <T,>() => (st.get(...(v as never[])) as T) ?? null,
        }),
      };
    },
  };
}

const n = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
export function fila(o: Partial<Record<string, unknown>> & { codigo_unico: string; nombre: string; entidad: string }) {
  const base = { nivel: "GL", funcion: "SALUD", departamento: "CUSCO", provincia: "CUSCO", distrito: "CUSCO", costo_actualizado: 1000,
    monto_viable: 1000, dev_anio: 0, saldo_ejecutar: 100, alerta_sobrecosto: 0, alerta_paralizacion: 0, ...o } as Record<string, unknown>;
  base.busqueda = n(`${base.nombre} ${base.entidad} ${base.distrito} ${base.provincia}`);
  base.entidad_n = n(String(base.entidad)); base.funcion_n = n(String(base.funcion)); base.departamento_n = n(String(base.departamento));
  return base as Record<string, unknown> & { codigo_unico: string };
}
