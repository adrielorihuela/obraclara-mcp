# Guía para redactar el informe final y hacer los gráficos

**Entrega: domingo 29/11/2026, 23:59.** El informe lo **escribe el grupo con sus palabras** y los **gráficos, diagramas y el workflow los hace el grupo a mano** (Excel, draw.io, PowerPoint o papel). La rúbrica prohíbe la IA en esas partes: incumplirlo es 0 en la Nota 03. Esta guía no contiene texto para copiar; dice **qué poner, de dónde sacar cada dato y cómo hacer cada gráfico**.

Fuentes de datos (todas en el repo público `github.com/adrielorihuela/obraclara-mcp`):

- Evaluación: `eval/resultados/resumen.md`, `graficos_global.csv`, `graficos_por_tipo.csv`, `graficos_latencia.csv`, `resultados.csv` (una fila por pregunta y condición), `raw_*.jsonl` (respuestas completas).
- Métricas del sistema: `metricas/resultados/*.csv` y `metricas/LEEME.md`.
- Explicación de todo: `docs/PROYECTO.md` y https://obraclara.adrielorihuela.net/proyecto.
- Referencias verificadas: `fuentes/REFERENCIAS.md`.
- Material hecho con IA solo para entender (no copiar): documentos «EJEMPLO» y «Material de apoyo» en Drive.

## 0. Antes de empezar (30 min, todo el grupo)

1. Repartir secciones (sugerencia abajo) y fijar una fecha interna: borrador completo el **jueves 26/11**, revisión cruzada el 27–28.
2. Abrir el avance aprobado (3/3) y la plantilla `1_Plantilla Informe.docx`: el final continúa el avance.
3. Decidir un **glosario común** de nombres y usarlo igual en todo el informe: «ObraClara Perú», «servidor MCP», «modelo de lenguaje», y los nombres reales de las herramientas: `buscar_inversiones`, `detalle_inversion`, `alertas_inversion`, `resumen_inversiones`.

| Integrante | Sugerencia |
|---|---|
| A | Resumen (al final), Introducción (ajustes), Conclusiones |
| B | Marco teórico (ajustes), Referencias y citas, Anexo 02 |
| C | Diseño y desarrollo (3.1–3.4) + diagrama de arquitectura |
| D | Diseño (3.5–3.7) + Resultados con tablas y gráficos + Anexo 01 |

## 1. Título, resumen y palabras clave

- Título: el del avance.
- **Resumen (escribirlo al final)**: un párrafo de **150–200 palabras, sin citas**: problema → qué se hizo (servidor MCP con 4 herramientas sobre el archivo del MEF) → cómo se evaluó (40 preguntas, sin y con MCP) → **resultados reales** (exactitud 8 % → 100 %; estricta 5 % → 98 %; información inventada 53 % → 0 %) → conclusión en una frase. Solo cosas hechas (lo pidió el profesor).
- Palabras clave: las del avance.

## 2. Introducción (ajustes)

- Mantener la del avance (fue sobresaliente).
- Añadir en la declaración de uso de IA la cita **(Anthropic, 2026)** y que la IA también ayudó a buscar fuentes que el grupo verificó.

## 3. Marco teórico (ajustes)

- Mantenerlo. Revisar que **«información inventada»** se defina igual que en resultados: respuesta con datos que no coinciden con la fuente oficial (ver `resumen.md`). En el avance decía «datos ausentes en la fuente»: unificar.
- Opcional: una frase sobre la nueva métrica «cifras no sustentadas».

## 4. Diseño y desarrollo de la propuesta (3–5 páginas, mínimo 4 subsecciones, con workflow y gráficos)

Lo que pidió el profesor: diagrama de arquitectura, funcionamiento de cada herramienta, procesamiento de datos, tecnologías, y justificar las alertas diferenciándolas de lo oficial.

| Subsección | Qué escribir | De dónde sacar los datos |
|---|---|---|
| 4.1 Metodología CRISP-DM | Las 6 fases y qué se hizo en cada una (tabla) | `/proyecto` § Metodología |
| 4.2 Datos y procesamiento (ETL) | Archivo del MEF: filas, columnas, tamaño, licencia, fecha de descarga (10/11/2026); duplicados; 23 columnas conservadas en 4 grupos; limpieza; cálculo de indicadores en Python; carga en la base; calidad de datos (vacíos por columna) | `/proyecto` § Datos; `metricas/resultados/calidad_*.csv`; `etl/inversiones.py` |
| 4.3 Arquitectura | Las partes y cómo se comunican: usuario → modelo de lenguaje → servidor MCP (Cloudflare Worker, `/mcp`) → 4 herramientas → base de datos; página web y chat; respaldo | **Figura 1 (dibujarla)**; README § Arquitectura |
| 4.4 Las 4 herramientas | Para cada una: para qué sirve, parámetros, qué devuelve y un ejemplo real | **Cuadro** con las 4; `/conectar` § Herramientas |
| 4.5 Criterios de alerta | Fórmulas; base legal (Ley 31589: 40 % de avance y 6 meses sin ejecución física); por qué es una aproximación (el archivo no trae ejecución física mensual; 50 % en administración directa); por qué 50 % de sobrecosto (regla del equipo, mostrar la distribución); cifras: 26 387 y 16 502 frente a las **684 del inventario oficial**, y por qué difieren | `/proyecto` § Alertas; `metricas/resultados/alertas_*.csv` |
| 4.6 Tecnologías | TypeScript, Cloudflare Workers, D1, Durable Objects, SDK de MCP (Streamable HTTP), Python, SQLite, Vitest, GitHub Actions; modelo de lenguaje gratuito con respaldo | README |
| 4.7 Seguridad y pruebas | Solo lectura, sin datos personales, límite de 60 solicitudes/min, secretos fuera del código; 118 pruebas automáticas; exactitud de herramientas frente a la base (30/30 fichas, 810/810 campos; 10/10 resúmenes; 14/14 alertas); rendimiento (100 % de éxito, mediana 1,4–2,1 s) | `metricas/resultados/exactitud_*.csv`, `rendimiento_mcp.csv`, `pruebas.csv` |
| 4.8 Diseño de la evaluación | 40 preguntas, 10 por tipo, referencias verificadas antes de correr, mismo modelo y mismas preguntas en las dos condiciones, métricas con fórmula | `eval/preguntas.csv`, `resumen.md` § Cómo se puntuó |

