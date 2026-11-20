# Métricas de ObraClara Perú

Todo se mide con scripts reproducibles (Python 3, solo biblioteca estándar; Node solo para vitest). Los resultados
están en `resultados/`: **`metricas.json`** (todo junto, con fecha) y un CSV por tabla (UTF-8 con BOM, abren directo en Excel).
Ninguna cifra se escribe a mano.

Regenerar todo: `bash metricas/todo.sh` (usa `~/cortex-temp/.venv/bin/python`, o `PYTHON=python3`).
Sin llamar al servidor público: `bash metricas/todo.sh --sin-red`. Los scripts que llaman a producción esperan 1,2 s entre
llamadas (límite del servidor: 60/min). La base local es `~/.local/share/obraclara/inversiones.db` (solo lectura; otra ruta con `OBRACLARA_DB`).

| Bloque | Script | Comando | Salida (`resultados/`) |
|---|---|---|---|
| 1. Calidad de datos y alertas | `calidad.py` | `python metricas/calidad.py` | `calidad_*.csv`, `alertas_*.csv` |
| 2. Rendimiento del MCP | `rendimiento.py` | `python metricas/rendimiento.py` (~3 min) | `rendimiento_mcp.csv` |
| 3. Exactitud frente a la base | `exactitud.py`, `alertas_check.py` | `python metricas/exactitud.py` y `python metricas/alertas_check.py` | `exactitud_*.csv` |
| 4. Pruebas y cobertura | `pruebas.py` | `python metricas/pruebas.py` (ejecuta vitest) | `pruebas.csv`, `cobertura.csv` |
| 5. Evaluación con/sin MCP | `evaluacion.py` | `python metricas/evaluacion.py` | `eval_global.csv`, `eval_por_tipo.csv`, `eval_latencia.csv` |
| 6. Asistente y agente | `asistente.py` | `python metricas/asistente.py` (~1,5 min) | `asistente_tiempos.csv`, `asistente_resumen.csv` |
| Unir todo | `consolidar.py` | `python metricas/consolidar.py` | `metricas.json` |

## 1. Calidad de datos (`calidad_*.csv`, `alertas_*.csv`)
Se calcula con SQL sobre la tabla `inversiones` (corte del MEF 2026-11-10, guardado en la tabla `meta`).
- `calidad_nulos.csv`: por columna, filas con valor NULL o vacío y su % del total. `calidad_ceros.csv`: montos/avances iguales a 0.
- `calidad_por_nivel.csv` (GL local, GR regional, GN nacional), `calidad_por_departamento_top10.csv`, `calidad_por_funcion_top10.csv`:
  cantidad de inversiones, % del total, costo actualizado, devengado del año, saldo por ejecutar (solo saldos positivos, como el servidor) y alertas.
- `calidad_rango_fechas.csv`: mínimo y máximo de inicio y fin de ejecución y del último devengado (AAAAMM). Hay fechas planificadas hasta 2070.
- `calidad_montos_totales.csv`: sumas en soles (costo actualizado, devengado del año, saldo, monto viable, PIM).
- **Duplicados**: la base tiene 0 (clave primaria). Los que el ETL descarta (queda el primero) solo se imprimen al ejecutar `etl/inversiones.py`
  (`repetidos_omitidos`); el CSV original del MEF no está en este equipo, por eso esa cifra figura como `null` en `metricas.json`. Para obtenerla:
  `python etl/inversiones.py --csv DETALLE_INVERSIONES.csv --out /tmp/build --fecha 2026-11-10`.
- Alertas (reglas del ETL): **sobrecosto** = (costo actualizado − monto viable) / monto viable ≥ 50 %; **posible paralización** = avance físico entre
  40 % y 99,99 % y 6 meses o más sin devengado. `alertas_totales.csv` (incluye cuántas tienen ambas), `alertas_por_nivel.csv`,
  `alertas_por_departamento_top10.csv` (los 10 con más alertas sumadas), `alertas_hist_sobrecosto.csv` (tramos de `sobrecosto_pct`),
  `alertas_hist_meses_sin_devengado.csv` (tramos de meses desde el último devengado; la fila «sin dato» son las que no tienen devengado registrado).
- Limitación a mencionar: `avance_fisico` está vacío en el 57 % de las inversiones; la alerta de paralización solo se puede evaluar donde existe.

## 2. Rendimiento del MCP (`rendimiento_mcp.csv`)
Para cada herramienta, 30 llamadas JSON-RPC (n = 120; la primera medición, con 20, queda en `rendimiento_mcp_previo_n20.csv`) (`tools/call`) a `https://obraclara.adrielorihuela.net/mcp` con argumentos variados:
los 10 de `eval/preguntas.csv` de esa herramienta más 20 variantes (`limite: 5` y `limite: 10` en buscar/alertas, 20 códigos aleatorios con semilla 42 en detalle,
otros departamentos en resumen). Además 10 llamadas a `tools/list` y 10 a `GET /salud`. Columnas: media, p50, p90, p95, máximo y mínimo en ms, errores,
tasa de éxito (HTTP 200 y sin `isError`), tamaño medio y máximo de la respuesta en bytes. La fecha y hora de inicio y fin están en `metricas.json`.
**La latencia incluye la red desde Lima** (DNS, TLS y conexión nueva en cada llamada, sin reutilizar), no solo el cómputo del Worker; por eso incluso `/salud` tarda ~1 s.
Una llamada de calentamiento previa no se cuenta. Cada llamada queda en `rendimiento_mcp_crudo.csv`.

