# AGENTS.md

Guía para agentes de IA que trabajen en este repositorio.

## Qué es
ObraClara Perú: un asistente que consulta datos de inversión pública (fuente única: `DETALLE_INVERSIONES.csv` del MEF) mediante un servidor MCP en Cloudflare con cuatro herramientas: buscar inversiones, detalle de una obra, alertas y resumen por entidad o región. Proyecto del curso I.A. Aplicada.

## Mapa de carpetas
- `worker/`: Worker de Cloudflare (servidor MCP, sitio y asistente). Código en `src/`, pruebas en `test/`.
- `conector/`: conector saliente que enlaza el asistente con la IA del servidor.
- `etl/`: carga y limpieza de datos (Python, SQLite/D1).
- `eval/`: banco de 40 preguntas, corridas por modelo y puntajes.
- `metricas/`: calidad de datos, alertas, rendimiento y exactitud (`bash metricas/todo.sh`).
- `docs/`: documentación de referencia.
- `fuentes/`: fuentes oficiales y referencias.

## Verificación
```bash
cd worker && npx vitest run && npx tsc --noEmit -p . && npx wrangler deploy --dry-run
cd eval && node score_eval.mjs && node exportar_graficos.mjs && node exportar_sitio.mjs
```
Ejecuta la primera línea tras cualquier cambio en `worker/`; la segunda tras tocar la evaluación.

## Reglas
- Responder y documentar en **español**, con lenguaje sencillo: la página y los documentos deben entenderlos personas sin conocimientos de tecnología, IA ni MCP.
- **Toda cifra debe estar medida y con fuente.** No inventar ni redondear a ojo; si cambia una medición, regenerar y actualizar sitio y docs.
- **Archivos GENERADOS no se editan a mano.** Búscalos con `grep -rl GENERADO worker/src/sitio` (por ejemplo `demo-datos.ts`, `evaluacion-datos.ts`, `metricas-datos.ts`, `evaluacion-tabla.ts`); se regeneran con los scripts de `eval/` y `metricas/`.
- **No exponer secretos** (tokens, `.env`, cookies) ni el proveedor de IA: en público se llama «la IA del servidor» y su dirección vive fuera del repositorio.
- **Despliegue automático** al hacer push a `main` (GitHub Actions). No despliegues ni reinicies servicios durante exposiciones anunciadas.
- Commits con mensaje **en español**, claros y por cambio.
- El informe del curso lo redacta el grupo a mano: no escribas texto del informe, el workflow, los gráficos del informe ni el póster.

## Documentación de referencia (`docs/`)
- [`PROYECTO.md`](docs/PROYECTO.md): el proyecto completo.
- [`PROCESO-IA.md`](docs/PROCESO-IA.md): cómo se desarrolló con IA.
- [`PROMPT-RECONSTRUCCION.md`](docs/PROMPT-RECONSTRUCCION.md): prompt para reconstruir el proyecto.
- [`EXPOSICION.md`](docs/EXPOSICION.md): guía de exposición.
