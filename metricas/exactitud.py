"""Bloque 3: exactitud de las herramientas MCP frente a la base SQLite local."""
import random
import time
import unicodedata

from comun import PAUSA, ahora, csv_out, db, parte_json, tool

random.seed(2026)
c = db()
c.row_factory = __import__("sqlite3").Row
CAMPOS = ["codigo_unico", "nombre", "entidad", "nivel", "sector", "funcion", "departamento", "provincia", "distrito", "ubigeo",
          "monto_viable", "costo_actualizado", "pim_anio", "dev_anio", "saldo_ejecutar", "monto_laudo", "avance_fisico", "avance_ejecucion",
          "ultimo_devengado", "fec_ini_ejecucion", "fec_fin_ejecucion", "situacion", "habitantes", "sobrecosto_pct", "meses_sin_devengado",
          "alerta_sobrecosto", "alerta_paralizacion"]
NUMERICOS = {"monto_viable", "costo_actualizado", "pim_anio", "dev_anio", "saldo_ejecutar", "monto_laudo", "avance_fisico", "avance_ejecucion",
             "habitantes", "sobrecosto_pct", "meses_sin_devengado", "alerta_sobrecosto", "alerta_paralizacion"}


def igual(k, a, b):
    if a is None or b is None:
        return a is None and b is None
    if k in NUMERICOS:
        return abs(float(a) - float(b)) <= 0.005
    return str(a) == str(b)


codigos = [r[0] for r in c.execute("SELECT codigo_unico FROM inversiones WHERE codigo_unico <> '' ORDER BY codigo_unico")]
muestra = random.sample(codigos, 30)
det, camp_ok, camp_tot, num_ok, num_tot = [], 0, 0, 0, 0
for cu in muestra:
    ok, d, n, seg = tool("detalle_inversion", {"codigo_unico": cu})
    time.sleep(PAUSA)
    fila = dict(c.execute("SELECT * FROM inversiones WHERE codigo_unico=?", (cu,)).fetchone())
    difs = []
    if not ok or not d or not d.get("datos"):
        difs = ["sin_respuesta"]
        n_c = len(CAMPOS)
    else:
        r = d["datos"]
        n_c = len(CAMPOS)
        for k in CAMPOS:
            e = igual(k, r.get(k), fila.get(k))
            camp_tot += 1; camp_ok += e
            if k in NUMERICOS:
                num_tot += 1; num_ok += e
            if not e: difs.append(k)
    det.append({"codigo_unico": cu, "campos_comparados": n_c, "campos_iguales": n_c - len(difs) if difs != ["sin_respuesta"] else 0,
                "numericos_iguales": all(k not in NUMERICOS for k in difs) and difs != ["sin_respuesta"],
                "coincide_100pct": not difs, "campos_distintos": "|".join(difs)})
csv_out_det = det


def norm(t):
    return unicodedata.normalize("NFD", t).encode("ascii", "ignore").decode().upper().strip()


ENL = {"DE", "DEL", "LA", "LAS", "LOS", "EL", "Y", "EN", "A"}
deps = [r[0] for r in c.execute("SELECT departamento FROM inversiones WHERE departamento<>'' GROUP BY departamento ORDER BY departamento")]
ents = [r[0] for r in c.execute("SELECT entidad FROM inversiones WHERE entidad<>'' GROUP BY entidad HAVING COUNT(*)>=30 ORDER BY entidad")]
casos = [("departamento", d) for d in random.sample(deps, 5)] + [("entidad", e) for e in random.sample(ents, 5)]
RES = [("inversiones", "inversiones"), ("costo_actualizado_total", "costo_actualizado_total"), ("devengado_anio_actual", "devengado_anio_actual"),
       ("saldo_por_ejecutar", "saldo_por_ejecutar"), ("alertas_sobrecosto", "alertas_sobrecosto"), ("alertas_paralizacion", "alertas_paralizacion")]
res = []
for tipo, valor in casos:
    ok, d, n, seg = tool("resumen_inversiones", {tipo: valor.title() if tipo == "departamento" else valor})
    time.sleep(PAUSA)
    if tipo == "departamento":
        w, p = "departamento_n = ?", [norm(valor)]
    else:  # misma regla que el servidor: todas las palabras (sin enlaces) deben aparecer en el nombre
        pal = [x for x in norm(valor).split() if (len(x) > 1 or x.isdigit()) and x not in ENL]
        w, p = " AND ".join(["entidad_n LIKE ?"] * len(pal)), [f"%{x}%" for x in pal]
    s = c.execute(f"""SELECT COUNT(*) a, ROUND(SUM(costo_actualizado),2) b, ROUND(SUM(dev_anio),2) c,
        ROUND(SUM(CASE WHEN saldo_ejecutar>0 THEN saldo_ejecutar ELSE 0 END),2) d, SUM(alerta_sobrecosto) e, SUM(alerta_paralizacion) f
        FROM inversiones WHERE {w}""", p).fetchone()
    sql = dict(zip([r[0] for r in RES], s))
    # Comparación adicional por nombre exacto (para entidades)
    ex = None
    if tipo == "entidad":
        ex = c.execute("SELECT COUNT(*) FROM inversiones WHERE entidad=?", (valor,)).fetchone()[0]
    r = d["datos"] if ok and d else {}
    difs = [k for k, _ in RES if r.get(k) is None or abs(float(r[k]) - float(sql[k] or 0)) > 0.01]
    res.append({"filtro": tipo, "valor": valor, "inversiones_mcp": r.get("inversiones"), "inversiones_sql": sql["inversiones"],
                "costo_mcp": r.get("costo_actualizado_total"), "costo_sql": sql["costo_actualizado_total"],
                "campos_distintos": "|".join(difs), "coincide_100pct": not difs,
                "inversiones_sql_nombre_exacto": ex})
tot_det = sum(1 for x in det if x["coincide_100pct"])
tot_res = sum(1 for x in res if x["coincide_100pct"])
resumen = [
    {"prueba": "detalle_inversion (30 códigos)", "casos": 30, "coinciden": tot_det, "pct_casos": round(100 * tot_det / 30, 1),
     "campos_comparados": camp_tot, "campos_iguales": camp_ok, "pct_campos": round(100 * camp_ok / max(camp_tot, 1), 2),
     "pct_campos_numericos": round(100 * num_ok / max(num_tot, 1), 2)},
    {"prueba": "resumen_inversiones (10 filtros)", "casos": 10, "coinciden": tot_res, "pct_casos": round(100 * tot_res / 10, 1),
     "campos_comparados": 60, "campos_iguales": 60 - sum(len(x["campos_distintos"].split("|")) for x in res if x["campos_distintos"]),
     "pct_campos": round(100 * (60 - sum(len(x["campos_distintos"].split("|")) for x in res if x["campos_distintos"])) / 60, 2),
     "pct_campos_numericos": ""}]
csv_out("exactitud_herramientas.csv", resumen)
csv_out("exactitud_detalle.csv", det)
csv_out("exactitud_resumenes.csv", res)
parte_json("exactitud", {"generado": ahora(), "semilla_detalle": 2026, "resumen": resumen, "detalle": det, "resumenes": res,
    "criterio": "Numéricos iguales con tolerancia 0,005 (montos redondeados a 2 decimales); texto y fechas, igualdad exacta. Resúmenes por departamento: departamento_n igual al normalizado; por entidad: misma regla de palabras que el servidor (todas deben aparecer)."})
print("exactitud:", resumen)
