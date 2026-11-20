# ObraClara Perú: el proyecto

Misma información que la página [`/proyecto`](https://obraclara.adrielorihuela.net/proyecto) del sitio. Proyecto del Grupo 1, I.A. Aplicada (sección 356), Universidad de Lima, 2026-2.

## En palabras sencillas

ObraClara es un sitio donde cualquiera puede preguntar, en castellano, por las obras públicas del Perú (colegios, hospitales, carreteras) y recibir una respuesta con la cifra oficial, la fuente y la fecha.

Funciona así: un asistente de inteligencia artificial (un programa que conversa como un chat) no responde de memoria, sino que primero consulta el registro oficial del Ministerio de Economía y Finanzas (MEF). Esa conexión se hace con un «enchufe» estándar llamado MCP. Es como la diferencia entre alguien que responde de memoria y alguien que abre el libro oficial y te muestra la página.

En una prueba de 40 preguntas, **sin la conexión el asistente acertó 3 y con la conexión acertó las 40**. Sin ella, 21 de las 40 respuestas traían cifras que no coinciden con el registro oficial; con ella, ninguna. El sitio también marca «alertas» sobre obras que conviene revisar; una alerta es una señal, **no una prueba de irregularidad ni de corrupción**.

Los términos técnicos se explican en el [glosario](#glosario). Después de cada resumen sencillo viene el detalle técnico. Para explicar el proyecto a un público sin conocimientos técnicos, usa la [guía de exposición](EXPOSICION.md); las referencias y los documentos oficiales están en [`fuentes/`](../fuentes/REFERENCIAS.md).

## Glosario

- **Inteligencia artificial (IA):** Programas que hacen tareas que antes pedían una persona, como entender un texto o responder una pregunta.
- **Modelo de lenguaje:** Programa de IA que entiende y escribe texto, como el asistente de un chat. Aprendió leyendo muchísimos textos y por eso redacta bien, pero no «sabe» datos actuales.
- **Alucinación:** Cuando un asistente de IA da un dato falso con total seguridad, porque responde de memoria y rellena lo que no sabe.
- **MCP (Model Context Protocol):** Un «enchufe» estándar que permite a un asistente de IA consultar una fuente de datos real en lugar de responder de memoria.
- **Herramienta:** Una función concreta que el asistente puede usar a través del MCP, por ejemplo «buscar obras» o «ver el detalle de una obra».
- **Servidor:** Un programa que está siempre encendido en internet esperando pedidos y respondiéndolos. El de ObraClara responde las consultas de los asistentes.
- **Base de datos:** Un archivo organizado para encontrar información rápido, como un fichero con cajones y etiquetas.
- **Datos abiertos:** Información pública que cualquiera puede descargar y usar. Aquí, el archivo de inversiones que publica el MEF.
- **MEF:** Ministerio de Economía y Finanzas del Perú, que registra y publica las inversiones públicas.
- **CSV:** Un archivo de texto con una tabla muy grande, una fila por obra. El del MEF pesa 247 MB y tiene 150 641 filas.
- **ETL:** Limpiar y ordenar el archivo del MEF antes de usarlo: quitar repetidos, convertir cifras y calcular las alertas. Las siglas vienen de extraer, transformar y cargar.
- **Inversión pública:** Dinero del Estado destinado a una obra o proyecto, como un colegio, un hospital o una carretera.
- **Monto viable:** Lo que costaba la obra cuando se aprobó su ejecución.
- **Costo actualizado:** Lo que cuesta la obra hoy, según el MEF. Puede ser mayor que el monto viable.
- **Devengado:** Gasto que el Estado reconoce como ya realizado (por ejemplo, un servicio ya prestado), aunque aún no se haya pagado.
- **PIM:** Presupuesto institucional modificado: el dinero autorizado para este año a la entidad, después de los cambios.
- **Avance físico:** Qué parte de la obra está construida, en porcentaje.
- **Alerta:** Una señal para revisar una obra con más atención. No es una prueba de irregularidad ni de corrupción.
- **Sobrecosto (alerta):** La obra hoy cuesta la mitad o más de lo aprobado al inicio (50 % o más sobre el monto viable).
- **Posible paralización (alerta):** La obra tiene entre 40 % y 99 % de avance físico y lleva 6 meses o más sin gasto devengado.
- **Exactitud, cita e inventada:** Las tres medidas de la evaluación: cuántas respuestas fueron correctas, cuántas dijeron de qué fuente y fecha salió el dato y cuántas traían cifras que no coinciden con el registro oficial.
- **CRISP-DM:** Un método de seis pasos para proyectos con datos: entender el problema, entender los datos, prepararlos, modelar, evaluar y publicar.
- **ODS 16:** Objetivo de Desarrollo Sostenible de la ONU sobre paz, justicia e instituciones sólidas, que incluye transparencia y acceso a la información.

## Contenido

1. [Problema y contexto](#1-problema-y-contexto) · 2. [Objetivo y alcance](#2-objetivo-y-alcance) · 3. [ODS 16](#3-ods-16) · 4. [Metodología CRISP-DM](#4-metodología-crisp-dm) · 5. [Datos y ETL](#5-datos-y-etl) · 6. [Criterios de alerta](#6-criterios-de-alerta) · 7. [Arquitectura](#7-arquitectura) · 8. [Herramientas](#8-las-4-herramientas) · 9. [Tecnologías](#9-tecnologías) · 10. [Evaluación](#10-evaluación) · [Métricas](#métricas) · 11. [Pruebas](#11-pruebas) · 12. [Limitaciones](#12-limitaciones-y-trabajo-futuro) · 13. [Uso de IA](#13-uso-de-ia) · [Glosario](#glosario) · 14. [Referencias](#14-referencias) · 15. [Enlaces](#15-enlaces)

## 1. Problema y contexto

Según la Nota Informativa N.° 02 del MEF (julio de 2026), con datos a marzo de 2026, hay **684 inversiones vinculadas a obras paralizadas** (MEF, 2026a).

| Indicador | Valor |
|---|---|
| Costo actualizado | S/ 21 141 millones |
| Devengado | S/ 13 100 millones |
| Saldo por ejecutar | S/ 8 041 millones |

| Nivel de gobierno | Inversiones | Parte |
|---|---|---|
| Gobiernos locales | 511 | 75 % |
| Gobierno nacional | 93 (saldo S/ 4 364 M, 54,3 % del saldo) | 13,6 % |
| Gobiernos regionales | 80 | 11,7 % |

Causas principales: falta de recursos financieros, 109 inversiones (15,9 %); incumplimiento de contrato, 106 (15,5 %).

Los datos son abiertos pero difíciles de usar: Janssen et al. (2012) advierten que publicar datos no basta, porque hay barreras técnicas y de uso; Wirtz et al. (2022) dan un marco para analizarlas. Quien quiere saber cómo va una obra debe descargar un archivo de cientos de MB, entender PIM, devengado o CUI y filtrar a mano.

## 2. Objetivo y alcance

**Objetivo general.** Facilitar el acceso a la información oficial de inversión pública del Perú mediante un servidor MCP público que permita a un asistente de IA buscar obras, ver su detalle, detectar alertas y resumir por entidad o región, con respuestas que citan la fuente y la fecha.

- Una sola fuente oficial: `DETALLE_INVERSIONES.csv` del MEF (ODC-BY).
- Cuatro herramientas: buscar, detalle, alertas y resumen.
- Las alertas son indicios, no prueba de irregularidades.
- El modelo no calcula: los indicadores salen del ETL.

## 3. ODS 16

| Meta | Texto | Relación |
|---|---|---|
| 16.6 | Crear a todos los niveles instituciones eficaces y transparentes que rindan cuentas | Directa |
| 16.10 | Garantizar el acceso público a la información | Directa |
| 16.5 | Reducir considerablemente la corrupción y el soborno en todas sus formas | Indirecta (las alertas no prueban irregularidades) |

## 4. Metodología CRISP-DM

```mermaid
flowchart LR
  A[1 Comprensión del negocio] --> B[2 Comprensión de los datos] --> C[3 Preparación] --> D[4 Modelado] --> E[5 Evaluación] --> F[6 Despliegue]
  F -.iteración.-> A
  E -.ajustes.-> C
```

| Fase | En este proyecto |
|---|---|
| 1. Comprensión del negocio | Obras paralizadas, usuarios (ciudadanos, periodistas, regidores) y ODS 16 |
| 2. Comprensión de los datos | Estructura (68 columnas), tamaño (150 641 filas, 247 MB), licencia ODC-BY y calidad (67 códigos repetidos, vacíos) |
| 3. Preparación | ETL en Python: limpieza, 23 columnas, indicadores, alertas y carga a SQLite y D1 |
| 4. Modelado | Diseño de las 4 herramientas MCP y del formato de respuesta |
| 5. Evaluación | 40 preguntas sin y con MCP |
| 6. Despliegue | Cloudflare, pruebas, documentación y sitio |

## 5. Datos y ETL

**En sencillo:** el MEF publica un archivo enorme con todas las obras. Antes de usarlo hay que limpiarlo y ordenarlo (eso es el ETL): quitar filas repetidas, convertir las cifras a números y calcular las alertas. De 150 641 filas quedaron 150 574 obras. Los detalles técnicos siguen.

Descarga del 10 de noviembre de 2026 (archivo modificado el 8 de noviembre): **150 641 filas, 68 columnas, 247 MB**. 67 códigos únicos repetidos: se conserva la primera fila, quedan **150 574 inversiones**. Se conservan **23 columnas**; la base SQLite pesa unos 141 MB. Licencia ODC-BY.

```mermaid
flowchart LR
  CSV[CSV del MEF<br/>150 641 filas · 68 col · 247 MB] --> ETL[etl/inversiones.py<br/>quita 67 repetidos · 23 col · alertas]
  ETL --> SQL[build/data_*.sql<br/>150 574 inversiones]
  SQL --> SQ[(SQLite local ≈ 141 MB)]
  SQL -. respaldo, manual .-> D1[(Cloudflare D1)]
```

| Bloque | Columnas del CSV |
|---|---|
| Identificación (2) | `CODIGO_UNICO`, `NOMBRE_INVERSION` |
| Responsable y ubicación (9) | `ENTIDAD`, `NIVEL`, `SECTOR`, `FUNCION`, `DEPARTAMENTO`, `PROVINCIA`, `DISTRITO`, `UBIGEO`, `NUM_HABITANTES_BENEF` |
| Montos (6) | `MONTO_VIABLE`, `COSTO_ACTUALIZADO`, `PIM_ANIO_ACTUAL`, `DEV_ANIO_ACTUAL`, `SALDO_EJECUTAR`, `MONTO_LAUDO` |
| Estado (6) | `AVANCE_FISICO`, `AVANCE_EJECUCION`, `ULTIMO_DEVENGADO`, `FEC_INI_EJECUCION`, `FEC_FIN_EJECUCION`, `SITUACION` |

Columnas derivadas: `sobrecosto_pct`, `meses_sin_devengado`, `alerta_sobrecosto`, `alerta_paralizacion`, y de búsqueda `busqueda`, `entidad_n`, `funcion_n`, `departamento_n`.

## 6. Criterios de alerta

**En sencillo:** una alerta es una señal para mirar una obra con más atención, como la luz de un tablero; no prueba que haya un problema ni corrupción. Hay dos: sobrecosto (hoy cuesta la mitad o más de lo aprobado) y posible paralización (entre 40 % y 99 % de avance y 6 meses o más sin gasto). Los detalles técnicos siguen.

- **Sobrecosto:** `(COSTO_ACTUALIZADO − MONTO_VIABLE) / MONTO_VIABLE ≥ 0,50`, con `MONTO_VIABLE > 0`.
- **Posible paralización:** `40 % ≤ AVANCE_FISICO < 100 %` y `meses desde ULTIMO_DEVENGADO ≥ 6`.

Base: Ley N.° 31589, que considera paralizada una obra por contrata con avance físico ≥ 40 % y seis meses o más sin ejecución física, o con contrato resuelto o nulo; en administración directa el avance mínimo es 50 % (Congreso de la República, 2022). Es una aproximación porque el archivo solo trae el último mes con gasto devengado (financiero, no físico), no distingue contrata de administración directa, no informa contratos resueltos ni declaraciones, e incluye todas las inversiones activas y no solo obras.

Cifras al corte del 10/11/2026 (API pública `/api/alertas` y `/salud`): **16 502** con posible paralización (11,0 % de 150 574) y **26 387** con sobrecosto ≥ 50 % (17,5 %). Frente a las 684 del inventario oficial (unas 24 veces menos): el universo es distinto (todas las inversiones activas), el indicador es distinto (gasto, no situación de la obra), no se distingue modalidad ni declaración, las fechas difieren (marzo frente a noviembre de 2026) y puede haber meses sin gasto por motivos administrativos. Sirven para priorizar revisiones, no para contar obras paralizadas.

## 7. Arquitectura

**En sencillo:** es como una biblioteca: el asistente pregunta, el servidor es el bibliotecario y la base de datos es el archivo. El asistente nunca toca la base directamente; solo recibe lo que el servidor le entrega, con fuente y fecha. Los detalles técnicos siguen.

```mermaid
flowchart LR
  U[Usuario] --> P[Panel web /asistente<br/>cliente de la API del agente]
  P -->|/api/chat, /api/agente| W
  C[Cliente MCP / LLM] <-->|Streamable HTTP /mcp| W[Cloudflare Worker<br/>servidor MCP]
  W --> T{{4 herramientas}}
  T --> DB[(SQLite local<br/>respaldo: D1)]
  CSV[CSV MEF] --> ETL[ETL Python] --> DB
  K[Conector saliente] <-->|WebSocket /conector/ws| W
  K --- IA[API del agente del grupo]
  K --- DB
```

**ObraClara es cliente de la API del agente.** En sencillo: el sitio es la ventanilla; quien trabaja es el agente de la API del grupo. Toda la lógica agéntica vive allá: turnos, cola de mensajes, lectura y creación de archivos (PDF, Word, Excel, PowerPoint, ZIP), bandeja, conexión con el servidor MCP, reintentos y limpieza de la respuesta. El sitio solo muestra el chat, le añade el servidor MCP de ObraClara y reenvía el mensaje tal cual. Si el visitante escribe mientras el agente trabaja, el mensaje va por el mismo camino y la API responde «entregado» (202); la respuesta final llega en el envío original. El progreso en vivo («Leyendo informe.pdf», «Consultando datos del MEF») viene de los eventos de la API: el conector los sigue y el Worker los guarda en memoria (sin escribir en D1). Si la API no está disponible, el sitio responde en **modo de emergencia**: solo texto, sin archivos ni agente, con el aviso visible; ahí el navegador conserva el pequeño bucle de herramientas MCP porque es la única forma de consultar los datos oficiales sin el agente. Con una API propia (Configuración) el chat es simple: texto e imágenes.

Las siete etapas de una consulta:

```mermaid
flowchart TD
  S1["1 El usuario pregunta"] --> S2["2 El LLM identifica entidad, región, sector y tipo"]
  S2 --> S3["3 El LLM elige la herramienta y sus parámetros"]
  S3 --> S4["4 El servidor MCP valida y ejecuta un SQL fijo"]
  S4 --> S5["5 Devuelve datos con fuente, enlace y fecha"]
  S5 --> S6["6 El LLM puede encadenar otra consulta (ciclo ReAct)"]
  S6 -.repetir.-> S3
  S6 --> S7["7 El LLM redacta la respuesta con alertas y fuente"]
```

## 8. Las 4 herramientas

Filtros comunes (opcionales): `entidad`, `departamento`, `funcion`, `nivel` (local, regional o nacional); `limite` de 1 a 20. Toda respuesta trae `datos`, `fuente`, `url`, `fecha_descarga` y, según el caso, `aviso`.

| Herramienta | Parámetros | Salida | Ejemplo real (corte 10/11/2026) |
|---|---|---|---|
| `buscar_inversiones` | `texto?`, filtros, `limite?` | `{ total, mostrados, inversiones[] }` | Transporte, Cusco, regional: total 74 |
| `detalle_inversion` | `codigo_unico` | ficha completa o `null` | `2507146`: Hospital de Alta Complejidad (Piura), S/ 955 063 507,44 |
| `alertas_inversion` | `tipo` (`sobrecosto` o `paralizacion`), filtros, `limite?` | `{ total, mostrados, inversiones[] }` | paralización en Ayacucho: total 815 |
| `resumen_inversiones` | filtros | `{ inversiones, costo_actualizado_total, devengado_anio_actual, saldo_por_ejecutar, alertas_sobrecosto, alertas_paralizacion }` | Moquegua: 1 767 inversiones, S/ 20 049 064 306,37 |

## 9. Tecnologías

TypeScript y Zod; Cloudflare Workers, D1 y Durable Objects; MCP SDK y Agents SDK (`createMcpHandler`); Streamable HTTP; Python 3.12 (ETL); SQLite; Vitest; GitHub Actions. IA del servidor (API de IA privada del grupo, compatible con OpenAI) con respaldo de Workers AI y Groq.

## 10. Evaluación

**En sencillo:** le hicimos al mismo asistente las mismas 40 preguntas, sin la conexión (respondiendo de memoria) y con ella (consultando el registro oficial). Sin la conexión acertó 3 de 40 (8 %), citó la fuente en 4 (10 %) y 21 respuestas (53 %) traían cifras que no coinciden con el registro; con la conexión acertó y citó las 40 (100 %) y ninguna fue inventada. Con la conexión tarda más (20,2 s frente a 11,1 s por pregunta, sin reintentos). «Inventada» es un máximo: incluye cifras reales de otras fuentes. Una revisión externa mostró que «acertó» era generoso (basta que una cifra coincida), así que añadimos una medida más exigente: con ella, sin la conexión acertó 2 de 40 (5 %) y con la conexión 39 de 40 (98 %). Los detalles técnicos siguen.

**Método.** 40 preguntas (10 de búsqueda, 10 de detalle, 10 de alertas y 10 de resumen) con referencia verificada contra el CSV antes de correr; las mismas preguntas sin y con MCP (hasta 5 pasos); una corrida (R02, R03 y R07–R10 el 18/11/2026; el resto el 10/11/2026).

- **Exactitud** = exactas / 40 × 100 (número a ±1 % del oficial, o entidad esperada).
- **Citación** = respuestas que mencionan MEF o el dataset y la fecha / 40 × 100.
- **Inventada** = respuestas con cifras que no coinciden, resultados donde no hay datos u otra entidad / 40 × 100.
- **Exacta estricta** = respuestas exactas en las que además ninguna cifra relevante contradice los datos / 40 × 100. Cifra relevante: porcentaje o monto/cantidad desde 1 000 (se ignoran años, fechas, códigos únicos, números de la pregunta y conteos pequeños). Está sustentada si aparece en los resultados de las herramientas de esa respuesta, si es una suma, resta o cociente simple de dos cifras de la fuente que la respuesta cita, o si coincide con la referencia. Tolerancia según la precisión escrita (hasta 1 %; con ±1 % fijo, 40,279,184.89 pasaría por cercana a 40,682,184.89).
- **Cifras no sustentadas** = respuestas con al menos una cifra relevante sin sustento / 40 × 100. No es «inventada»: «inventada» exige que *ninguna* cifra coincida; aquí basta una suelta sin respaldo.
- **Qué significa:** la exacta original premia acertar *una* cifra aunque otra esté mal; la estricta exige que todas las cifras relevantes se puedan comprobar.

**Resultado global** (`eval/resultados/graficos_global.csv` y `resumen.md`)

| Condición | Exacta | Cita | Inventada | Revisar | Latencia total | Sin reintentos | Llamadas | Ejecutadas |
|---|---|---|---|---|---|---|---|---|
| Sin MCP | 8 % | 10 % | 53 % | 20 | 22,1 s | 11,1 s | 0,0 | 40/40 |
| Con MCP | 100 % | 100 % | 0 % | 0 | 99,9 s | 20,2 s | 1,0 | 40/40 |

La herramienta esperada se usó en 37 de 40 preguntas con MCP.

**Exacta estricta y cifras no sustentadas** (métricas añadidas; las anteriores no cambian; `graficos_global.csv`)

| Condición | Exacta | Exacta estricta | Cifras no sustentadas |
|---|---|---|---|
| Sin MCP | 8 % (3 de 40) | 5 % (2 de 40) | 55 % (22 de 40) |
| Con MCP | 100 % (40 de 40) | 98 % (39 de 40) | 3 % (1 de 40) |

Casos que pasan de exacta a no estricta: **D04 con MCP** (escribió «S/ 40,279,184.89» como incremento y más abajo el correcto «S/ 40,682,184.89»; contó como exacta por el 578,39 %) y **R10 sin MCP** (cifras como «1,9 billones» o «499 569» que no salen de los datos). Por tipo, la estricta con MCP solo baja en detalle (9 de 10); sin MCP las respuestas con cifras sin sustento van de 4 a 7 de cada 10 según el tipo.

**Limitación del puntuador.** Es automático y de reglas simples: no entiende el contexto de cada cifra (una cifra correcta con otro significado cuenta como sustentada; una cuenta válida que la respuesta no muestra puede marcarse como sin sustento). Con MCP, la fuente son los resultados de las herramientas, **reproducidos** con las mismas llamadas (`eval/reconstruir_fuentes.mjs`, sin consultar a la IA) porque `raw_con_mcp.jsonl` solo guardaba su tamaño; coincide en las 40 llamadas. Sin MCP no hay herramientas: se usan la referencia y, en detalle, la fila de la base del código preguntado; cifras reales de otras páginas cuentan como sin sustento. Una sola corrida.

**Por tipo** (`graficos_por_tipo.csv`)

| Tipo | Exacta sin / con | Cita sin / con | Inventada sin / con |
|---|---|---|---|
| Búsqueda | 0 % / 100 % | 0 % / 100 % | 80 % / 0 % |
| Detalle | 20 % / 100 % | 30 % / 100 % | 20 % / 0 % |
| Alertas | 0 % / 100 % | 0 % / 100 % | 70 % / 0 % |
| Resumen | 10 % / 100 % | 10 % / 100 % | 40 % / 0 % |

```mermaid
xychart-beta
  title "Resultado global (% de 40 preguntas)"
  x-axis ["Exactitud sin", "Exactitud con", "Cita sin", "Cita con", "Inventada sin", "Inventada con"]
  y-axis "%" 0 --> 100
  bar [8, 100, 10, 100, 53, 0]
```

**Latencia media** (`graficos_latencia.csv`): 22,1 s sin MCP y 99,9 s con MCP (con reintentos; el proveedor a veces tardó hasta 3 minutos).

| Latencia (s) | Media | Mediana | p90 | Máximo | Mediana sin reintentos | p90 sin reintentos |
|---|---|---|---|---|---|---|
| Sin MCP | 22,1 | 12,9 | 17,9 | 199,8 | 11,0 | 13,9 |
| Con MCP | 99,9 | 21,0 | 214,2 | 401,3 | 14,8 | 20,0 |

**En sencillo:** la mediana es el tiempo de la pregunta del medio y el p90 el que 9 de cada 10 no superaron. Los máximos (más de 300 s; 3 respuestas con MCP) se deben a reintentos: cuando el proveedor no responde a tiempo, el ejecutor espera y repite la consulta una vez, y el total suma ambos intentos.

**Ejemplos reales** (recortados, de `raw_*.jsonl`)

| Pregunta (referencia) | Sin MCP | Con MCP |
|---|---|---|
| B01 ¿Cuántos proyectos de transporte tiene el Gobierno Regional en Cusco? (74) | «…cuenta con una cartera de 56 inversiones e intervenciones en transporte…» (no exacta, inventada) | «…tiene 74 proyectos de inversión pública en la función Transporte registrados en el MEF…» (exacta, cita) |
| A01 ¿Cuántas obras de Ayacucho podrían estar paralizadas? (815) | «Según la Contraloría…, en Ayacucho se registraban 150 obras públicas paralizadas al 30 de junio de 2026.» (no exacta, inventada) | «…se identifican 815 inversiones públicas con posibles indicios de paralización…» (exacta, cita) |
| R01 ¿Cuánto suman las inversiones registradas en Moquegua? (S/ 20 049 064 306,37) | Reparte por nivel de gobierno con otras cifras (no exacta, inventada) | «…suman un costo actualizado total de S/ 20,049,064,306.37… 1,767 inversiones…» (exacta, cita) |

**Limitaciones** (de `resumen.md`): proveedor de IA gratuito con límite de uso y modelo no controlado (sin MCP puede usar búsqueda web); protocolo de herramientas en texto y resultados de más de 15 000 caracteres recortados; puntuación automática con reglas simples (los casos «revisar» requieren revisión manual); la latencia incluye reintentos; «inventada» es una cota superior (sin MCP el chat cita fuentes reales de otras fechas); el marcado interno del proveedor afecta sobre todo a «cita» sin MCP; las abstenciones no cuentan como exactas ni inventadas; una sola corrida por condición; referencia con corte 2026-11-10.

Para regenerar los datos del sitio: `node eval/exportar_sitio.mjs`.

### Benchmarks: página `/evaluacion` y comparación entre modelos

**En sencillo:** la página [/evaluacion](https://obraclara.adrielorihuela.net/evaluacion) («Benchmarks» en el menú) muestra el examen de 40 preguntas completo: tarjetas con el resultado principal (**de 40 preguntas, sin MCP acertó 3; con MCP, 40**), gráficos de todas las métricas y de la latencia, y una tabla de las 40 preguntas con filtro por tipo, búsqueda, la respuesta de referencia, ✓/✗ de exacta, estricta, cita e inventada en cada condición, y un desplegable «Ver respuesta» con lo que contestó la IA (y la herramienta usada, con MCP). Todo se genera con `node eval/exportar_sitio.mjs` desde `eval/resultados/` (archivo `worker/src/sitio/evaluacion-tabla.ts`); nada se copia a mano.

**El MCP mejora a todos los modelos, no solo a uno.** El profesor pidió comparar la IA sola con la herramienta en más de un modelo. Cada modelo se evalúa con las mismas 40 preguntas, sin y con MCP, y sus resultados se guardan aparte en `eval/resultados/modelos/<id>/` sin tocar la corrida principal:

```bash
cd eval
export IA_URL=<API compatible con OpenAI del modelo> IA_KEY=<clave> IA_MODELO=<modelo>
export EVAL_MODELO_ID=<id corto> EVAL_MODELO_NOMBRE="<nombre legible>"
node run_eval.mjs && node reconstruir_fuentes.mjs && node score_eval.mjs && node exportar_graficos.mjs
echo '{"nombre":"<nombre legible>","nota":"<observaciones>"}' > resultados/modelos/<id>/meta.json
node exportar_sitio.mjs   # añade el modelo a la tabla y al gráfico comparativo de /evaluacion
```

Si un proveedor alcanza su límite de uso, el ejecutor se detiene tras 3 fallos seguidos; es reanudable y la tabla muestra cuántas preguntas se respondieron («Respondidas»). Los resultados por modelo aparecen en la sección «El MCP mejora a todos los modelos» de `/evaluacion`.

**Resultados por modelo** (40 preguntas, una corrida por modelo y condición; porcentajes de las 40 preguntas; recall y precisión sobre las 13 preguntas de conteo o lista; «–» = el modelo no nombró ninguna obra, la precisión no se puede calcular):

| Modelo | Condición | Exacta | Estricta | Cita | Inventada | Respondidas | Recall | Precisión |
|---|---|---|---|---|---|---|---|---|
| IA del servidor | sin MCP | 8 % | 5 % | 10 % | 53 % | 40/40 | 1 % | 17 % |
| IA del servidor | con MCP | 100 % | 98 % | 100 % | 0 % | 40/40 | 10 % | 100 % |
| gpt-oss-120b (Groq) | sin MCP | 3 % | 3 % | 0 % | 93 % | 40/40 | 0 % | – |
| gpt-oss-120b (Groq) | con MCP | 25 % | 25 % | 25 % | 55 % | 36/40 | 0 % | – |
| Gemini 3.5 Flash-Lite (Google) | sin MCP | 0 % | 0 % | 0 % | 45 % | 40/40 | 0 % | – |
| Gemini 3.5 Flash-Lite (Google) | con MCP | 95 % | 93 % | 100 % | 3 % | 40/40 | 0 % | – |

Los modelos de otros proveedores se ejecutaron fijos (sin cadena de respaldo) el 19/11/2026. Lectura: con MCP las respuestas exactas suben en los tres modelos, pero el tamaño de la mejora depende del modelo: gpt-oss-120b contestó muchas preguntas sin llamar a la herramienta (inventando el resultado) y 4 respuestas llegaron vacías, así que sube de 3 % a 25 %, mientras que Gemini sube de 0 % a 95 %. Los modelos nuevos casi nunca nombran obras, por eso su recall es 0.

**Recall y precisión de elementos** (métrica pedida por el profesor en la clase del 18/11). Se calculan en las preguntas de búsqueda y alertas que piden contar o listar obras (13 con referencia; B10 y A10 no tienen obras y solo cuentan para la precisión). La lista esperada son los códigos únicos que devuelve la herramienta con los filtros correctos (`eval/reconstruir_referencia.mjs` → `eval/resultados/referencia_items.json`; máximo 20 por consulta). Mencionados = códigos de 7 dígitos de la respuesta. **Recall** = aciertos / esperados («de las obras que debía encontrar, encontró X %»); **precisión** = aciertos / mencionados («de las que nombró, X % eran correctas»); **F1** = 2·P·R / (P + R). Una respuesta que solo da el total tiene recall 0. Las columnas están en `graficos_*.csv` y el detalle por pregunta en `graficos_recall.csv`; en el sitio, sección «Recall y precisión» de `/evaluacion`.


## Métricas

**En sencillo:** medimos cuatro cosas: si los datos están completos, cuántas obras tienen alertas, si el servidor responde rápido y sin fallar, y si lo que responde coincide con la base de datos. Todos los números salen de los archivos de [`metricas/resultados/`](../metricas/resultados/) (corte del 10 de noviembre de 2026); las tablas y los gráficos de la página `/proyecto` se generan con `node metricas/exportar_sitio.mjs`.

### Calidad de los datos

La base tiene **150 574 inversiones** sin repetidos.

| Columna clave | Vacíos | % vacío |
|---|---:|---:|
| Avance físico | 86 301 | 57,3 % |
| Último gasto registrado | 54 898 | 36,5 % |
| Avance de ejecución | 37 699 | 25,0 % |
| Habitantes beneficiados | 46 278 | 30,7 % |
| Fecha de inicio | 11 606 | 7,7 % |
| Monto aprobado (viable) | 243 | 0,2 % |
| Código de ubicación | 166 | 0,1 % |
| Departamento | 13 | 0,0 % |
| Costo actualizado | 0 | 0,0 % |

**Qué significa:** los datos de identificación y ubicación están casi completos, pero el avance físico falta en 57,3 % de las obras; la alerta de paralización solo puede evaluar las que informan su avance.

| Nivel de gobierno | Inversiones | % |
|---|---:|---:|
| Gobiernos locales | 124 181 | 82,5 % |
| Gobiernos regionales | 13 674 | 9,1 % |
| Gobierno nacional | 12 719 | 8,4 % |

| Departamento (10 con más obras) | Inversiones | % |
|---|---:|---:|
| Lima | 15 904 | 10,6 % |
| Ancash | 12 935 | 8,6 % |
| Cusco | 10 604 | 7,0 % |
| Junin | 8 994 | 6,0 % |
| Cajamarca | 8 755 | 5,8 % |
| Puno | 8 425 | 5,6 % |
| La Libertad | 7 894 | 5,2 % |
| Ayacucho | 7 844 | 5,2 % |
| Piura | 7 485 | 5,0 % |
| Arequipa | 7 218 | 4,8 % |

**Qué significa:** más obras registradas no quiere decir más problemas, solo más obras.

### Alertas

| Alerta | Inversiones | % del total |
|---|---:|---:|
| Sobrecosto | 26 387 | 17,5 % |
| Posible paralización | 16 502 | 11,0 % |
| Las dos alertas | 4 205 | 2,8 % |
| Ninguna alerta | 111 890 | 74,3 % |

| Nivel | % con sobrecosto | % con posible paralización |
|---|---:|---:|
| Gobiernos locales | 16,6 % | 11,7 % |
| Gobiernos regionales | 22,4 % | 7,3 % |
| Gobierno nacional | 21,4 % | 7,9 % |

| Departamento | Con sobrecosto | Con posible paralización |
|---|---:|---:|
| Lima | 2 275 (14,3 %) | 2 275 (14,3 %) |
| Cusco | 2 782 (26,2 %) | 1 484 (14,0 %) |
| Ancash | 2 559 (19,8 %) | 1 126 (8,7 %) |
| Junin | 1 525 (17,0 %) | 1 117 (12,4 %) |
| Arequipa | 1 504 (20,8 %) | 968 (13,4 %) |
| Puno | 1 095 (13,0 %) | 1 179 (14,0 %) |
| Cajamarca | 1 413 (16,1 %) | 687 (7,8 %) |
| Piura | 1 312 (17,5 %) | 705 (9,4 %) |
| Ayacucho | 1 003 (12,8 %) | 815 (10,4 %) |
| Ica | 955 (17,6 %) | 706 (13,0 %) |

**Qué significa:** son señales para decidir qué revisar primero; los gobiernos regionales y el nacional tienen proporcionalmente más sobrecosto y los locales más posible paralización. No prueban irregularidades.

| Cuánto se pasó del monto aprobado | Inversiones | % |
|---|---:|---:|
| < 0 % (costo menor al viable) | 26 363 | 17,5 % |
| 0 a 10 % | 69 919 | 46,5 % |
| 10 a 25 % | 13 413 | 8,9 % |
| 25 a 50 % | 14 247 | 9,5 % |
| 50 a 100 % (alerta) | 12 965 | 8,6 % |
| 100 a 200 % (alerta) | 8 327 | 5,5 % |
| 200 % o más (alerta) | 5 095 | 3,4 % |
| sin dato (monto viable vacío o 0) | 245 | 0,2 % |

| Meses sin registrar gasto | Inversiones | % |
|---|---:|---:|
| sin dato (sin devengado registrado) | 54 898 | 36,5 % |
| 0 a 2 meses | 20 774 | 13,8 % |
| 3 a 5 meses | 8 437 | 5,6 % |
| 6 a 11 meses (alerta si avance 40-99 %) | 12 375 | 8,2 % |
| 12 a 23 meses | 13 159 | 8,7 % |
| 24 a 59 meses | 24 502 | 16,3 % |
| 60 meses o más | 16 429 | 10,9 % |

**Qué significa:** la mayoría de las obras cuesta lo aprobado o poco más; muchas llevan años sin registrar gasto, pero la alerta solo se activa si además van entre 40 % y 99 % de avance.

### Rendimiento del servidor MCP

Se llamó 30 veces a cada una de las 4 herramientas (**n = 120 llamadas**) y 10 veces a la lista de herramientas y al estado del servicio (140 llamadas en total), una tras otra, desde Lima, contra el servidor público. Con argumentos variados: las 10 preguntas de la evaluación de cada herramienta más variantes. La primera medición (20 llamadas por herramienta) está guardada en `metricas/resultados/rendimiento_mcp_previo_n20.csv`.

| Prueba | Llamadas (n) | Éxito | Mediana | P90 | Mínimo | Máximo |
|---|---:|---:|---:|---:|---:|---:|
| `buscar_inversiones` | 30 | 100 % | 1,4 s | 1,5 s | 1,3 s | 2,1 s |
| `detalle_inversion` | 30 | 100 % | 1,0 s | 1,1 s | 0,9 s | 1,1 s |
| `alertas_inversion` | 30 | 100 % | 1,3 s | 1,4 s | 1,3 s | 1,5 s |
| `resumen_inversiones` | 30 | 100 % | 1,0 s | 1,0 s | 0,9 s | 1,2 s |
| `tools/list` | 10 | 100 % | 0,3 s | 0,4 s | 0,3 s | 0,5 s |
| `GET /salud` | 10 | 100 % | 0,6 s | 0,7 s | 0,6 s | 0,8 s |

**Qué significa:** las 140 llamadas funcionaron (100 % de éxito, 0 errores) y la mitad de las consultas se respondió en 1,0 a 1,4 s; el 90 % tardó menos de 1,5 s. «P90» es el tiempo por debajo del cual quedó el 90 % de las respuestas. Los datos crudos de cada llamada están en `metricas/resultados/rendimiento_mcp_crudo.csv`. La primera medición (n = 20 por herramienta) dio medianas de 1,4 a 2,1 s: la diferencia probablemente se deba a la red de ese momento (la medición incluye el viaje desde Lima); no se cambió el servidor para mejorarla.

### ¿Las herramientas dicen lo mismo que la base de datos?

- Detalle de obras: **30 de 30** fichas idénticas (810 de 810 campos iguales).
- Resúmenes por filtro: **10 de 10** idénticos.
- Listas de alertas: **14 de 14** con el mismo total que la base.

**Qué significa:** el servidor no cambia ni inventa cifras.

### Pruebas de software

**149 de 149** pruebas automáticas pasan, en 15 archivos. Cobertura de código: 80,3 % de las líneas (75,5 % en la lógica del servidor, sin las páginas).

**Qué significa:** una prueba automática es un programa que revisa que otro funciona; «cobertura» es la parte del código que se ejecutó al probar.

### Asistente del sitio, de punta a punta

Se hicieron **24 preguntas variadas** (6 de cada tipo del banco de 40), de una en una con pausa de 8 s, al asistente completo con las herramientas conectadas (`POST /api/agente` con `mcp: true`, igual que el panel «con conexión»). Cada respuesta se comparó con el dato oficial del MEF usando la regla de «exacta» de la evaluación. Respondieron la IA del servidor (2) y su respaldo automático Gemini 3.5 Flash-Lite (22); ningún error ni límite de uso. Script: `metricas/asistente_extenso.mjs`; datos: `asistente_extenso.csv` (con la respuesta recortada de cada pregunta).

| Tipo de pregunta | Preguntas (n) | Con respuesta | Correctas | Mediana | P90 | Mínimo | Máximo |
|---|---:|---:|---:|---:|---:|---:|---:|
| Todas | 24 | 24 | 21 (87,5 %) | 6,9 s | 22,4 s | 4,6 s | 26,2 s |
| Búsqueda | 6 | 6 | 5 (83,3 %) | 8,6 s | 26,2 s | 5,6 s | 26,2 s |
| Detalle de una obra | 6 | 6 | 6 (100 %) | 5,5 s | 16,3 s | 4,6 s | 16,3 s |
| Alertas | 6 | 6 | 5 (83,3 %) | 6 s | 22,4 s | 5,7 s | 22,4 s |
| Resumen | 6 | 6 | 5 (83,3 %) | 5,8 s | 23,6 s | 4,9 s | 23,6 s |

**Qué significa:** la mitad de las preguntas se respondió en 6,9 s o menos y el 90 % en menos de 22,4 s (máximo 26,2 s). El asistente acertó **21 de 24 (87,5 %)**, y en las 24 llamó a las herramientas al menos una vez. Una primera medición del mismo día dio solo 4 de 24: la IA del servidor respondía sin consultar el registro (de memoria o con otras fuentes, como la Contraloría). Se corrigió en el servidor de IA: si hay herramientas conectadas y la pregunta pide datos de su tema, no se acepta una respuesta que no las haya consultado. Las 3 fallas que quedan son una respuesta que dijo no poder confirmar el dato, una que habló de archivos en vez de responder y una con una cifra distinta de la oficial; por eso la evaluación de 40 preguntas (40 de 40) sigue siendo la medida de la conexión y no conviene decir «el asistente siempre acierta». La primera medición del asistente (5 preguntas sin herramientas y 2 con ellas) fue demasiado pequeña y queda reemplazada por esta.

## 11. Pruebas

**149 pruebas en 15 archivos** (`cd worker && npx vitest run`), todas pasan; además `npx tsc --noEmit` y `npx wrangler deploy --dry-run`.

| Archivo | Pruebas | Qué cubre |
|---|---|---|
| `adjuntos` | 16 | ZIP y .docx para la vista previa, texto frente a binario |
| `agente` | 42 | llamadas JSON a herramientas, SSE, vista previa de .xlsx/.csv y panel como cliente de la API |
| `compartir` | 14 | chats compartidos |
| `queries` | 14 | normalización, buscar, detalle, alertas y resumen sobre D1 simulada |
| `cadena` | 13 | cadena de proveedores de IA y validación con imágenes |
| `agenteapi` | 2 | forma de la petición a la API del agente |
| `remotedb` | 4 | usa el conector y cae a D1 si no responde |
| `mcp` | 3 | 4 herramientas, respuesta con datos, fuente, URL y fecha, sin resultados |
| `gptjobs` | 2 | validación de mensajes |
| `sitio` | 5 | `/proyecto` responde con todas las secciones, cifras y gráficos accesibles |

## 12. Limitaciones y trabajo futuro

- Datos a la fecha de descarga; alertas aproximadas; D1 queda vacía unos minutos durante la recarga; la IA del servidor es compartida y puede estar apagada; evaluación de una sola corrida con puntuación automática.
- Futuro: repetir la evaluación y revisar a mano los casos «revisar»; acercar la alerta de paralización a la ley (modalidad y avance físico reciente); otras fuentes oficiales para contrastar; llamadas nativas a herramientas.

## 13. Uso de IA

El código se desarrolló con ayuda de IA generativa y fue revisado y probado por el grupo. La redacción del informe, el workflow, los gráficos del informe y el póster los hace el grupo sin IA. En el chat, el modelo solo redacta: las cifras salen de las herramientas y del ETL.

## 14. Referencias

- Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., Neelakantan, A., Shyam, P., Sastry, G., Askell, A., Agarwal, S., Herbert-Voss, A., Krueger, G., Henighan, T., Child, R., Ramesh, A., Ziegler, D. M., Wu, J., Winter, C., . . . Amodei, D. (2020). Language models are few-shot learners. En *Advances in Neural Information Processing Systems* (Vol. 33). <https://arxiv.org/abs/2005.14165>
- Congreso de la República. (2022). *Ley N.° 31589*.
- Es, S., James, J., Espinosa Anke, L., & Schockaert, S. (2024). RAGAs: Automated evaluation of retrieval augmented generation. En *Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics: System Demonstrations* (pp. 150–158). <https://doi.org/10.18653/v1/2024.eacl-demo.16>
- Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., Dai, Y., Sun, J., Wang, M., & Wang, H. (2023). *Retrieval-augmented generation for large language models: A survey*. arXiv. <https://arxiv.org/abs/2312.10997>
- Hou, X., Zhao, Y., Wang, S., & Wang, H. (2025). *Model Context Protocol (MCP): Landscape, security threats, and future research directions*. arXiv. <https://arxiv.org/abs/2503.23278>
- Janssen, M., Charalabidis, Y., & Zuiderwijk, A. (2012). Benefits, adoption barriers and myths of open data and open government. *Information Systems Management, 29*(4), 258–268. <https://doi.org/10.1080/10580530.2012.716740>
- Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y. J., Madotto, A., & Fung, P. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys, 55*(12), 1–38. <https://doi.org/10.1145/3571730>
- Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.-t., Rocktäschel, T., Riedel, S., & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. En *Advances in Neural Information Processing Systems* (Vol. 33). <https://arxiv.org/abs/2005.11401>
- Li, J., Hui, B., Qu, G., Yang, J., Li, B., Li, B., Wang, B., Qin, B., Cao, R., Geng, R., Huo, N., Zhou, X., Ma, C., Li, G., Chang, K. C. C., Huang, F., Cheng, R., & Li, Y. (2023). Can LLM already serve as a database interface? A BIg bench for large-scale database grounded text-to-SQLs. En *Advances in Neural Information Processing Systems* (Vol. 36). <https://arxiv.org/abs/2305.03111>
- Ministerio de Economía y Finanzas. (2026a). *Nota Informativa N.° 02* [Obras paralizadas, julio de 2026].
- Ministerio de Economía y Finanzas. (2026b). *Información de inversiones públicas 2001–2026* [Conjunto de datos]. Plataforma Nacional de Datos Abiertos. <https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-inversiones-p%C3%BAblicas-2001%E2%80%932026-mef>
- Model Context Protocol. (2025). *Specification (versión 2025-06-18)*. <https://modelcontextprotocol.io/specification/2025-06-18>
- Naciones Unidas. (s. f.). *Objetivo 16: Paz, justicia e instituciones sólidas*. <https://sdgs.un.org/es/goals/goal16>
- Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., Cancedda, N., & Scialom, T. (2023). Toolformer: Language models can teach themselves to use tools. En *Advances in Neural Information Processing Systems* (Vol. 36). <https://arxiv.org/abs/2302.04761>
- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. En *Advances in Neural Information Processing Systems* (Vol. 30). <https://arxiv.org/abs/1706.03762>
- Wang, L., Ma, C., Feng, X., Zhang, Z., Yang, H., Zhang, J., Chen, Z., Tang, J., Chen, X., Lin, Y., Zhao, W. X., Wei, Z., & Wen, J. (2024). A survey on large language model based autonomous agents. *Frontiers of Computer Science, 18*(6). <https://doi.org/10.1007/s11704-024-40231-1>
- Wirtz, B. W., Weyerer, J. C., Becker, M., & Müller, W. M. (2022). Open government data: A systematic literature review of empirical research. *Electronic Markets, 32*(4), 2381–2404. <https://doi.org/10.1007/s12525-022-00582-8>
- Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). ReAct: Synergizing reasoning and acting in language models. En *International Conference on Learning Representations (ICLR 2023)*. <https://arxiv.org/abs/2210.03629>
- Yu, T., Zhang, R., Yang, K., Yasunaga, M., Wang, D., Li, Z., Ma, J., Li, I., Yao, Q., Roman, S., Zhang, Z., & Radev, D. (2018). Spider: A large-scale human-labeled dataset for complex and cross-domain semantic parsing and text-to-SQL task. En *Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing* (pp. 3911–3921). <https://doi.org/10.18653/v1/D18-1425>

## 15. Enlaces

- Guía de exposición: [`docs/EXPOSICION.md`](EXPOSICION.md)
- Fuentes y referencias: [`fuentes/REFERENCIAS.md`](../fuentes/REFERENCIAS.md)
- Repositorio: <https://github.com/adrielorihuela/obraclara-mcp>
- Servidor MCP: <https://obraclara.adrielorihuela.net/mcp>
- [Conectar](https://obraclara.adrielorihuela.net/conectar) · [Asistente](https://obraclara.adrielorihuela.net/asistente) · [Datos y alertas](https://obraclara.adrielorihuela.net/datos) · [El proyecto](https://obraclara.adrielorihuela.net/proyecto)
