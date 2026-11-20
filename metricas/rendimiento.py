"""Bloque 2: rendimiento del servidor MCP en producción (latencia desde Lima, incluye la red)."""
import csv
import json
import random
import statistics
import time

from comun import PAUSA, PREGUNTAS, PARTES, ahora, csv_out, db, http, mcp, parte_json, percentil, tool

N = 30  # llamadas por herramienta (la primera medición usó 20; ver rendimiento_mcp_previo_n20.csv)
random.seed(42)
pre = list(csv.DictReader(open(PREGUNTAS, encoding="utf-8")))
args = {}
for t in ("buscar_inversiones", "detalle_inversion", "alertas_inversion", "resumen_inversiones"):
    args[t] = [json.loads(p["parametros_esperados"]) for p in pre if p["herramienta_esperada"] == t]
c = db()
# Completar a N argumentos distintos por herramienta (las 10 de la evaluación y variantes con otro límite de filas)
for _t in ("buscar_inversiones", "alertas_inversion"):
    _b = list(args[_t])
    args[_t] = _b + [{**a, "limite": 5} for a in _b] + [{**a, "limite": 10} for a in _b]
codigos = [r[0] for r in c.execute("SELECT codigo_unico FROM inversiones ORDER BY codigo_unico")]
args["detalle_inversion"] += [{"codigo_unico": x} for x in random.sample(codigos, N - len(args["detalle_inversion"]))]
deps = [r[0] for r in c.execute("SELECT departamento FROM inversiones WHERE departamento<>'' GROUP BY departamento ORDER BY COUNT(*) DESC LIMIT 25")]
usados = {a.get("departamento") for a in args["resumen_inversiones"]}
extra = [d.title() for d in deps if d.title() not in usados and d not in usados]
args["resumen_inversiones"] += [{"departamento": d} for d in extra[:N - len(args["resumen_inversiones"])]]

filas, crudo, detalle = [], {}, []
def serie(nombre, fn):
    lat, ok_n, tam = [], 0, []
    for i, a in enumerate(fn, 1):
        ok, n, seg = a()
        lat.append(seg * 1000); tam.append(n); ok_n += ok
        detalle.append({"prueba": nombre, "n": i, "exito": int(bool(ok)), "ms": round(seg * 1000, 1), "bytes": n})
        time.sleep(PAUSA)
    ms = lambda v: round(v, 1)
    filas.append({"prueba": nombre, "llamadas": len(lat), "exitosas": ok_n, "errores": len(lat) - ok_n, "tasa_exito_pct": round(100 * ok_n / len(lat), 1),
                  "lat_media_ms": ms(statistics.mean(lat)), "lat_p50_ms": ms(percentil(lat, 50)), "lat_p90_ms": ms(percentil(lat, 90)), "lat_p95_ms": ms(percentil(lat, 95)),
                  "lat_max_ms": ms(max(lat)), "lat_min_ms": ms(min(lat)), "tam_resp_medio_bytes": round(statistics.mean(tam)),
                  "tam_resp_max_bytes": max(tam)})
    crudo[nombre] = [round(x, 1) for x in lat]
    print(nombre, filas[-1]["lat_p50_ms"], "ms p50", filas[-1]["tasa_exito_pct"], "% ok", flush=True)

def llamada(t, a):
    def f():
        ok, d, n, seg = tool(t, a)
        return ok, n, seg
    return f

inicio = ahora()
# Descarte de calentamiento (no se cuenta): una llamada
mcp("tools/list")
time.sleep(PAUSA)
for t, lista in args.items():
    serie(t, [llamada(t, a) for a in lista[:N]])
def lista():
    ok, r, n, seg = mcp("tools/list")
    return ok and len(r.get("tools", [])) == 4, n, seg
serie("tools/list", [lista] * 10)
def salud():
    est, raw, seg = http("GET", "/salud")
    return est == 200 and b'"estado":"ok"' in raw, len(raw), seg
serie("GET /salud", [salud] * 10)
fin = ahora()
csv_out("rendimiento_mcp.csv", filas)
csv_out("rendimiento_mcp_crudo.csv", detalle)
parte_json("rendimiento", {"inicio": inicio, "fin": fin, "url": "https://obraclara.adrielorihuela.net",
    "nota": "Latencia medida con Python urllib desde Lima (Perú) hacia Cloudflare; incluye DNS, TLS y red (cada llamada abre conexión nueva). Pausa de 1,2 s entre llamadas para respetar el límite de 60/min.",
    "filas": filas, "latencias_ms": crudo})