## 5. Resultados e interpretación (1–2 páginas, con tablas y gráficos)

Pidió: resultados de las 40 preguntas, con y sin MCP, tablas, gráficos y **ejemplos de respuestas**.

1. **Tabla 1 – Resultados globales** (de `graficos_global.csv`): exacta, exacta estricta, citación, inventada, cifras no sustentadas, ejecutadas; sin MCP vs con MCP.
2. **Gráfico 1** (hacerlo en Excel): barras agrupadas sin/con MCP para exactitud, citación e inventada.
3. **Gráfico 2**: exactitud por tipo de pregunta (`graficos_por_tipo.csv`): búsqueda, detalle, alertas, resumen.
4. **Tabla o gráfico 3 – Tiempo de respuesta**: mediana y p90 (`graficos_latencia.csv`); explicar que los máximos de más de 300 s son reintentos.
5. **Ejemplos** (2 o 3): una misma pregunta respondida sin MCP y con MCP, recortada (de `raw_sin_mcp.jsonl` / `raw_con_mcp.jsonl`; buenos candidatos: B01, D04, A01, R02). Comentar qué cambió.
6. **Interpretación** (con sus palabras): por qué mejora (el dato sale de la fuente y no de la memoria); por qué la citación con MCP es casi automática (la herramienta devuelve la fuente); el caso D04 (porcentaje bien y una resta mal: por eso la métrica estricta); el costo en tiempo.
7. Revisión manual: dos integrantes revisan por separado los 20 casos «revisar» de sin MCP (columna `revisar` de `resultados.csv`) y anotan si coinciden; ponerlo en un párrafo.

## 6. Conclusiones (dos párrafos, sin citas, sin tablas)

- Párrafo 1: qué se logró y qué demuestran los números (respondiendo al objetivo general).
- Párrafo 2: **limitaciones y trabajo futuro**: una sola corrida; puntuación automática; modelo gratuito cuya versión no se controla; alertas aproximadas; 57 % de inversiones sin avance físico; trabajo futuro (más fuentes como contrataciones, más corridas, revisión humana completa, ejecución física mensual).

## 7. Referencias (APA 7, mínimo 10)

- Usar `fuentes/REFERENCIAS.md` (19 verificadas) + **Anthropic (2026)**.
- Comprobar que cada cita del texto está en la lista y cada referencia se cita al menos una vez.
- Debajo de cada tabla y figura: «Nota.» y «Fuente: elaboración propia con datos de …».

## 8. Anexos

- **Anexo 01 Documentación**: enlace público al repo y lista de qué contiene (código, README con instrucciones, `docs/PROYECTO.md`, prompts en el README, pruebas, `eval/`, `metricas/`, `fuentes/`) y el enlace al sitio.
- **Anexo 02 Coevaluación**: tabla con los 4 integrantes, % de participación (0–100 %) y observaciones obligatorias y concretas de qué hizo cada uno; justificar si alguien tiene menos de 100 %.

## 9. Figuras y gráficos que el grupo debe hacer a mano

| N.° | Qué | Cómo |
|---|---|---|
| Figura 1 | Arquitectura / workflow de una consulta (7 pasos numerados) | draw.io o PowerPoint; guiarse por el bosquejo de los 7 pasos y por `/proyecto` § Arquitectura (no copiar la imagen) |
| Figura 2 | Flujo de datos (CSV del MEF → ETL → base → servidor) | draw.io |
| Gráfico 1 | Resultados globales sin vs con MCP | Excel con `graficos_global.csv` |
| Gráfico 2 | Exactitud por tipo | Excel con `graficos_por_tipo.csv` |
| Gráfico 3 (opcional) | Alertas por nivel de gobierno o histograma de sobrecosto | Excel con `metricas/resultados/alertas_por_nivel.csv` / `alertas_hist_sobrecosto.csv` |
| Figuras 3–5 (opcional) | Capturas del sitio (inicio, chat con MCP, búsqueda) | Captura de pantalla propia |

Cada figura: número, título arriba, «Fuente: elaboración propia» abajo, citada en el texto.

## 10. Lista final antes de subir

- [ ] Resumen 150–200 palabras con resultados reales y sin citas
- [ ] Nombres de herramientas y definiciones iguales en todo el documento
- [ ] Figura 1 dibujada por el grupo; gráficos hechos en Excel por el grupo
- [ ] 2–3 ejemplos de respuestas
- [ ] Alertas justificadas y diferenciadas de lo oficial
- [ ] Conclusiones con limitaciones
- [ ] Citas ↔ referencias (APA 7), incluida Anthropic (2026)
- [ ] Anexo 01 con enlace; Anexo 02 con observaciones
- [ ] Declaración de IA en la introducción
- [ ] Nada redactado con IA; leerlo en voz alta para que suene a ustedes

## Después: exposición (semana 15)

PPT con la plantilla ULima (IA permitida, declarándola), póster con la plantilla (sin IA), video pitch de **3 minutos exactos**, demo en vivo. Guion y 20 preguntas probables: `docs/EXPOSICION.md`.
