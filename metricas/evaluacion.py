"""Bloque 5: cifras de la evaluación ya hecha (eval/). Solo copia y lee; no recalcula nada."""
import csv
import shutil

from comun import RAIZ, RES, ahora, parte_json

E = RAIZ.parent / "eval" / "resultados"
RES.mkdir(parents=True, exist_ok=True)
datos = {}
for nombre in ("global", "latencia", "por_tipo"):
    shutil.copy(E / f"graficos_{nombre}.csv", RES / f"eval_{nombre}.csv")
    datos[nombre] = list(csv.DictReader(open(E / f"graficos_{nombre}.csv", encoding="utf-8")))
parte_json("evaluacion", {"copiado": ahora(), "origen": "eval/resultados/graficos_*.csv (40 preguntas, con y sin MCP); texto completo en eval/resultados/resumen.md", **datos})
print("evaluacion:", datos["global"])
