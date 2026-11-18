"""Bloque 3b: las alertas que devuelve el servidor coinciden con las de la base (tool alertas_inversion y /api/alertas)."""
import json
import time

from comun import PAUSA, ahora, csv_out, db, http, parte_json, tool

c = db()
casos = [("sobrecosto", {}, "alerta_sobrecosto=1", []), ("paralizacion", {}, "alerta_paralizacion=1", [])]
for niv, cod in (("local", "GL"), ("regional", "GR"), ("nacional", "GN")):
    casos.append(("sobrecosto", {"nivel": niv}, "alerta_sobrecosto=1 AND nivel=?", [cod]))
    casos.append(("paralizacion", {"nivel": niv}, "alerta_paralizacion=1 AND nivel=?", [cod]))
for dep in ("Lima", "Cusco", "Piura"):
    casos.append(("sobrecosto", {"departamento": dep}, "alerta_sobrecosto=1 AND departamento_n=?", [dep.upper()]))
    casos.append(("paralizacion", {"departamento": dep}, "alerta_paralizacion=1 AND departamento_n=?", [dep.upper()]))
filas = []
for tipo, f, w, p in casos:
    sql = c.execute(f"SELECT COUNT(*) FROM inversiones WHERE {w}", p).fetchone()[0]
    ok, d, n, seg = tool("alertas_inversion", {"tipo": tipo, **f, "limite": 1})
    time.sleep(PAUSA)
    mcp_n = d["datos"]["total"] if ok and d else None
    q = "&".join(f"{k}={v}" for k, v in {"tipo": tipo, **f}.items())
    est, raw, _ = http("GET", "/api/alertas?" + q)
    time.sleep(PAUSA)
    api_n = json.loads(raw)["datos"]["total"] if est == 200 else None
    filas.append({"tipo": tipo, "filtro": json.dumps(f, ensure_ascii=False) if f else "(ninguno)", "total_sql": sql, "total_tool_mcp": mcp_n,
                  "total_api_alertas": api_n, "coincide": sql == mcp_n == api_n})
csv_out("exactitud_alertas.csv", filas)
n_ok = sum(x["coincide"] for x in filas)
parte_json("exactitud_alertas", {"generado": ahora(), "casos": len(filas), "coinciden": n_ok, "pct": round(100 * n_ok / len(filas), 1), "detalle": filas})
print("alertas:", n_ok, "/", len(filas), [x for x in filas if not x["coincide"]])
