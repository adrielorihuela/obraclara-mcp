// Consultas de datos: primero en el servidor del grupo (SQLite local, vía el conector), y si no está disponible, en D1.
// Así las consultas pesadas no gastan las lecturas del plan gratuito de D1. Las sentencias SQL las escribe este código
// (constantes con parámetros); el conector solo ejecuta SELECT sobre una base abierta en modo lectura.
import type { Db } from "./queries";

type Fetcher = (ruta: string, init?: RequestInit) => Promise<Response>;

export class RespaldoDb implements Db {
  private remotoCaido = false;
  constructor(private remoto: Fetcher | null, private d1: Db) {}

  private async remota(sql: string, params: unknown[], modo: "all" | "first"): Promise<{ rows: unknown[]; row: unknown } | null> {
    if (!this.remoto || this.remotoCaido) return null;
    try {
      const r = await this.remoto("https://cola/consultar", { method: "POST", body: JSON.stringify({ sql, params, modo }) });
      if (!r.ok) { this.remotoCaido = true; return null; }
      return (await r.json()) as { rows: unknown[]; row: unknown };
    } catch { this.remotoCaido = true; return null; }
  }

  prepare(sql: string) {
    const d1 = this.d1;
    const self = this;
    return {
      bind(...p: unknown[]) {
        return {
          async all<T = Record<string, unknown>>() {
            const r = await self.remota(sql, p, "all");
            return r ? { results: (r.rows ?? []) as T[] } : d1.prepare(sql).bind(...p).all<T>();
          },
          async first<T = Record<string, unknown>>() {
            const r = await self.remota(sql, p, "first");
            return r ? ((r.row ?? null) as T | null) : d1.prepare(sql).bind(...p).first<T>();
          },
        };
      },
    };
  }
}
