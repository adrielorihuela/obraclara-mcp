#!/usr/bin/env python3
"""Verifica las respuestas de referencia de eval/preguntas.csv contra la base de ObraClara.

Reconstruye en memoria la misma base que está en D1 (etl/schema.sql + data_*.sql + meta.sql) y recalcula
cada valor_oficial con el SQL guardado en CONSULTAS. Las consultas imitan los filtros de los tools
(worker/src/lib/queries.ts): departamento_n = X, funcion_n LIKE %X%, entidad_n/busqueda LIKE por palabra,
nivel = GL/GR/GN; buscar ordena por costo_actualizado DESC, alertas de sobrecosto por sobrecosto_pct DESC y las
de paralización por meses_sin_devengado DESC, costo_actualizado DESC.

Cada consulta devuelve (valor, clave): valor es lo que se compara con valor_oficial (tolerancia ±1 %) y clave,
cuando existe, es el texto que debe aparecer en respuesta_referencia (código único o nombre de entidad).
Para los top-1 hay además una consulta de empate: el segundo lugar debe ser distinto del primero.

Uso:  python3 -I eval/verificar_referencias.py [--build DIR] [--mostrar]
Sale con código 1 y lista los fallos si algo no coincide.
"""
import argparse
import csv
import glob
import os
import sqlite3
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SCHEMA = os.path.join(AQUI, "..", "etl", "schema.sql")
BUILD = "/home/adrielorihuela/.claude/jobs/0c8ddb34/tmp/data/build"
FECHA_CORTE = "2026-11-10"
TOTAL_ESPERADO = 150574

CONTAR = "SELECT COUNT(*), NULL FROM inversiones WHERE "
TOP_COSTO = "SELECT costo_actualizado, codigo_unico FROM inversiones WHERE {w} ORDER BY costo_actualizado DESC LIMIT 1"
TOP_SOB = "SELECT sobrecosto_pct, codigo_unico FROM inversiones WHERE alerta_sobrecosto = 1 AND {w} ORDER BY sobrecosto_pct DESC LIMIT 1"
TOP_PAR = ("SELECT meses_sin_devengado, codigo_unico FROM inversiones WHERE alerta_paralizacion = 1 AND {w} "
           "ORDER BY meses_sin_devengado DESC, costo_actualizado DESC LIMIT 1")
CAMPO = "SELECT {c}, {k} FROM inversiones WHERE codigo_unico = '{cu}'"
SUMA = "SELECT ROUND(SUM({c}), 2), NULL FROM inversiones WHERE {w}"
SALDO = "SELECT ROUND(SUM(CASE WHEN saldo_ejecutar > 0 THEN saldo_ejecutar ELSE 0 END), 2), NULL FROM inversiones WHERE {w}"

# Empates: el segundo lugar (OFFSET 1) debe tener un valor de orden distinto al primero.
EMPATE = {
    "costo": "SELECT costo_actualizado FROM inversiones WHERE {w} ORDER BY costo_actualizado DESC LIMIT 2",
    "sob": "SELECT sobrecosto_pct FROM inversiones WHERE alerta_sobrecosto = 1 AND {w} ORDER BY sobrecosto_pct DESC LIMIT 2",
    "par": ("SELECT meses_sin_devengado FROM inversiones WHERE alerta_paralizacion = 1 AND {w} "
            "ORDER BY meses_sin_devengado DESC, costo_actualizado DESC LIMIT 2"),
}

def top(plantilla, w, empate):
    return {"sql": plantilla.format(w=w), "empate": EMPATE[empate].format(w=w)}

def q(sql):
    return {"sql": sql}

