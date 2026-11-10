"""ETL de ObraClara Perú: DETALLE_INVERSIONES.csv (MEF) -> archivos SQL para Cloudflare D1.

Uso:
    python etl/inversiones.py --csv DETALLE_INVERSIONES.csv --out build/ [--fecha 2026-11-10]

Genera build/data_000.sql, data_001.sql, ... (INSERT por lotes) y build/meta.sql.
Todos los indicadores se calculan aquí, con código determinista; el modelo de lenguaje no calcula nada.
"""
import argparse
import csv
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

COLS = {  # columna del CSV -> columna de la tabla
    "CODIGO_UNICO": "codigo_unico", "NOMBRE_INVERSION": "nombre", "ENTIDAD": "entidad", "NIVEL": "nivel",
    "SECTOR": "sector", "FUNCION": "funcion", "DEPARTAMENTO": "departamento", "PROVINCIA": "provincia",
    "DISTRITO": "distrito", "UBIGEO": "ubigeo", "MONTO_VIABLE": "monto_viable",
    "COSTO_ACTUALIZADO": "costo_actualizado", "PIM_ANIO_ACTUAL": "pim_anio", "DEV_ANIO_ACTUAL": "dev_anio",
    "SALDO_EJECUTAR": "saldo_ejecutar", "MONTO_LAUDO": "monto_laudo", "AVANCE_FISICO": "avance_fisico",
    "AVANCE_EJECUCION": "avance_ejecucion", "ULTIMO_DEVENGADO": "ultimo_devengado",
    "FEC_INI_EJECUCION": "fec_ini_ejecucion", "FEC_FIN_EJECUCION": "fec_fin_ejecucion", "SITUACION": "situacion",
    "NUM_HABITANTES_BENEF": "habitantes",
}
NUM = {"monto_viable", "costo_actualizado", "pim_anio", "dev_anio", "saldo_ejecutar", "monto_laudo",
       "avance_fisico", "avance_ejecucion"}
UMBRAL_SOBRECOSTO = 0.50     # (costo actualizado - monto viable) / monto viable
UMBRAL_AVANCE_MIN = 40.0     # Ley 31589: avance físico >= 40 % (obras contratadas)
MESES_SIN_DEVENGADO = 6

ORDEN = list(COLS.values()) + ["sobrecosto_pct", "meses_sin_devengado", "alerta_sobrecosto",
                               "alerta_paralizacion", "busqueda", "entidad_n", "funcion_n", "departamento_n"]


def sin_tildes(t: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn").upper()


def num(v: str):
    v = v.strip()
    if not v:
        return None
    try:
        return float(v)
    except ValueError:
        return None


def meses_entre(aaaamm: str, ref: date):
    if not re.fullmatch(r"\d{6}", aaaamm or ""):
        return None
    a, m = int(aaaamm[:4]), int(aaaamm[4:])
    if not 1 <= m <= 12:
        return None
    return (ref.year - a) * 12 + (ref.month - m)


def lit(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--fecha", default=date.today().isoformat(), help="fecha de descarga AAAA-MM-DD")
    ap.add_argument("--lote", type=int, default=40, help="filas por INSERT")
    ap.add_argument("--filas-por-archivo", type=int, default=4000)
    a = ap.parse_args()
    ref = date.fromisoformat(a.fecha)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for f in out.glob("data_*.sql"):
        f.unlink()

    vistos, repetidos, filas = set(), 0, []
    n_sob = n_par = 0
    with open(a.csv, encoding="utf-8-sig", newline="") as fh:
        for r in csv.DictReader(fh):
            cu = r["CODIGO_UNICO"].strip()
            if cu in vistos:
                repetidos += 1
                continue
            vistos.add(cu)
            d = {v: r[k].strip() for k, v in COLS.items()}
            for k in NUM:
                d[k] = num(d[k])
            d["habitantes"] = int(num(d["habitantes"])) if num(d["habitantes"]) is not None else None
            for k in ("fec_ini_ejecucion", "fec_fin_ejecucion"):
                d[k] = d[k][:10] or None
            d["ultimo_devengado"] = d["ultimo_devengado"] or None
            mv, ca = d["monto_viable"], d["costo_actualizado"]
            d["sobrecosto_pct"] = round((ca - mv) / mv * 100, 2) if mv and mv > 0 and ca is not None else None
            d["alerta_sobrecosto"] = int(d["sobrecosto_pct"] is not None and d["sobrecosto_pct"] >= UMBRAL_SOBRECOSTO * 100)
            d["meses_sin_devengado"] = meses_entre(d["ultimo_devengado"], ref)
            af, ms = d["avance_fisico"], d["meses_sin_devengado"]
            d["alerta_paralizacion"] = int(af is not None and UMBRAL_AVANCE_MIN <= af < 100
                                           and ms is not None and ms >= MESES_SIN_DEVENGADO)
            d["busqueda"] = sin_tildes(f'{d["nombre"]} {d["entidad"]} {d["distrito"]} {d["provincia"]}')
            d["entidad_n"], d["funcion_n"], d["departamento_n"] = (sin_tildes(d[k]) for k in ("entidad", "funcion", "departamento"))
            n_sob += d["alerta_sobrecosto"]
            n_par += d["alerta_paralizacion"]
            filas.append(d)

    cols_sql = ",".join(ORDEN)
    k = 0
    for ini in range(0, len(filas), a.filas_por_archivo):
        bloque = filas[ini:ini + a.filas_por_archivo]
        with open(out / f"data_{k:03d}.sql", "w", encoding="utf-8") as fo:
            for j in range(0, len(bloque), a.lote):
                vals = ",\n".join("(" + ",".join(lit(x[c]) for c in ORDEN) + ")" for x in bloque[j:j + a.lote])
                fo.write(f"INSERT INTO inversiones ({cols_sql}) VALUES\n{vals};\n")
        k += 1
    with open(out / "meta.sql", "w", encoding="utf-8") as fo:
        for clave, valor in [("fecha_descarga", a.fecha), ("total_inversiones", len(filas)),
                             ("alertas_sobrecosto", n_sob), ("alertas_paralizacion", n_par),
                             ("fuente", "Ministerio de Economía y Finanzas, Información de inversiones públicas 2001-2026"),
                             ("url", "https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-inversiones-p%C3%BAblicas-2001%E2%80%932026-mef")]:
            fo.write(f"INSERT OR REPLACE INTO meta (clave, valor) VALUES ({lit(clave)}, {lit(str(valor))});\n")
    print(f"filas={len(filas)} repetidos_omitidos={repetidos} archivos={k} "
          f"alerta_sobrecosto={n_sob} alerta_paralizacion={n_par} fecha={a.fecha}")


if __name__ == "__main__":
    sys.exit(main())
