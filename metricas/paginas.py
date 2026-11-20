"""Tiempo de carga de las páginas públicas del sitio (solo biblioteca estándar).

Pide cada página en serie, n veces, con una conexión nueva (sin caché), y mide el tiempo hasta
recibir todo el HTML y su tamaño. Salidas: resultados/paginas_sitio.csv (resumen) y
resultados/paginas_sitio_crudo.csv (una fila por petición). Uso: python metricas/paginas.py [--n 20]
"""
import argparse
import urllib.request
from comun import BASE, PAUSA, ahora, csv_out, parte_json, percentil
import time

PAGINAS = ["/", "/proyecto", "/evaluacion", "/demo", "/datos", "/acerca", "/conectar"]


def pedir(ruta, timeout=30):
    req = urllib.request.Request(BASE + ruta, headers={"User-Agent": "obraclara-metricas/1.0", "Cache-Control": "no-cache"})
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            cuerpo = r.read()
            return r.status, (time.perf_counter() - t0) * 1000, len(cuerpo)
    except Exception as e:  # error de red o HTTP: se cuenta como fallo, sin reintentar
        return getattr(e, "code", 0), (time.perf_counter() - t0) * 1000, 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=20)
    args = ap.parse_args()
    inicio = ahora()
    crudo, resumen = [], []
    for ruta in PAGINAS:
        pedir(ruta)  # calentamiento, no cuenta
        tiempos, tams, ok = [], [], 0
        for i in range(args.n):
            time.sleep(PAUSA)
            codigo, ms, tam = pedir(ruta)
            crudo.append({"pagina": ruta, "repeticion": i + 1, "estado": codigo, "ms": round(ms, 1), "bytes": tam})
            if codigo == 200:
                ok += 1
                tiempos.append(ms)
                tams.append(tam)
        resumen.append({
            "pagina": ruta, "n": args.n, "exitosas": ok,
            "mediana_ms": round(percentil(tiempos, 50), 1) if tiempos else "",
            "p90_ms": round(percentil(tiempos, 90), 1) if tiempos else "",
            "minimo_ms": round(min(tiempos), 1) if tiempos else "",
            "maximo_ms": round(max(tiempos), 1) if tiempos else "",
            "bytes_medio": round(sum(tams) / len(tams)) if tams else "",
            "bytes_max": max(tams) if tams else "",
        })
        print(ruta, resumen[-1]["mediana_ms"], "ms mediana", ok, "/", args.n, flush=True)
    csv_out("paginas_sitio_crudo.csv", crudo)
    csv_out("paginas_sitio.csv", resumen)
    parte_json("paginas_sitio", {"inicio": inicio, "fin": ahora(), "base": BASE, "n": args.n, "pausa_s": PAUSA})
    print("listo", flush=True)