# id -> consulta. valor esperado y texto clave se leen de preguntas.csv.
CONSULTAS = {
    # ---- búsqueda (buscar_inversiones) ----
    "B01": q(CONTAR + "funcion_n LIKE '%TRANSPORTE%' AND departamento_n = 'CUSCO' AND nivel = 'GR'"),
    "B02": top(TOP_COSTO, "funcion_n LIKE '%SALUD%' AND departamento_n = 'PIURA'", "costo"),
    "B03": q(CONTAR + "funcion_n LIKE '%SANEAMIENTO%' AND departamento_n = 'MADRE DE DIOS' AND nivel = 'GL'"),
    "B04": q(CONTAR + "entidad_n LIKE '%MUNICIPALIDAD%' AND entidad_n LIKE '%PROVINCIAL%' AND entidad_n LIKE '%DE%' "
             "AND entidad_n LIKE '%AREQUIPA%'"),
    "B05": q(CONTAR + "busqueda LIKE '%PUENTE%' AND departamento_n = 'AMAZONAS'"),
    "B06": top(TOP_COSTO, "funcion_n LIKE '%EDUCACION%' AND departamento_n = 'MADRE DE DIOS'", "costo"),
    "B07": q(CONTAR + "funcion_n LIKE '%TURISMO%' AND departamento_n = 'CUSCO'"),
    "B08": q(CONTAR + "busqueda LIKE '%COMISARIA%' AND departamento_n = 'LIMA'"),
    "B09": top(TOP_COSTO, "busqueda LIKE '%HOSPITAL%' AND departamento_n = 'LAMBAYEQUE'", "costo"),
    "B10": q(CONTAR + "funcion_n LIKE '%PESCA%' AND departamento_n = 'APURIMAC'"),
    # ---- detalle (detalle_inversion) ----
    "D01": q(CAMPO.format(c="avance_fisico", k="entidad", cu="2194680")),
    "D02": q(CAMPO.format(c="meses_sin_devengado", k="ultimo_devengado", cu="2488996")),
    "D03": q(CAMPO.format(c="dev_anio", k="entidad", cu="2251136")),
    "D04": q(CAMPO.format(c="sobrecosto_pct", k="entidad", cu="2226075")),
    "D05": q(CAMPO.format(c="saldo_ejecutar", k="entidad", cu="2110581")),
    "D06": q(CAMPO.format(c="costo_actualizado", k="entidad", cu="2340106")),
    "D07": q(CAMPO.format(c="habitantes", k="entidad", cu="2178454")),
    "D08": q(CAMPO.format(c="NULL", k="entidad", cu="2427376")),
    "D09": q(CAMPO.format(c="pim_anio", k="entidad", cu="2228738")),
    "D10": q("SELECT COUNT(*), NULL FROM inversiones WHERE codigo_unico = '9999999'"),
    # ---- alertas (alertas_inversion) ----
    "A01": q(CONTAR + "alerta_paralizacion = 1 AND departamento_n = 'AYACUCHO'"),
    "A02": top(TOP_SOB, "departamento_n = 'JUNIN'", "sob"),
    "A03": q(CONTAR + "alerta_sobrecosto = 1 AND departamento_n = 'LA LIBERTAD' AND nivel = 'GR'"),
    "A04": q(CONTAR + "alerta_paralizacion = 1 AND departamento_n = 'CAJAMARCA' AND nivel = 'GL'"),
    "A05": q(CONTAR + "alerta_paralizacion = 1 AND funcion_n LIKE '%EDUCACION%' AND departamento_n = 'ICA' AND nivel = 'GR'"),
    "A06": q(CONTAR + "alerta_sobrecosto = 1 AND funcion_n LIKE '%ORDEN PUBLICO%' AND departamento_n = 'LIMA'"),
    "A07": top(TOP_PAR, "departamento_n = 'TACNA'", "par"),
    "A08": q(CONTAR + "alerta_sobrecosto = 1 AND funcion_n LIKE '%TRANSPORTE%' AND nivel = 'GN'"),
    "A09": q(CONTAR + "alerta_paralizacion = 1 AND funcion_n LIKE '%SANEAMIENTO%' AND departamento_n = 'SAN MARTIN' AND nivel = 'GN'"),
    "A10": q(CONTAR + "alerta_paralizacion = 1 AND funcion_n LIKE '%TURISMO%' AND departamento_n = 'MOQUEGUA'"),
    # ---- resumen (resumen_inversiones) ----
    "R01": q(SUMA.format(c="costo_actualizado", w="departamento_n = 'MOQUEGUA'")),
    "R02": q(SUMA.format(c="dev_anio", w="entidad_n LIKE '%GOBIERNO%' AND entidad_n LIKE '%REGIONAL%' AND entidad_n LIKE '%AREQUIPA%'")),
    "R03": q(SALDO.format(w="funcion_n LIKE '%SALUD%' AND departamento_n = 'CALLAO' AND nivel = 'GR'")),
    "R04": q(CONTAR + "departamento_n = 'TUMBES'"),
    "R05": q(SUMA.format(c="dev_anio", w="funcion_n LIKE '%EDUCACION%' AND departamento_n = 'UCAYALI' AND nivel = 'GN'")),
    "R06": q(SUMA.format(c="costo_actualizado", w="entidad_n LIKE '%MUNICIPALIDAD%' AND entidad_n LIKE '%PROVINCIAL%' "
                         "AND entidad_n LIKE '%DE%' AND entidad_n LIKE '%PIURA%'")),
    "R07": q(SUMA.format(c="dev_anio", w="departamento_n = 'SAN MARTIN'")),
    "R08": q(SALDO.format(w="departamento_n = 'CALLAO' AND nivel = 'GN'")),
    "R09": q(SUMA.format(c="costo_actualizado", w="funcion_n LIKE '%TRANSPORTE%' AND departamento_n = 'HUANUCO' AND nivel = 'GL'")),
    "R10": q(SUMA.format(c="costo_actualizado", w="1 = 1")),
}


