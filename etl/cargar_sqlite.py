"""Construye la base SQLite local (en la máquina del grupo) a partir de la salida del ETL.

Uso: python etl/cargar_sqlite.py --build build/ --db ~/.local/share/obraclara/inversiones.db

Sirve las consultas pesadas sin gastar lecturas ni escrituras del plan gratuito de Cloudflare D1.
"""
import argparse
import sqlite3
import sys
import time
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", required=True)
    ap.add_argument("--db", required=True)
    a = ap.parse_args()
    build, db = Path(a.build), Path(a.db).expanduser()
    db.parent.mkdir(parents=True, exist_ok=True)
    tmp = db.with_suffix(".nuevo")
    tmp.unlink(missing_ok=True)
    t0 = time.time()
    con = sqlite3.connect(tmp)
    con.executescript((Path(__file__).parent / "schema.sql").read_text(encoding="utf-8"))
    con.execute("PRAGMA journal_mode=OFF")
    con.execute("PRAGMA synchronous=OFF")
    archivos = sorted(build.glob("data_*.sql"))
    if not archivos:
        sys.exit("No hay archivos data_*.sql en " + str(build))
    for f in archivos:
        con.executescript(f.read_text(encoding="utf-8"))
    con.executescript((build / "meta.sql").read_text(encoding="utf-8"))
    con.commit()
    n = con.execute("SELECT COUNT(*) FROM inversiones").fetchone()[0]
    con.execute("ANALYZE")
    con.close()
    tmp.replace(db)  # reemplazo atómico: el conector sigue leyendo la base anterior hasta el cambio
    print(f"{n} inversiones en {db} ({db.stat().st_size / 1e6:.0f} MB, {time.time() - t0:.0f} s)")


if __name__ == "__main__":
    main()
