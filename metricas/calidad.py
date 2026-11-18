"""Bloque 1: calidad de datos y alertas, calculado sobre la base SQLite local (solo lectura)."""
from comun import ahora, csv_out, db, parte_json

c = db()
q = lambda s, *a: c.execute(s, a).fetchall()
un = lambda s, *a: c.execute(s, a).fetchone()[0]

total = un("SELECT COUNT(*) FROM inversiones")
meta = dict(q("SELECT clave, valor FROM meta"))
cols = [r[1] for r in q("PRAGMA table_info(inversiones)")]
interno = {"busqueda", "entidad_n", "funcion_n", "departamento_n"}
cols_datos = [x for x in cols if x not in interno]

# Nulos / vacíos por columna (NULL o cadena vacía)
nulos = []
for col in cols_datos:
    n = un(f"SELECT COUNT(*) FROM inversiones WHERE {col} IS NULL OR TRIM(CAST({col} AS TEXT)) = ''")
    nulos.append({"columna": col, "nulos": n, "pct_nulos": round(100 * n / total, 2),
                  "completos": total - n, "pct_completos": round(100 * (total - n) / total, 2)})
csv_out("calidad_nulos.csv", nulos)

# Ceros (montos que valen 0 también son datos débiles)
ceros = []
for col in ("monto_viable", "costo_actualizado", "pim_anio", "dev_anio", "saldo_ejecutar", "avance_fisico", "avance_ejecucion"):
    n = un(f"SELECT COUNT(*) FROM inversiones WHERE {col} = 0")
    ceros.append({"columna": col, "ceros": n, "pct_ceros": round(100 * n / total, 2)})
csv_out("calidad_ceros.csv", ceros)


def agrupado(col, tope=None):
    lim = f"LIMIT {tope}" if tope else ""
    return [{col: r[0] or "(sin dato)", "inversiones": r[1], "pct": round(100 * r[1] / total, 2),
             "costo_actualizado": round(r[2] or 0, 2), "devengado_anio": round(r[3] or 0, 2),
             "saldo_ejecutar": round(r[4] or 0, 2), "alertas_sobrecosto": r[5], "alertas_paralizacion": r[6]}
            for r in q(f"""SELECT {col}, COUNT(*) n, SUM(costo_actualizado), SUM(dev_anio),
                SUM(CASE WHEN saldo_ejecutar > 0 THEN saldo_ejecutar ELSE 0 END),
                SUM(alerta_sobrecosto), SUM(alerta_paralizacion)
                FROM inversiones GROUP BY {col} ORDER BY n DESC {lim}""")]


niv = agrupado("nivel")
dep = agrupado("departamento", 10)
fun = agrupado("funcion", 10)
csv_out("calidad_por_nivel.csv", niv)
csv_out("calidad_por_departamento_top10.csv", dep)
csv_out("calidad_por_funcion_top10.csv", fun)

fechas = {k: q(f"SELECT MIN({k}), MAX({k}) FROM inversiones WHERE {k} IS NOT NULL AND {k} <> ''")[0]
          for k in ("fec_ini_ejecucion", "fec_fin_ejecucion", "ultimo_devengado")}
csv_out("calidad_rango_fechas.csv", [{"campo": k, "minimo": v[0], "maximo": v[1]} for k, v in fechas.items()])

m = q("""SELECT SUM(costo_actualizado), SUM(dev_anio), SUM(CASE WHEN saldo_ejecutar > 0 THEN saldo_ejecutar ELSE 0 END),
         SUM(monto_viable), SUM(pim_anio) FROM inversiones""")[0]
montos = {"costo_actualizado_total": round(m[0], 2), "devengado_anio_total": round(m[1], 2),
          "saldo_por_ejecutar_total": round(m[2], 2), "monto_viable_total": round(m[3], 2), "pim_anio_total": round(m[4], 2)}
csv_out("calidad_montos_totales.csv", [{"indicador": k, "soles": v} for k, v in montos.items()])

# Duplicados: la base tiene clave primaria; los eliminados en el ETL no quedan guardados
dup_en_base = total - un("SELECT COUNT(DISTINCT codigo_unico) FROM inversiones")

# ---------------- Alertas ----------------
sob = un("SELECT SUM(alerta_sobrecosto) FROM inversiones")
par = un("SELECT SUM(alerta_paralizacion) FROM inversiones")
ambas = un("SELECT COUNT(*) FROM inversiones WHERE alerta_sobrecosto=1 AND alerta_paralizacion=1")
ninguna = un("SELECT COUNT(*) FROM inversiones WHERE alerta_sobrecosto=0 AND alerta_paralizacion=0")
alt_tot = [{"alerta": "sobrecosto", "inversiones": sob, "pct_del_total": round(100 * sob / total, 2)},
           {"alerta": "posible_paralizacion", "inversiones": par, "pct_del_total": round(100 * par / total, 2)},
           {"alerta": "ambas", "inversiones": ambas, "pct_del_total": round(100 * ambas / total, 2)},
           {"alerta": "ninguna", "inversiones": ninguna, "pct_del_total": round(100 * ninguna / total, 2)}]
csv_out("alertas_totales.csv", alt_tot)