def construir(build):
    con = sqlite3.connect(":memory:")
    with open(SCHEMA, encoding="utf-8") as fh:
        con.executescript(fh.read())
    archivos = sorted(glob.glob(os.path.join(build, "data_*.sql"))) + [os.path.join(build, "meta.sql")]
    for f in archivos:
        with open(f, encoding="utf-8") as fh:
            con.executescript(fh.read())
    return con


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", default=BUILD)
    ap.add_argument("--csv", default=os.path.join(AQUI, "preguntas.csv"))
    ap.add_argument("--mostrar", action="store_true", help="imprime los valores calculados (para redactar el CSV)")
    a = ap.parse_args()

    con = construir(a.build)
    fallos = []
    total = con.execute("SELECT COUNT(*) FROM inversiones").fetchone()[0]
    corte = dict(con.execute("SELECT clave, valor FROM meta").fetchall()).get("fecha_descarga")
    if total != TOTAL_ESPERADO:
        fallos.append(f"base: {total} inversiones, se esperaban {TOTAL_ESPERADO}")
    if corte != FECHA_CORTE:
        fallos.append(f"base: fecha_descarga {corte}, se esperaba {FECHA_CORTE}")

    if a.mostrar:
        for i, c in CONSULTAS.items():
            print(i, con.execute(c["sql"]).fetchone(), [r[0] for r in con.execute(c["empate"])] if "empate" in c else "")
        return

    with open(a.csv, encoding="utf-8", newline="") as fh:
        filas = list(csv.DictReader(fh))
    ids = [f["id"] for f in filas]
    if len(filas) != 40 or len(set(ids)) != 40:
        fallos.append(f"el CSV debe tener 40 ids únicos, tiene {len(filas)} filas / {len(set(ids))} ids")
    tipos = {}
    for f in filas:
        tipos[f["tipo"]] = tipos.get(f["tipo"], 0) + 1
    if tipos != {"busqueda": 10, "detalle": 10, "alertas": 10, "resumen": 10}:
        fallos.append(f"tipos desbalanceados: {tipos}")
    if set(ids) != set(CONSULTAS):
        fallos.append(f"ids sin consulta: {sorted(set(ids) ^ set(CONSULTAS))}")

    for f in filas:
        i = f["id"]
        if i not in CONSULTAS:
            continue
        if f["fecha_corte"] != FECHA_CORTE:
            fallos.append(f"{i}: fecha_corte {f['fecha_corte']}")
        c = CONSULTAS[i]
        valor, clave = con.execute(c["sql"]).fetchone()
        ref = f["respuesta_referencia"]
        if f["valor_oficial"].strip():
            esperado = float(f["valor_oficial"])
            if valor is None or abs(valor - esperado) > max(abs(esperado) * 0.01, 1e-9) and not (esperado == 0 and valor == 0):
                fallos.append(f"{i}: SQL da {valor}, CSV dice {esperado}")
            elif valor != 0 and abs(valor - esperado) > abs(esperado) * 1e-6:
                fallos.append(f"{i}: dentro de ±1 % pero no exacto (SQL {valor}, CSV {esperado}); corregir el CSV")
        elif f["unidad"] != "texto":
            fallos.append(f"{i}: valor_oficial vacío con unidad {f['unidad']}")
        if clave is not None and str(clave) not in ref:
            fallos.append(f"{i}: '{clave}' no aparece en respuesta_referencia")
        if "empate" in c:
            r = [x[0] for x in con.execute(c["empate"])]
            if len(r) == 2 and r[0] == r[1]:
                fallos.append(f"{i}: empate en el primer lugar ({r})")
        if f["valor_oficial"].strip() == "0" or ("no existen resultados" in ref.lower()):
            if valor != 0:
                fallos.append(f"{i}: se esperaba cero resultados y hay {valor}")

    if fallos:
        print("FALLA:")
        for x in fallos:
            print("  -", x)
        sys.exit(1)
    print(f"OK: {len(filas)} preguntas verificadas contra {total} inversiones (corte {corte}). Tipos: {tipos}")


if __name__ == "__main__":
    main()
