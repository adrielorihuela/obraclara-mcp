#!/usr/bin/env bash
# Regenera todas las métricas. Uso: bash metricas/todo.sh [--sin-red]   (--sin-red: omite lo que llama al servidor público)
set -euo pipefail
cd "$(dirname "$0")"
PY="${PYTHON:-$HOME/cortex-temp/.venv/bin/python}"; [ -x "$PY" ] || PY=python3
$PY calidad.py
$PY pruebas.py
$PY evaluacion.py
if [ "${1:-}" != "--sin-red" ]; then
  $PY rendimiento.py
  $PY exactitud.py
  $PY alertas_check.py
  $PY asistente.py || echo "asistente: no medido"
fi
$PY consolidar.py
