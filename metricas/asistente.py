"""Bloque 6: tiempo de respuesta del asistente (/api/chat) y del modo agente (/api/agente). Opcional: si falla, «no medido»."""
import json
import time

from comun import BASE, ahora, csv_out, http, parte_json, percentil

SITIO = BASE  # el servicio solo acepta el origen de la propia página
PREG = ["¿Qué es una inversión pública?", "¿Qué significa «posible paralización»?", "¿De dónde vienen los datos de ObraClara?",
        "Explica en una frase qué es el sobrecosto.", "¿Qué es el devengado?"]
filas = []
def medir(modo, ruta, cuerpo, espera):
    est, raw, seg = http("POST", ruta, cuerpo, timeout=espera, origen=SITIO)
    ok, extra = est == 200, {}
    try:
        j = json.loads(raw)
    except ValueError:
        j = {}
    if ok and not (j.get("content") or j.get("respuesta") or j.get("mensaje") or j.get("texto")):
        ok = False
    extra["modelo"] = j.get("modelo", "") if isinstance(j, dict) else ""
    return {"modo": modo, "pregunta": cuerpo.get("mensaje") or cuerpo["messages"][0]["content"], "estado_http": est,
            "exito": ok, "segundos": round(seg, 2) if ok else "no medido", "segundos_intento": round(seg, 2),
            "bytes": len(raw), "modelo": extra["modelo"], "error": "" if ok else raw[:120].decode("utf-8", "replace")}

e = http("GET", "/api/ia-estado")
estado = json.loads(e[1]) if e[0] == 200 else {}
if estado.get("pendientes", 0) > 3 or not estado.get("conectado"):
    print("servicio ocupado o desconectado:", estado)
for q in PREG:
    filas.append(medir("chat", "/api/chat", {"messages": [{"role": "user", "content": q}]}, 90))
    time.sleep(4)
# Modo agente (flujo real con herramientas): solo 2 preguntas por ser un servicio compartido y lento
for q in ["¿Cuántas inversiones con alerta de sobrecosto hay en Tacna?", "¿Cuántas inversiones hay en Moquegua?"]:
    filas.append(medir("agente", "/api/agente", {"mensaje": q}, 170))
    time.sleep(5)
resumen = []
for modo in ("chat", "agente"):
    f = [x for x in filas if x["modo"] == modo]
    s = [x["segundos_intento"] for x in f if x["exito"]]
    resumen.append({"modo": modo, "preguntas": len(f), "exitosas": len(s),
                    "media_s": round(sum(s) / len(s), 2) if s else "no medido", "p50_s": round(percentil(s, 50), 2) if s else "no medido",
                    "max_s": max(s) if s else "no medido"})
csv_out("asistente_tiempos.csv", filas, ["modo", "pregunta", "estado_http", "exito", "segundos", "bytes", "modelo", "error"])
csv_out("asistente_resumen.csv", resumen)
parte_json("asistente", {"generado": ahora(), "estado_servicio": estado, "resumen": resumen, "detalle": filas,
    "nota": "Mide el tiempo de punta a punta desde Lima. Incluye la cola de la IA del servidor, que puede esperar hasta 60 s; es un servicio compartido, no un servidor dedicado. «no medido» = la llamada falló o expiró."})
print(resumen)
