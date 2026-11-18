"""Utilidades compartidas de los scripts de métricas de ObraClara Perú (solo biblioteca estándar)."""
import csv
import json
import os
import sqlite3
import time
import urllib.request
from datetime import datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
RES = RAIZ / "resultados"
PARTES = RES / "partes"
BASE = os.environ.get("OBRACLARA_URL", "https://obraclara.adrielorihuela.net")
DB = Path(os.environ.get("OBRACLARA_DB", Path.home() / ".local/share/obraclara/inversiones.db"))
PREGUNTAS = RAIZ.parent / "eval" / "preguntas.csv"
PAUSA = 1.2  # s entre llamadas al servidor público (límite: 60 por minuto)


def ahora():
    return datetime.now().astimezone().isoformat(timespec="seconds")


def db():
    return sqlite3.connect(f"file:{DB}?mode=ro", uri=True)


def csv_out(nombre, filas, campos=None):
    RES.mkdir(parents=True, exist_ok=True)
    filas = list(filas)
    campos = campos or list(filas[0].keys())
    with open(RES / nombre, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(filas)


def parte_json(nombre, datos):
    PARTES.mkdir(parents=True, exist_ok=True)
    with open(PARTES / f"{nombre}.json", "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)


def http(metodo, ruta, cuerpo=None, timeout=30, origen=None):
    """Devuelve (estado, bytes, segundos). Nunca lanza: estado 0 si falla la red."""
    cab = {"accept": "application/json, text/event-stream", "content-type": "application/json",
           "user-agent": "obraclara-metricas/1.0"}
    if origen:
        cab["origin"] = origen
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(BASE + ruta, data=datos, method=metodo, headers=cab)
    t = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read(), time.perf_counter() - t
    except urllib.error.HTTPError as e:
        return e.code, e.read(), time.perf_counter() - t
    except Exception as e:  # noqa: BLE001
        return 0, str(e).encode(), time.perf_counter() - t


_id = [0]


def mcp(metodo, params=None, timeout=30):
    """Llamada JSON-RPC a /mcp. Devuelve (ok, resultado|None, bytes_respuesta, segundos)."""
    _id[0] += 1
    cuerpo = {"jsonrpc": "2.0", "id": _id[0], "method": metodo}
    if params is not None:
        cuerpo["params"] = params
    est, raw, seg = http("POST", "/mcp", cuerpo, timeout)
    if est != 200:
        return False, None, len(raw), seg
    txt = raw.decode("utf-8", "replace")
    for linea in txt.splitlines():
        if linea.startswith("data:"):
            txt = linea[5:].strip()
            break
    try:
        j = json.loads(txt)
    except ValueError:
        return False, None, len(raw), seg
    if "error" in j or j.get("result", {}).get("isError"):
        return False, j, len(raw), seg
    return True, j.get("result"), len(raw), seg


def tool(nombre, args, timeout=30):
    ok, res, n, seg = mcp("tools/call", {"name": nombre, "arguments": args}, timeout)
    datos = None
    if ok:
        datos = json.loads(res["content"][0]["text"])
    return ok, datos, n, seg


def percentil(xs, p):
    xs = sorted(xs)
    if not xs:
        return None
    k = (len(xs) - 1) * p / 100
    f = int(k)
    c = min(f + 1, len(xs) - 1)
    return xs[f] + (xs[c] - xs[f]) * (k - f)
