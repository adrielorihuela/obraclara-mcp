"""Junta resultados/partes/*.json en resultados/metricas.json (con fecha)."""
import json

from comun import PARTES, RES, ahora

out = {"generado": ahora(), "corte_datos": None, "bloques": {}}
for f in sorted(PARTES.glob("*.json")):
    out["bloques"][f.stem] = json.loads(f.read_text(encoding="utf-8"))
cal = out["bloques"].get("calidad", {})
out["corte_datos"] = cal.get("alertas", {}).get("cifras_meta_en_base") or None
out["resumen_cifras"] = {
    "inversiones": cal.get("filas_totales"),
    "alertas_sobrecosto": next((a["inversiones"] for a in cal.get("alertas", {}).get("totales", []) if a["alerta"] == "sobrecosto"), None),
    "alertas_paralizacion": next((a["inversiones"] for a in cal.get("alertas", {}).get("totales", []) if a["alerta"] == "posible_paralizacion"), None),
    "pruebas": out["bloques"].get("pruebas", {}).get("pruebas_total"),
    "cobertura_lineas_pct": out["bloques"].get("pruebas", {}).get("cobertura_total", {}).get("lines", {}).get("pct"),
}
(RES / "metricas.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print("metricas.json:", len(out["bloques"]), "bloques", out["resumen_cifras"])