def alerta_por(col, tope=None):
    lim = f"LIMIT {tope}" if tope else ""
    out = []
    for r in q(f"""SELECT {col}, COUNT(*), SUM(alerta_sobrecosto), SUM(alerta_paralizacion),
               SUM(CASE WHEN alerta_sobrecosto=1 THEN costo_actualizado END),
               SUM(CASE WHEN alerta_paralizacion=1 THEN costo_actualizado END)
               FROM inversiones GROUP BY {col} ORDER BY SUM(alerta_sobrecosto)+SUM(alerta_paralizacion) DESC {lim}"""):
        out.append({col: r[0] or "(sin dato)", "inversiones": r[1], "sobrecosto": r[2], "pct_sobrecosto": round(100 * r[2] / r[1], 2),
                    "paralizacion": r[3], "pct_paralizacion": round(100 * r[3] / r[1], 2),
                    "costo_en_sobrecosto": round(r[4] or 0, 2), "costo_en_paralizacion": round(r[5] or 0, 2)})
    return out


a_niv = alerta_por("nivel")
a_dep = alerta_por("departamento", 10)
csv_out("alertas_por_nivel.csv", a_niv)
csv_out("alertas_por_departamento_top10.csv", a_dep)

# Histograma de sobrecosto_pct (todas las inversiones con dato) por tramos
tramos = [("< 0 % (costo menor al viable)", None, 0), ("0 a 10 %", 0, 10), ("10 a 25 %", 10, 25), ("25 a 50 %", 25, 50),
          ("50 a 100 % (alerta)", 50, 100), ("100 a 200 % (alerta)", 100, 200), ("200 % o más (alerta)", 200, None)]
hist_s = []
con_dato = un("SELECT COUNT(*) FROM inversiones WHERE sobrecosto_pct IS NOT NULL")
for nom, lo, hi in tramos:
    w = ["sobrecosto_pct IS NOT NULL"]
    if lo is not None: w.append(f"sobrecosto_pct >= {lo}")
    if hi is not None: w.append(f"sobrecosto_pct < {hi}")
    n = un("SELECT COUNT(*) FROM inversiones WHERE " + " AND ".join(w))
    hist_s.append({"tramo": nom, "inversiones": n, "pct": round(100 * n / con_dato, 2)})
hist_s.append({"tramo": "sin dato (monto viable vacío o 0)", "inversiones": total - con_dato, "pct": round(100 * (total - con_dato) / total, 2)})
csv_out("alertas_hist_sobrecosto.csv", hist_s)

# Histograma de meses_sin_devengado
tr_m = [("sin dato (sin devengado registrado)", None, None), ("0 a 2 meses", 0, 3), ("3 a 5 meses", 3, 6), ("6 a 11 meses (alerta si avance 40-99 %)", 6, 12),
        ("12 a 23 meses", 12, 24), ("24 a 59 meses", 24, 60), ("60 meses o más", 60, None)]
hist_m = []
for nom, lo, hi in tr_m:
    if lo is None and hi is None:
        n = un("SELECT COUNT(*) FROM inversiones WHERE meses_sin_devengado IS NULL")
    else:
        w = ["meses_sin_devengado IS NOT NULL", f"meses_sin_devengado >= {lo}"]
        if hi is not None: w.append(f"meses_sin_devengado < {hi}")
        n = un("SELECT COUNT(*) FROM inversiones WHERE " + " AND ".join(w))
    hist_m.append({"tramo": nom, "inversiones": n, "pct": round(100 * n / total, 2)})
csv_out("alertas_hist_meses_sin_devengado.csv", hist_m)

def stats(col, cond=""):
    v = [r[0] for r in q(f"SELECT {col} FROM inversiones WHERE {col} IS NOT NULL {cond} ORDER BY {col}")]
    n = len(v)
    return {"n": n, "min": v[0], "mediana": v[n // 2], "p90": v[int(n * .9)], "max": v[-1], "media": round(sum(v) / n, 2)}

parte_json("calidad", {
    "generado": ahora(), "base": str(meta), "filas_totales": total, "columnas_tabla": len(cols), "columnas_de_datos_MEF": len(cols_datos) - 2,
    "columnas_calculadas_por_etl": ["sobrecosto_pct", "meses_sin_devengado", "alerta_sobrecosto", "alerta_paralizacion"],
    "duplicados_codigo_unico_en_base": dup_en_base,
    "duplicados_eliminados_en_etl": None,
    "duplicados_nota": "El ETL descarta los códigos únicos repetidos (queda el primero) y solo lo imprime al ejecutarse; el CSV original del MEF no está en este equipo, por eso la cifra no se puede reconstruir aquí. En la base hay 0 duplicados (clave primaria).",
    "nulos_por_columna": nulos, "ceros": ceros, "por_nivel": niv, "por_departamento_top10": dep, "por_funcion_top10": fun,
    "rango_fechas": fechas, "montos_totales": montos,
    "alertas": {"totales": alt_tot, "por_nivel": a_niv, "por_departamento_top10": a_dep,
                "hist_sobrecosto_pct": hist_s, "hist_meses_sin_devengado": hist_m,
                "stats_sobrecosto_pct_en_alerta": stats("sobrecosto_pct", "AND alerta_sobrecosto=1"),
                "stats_meses_sin_devengado_en_alerta": stats("meses_sin_devengado", "AND alerta_paralizacion=1"),
                "cifras_meta_en_base": {k: meta.get(k) for k in ("total_inversiones", "alertas_sobrecosto", "alertas_paralizacion")}},
})
print(f"calidad: filas={total} sobrecosto={sob} paralizacion={par} ambas={ambas} dup_en_base={dup_en_base}")
