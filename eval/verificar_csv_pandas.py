#!/usr/bin/env python3
"""Verificación independiente (sin SQLite ni ETL) de una muestra de preguntas.csv desde el CSV crudo del MEF.

Recalcula con pandas desde DETALLE_INVERSIONES.csv: deduplica por CODIGO_UNICO (primera aparición),
calcula sobrecosto y meses sin devengado por su cuenta y compara con valor_oficial (±1 %).
Uso:  ~/cortex-temp/.venv/bin/python -I eval/verificar_csv_pandas.py [--raw inv.csv]
"""
import argparse
import os
import sys
import unicodedata

import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
RAW = "/home/adrielorihuela/.claude/jobs/0c8ddb34/tmp/data/inv.csv"


def norm(s):
    return s.map(lambda t: "".join(c for c in unicodedata.normalize("NFD", str(t)) if unicodedata.category(c) != "Mn").upper().strip())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", default=RAW)
    a = ap.parse_args()
    df = pd.read_csv(a.raw, encoding="utf-8-sig", dtype=str, keep_default_na=False)
    df["CODIGO_UNICO"] = df["CODIGO_UNICO"].str.strip()
    df = df.drop_duplicates("CODIGO_UNICO", keep="first").copy()
    for c in ["MONTO_VIABLE", "COSTO_ACTUALIZADO", "DEV_ANIO_ACTUAL", "AVANCE_FISICO", "SALDO_EJECUTAR"]:
        df[c] = pd.to_numeric(df[c].str.strip(), errors="coerce")
    df["DEP"], df["FUN"], df["ENT"] = norm(df["DEPARTAMENTO"]), norm(df["FUNCION"]), norm(df["ENTIDAD"])
    df["NIV"] = df["NIVEL"].str.strip()
    mv, ca = df["MONTO_VIABLE"], df["COSTO_ACTUALIZADO"]
    df["SOB"] = ((ca - mv) / mv * 100).where(mv > 0).round(2)
    ud = df["ULTIMO_DEVENGADO"].str.strip()
    ok = ud.str.fullmatch(r"\d{6}")
    anio, mes = pd.to_numeric(ud.str[:4].where(ok)), pd.to_numeric(ud.str[4:].where(ok))
    df["MESES"] = (2026 - anio) * 12 + (11 - mes)
    df["PAR"] = df["AVANCE_FISICO"].between(40, 100, inclusive="left") & (df["MESES"] >= 6)
    df["ASOB"] = df["SOB"] >= 50
    nombre_n = norm(df["NOMBRE_INVERSION"])
    fila = lambda cu: df.loc[df["CODIGO_UNICO"] == cu].iloc[0]

    dep = lambda d: df["DEP"] == d
    calc = {
        "B01": lambda: int((df["FUN"].str.contains("TRANSPORTE") & dep("CUSCO") & (df["NIV"] == "GR")).sum()),
        "B02": lambda: df.loc[df["FUN"].str.contains("SALUD") & dep("PIURA"), "COSTO_ACTUALIZADO"].max(),
        "B04": lambda: int((df["ENT"] == "MUNICIPALIDAD PROVINCIAL DE AREQUIPA").sum()),
        "B05": lambda: int((nombre_n.str.contains("PUENTE") & dep("AMAZONAS")).sum()),
        "B07": lambda: int(((df["FUN"] == "TURISMO") & dep("CUSCO")).sum()),
        "B10": lambda: int((df["FUN"].str.contains("PESCA") & dep("APURIMAC")).sum()),
        "D01": lambda: fila("2194680")["AVANCE_FISICO"],
        "D02": lambda: fila("2488996")["MESES"],
        "D04": lambda: fila("2226075")["SOB"],
        "D05": lambda: fila("2110581")["SALDO_EJECUTAR"],
        "D10": lambda: int((df["CODIGO_UNICO"] == "9999999").sum()),
        "A01": lambda: int((df["PAR"] & dep("AYACUCHO")).sum()),
        "A02": lambda: df.loc[df["ASOB"] & dep("JUNIN"), "SOB"].max(),
        "A04": lambda: int((df["PAR"] & dep("CAJAMARCA") & (df["NIV"] == "GL")).sum()),
        "A07": lambda: df.loc[df["PAR"] & dep("TACNA"), "MESES"].max(),
        "A10": lambda: int((df["PAR"] & (df["FUN"] == "TURISMO") & dep("MOQUEGUA")).sum()),
        "R01": lambda: df.loc[dep("MOQUEGUA"), "COSTO_ACTUALIZADO"].sum(),
        "R04": lambda: int(dep("TUMBES").sum()),
        "R07": lambda: df.loc[dep("SAN MARTIN"), "DEV_ANIO_ACTUAL"].sum(),
        "R10": lambda: df["COSTO_ACTUALIZADO"].sum(),
    }
    ref = pd.read_csv(os.path.join(AQUI, "preguntas.csv"), dtype=str, keep_default_na=False).set_index("id")
    fallos = []
    print(f"Inversiones únicas en el CSV crudo: {len(df)}")
    for i, f in calc.items():
        v, e = float(f()), float(ref.loc[i, "valor_oficial"])
        bien = (v == e) if e == 0 else abs(v - e) <= abs(e) * 0.01
        print(f"{i}: pandas={v:,.2f} csv={e:,.2f} {'OK' if bien else 'FALLA'}")
        if not bien:
            fallos.append(i)
    if len(df) != 150574:
        fallos.append("total")
    if fallos:
        print("FALLA:", fallos)
        sys.exit(1)
    print(f"OK: {len(calc)} respuestas confirmadas desde el CSV crudo")


if __name__ == "__main__":
    main()
