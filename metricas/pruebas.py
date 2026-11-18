"""Bloque 4: pruebas de software (vitest) y cobertura de código del Worker."""
import json
import subprocess
import tempfile
import time
from pathlib import Path

from comun import RAIZ, ahora, csv_out, parte_json

W = RAIZ.parent / "worker"
tmp = Path(tempfile.mkdtemp(prefix="vt-"))
t = time.perf_counter()
p = subprocess.run(["npx", "vitest", "run", "--reporter=json", f"--outputFile={tmp/'r.json'}", "--coverage",
                    "--coverage.provider=v8", "--coverage.reporter=json-summary", f"--coverage.reportsDirectory={tmp/'cov'}",
                    "--coverage.include=src/**/*.ts"], cwd=W, capture_output=True, text=True, timeout=280)
pared = time.perf_counter() - t
j = json.loads((tmp / "r.json").read_text())
filas = []
for r in sorted(j["testResults"], key=lambda r: r["name"]):
    a = r["assertionResults"]
    filas.append({"archivo": Path(r["name"]).name, "pruebas": len(a), "pasan": sum(x["status"] == "passed" for x in a),
                  "fallan": sum(x["status"] == "failed" for x in a), "duracion_ms": round(r["endTime"] - r["startTime"], 1)})
tot = {"archivo": "TOTAL", "pruebas": sum(f["pruebas"] for f in filas), "pasan": sum(f["pasan"] for f in filas),
       "fallan": sum(f["fallan"] for f in filas), "duracion_ms": round(max(r["endTime"] for r in j["testResults"]) - j["startTime"], 1)}
csv_out("pruebas.csv", filas + [tot])

cov = json.loads((tmp / "cov" / "coverage-summary.json").read_text())
def agrega(pred):
    s = {k: [0, 0] for k in ("lines", "statements", "functions", "branches")}
    for ruta, v in cov.items():
        if ruta != "total" and pred(ruta):
            for k in s:
                s[k][0] += v[k]["covered"]; s[k][1] += v[k]["total"]
    return {k: round(100 * a / b, 2) if b else None for k, (a, b) in s.items()}
sitio = lambda r: "/src/sitio/" in r or r.endswith("/pagina.ts")
filas_cov = []
for ruta, v in sorted(cov.items()):
    filas_cov.append({"archivo": "TOTAL" if ruta == "total" else ruta.split("/worker/")[-1],
                      "lineas_pct": v["lines"]["pct"], "sentencias_pct": v["statements"]["pct"],
                      "funciones_pct": v["functions"]["pct"], "ramas_pct": v["branches"]["pct"],
                      "lineas_cubiertas": v["lines"]["covered"], "lineas_totales": v["lines"]["total"]})
logica = agrega(lambda r: not sitio(r))
filas_cov.append({"archivo": "TOTAL solo logica (sin sitio/ ni pagina.ts: HTML y CSS en cadenas)", "lineas_pct": logica["lines"],
                  "sentencias_pct": logica["statements"], "funciones_pct": logica["functions"], "ramas_pct": logica["branches"],
                  "lineas_cubiertas": "", "lineas_totales": ""})
csv_out("cobertura.csv", filas_cov)
parte_json("pruebas", {"generado": ahora(), "comando": "cd worker && npx vitest run --coverage", "exito": j["success"],
    "pruebas_total": tot["pruebas"], "pasan": tot["pasan"], "fallan": tot["fallan"], "archivos": len(filas),
    "suites_describe": j["numTotalTestSuites"], "duracion_suite_ms": tot["duracion_ms"], "duracion_pared_con_cobertura_s": round(pared, 1),
    "por_archivo": filas, "cobertura_total": cov["total"], "cobertura_solo_logica_pct": logica, "cobertura_por_archivo": filas_cov,
    "nota_cobertura": "Cobertura V8 con @vitest/coverage-v8 5.1.0 (devDependency añadida). El código de src/sitio y pagina.ts es HTML/CSS en cadenas y no tiene pruebas unitarias, por eso se reporta también la cobertura sin ese código. Además index.ts y cola.ts (entrada del Worker y Durable Object) se verifican solo contra producción, no con vitest."})
print("pruebas:", tot, "cobertura total lineas", cov["total"]["lines"]["pct"], "logica", logica)