## 3. Exactitud (`exactitud_*.csv`)
- `exactitud_detalle.csv`: 30 códigos únicos al azar (semilla 2026) → `detalle_inversion` por MCP frente a la fila SQLite. Se comparan 27 campos
  (numéricos con tolerancia 0,005; texto y fechas exactos). `exactitud_resumenes.csv`: 10 filtros (5 departamentos y 5 entidades con ≥ 30 inversiones, semilla 2026)
  → `resumen_inversiones` frente a SQL directo en 6 cifras (cantidad, costo, devengado, saldo, alertas). Para entidades el SQL usa la misma regla de palabras que
  el servidor (todas deben aparecer en el nombre); la columna `inversiones_sql_nombre_exacto` permite ver la diferencia con el nombre exacto.
- `exactitud_herramientas.csv`: % de casos y de campos que coinciden. `exactitud_alertas.csv`: totales de `alertas_inversion` (tool) y de `/api/alertas`
  frente a SQL, global, por nivel y por 3 departamentos (14 casos).

## 4. Pruebas (`pruebas.csv`, `cobertura.csv`)
`cd worker && npx vitest run --coverage` (V8; se agregó `@vitest/coverage-v8@5.1.0`, igual que vitest, como devDependency de `worker/package.json`).
`pruebas.csv`: pruebas, pasan, fallan y duración por archivo y total (la duración es la de vitest, sin contar el arranque de Node). `cobertura.csv`: líneas,
sentencias, funciones y ramas por archivo, el total y el total sin `src/sitio/` ni `pagina.ts` (HTML/CSS en cadenas sin pruebas unitarias). `index.ts` y `cola.ts`
(entrada del Worker y Durable Object) no tienen pruebas con vitest; se comprueban contra producción en los bloques 2, 3 y 6.

## 5. Evaluación con y sin MCP (`eval_*.csv`)
Copia **sin recalcular** de `eval/resultados/graficos_*.csv`: 40 preguntas, exactitud, citación e información inventada con y sin MCP, y latencia media.
El detalle y la forma de puntuar están en `eval/resultados/resumen.md`.

## 6. Asistente y modo agente (`asistente_*.csv`)
Tiempo de punta a punta (desde Lima) de `POST /api/chat` con 5 preguntas conceptuales cortas (sin herramientas) y de `POST /api/agente` con 2 preguntas
de datos (flujo real con herramientas). Es un servicio compartido con cola; si una llamada falla o expira, la tabla dice «no medido». Muestra pequeña (5 y 2):
úsese como orden de magnitud, no como percentil. El límite del chat es 20 preguntas por minuto, por eso hay pausas de 4-5 s.

### 6b. Asistente de punta a punta con 24 preguntas (`asistente_extenso*.csv`)
`node metricas/asistente_extenso.mjs [--por-tipo 6] [--pausa 8]` (~10 min). Envía en serie 24 preguntas del banco de 40 (6 por tipo, reparto uniforme) a `POST /api/agente` con `mcp: true`
(igual que el panel «con conexión» de `/demo`), con pausa de 8 s. Mide segundos, modelo que respondió y si la respuesta es correcta con la regla «exacta» de `eval/score_eval.mjs`
(valor oficial con tolerancia 1 %, entidad esperada o «sin datos»). Si un proveedor llega a su límite no se esquiva: queda como error y se sigue. Salida: `asistente_extenso.csv`
(una fila por pregunta, con la respuesta recortada a 400 caracteres), `asistente_extenso_resumen.csv` (todas y por tipo: mediana, P90, mín., máx., correctas) y `partes/asistente_extenso.json`.
Resultado del 20/11/2026 (tras la corrección): 24 de 24 con respuesta, mediana 6,9 s, P90 22,4 s, 21 de 24 correctas, y en las 24 hubo llamadas a las herramientas. La primera medición del mismo día dio 4 de 24 porque la IA del servidor respondía sin consultar el registro; el servidor de IA ahora lo exige en preguntas de datos.

## Cómo leer los CSV para gráficos
Una fila por categoría y una columna por medida; las tablas `*_top10` y `*_hist_*` están ordenadas para barras directas. Las latencias crudas de cada
llamada están en `metricas.json` → `bloques.rendimiento.latencias_ms` (para cajas o histogramas).

## Datos para la página /proyecto
`node metricas/exportar_sitio.mjs` lee `metricas/resultados/*.csv` y `metricas.json` y escribe `worker/src/sitio/metricas-datos.ts`, que usa la sección «Métricas» de `/proyecto` (gráficos SVG). No se edita a mano: se vuelve a generar después de cada medición.
