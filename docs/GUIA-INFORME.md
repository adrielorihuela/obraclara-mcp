# Guía para redactar el informe final y hacer los gráficos

**ObraClara Perú · Grupo 1 · I.A. Aplicada 2026-2 (sección 356) · Entrega: domingo 29/11/2026, 23:59 (Blackboard, Word o PDF).**
Actualizada el 20/11/2026 con los datos finales del repositorio. Sigue, en orden, las secciones de «1_Plantilla Informe.docx».

## A. Cómo usar esta guía (léanla los cuatro antes de empezar)

- **Regla de la rúbrica (sección 8 del documento del proyecto):** la IA **no está permitida** en la redacción del informe, en el diseño del workflow, en las imágenes y gráficos del informe ni en el póster. Incumplirlo es **0 en la Nota 03**. La IA sí se permite en el código (hay que declararlo en la Introducción) y en el PPT (declararlo en el PPT).
- Por eso esta guía **no trae párrafos para copiar**. Para cada sección de la plantilla da: extensión, objetivo, lo que pidió el profesor, **qué decir párrafo por párrafo con todos los datos concretos** (cantidades, porcentajes, veces, fechas, autores) en plantillas con huecos `___`, cada tabla con sus filas, columnas y valores, cada figura con cada caja, flecha, eje y valor, los errores a evitar y una lista de verificación.
- Las plantillas son un **esqueleto de ideas**: el texto entre paréntesis dice qué va en el hueco; ustedes escriben la oración a su manera.
- Todo lo necesario está aquí; los archivos citados (repositorio https://github.com/adrielorihuela/obraclara-mcp y sitio https://obraclara.adrielorihuela.net) sirven para comprobar y para la nota «Fuente:». No estimen ninguna cifra.
- Los documentos de Drive «EJEMPLO (hecho con IA)» y «Material de apoyo» son solo para entender: no se copian.
- Cifras en formato peruano: espacio para los miles y coma decimal (150 574; 57,3 %; S/ 20 049 064 306,37).

Para bajar un CSV de GitHub: abrir el archivo → botón «Download raw file». En Excel: Datos → Obtener datos → Desde texto/CSV → origen «65001: Unicode (UTF-8)» → Cargar.

## B. Reparto sugerido (según lo que cada uno expuso en las mentorías del 18/11 y 20/11)

| Integrante | Secciones que redacta | Figuras y tablas que hace a mano |
|---|---|---|
| **Camila** | Resultados 4.1 a 4.4 (globales, por tipo, ejemplos, interpretación); revisión manual de los casos «revisar» con Piero | Tabla 9 (resultados globales), Figura 6 (barras sin/con MCP), Figura 7 (por tipo), Tabla 10 (ejemplos) |
| **Piero** | Diseño 3.7 (evaluación); Resultados 4.5 (modelos, recall y precisión) y 4.6 (tiempo); Referencias | Tabla 8 (métricas), Tabla 11 / Figura 8 (modelos), Tabla 12 (tiempos) |
| **Sebastián** | Marco teórico (ajustes y ecuaciones); Diseño 3.2 (datos y ETL) y 3.5 (alertas) | Figura 2 (flujo de datos), Tablas 2 y 3 (columnas y calidad), Figura 5 (histograma de sobrecosto), Tabla 5 (alertas frente a lo oficial) |
| **Adriel** | Introducción (ajustes y declaración de IA); Diseño 3.1, 3.3, 3.4 y 3.6; Anexo 01 | Figura 1 (CRISP-DM, opcional), Figura 3 (arquitectura, obligatoria), Figura 4 (7 etapas), Tabla 1 (CRISP-DM), Tabla 4 (herramientas), Tabla 6 (tecnologías) y Tabla 7 (verificación) |
| **Los cuatro** | Portada y título, Resumen, Palabras clave, Conclusiones, Anexo 02, revisión final | Tabla del Anexo 02 |

Todos escriben en **un solo Word compartido** hecho desde la plantilla, con control de cambios activado para la revisión cruzada.

## C. Calendario hasta el 29/11

| Fecha | Qué se hace | Quién |
|---|---|---|
| Vie 20/11 – Sáb 21/11 | Leer esta guía; reunión de 30 min: confirmar reparto, aprobar el glosario (D) y crear el Word compartido con las secciones vacías | Todos |
| Dom 22/11 – Mar 24/11 | Primer borrador de cada sección propia; bajar los CSV; hacer tablas | Cada uno |
| Mar 24/11 | Figuras dibujadas (draw.io y Excel) e insertadas con número, título, nota y fuente | Cada uno |
| Mié 25/11 | Revisión manual de los 20 casos «revisar» (sección 6, apartado 6.7) | Camila y Piero |
| Jue 26/11 | **Borrador completo** (todo menos Resumen y Conclusiones) | Todos |
| Vie 27/11 | Revisión cruzada con la lista de verificación de cada sección: Camila revisa a Adriel, Adriel a Sebastián, Sebastián a Piero, Piero a Camila | Todos |
| Sáb 28/11 | Reunión: Resumen y Conclusiones con las cifras finales; Anexo 02; cruce citas ↔ referencias; numerar tablas y figuras | Todos |
| Dom 29/11 | Lectura en voz alta; lista global (sección F); exportar a PDF; **subir antes de las 20:00** (cierre 23:59) | Todos (uno sube) |

## D. Glosario común: úsenlo igual en todo el informe

La revisión externa del 18/11 encontró nombres de herramientas distintos en el avance, el sitio y las tablas, y dos definiciones de «información inventada». Decidan estos términos el primer día y no los cambien.

| Término | Cómo escribirlo siempre | Qué significa (explíquenlo con sus palabras la primera vez) |
|---|---|---|
| El sistema | **ObraClara Perú** (después «ObraClara») | Servidor MCP + sitio web + base de datos |
| El protocolo | **Model Context Protocol (MCP)** la primera vez; luego «MCP» | Estándar abierto para que un modelo de lenguaje use herramientas externas |
| El servidor | **servidor MCP de ObraClara** | Programa en Cloudflare que atiende en https://obraclara.adrielorihuela.net/mcp |
| La IA que responde | **modelo de lenguaje** («LLM» después de definirlo); no alternar con «chatbot» | Interpreta la pregunta, elige la herramienta y redacta |
| Herramienta 1 | **`buscar_inversiones`** | Busca inversiones por texto y filtros; devuelve el total y hasta 20 |
| Herramienta 2 | **`detalle_inversion`** | Ficha completa de una inversión por su código único |
| Herramienta 3 | **`alertas_inversion`** | Inversiones con alerta de sobrecosto o de posible paralización |
| Herramienta 4 | **`resumen_inversiones`** | Totales por entidad, departamento, función o nivel |
| La fuente | **archivo `DETALLE_INVERSIONES.csv` del MEF** (conjunto «Información de inversiones públicas 2001–2026») | Única fuente de datos; cita (MEF, 2026b) |
| Fecha de corte | **10 de noviembre de 2026** | Fecha de descarga; todas las cifras de datos son «al 10/11/2026» |
| Condiciones | **sin MCP** y **con MCP** | Mismo modelo y mismas preguntas; solo cambia el acceso a las herramientas |
| Exactitud | **respuesta exacta** | Al menos una cifra a ±1 % del valor oficial; en preguntas de texto, nombra la entidad esperada; en preguntas sin datos, dice que no hay resultados |
| Exactitud estricta | **exactitud estricta** | Respuesta exacta **y** ninguna otra cifra relevante sin sustento en la fuente |
| Citación | **citación correcta** | Menciona el MEF (o el dataset o datosabiertos.gob.pe) **y** la fecha de corte o de descarga |
| Información inventada | **información inventada** (una sola definición) | Ver abajo |
| Cifras no sustentadas | **cifras no sustentadas** | Respuesta con al menos una cifra relevante (porcentaje, o monto o cantidad ≥ 1 000; se ignoran años, fechas, códigos y números de la pregunta) que no está en la fuente ni sale de una suma, resta o cociente de dos cifras de la fuente |
| Alertas | **alerta de sobrecosto** y **alerta de posible paralización**; nunca «obra paralizada» ni «corrupción» | Indicios técnicos para priorizar revisiones, no determinaciones oficiales |

**Información inventada: una sola definición** (la de `eval/resultados/resumen.md`). Una respuesta tiene información inventada si cumple **cualquiera** de estas tres condiciones: (1) da cifras (en preguntas en soles, cifras de 1 000 o más) y **ninguna** coincide con la referencia oficial; (2) afirma resultados en una pregunta que no tiene datos (B10, D10, A10); (3) nombra una entidad distinta de la esperada. En el avance decía «datos ausentes en la fuente»: **cámbienlo** en Introducción y Marco teórico. Expliquen una vez la diferencia con «cifras no sustentadas»: la inventada exige que *ninguna* cifra coincida; la no sustentada basta con *una* cifra suelta sin respaldo aunque otra sea correcta.

## E. Formato general (todas las secciones)

- **Numeración sugerida:** 1 Introducción · 2 Marco teórico (2.1–2.8) · 3 Diseño y desarrollo de la propuesta (3.1–3.7) · 4 Resultados e interpretación de resultados (4.1–4.6) · 5 Conclusiones · Referencias · Anexo 01 · Anexo 02.
- **Tablas APA 7:** arriba «**Tabla N**» en negrita; debajo, título en *cursiva*; tabla sin líneas verticales; debajo «*Nota.* ___. Fuente: elaboración propia con datos de ___ (Autor, año).»
- **Figuras APA 7:** arriba «**Figura N**» en negrita; título en *cursiva*; imagen; debajo nota y fuente igual.
- Cada tabla y figura se **menciona en el texto antes** de aparecer («como muestra la Tabla 9, …»).
- **Fuentes de datos propios:** datos del MEF → «Fuente: elaboración propia con datos de MEF (2026b)»; evaluación → «Fuente: elaboración propia a partir de la evaluación del grupo (Anexo 01, `eval/resultados/graficos_global.csv`)».
- **Ecuaciones:** Insertar → Ecuación en Word; numeradas a la derecha (1), (2)…
- **Citas en el texto:** (Autor, año) o Autor (año); con 3 o más autores, «et al.» desde la primera vez; los dos documentos del MEF son (MEF, 2026a) y (MEF, 2026b); la primera vez «Ministerio de Economía y Finanzas [MEF], 2026a».

**Excel (pasos comunes para todos los gráficos):** (1) abrir el CSV y copiar a una hoja nueva solo las columnas del gráfico; renombrar «sin_mcp» → «Sin MCP», «con_mcp» → «Con MCP» y los encabezados en español; (2) seleccionar → Insertar → Gráfico → el tipo indicado; (3) Diseño del gráfico → Agregar elemento → Etiquetas de datos → Extremo externo; (4) en porcentajes, eje Y de 0 a 100 (clic derecho en el eje → Dar formato al eje → Mínimo 0, Máximo 100); (5) sin 3D ni sombras, sin título dentro del gráfico (va arriba en formato APA), leyenda abajo; colores: **gris** para «Sin MCP» y **azul** para «Con MCP» en todas las figuras; (6) clic derecho → Copiar → en Word Pegado especial → Imagen (PNG).

**draw.io (pasos comunes para los diagramas):** (1) https://app.diagrams.net → Create New Diagram → Blank Diagram → guardar en el Drive del grupo; (2) rectángulo redondeado = proceso, cilindro («Cylinder») = base de datos, «Actor» = persona, «Document» = archivo; (3) flechas desde el punto azul de una caja a otra; doble clic en la flecha para rotularla; (4) números en círculos para los pasos; (5) Arial 11 o más, máximo tres colores; (6) Archivo → Exportar como → PNG, zoom 200 %, fondo blanco; (7) guardar el `.drawio` en el Drive como evidencia de que lo hizo el grupo.

---

## 1. Portada y título

**Qué pide la plantilla:** portada con «Universidad de Lima · Facultad de Ingeniería · Inteligencia Artificial Aplicada», **TÍTULO DEL TRABAJO**, **«ODS N° XX: Xxxxxxxx»**, Alumno 01 a 04, Profesor, «Lima - Perú», «Mes - 2026»; luego una página con el título y cada autor con «Universidad de Lima» y su correo `202xxxxx@aloe.ulima.edu.pe`.

**Qué pidió el profesor:** en la inscripción propuso simplificar el título y sugirió «ObraClara Perú: asistente de inteligencia artificial para consultar y analizar datos de inversión pública mediante MCP»; en el avance (3/3) valoró «un título más preciso». La rúbrica exige indicar **el ODS expresamente** en la entrega final.

**Qué poner:**
- Título: el del avance, ya aprobado. Debe contener tres elementos: «ObraClara Perú», «inversión pública» y «MCP». Si alguno falta, usen la propuesta del profesor.
- ODS: «ODS N° 16: Paz, justicia e instituciones sólidas».
- Profesor: Lutzgardo Saavedra. Fecha: «Noviembre - 2026». Integrantes en orden alfabético por apellido, con sus códigos y correos.

**Errores a evitar:** título distinto en la portada y en la página 2; dejar «Mes - 2026» o «ODS N° XX».

**Verificación:** ☐ mismo título en las dos páginas ☐ ODS 16 escrito completo ☐ 4 nombres y 4 correos ☐ profesor y fecha.

## 2. Resumen

**Extensión:** **un párrafo de 150 a 200 palabras, sin citas.** Escríbanlo al final (sábado 28/11).

**Qué pidió el profesor (avance, 16/11):** «Revisar que el resumen refleje **únicamente actividades y resultados efectivamente realizados**.» El del avance tenía resultados esperados: **reemplácenlo entero**.

**Qué decir, oración por oración:**
1. En esta oración explican que el problema es que la información de inversión pública del Perú ___ (es abierta pero difícil de usar: un archivo de 247 MB con 150 641 filas y términos como devengado o PIM) y que los modelos de lenguaje ___ (responden de memoria y pueden dar cifras falsas).
2. Explican que se construyó ___ (ObraClara Perú), un servidor MCP público con ___ (4) herramientas que consultan ___ (el archivo `DETALLE_INVERSIONES.csv` del MEF, corte del 10/11/2026).
3. Explican que los datos se ___ (limpiaron con un ETL en Python), del que resultaron ___ (150 574 inversiones), y que las alertas de ___ (sobrecosto y posible paralización) se calcularon con reglas fijas y no con el modelo.
4. Explican que se evaluó haciendo ___ (las mismas 40 preguntas, 10 de cada tipo) al ___ (mismo modelo) sin MCP y con MCP.
5. Dan **como máximo tres** resultados: exactitud de ___ (8 %) a ___ (100 %), exactitud estricta de ___ (5 %) a ___ (98 %) e información inventada de ___ (53 %) a ___ (0 %).
6. Cierran con lo que significa: ___ (conectar el modelo a la fuente oficial mediante MCP hace que sus cifras sean verificables) y la principal limitación ___ (una sola corrida con puntuación automática).

**Datos del Resumen**

| Cifra | Valor | Archivo |
|---|---|---|
| Archivo del MEF | 150 641 filas, 68 columnas, 247 MB | `docs/PROYECTO.md` § 5 |
| Inversiones en la base | 150 574 | `metricas/resultados/calidad_nulos.csv` |
| Fecha de corte | 10/11/2026 | `eval/preguntas.csv` |
| Preguntas | 40 (10 de búsqueda, 10 de detalle, 10 de alertas, 10 de resumen) | `eval/resultados/resumen.md` |
| Exactitud sin → con MCP | 3 de 40 (8 %) → 40 de 40 (100 %) | `eval/resultados/graficos_global.csv` |
| Exactitud estricta | 2 de 40 (5 %) → 39 de 40 (98 %) | ídem |
| Información inventada | 21 de 40 (53 %) → 0 de 40 (0 %) | ídem |

**Errores a evitar:** citas; futuro («se evaluará»); más de 200 palabras; cifras distintas de Resultados.

**Verificación:** ☐ 150–200 palabras (contador de Word) ☐ 0 citas ☐ todo en pasado ☐ cifras iguales a la Tabla 9.

## 3. Palabras clave

**Extensión:** **al menos 5, separadas por coma** (plantilla).

**Qué poner:** 5 a 7 conceptos que sean subtítulos o ideas centrales del Marco teórico. Opciones (elijan): inteligencia artificial, modelos de lenguaje, Model Context Protocol, inversión pública, datos abiertos, transparencia, alucinación, uso de herramientas.

**Verificación:** ☐ ≥ 5 ☐ separadas por coma ☐ todas aparecen en el texto.

## 4. Introducción (sección 1)

**Extensión:** **una página, con citas** (plantilla). Debe incluir la declaración de uso de IA (la rúbrica lo exige **en la Introducción**).

**Qué pidió el profesor:** inscripción: «estadísticas oficiales citadas, los usuarios beneficiarios y **por qué conviene LLM con MCP frente a una consulta convencional**»; ODS 16 «sobre todo 16.6 y 16.10» y **16.5 solo como contribución indirecta**; alertas «sin presentarlas como evidencia de corrupción». Avance (3/3): «introducción bien contextualizada»: **manténganla y hagan solo estos ajustes**: (1) unificar «información inventada» (D); (2) pasar a pasado lo ya hecho; (3) nombres reales de las 4 herramientas; (4) añadir el párrafo de declaración de IA; (5) cerrar con la organización del informe.

**Qué decir, párrafo por párrafo:**

1. **Contexto.** Explican que las obras paralizadas son un problema medido por el Estado: según el MEF (2026a), con datos a marzo de 2026, había ___ (684) inversiones vinculadas a obras paralizadas, con un costo actualizado de ___ (S/ 21 141 millones), de los que ya se habían devengado ___ (S/ 13 100 millones) y quedaba un saldo de ___ (S/ 8 041 millones). Añaden que la mayoría eran de ___ (gobiernos locales: 511, el 75 %), que el gobierno nacional tenía ___ (93, el 13,6 %, pero con S/ 4 364 millones, el 54,3 % del saldo) y que las causas principales fueron ___ (falta de recursos financieros: 109, 15,9 %; incumplimiento de contrato: 106, 15,5 %).
2. **Problema.** Explican que el MEF publica todas las inversiones como datos abiertos (MEF, 2026b), pero que usarlos exige ___ (descargar un archivo de 247 MB con 150 641 filas y 68 columnas, entender términos como PIM, devengado o código único y filtrar a mano). Citan a Janssen et al. (2012), que sostienen que ___ (publicar datos no basta: hay barreras técnicas y de uso que impiden aprovecharlos).
3. **Por qué un LLM con MCP y no una consulta convencional.** Explican que un buscador o una consulta SQL ___ (exige conocer códigos y columnas y no explica el resultado); que un modelo de lenguaje ___ (entiende preguntas en castellano y redacta), pero ___ (puede dar datos falsos con seguridad: alucinación; Ji et al., 2023); y que dejar que el modelo escriba SQL no es fiable porque ___ (en el banco BIRD el mejor modelo evaluado logró 40,08 % de exactitud de ejecución frente a 92,96 % de personas; Li et al., 2023). Con MCP, en cambio, ___ (el modelo elige una herramienta, el servidor ejecuta una consulta fija sobre la fuente oficial y la respuesta trae fuente y fecha).
4. **Usuarios.** Explican a quién sirve: ___ (ciudadanos, periodistas, regidores y estudiantes que quieren saber cuánto cuesta, cuánto avanza o si tiene alertas una obra de su zona sin saber de bases de datos).
5. **Objetivos.** Objetivo general: ___ (facilitar el acceso a la información oficial de inversión pública mediante un servidor MCP público que permita a un asistente de IA buscar obras, ver su detalle, detectar alertas y resumir por entidad o región, citando fuente y fecha). Objetivos específicos: (a) ___ (procesar el archivo del MEF con un ETL), (b) ___ (implementar las 4 herramientas), (c) ___ (definir alertas de sobrecosto y posible paralización con criterios técnicos), (d) ___ (evaluar con 40 preguntas sin y con MCP).
6. **ODS 16.** Explican que el proyecto se relaciona **directamente** con la meta 16.6 (___: «crear a todos los niveles instituciones eficaces y transparentes que rindan cuentas») y la 16.10 (___: «garantizar el acceso público a la información»), porque ___; y **indirectamente** con la 16.5 (___: «reducir considerablemente la corrupción y el soborno»), porque ___ (las alertas solo ayudan a la vigilancia ciudadana; no prueban irregularidades) (Naciones Unidas, s. f.).
7. **Declaración de uso de IA** (párrafo propio; ver el recuadro de abajo).
8. **Organización.** Una oración: en la sección 2 ___ (marco teórico), en la 3 ___ (diseño), en la 4 ___ (resultados) y en la 5 ___ (conclusiones).

**Declaración de uso de IA: qué debe decir (la redactan ustedes)**
1. **Herramienta:** Claude, de la empresa Anthropic, usado mediante Claude Code con los modelos Claude Opus 5.5 y Claude Sonnet 5.5 (el historial del repositorio registra 49 y 14 cambios coautorados con cada uno). Cita: (Anthropic, 2026).
2. **Para qué:** desarrollo del código (vibe coding, permitido por el profesor): servidor MCP, ETL, sitio web y scripts de evaluación y de métricas; y apoyo para **ubicar** fuentes que el grupo leyó y verificó.
3. **Qué hizo el grupo:** definió el problema, el alcance y las 40 preguntas; revisó, probó y desplegó el código; verificó cada referencia; interpretó los resultados.
4. **Qué no se hizo con IA:** la redacción del informe, el workflow, las figuras y gráficos del informe y el póster.
5. **Aclaración:** el modelo de lenguaje que responde dentro de ObraClara es parte del sistema evaluado, no una ayuda de redacción.

**Datos de la Introducción**

| Cifra | Valor | Cita |
|---|---|---|
| Inversiones vinculadas a obras paralizadas | 684 (datos a marzo de 2026; nota del 17/07/2026) | (MEF, 2026a) |
| Costo actualizado / devengado / saldo | S/ 21 141 M / S/ 13 100 M / S/ 8 041 M | (MEF, 2026a) |
| Por nivel | locales 511 (75 %); nacional 93 (13,6 %; saldo S/ 4 364 M = 54,3 % del saldo); regionales 80 (11,7 %) | (MEF, 2026a) |
| Causas | falta de recursos 109 (15,9 %); incumplimiento de contrato 106 (15,5 %) | (MEF, 2026a) |
| Archivo abierto | 150 641 filas, 68 columnas, 247 MB | (MEF, 2026b) |
| BIRD | 40,08 % del modelo frente a 92,96 % de personas | (Li et al., 2023) |
| ODS | 16.5 indirecta; 16.6 y 16.10 directas | (Naciones Unidas, s. f.) |

**Errores a evitar:** decir que ObraClara «detecta corrupción» u «obras paralizadas»; 16.5 como relación directa; olvidar la declaración de IA; párrafos sin cita.

**Verificación:** ☐ 1 página ☐ ≥ 5 citas ☐ comparación con consulta convencional ☐ usuarios ☐ objetivos ☐ ODS 16 con 16.5 indirecta ☐ declaración de IA con (Anthropic, 2026).

## 5. Marco teórico (sección 2)

**Extensión:** **dos a tres páginas**, con gráficos y ecuaciones según corresponda, con citas. Gráficos hechos por el grupo.

**Qué pidió el profesor:** inscripción: «modelos de lenguaje, agentes de IA y uso de herramientas, MCP, recuperación de datos estructurados, transparencia de datos públicos y evaluación de respuestas fundamentadas»; avance (3/3): «marco teórico pertinente, respaldado por referencias académicas». **Manténganlo**; ajustes: unificar «información inventada», añadir las ecuaciones de 2.8 y un párrafo de recall y precisión (en la clase del 18/11 el profesor dijo a los grupos que «una de las métricas más importantes es el recall»).

**Qué decir en cada subtema (½ página aprox. cada uno; la última oración siempre conecta con ObraClara, porque la rúbrica pide «conectado con la propuesta»):**

- **2.1 Modelos de lenguaje.** Explican que un modelo de lenguaje es ___ (un programa que aprende a predecir y generar texto a partir de enormes cantidades de texto), que los actuales se basan en ___ (la arquitectura Transformer, que usa mecanismos de atención; Vaswani et al., 2017) y que pueden ___ (resolver tareas nuevas solo con instrucciones o pocos ejemplos, sin reentrenarse; Brown et al., 2020). Conexión: en ObraClara el modelo ___ (interpreta la pregunta y redacta, pero no aporta las cifras).
- **2.2 Alucinación.** Explican que una alucinación es ___ (texto fluido y seguro pero falso o sin respaldo; Ji et al., 2023) y por qué ocurre ___ (el modelo responde de memoria y completa lo que no sabe). Conexión: es lo que mide la métrica de ___ (información inventada).
- **2.3 Generación aumentada por recuperación (RAG).** Explican que ___ (combinar el modelo con información recuperada de una fuente externa mejora las respuestas en tareas que exigen conocimiento; Lewis et al., 2020) y que ___ (apoyar la respuesta en fuentes reduce respuestas sin base; Gao et al., 2023). Conexión: ObraClara recupera ___ (filas de la base del MEF mediante herramientas, no documentos de texto).
- **2.4 Uso de herramientas y agentes.** Explican que ___ (los modelos pueden aprender a decidir cuándo y cómo llamar a herramientas externas; Schick et al., 2023), que el ciclo ___ (razonar-actuar, ReAct: el modelo usa una herramienta, lee el resultado y decide si necesita otra; Yao et al., 2023) y que un agente es ___ (un sistema basado en un modelo de lenguaje que planifica y usa herramientas; Wang et al., 2024). Conexión: en ObraClara el modelo puede encadenar hasta ___ (5) pasos.
- **2.5 Model Context Protocol.** Explican que MCP es ___ (un protocolo abierto que define cómo un cliente de IA descubre y llama herramientas de un servidor, con el transporte Streamable HTTP; Model Context Protocol, 2025) y que su ecosistema ___ (crece rápido y tiene riesgos de seguridad que deben considerarse; Hou et al., 2025). Conexión: ObraClara es un servidor MCP público y por seguridad ___ (es solo lectura, valida parámetros y limita a 60 solicitudes por minuto).
- **2.6 Datos estructurados y texto a SQL.** Explican que ___ (convertir preguntas en SQL correcto es difícil, como muestra el banco Spider con bases de muchos dominios; Yu et al., 2018) y que ___ (en BIRD, con bases grandes y reales, el mejor modelo evaluado logró 40,08 % de exactitud de ejecución frente a 92,96 % de personas; Li et al., 2023). Conexión: por eso ObraClara ___ (no deja al modelo escribir SQL: cada herramienta ejecuta una consulta fija).
- **2.7 Datos abiertos y transparencia.** Explican que ___ (publicar datos no basta: hay barreras técnicas, de calidad y de uso, y mitos sobre sus beneficios; Janssen et al., 2012) y que ___ (existe un marco para analizar beneficios y barreras de los datos abiertos de gobierno; Wirtz et al., 2022). Conexión: ObraClara ataca la barrera de ___ (uso: preguntar en castellano en lugar de filtrar 150 641 filas).
- **2.8 Evaluación de respuestas fundamentadas.** Explican que ___ (existen métricas automáticas para evaluar sistemas que responden con ayuda de información recuperada; Es et al., 2024) y presentan las ecuaciones (1) a (6) con una oración cada una. Expliquen recall y precisión con la idea: ___ (recall: de las obras que debía encontrar, qué porcentaje encontró; precisión: de las que nombró, qué porcentaje es correcto).

**Ecuaciones de 2.8** (*N* = 40 preguntas):
- (1) Exactitud = (respuestas exactas / *N*) × 100
- (2) Exactitud estricta = (respuestas exactas sin ninguna cifra relevante sin sustento / *N*) × 100
- (3) Citación = (respuestas que mencionan MEF o el dataset **y** la fecha / *N*) × 100
- (4) Información inventada = (respuestas que cumplen alguna de las 3 condiciones de D / *N*) × 100
- (5) Recall = obras correctas mencionadas / obras esperadas; Precisión = obras correctas mencionadas / obras mencionadas
- (6) F1 = 2 · Precisión · Recall / (Precisión + Recall)

**Figura opcional del Marco teórico (draw.io, 2 columnas):** columna izquierda «Sin herramientas»: caja «Pregunta del usuario» → flecha → caja «Modelo de lenguaje (responde de memoria)» → flecha → caja «Respuesta sin fuente verificable». Columna derecha «Con MCP»: «Pregunta del usuario» → «Modelo de lenguaje» → flecha rotulada «llama a una herramienta» → «Servidor MCP» → flecha «consulta fija» → cilindro «Datos oficiales del MEF» → flecha de regreso «datos + fuente + fecha» → «Modelo de lenguaje» → «Respuesta con cifra oficial, fuente y fecha». Título: *Respuesta de un modelo de lenguaje sin herramientas y con MCP*. Fuente: elaboración propia a partir de Lewis et al. (2020) y Yao et al. (2023).

**Errores a evitar:** definiciones copiadas del sitio; teoría que no se usa después; párrafos sin cita; figuras de artículos sin citar o hechas con IA.

**Verificación:** ☐ 2–3 páginas ☐ 8 subtemas ☐ ecuaciones (1)–(6) numeradas ☐ cada párrafo con cita ☐ cada subtema conecta con ObraClara.

## 6. Diseño y desarrollo de la propuesta (sección 3)

**Extensión:** **tres a cinco páginas, con workflow, con gráficos y al menos 4 subsecciones.** Aquí van 7. **El workflow lo dibuja el grupo** (sin IA). **Peso: 4 de 14 puntos** («Se describe detalladamente el diseño y desarrollo de la propuesta»).

**Qué pidió el profesor (avance, 16/11):** «Incorporar un **diagrama de arquitectura** que muestre la interacción entre el LLM, el servidor MCP, las cuatro herramientas y la base de datos. Explicar el funcionamiento de cada herramienta, el procesamiento de datos y las tecnologías utilizadas» y «**Justificar los criterios** utilizados para generar alertas de sobrecostos y posibles paralizaciones, **diferenciando claramente estas estimaciones de las determinaciones oficiales**». Inscripción: documentar «el formato, el tamaño, la frecuencia de actualización, la licencia, las columnas clave y la llave de cruce» de la fuente.

### 3.1 Metodología CRISP-DM (Adriel, ⅓ de página)

**Qué decir:** en esta subsección explican que el proyecto siguió ___ (CRISP-DM, un método de seis fases para proyectos con datos: comprensión del negocio, comprensión de los datos, preparación, modelado, evaluación y despliegue), que la Tabla 1 resume qué se hizo en cada fase y que hubo una vuelta atrás: ___ (tras la revisión externa del 18/11 se volvió de la fase de evaluación a la de modelado de métricas para añadir la exactitud estricta y las cifras no sustentadas).

**Tabla 1. *Fases de CRISP-DM aplicadas a ObraClara Perú*** (2 columnas: Fase · Qué se hizo; redacten las celdas con sus palabras usando estos datos):

| Fase | Datos para la celda |
|---|---|
| 1. Comprensión del negocio | Problema de las obras paralizadas (684 inversiones, MEF 2026a); usuarios: ciudadanos, periodistas, regidores; ODS 16 |
| 2. Comprensión de los datos | Archivo del MEF de 150 641 filas, 68 columnas y 247 MB; licencia ODC-BY; 67 códigos repetidos; columnas con vacíos |
| 3. Preparación | ETL en Python: limpieza, 23 columnas conservadas, indicadores y alertas, carga en SQLite (y D1 de respaldo) |
| 4. Modelado | Diseño de las 4 herramientas MCP y del formato de respuesta (datos, fuente, URL, fecha) |
| 5. Evaluación | 40 preguntas sin y con MCP; 3 modelos; métricas del sistema |
| 6. Despliegue | Cloudflare Workers, pruebas automáticas, GitHub Actions, sitio público y documentación |

Fuente: elaboración propia. **Figura 1 (opcional, draw.io):** seis cajas en círculo con los nombres de las fases unidas por flechas en sentido horario (1→2→3→4→5→6→1) y una flecha punteada de 5 a 3 rotulada «ajustes». Título: *Ciclo CRISP-DM seguido en el proyecto*.

### 3.2 Datos y procesamiento (ETL) (Sebastián, 1 página)

**Qué decir:**
1. En este párrafo explican que la única fuente es ___ (el archivo `DETALLE_INVERSIONES.csv` del conjunto «Información de inversiones públicas 2001–2026» del MEF, en la Plataforma Nacional de Datos Abiertos; MEF, 2026b), que se descargó el ___ (10/11/2026; el archivo había sido modificado el 08/11/2026), que su formato es ___ (CSV en UTF-8), que tiene ___ (150 641 filas, 68 columnas, 247 MB), licencia ___ (ODC-BY, que permite reutilizar citando la fuente) y que la llave de cada inversión es ___ (el código único, un número de 7 dígitos).
2. Explican que la limpieza se hizo con un programa ETL (extraer, transformar y cargar) en ___ (Python, archivo `etl/inversiones.py`) con estos pasos en orden: ___ (quitar espacios; descartar los códigos únicos repetidos conservando la primera fila: 67; convertir montos y avances a número, y lo vacío o no numérico a nulo; recortar fechas a AAAA-MM-DD; habitantes a entero), y que resultó en ___ (150 574 inversiones).
3. Explican que se conservaron ___ (23 de las 68 columnas) en cuatro grupos (Tabla 2) y que se calcularon ___ (cuatro columnas derivadas: porcentaje de sobrecosto, meses sin devengado y las dos alertas) con código determinista: el modelo de lenguaje no calcula nada.
4. Explican que la calidad se midió contando vacíos por columna (Tabla 3) y que lo más importante es que ___ (el avance físico falta en 86 301 inversiones, el 57,3 %, y el último mes con gasto devengado en 54 898, el 36,5 %), lo que significa que ___ (la alerta de posible paralización solo puede evaluarse donde hay avance físico). Pueden añadir que hay fechas planificadas ___ (hasta 2070).
5. Explican que el resultado se cargó en ___ (una base SQLite local de unos 141 MB, con copia de respaldo en Cloudflare D1) y que la distribución por nivel es ___ (locales 124 181, 82,5 %; regionales 13 674, 9,1 %; nacional 12 719, 8,4 %).

**Figura 2. *Flujo de procesamiento de los datos del MEF*** (draw.io, horizontal de izquierda a derecha):
- Caja «Document»: «DETALLE_INVERSIONES.csv (MEF) · 150 641 filas · 68 columnas · 247 MB».
- Flecha rotulada «lectura UTF-8» → caja de proceso «ETL en Python (etl/inversiones.py)», con tres líneas dentro: «quita 67 códigos repetidos», «conserva 23 columnas», «calcula sobrecosto, meses sin devengado y alertas».
- Flecha rotulada «archivos SQL» → caja «150 574 inversiones».
- Flecha → cilindro «SQLite local (≈141 MB)».
- Flecha punteada rotulada «respaldo, carga manual» → cilindro «Cloudflare D1».
- Nota: «El modelo de lenguaje no interviene en este proceso.» Fuente: elaboración propia con datos de MEF (2026b).

**Tabla 2. *Columnas del archivo del MEF conservadas por el ETL*** (columnas: Grupo · Cantidad · Columnas):

| Grupo | Cantidad | Columnas |
|---|---|---|
| Identificación | 2 | CODIGO_UNICO, NOMBRE_INVERSION |
| Responsable y ubicación | 9 | ENTIDAD, NIVEL, SECTOR, FUNCION, DEPARTAMENTO, PROVINCIA, DISTRITO, UBIGEO, NUM_HABITANTES_BENEF |
| Montos | 6 | MONTO_VIABLE, COSTO_ACTUALIZADO, PIM_ANIO_ACTUAL, DEV_ANIO_ACTUAL, SALDO_EJECUTAR, MONTO_LAUDO |
| Estado | 6 | AVANCE_FISICO, AVANCE_EJECUCION, ULTIMO_DEVENGADO, FEC_INI_EJECUCION, FEC_FIN_EJECUCION, SITUACION |

Fuente: elaboración propia con datos de MEF (2026b).

**Tabla 3. *Valores vacíos en las columnas clave*** (columnas: Columna · Vacíos · % del total; total 150 574):

| Columna | Vacíos | % |
|---|---|---|
| Avance físico | 86 301 | 57,3 % |
| Último mes con devengado | 54 898 | 36,5 % |
| Habitantes beneficiados | 46 278 | 30,7 % |
| Avance de ejecución | 37 699 | 25,0 % |
| Fecha de inicio de ejecución | 11 606 | 7,7 % |
| Monto viable | 243 | 0,2 % |
| Código de ubicación (ubigeo) | 166 | 0,1 % |
| Departamento | 13 | 0,0 % |
| Costo actualizado | 0 | 0,0 % |

Nota: «Calculado sobre la base ya limpia.» Fuente: elaboración propia con datos de MEF (2026b) (`metricas/resultados/calidad_nulos.csv`).

### 3.3 Arquitectura y workflow (Adriel, 1 página; diagrama obligatorio)

**Qué decir:**
1. En este párrafo explican que la Figura 3 muestra la arquitectura y que tiene ___ (seis partes: usuario, sitio web, modelo de lenguaje, servidor MCP en Cloudflare, cuatro herramientas y base de datos), y qué hace cada una en una frase.
2. Explican que el modelo **nunca** accede a la base: ___ (pide una herramienta por MCP, el servidor valida los parámetros y ejecuta una consulta SQL fija y parametrizada) y que por eso ___ (las cifras salen de la fuente; el riesgo de que el modelo escriba SQL lo muestra Li et al., 2023).
3. Explican las siete etapas de una consulta (Figura 4) y que la etapa 6 puede repetirse, como en el ciclo ___ (ReAct; Yao et al., 2023).
4. Explican que el sitio web ___ (es una ventanilla: muestra el chat, añade el servidor MCP de ObraClara y reenvía la pregunta a la API de IA del grupo), que si esa API falla ___ (pasa a un modo de emergencia con modelos de respaldo, Workers AI y luego Groq) y que el mismo servidor ___ (puede usarlo cualquier cliente MCP, por ejemplo MCP Inspector).

**Figura 3. *Arquitectura de ObraClara Perú*** (draw.io, obligatoria). Cajas y flechas, cada una con su texto:
- «Actor» **Usuario** → flecha «pregunta en castellano» → caja **Sitio web (/asistente)**.
- **Sitio web** → flecha «reenvía la pregunta» → caja **Modelo de lenguaje (LLM)**.
- **Modelo de lenguaje** → flecha «llamada a herramienta (MCP, Streamable HTTP)» → caja grande **Servidor MCP de ObraClara (Cloudflare Worker, /mcp)**; flecha de regreso «datos + fuente + URL + fecha».
- Dentro de la caja del servidor, cuatro cajas pequeñas: `buscar_inversiones`, `detalle_inversion`, `alertas_inversion`, `resumen_inversiones`.
- **Servidor** → flecha «consulta SQL fija y parametrizada» → cilindro **Base de datos (SQLite local; respaldo Cloudflare D1)**.
- Abajo, separado con línea punteada y título «Preparación de datos (una vez)»: «Document» **CSV del MEF** → flecha «ETL Python» → cilindro de la base de datos.
- A un lado (opcional): caja **Otros clientes MCP (MCP Inspector)** → flecha «MCP» → servidor.
- Modelo de lenguaje → flecha «respuesta con cifra, fuente y fecha» → Sitio web → Usuario.
Nota: «Las flechas indican el sentido de las solicitudes.» Fuente: elaboración propia. Pueden mirar `/proyecto` § Arquitectura para entender las partes, pero el dibujo es de ustedes desde cero.

**Figura 4. *Etapas de una consulta en ObraClara*** (draw.io, vertical, 7 círculos numerados, cada uno con su texto):
1 «El usuario pregunta» → 2 «El modelo identifica entidad, región, sector y tipo de consulta» → 3 «El modelo elige la herramienta y sus parámetros» → 4 «El servidor MCP valida y ejecuta una consulta fija» → 5 «El servidor devuelve datos con fuente, enlace y fecha» → 6 «El modelo decide si necesita otra consulta» (flecha punteada de 6 a 3 rotulada «sí, hasta 5 pasos») → 7 «El modelo redacta la respuesta con la cifra, las alertas y la fuente». Si falta espacio, pongan los números 1–7 sobre las flechas de la Figura 3 y omitan la Figura 4.

### 3.4 Las cuatro herramientas MCP (Adriel, ½ página)

**Qué decir:** en esta subsección explican que el servidor ofrece ___ (4) herramientas (Tabla 4); que todas aceptan los filtros opcionales ___ (entidad, departamento, función y nivel: local, regional o nacional) y un límite de ___ (1 a 20 resultados); que toda respuesta incluye ___ (los datos, la fuente, la URL del dataset, la fecha de descarga y, en alertas, detalle y resumen, un aviso de que las alertas son indicios) y que, si una herramienta no encuentra nada, ___ (lo dice en vez de inventar). Den un ejemplo explicado: ___ (al preguntar por proyectos de transporte del Gobierno Regional en Cusco, el modelo llama a `buscar_inversiones` con función Transporte, departamento Cusco y nivel regional, y la herramienta devuelve un total de 74).

**Tabla 4. *Herramientas del servidor MCP de ObraClara*** (columnas: Herramienta · Para qué sirve · Parámetros · Devuelve · Ejemplo real al 10/11/2026):

| Herramienta | Para qué sirve | Parámetros | Devuelve | Ejemplo real |
|---|---|---|---|---|
| `buscar_inversiones` | Encontrar inversiones por palabras y filtros | texto (opcional), filtros, límite | total, mostrados y lista ordenada por costo actualizado | Transporte, Cusco, nivel regional: 74 |
| `detalle_inversion` | Ver la ficha completa de una inversión | código único (obligatorio) | 27 campos (montos, avance, fechas, situación, ubicación) o aviso de que no existe | 2507146: Hospital de Alta Complejidad (Piura), costo S/ 955 063 507,44 |
| `alertas_inversion` | Listar inversiones con alerta | tipo (sobrecosto o paralizacion, obligatorio), filtros, límite | total, mostrados y lista ordenada por sobrecosto o por meses sin gasto | Posible paralización en Ayacucho: 815 |
| `resumen_inversiones` | Totales de un grupo | filtros | cantidad, costo actualizado total, devengado del año, saldo por ejecutar, alertas de cada tipo | Moquegua: 1 767 inversiones, S/ 20 049 064 306,37 |

Fuente: elaboración propia (Anexo 01, `README.md` § Herramientas MCP). Los textos de instrucciones y descripciones de las herramientas (prompts) van en el Anexo 01.

### 3.5 Criterios de alerta y diferencia con lo oficial (Sebastián, 1 página)

**Qué decir:**
1. **Definición y fórmula.** En este párrafo explican que la alerta de sobrecosto es ___ (una señal de que la obra hoy cuesta la mitad o más de lo aprobado) y se calcula con la ecuación (7); y que la alerta de posible paralización es ___ (una señal de que una obra avanzada lleva medio año sin gasto) con la condición (8):
   - (7) Sobrecosto (%) = (costo actualizado − monto viable) / monto viable × 100; alerta si ≥ 50 % y monto viable > 0.
   - (8) Posible paralización: 40 % ≤ avance físico < 100 % **y** meses desde el último devengado ≥ 6.
2. **Base legal.** Explican que se tomó de la Ley N.° 31589, que considera paralizada una obra por contrata con ___ (avance físico de 40 % o más y seis meses o más sin ejecución física, o con contrato resuelto o declarado nulo), y que en administración directa el mínimo es ___ (50 %) (Congreso de la República, 2022).
3. **Por qué es una aproximación.** Explican que el archivo del MEF ___ (no trae ejecución física mensual: solo el último mes con gasto devengado, que es financiero), ___ (no distingue contrata de administración directa), ___ (no informa contratos resueltos ni declaraciones de paralización) e ___ (incluye todas las inversiones activas, no solo obras).
4. **Por qué 50 % de sobrecosto.** Explican que el umbral es ___ (una regla del equipo, no un umbral oficial) y lo justifican con la Figura 5: ___ (el 46,5 % de las inversiones tiene entre 0 % y 10 % de sobrecosto y el 17,5 % cuesta menos de lo aprobado; desde 50 % queda el 17,5 %, 26 387 inversiones, un grupo acotado para priorizar).
5. **Cifras y comparación con lo oficial** (Tabla 5). Explican que al 10/11/2026 ___ (26 387 inversiones, 17,5 %, tienen alerta de sobrecosto; 16 502, 11,0 %, de posible paralización; 4 205, 2,8 %, tienen ambas; 111 890, 74,3 %, ninguna), frente a ___ (684 del inventario oficial; MEF, 2026a), unas ___ (24) veces más, y que la diferencia se debe a ___ (universo, indicador, modalidad, fecha y meses sin gasto por motivos administrativos).
6. **Cierre obligatorio.** Explican que por eso las alertas son ___ (indicios para decidir qué revisar primero) y no ___ (la determinación oficial ni prueba de irregularidades ni de corrupción). Opcional: por nivel, ___ (los gobiernos regionales, 22,4 %, y el nacional, 21,4 %, tienen proporcionalmente más sobrecosto; los locales, 11,7 %, más posible paralización).

**Figura 5. *Distribución de las inversiones según su sobrecosto*** (Excel, columnas agrupadas, una sola serie, `metricas/resultados/alertas_hist_sobrecosto.csv`):
- Eje X (8 categorías, en este orden): «< 0 %», «0–10 %», «10–25 %», «25–50 %», «50–100 %», «100–200 %», «≥ 200 %», «Sin dato».
- Eje Y: «Porcentaje de inversiones (%)», de 0 a 50.
- Valores (porcentaje y cantidad): 17,5 % (26 363); 46,5 % (69 919); 8,9 % (13 413); 9,5 % (14 247); 8,6 % (12 965); 5,5 % (8 327); 3,4 % (5 095); 0,2 % (245).
- Las tres barras de 50 % o más en color de alerta (naranja); las demás en gris (clic en la barra, otro clic para seleccionar solo esa → Relleno).
- Nota: «Las barras naranjas superan el umbral de 50 % definido por el equipo (26 387 inversiones en total).» Fuente: elaboración propia con datos de MEF (2026b).

**Tabla 5. *Alertas de ObraClara frente al inventario oficial de obras paralizadas*** (columnas: Aspecto · ObraClara · Inventario oficial del MEF):

| Aspecto | ObraClara (posible paralización) | Inventario oficial |
|---|---|---|
| Universo | Todas las inversiones activas del archivo (150 574) | Obras paralizadas reportadas |
| Indicador | Avance físico 40 %–99 % y 6 meses o más sin gasto devengado | Ejecución física detenida, contrato resuelto o nulo (Ley 31589) |
| Modalidad | No distingue contrata de administración directa | Distingue (40 % y 50 %) |
| Fecha de los datos | 10/11/2026 | Marzo de 2026 |
| Cantidad | 16 502 (11,0 %) | 684 |
| Qué significa | Indicio para priorizar revisiones | Determinación oficial |

Fuente: elaboración propia con datos de MEF (2026a, 2026b) y Congreso de la República (2022).

**Opcional (Excel, barras agrupadas)**: *Porcentaje de inversiones con alerta por nivel de gobierno*: X = Gobiernos locales, Gobiernos regionales, Gobierno nacional; series «Sobrecosto» (16,6 %; 22,4 %; 21,4 %) y «Posible paralización» (11,7 %; 7,3 %; 7,9 %); `metricas/resultados/alertas_por_nivel.csv`.

### 3.6 Tecnologías, seguridad y verificación del sistema (Adriel, ½ página)

**Qué decir:**
1. En este párrafo explican las tecnologías con la Tabla 6: para qué se usó cada una.
2. Explican la seguridad: ___ (el servidor es solo lectura; cada herramienta ejecuta consultas parametrizadas, nunca SQL escrito por el modelo; límite de 60 solicitudes por minuto por cliente; máximo 20 resultados por consulta; claves fuera del código; los datos del MEF no contienen datos personales). Pueden conectar con los riesgos de MCP que describen Hou et al. (2025).
3. Explican cómo se verificó que el sistema no altera las cifras (Tabla 7): ___ (se compararon 30 fichas elegidas al azar campo por campo con la base: 810 de 810 campos iguales; 10 resúmenes: 60 de 60 cifras iguales; 14 consultas de alertas con el mismo total) y que ___ (149 pruebas automáticas pasan y cada cambio se despliega solo con GitHub Actions).

**Tabla 6. *Tecnologías utilizadas*** (columnas: Tecnología · Para qué se usó):

| Tecnología | Para qué |
|---|---|
| TypeScript y Zod | Código del servidor y validación de los parámetros de las herramientas |
| Cloudflare Workers (plan gratuito) | Publicar el servidor MCP y el sitio en internet |
| SDK de MCP y Agents SDK (Streamable HTTP) | Implementar el protocolo MCP |
| Cloudflare D1 y Durable Objects | Base de respaldo y estado de las conversaciones |
| Python 3.12 | ETL (limpieza y cálculo de alertas) |
| SQLite | Base de datos principal (≈141 MB) |
| Vitest | Pruebas automáticas |
| GitHub y GitHub Actions | Código público y despliegue automático en cada cambio |
| Modelos de lenguaje | IA del servidor del grupo como principal; respaldo automático Workers AI y Groq |

**Tabla 7. *Verificación del sistema*** (columnas: Prueba · Resultado):

| Prueba | Resultado |
|---|---|
| Pruebas automáticas | 149 de 149 pasan, en 15 archivos (20/11/2026) |
| Cobertura de código | 84,0 % de las líneas (81,4 % en la lógica sin páginas) |
| `detalle_inversion` frente a la base | 30 de 30 fichas idénticas; 810 de 810 campos |
| `resumen_inversiones` frente a la base | 10 de 10 filtros; 60 de 60 cifras |
| `alertas_inversion` frente a la base | 14 de 14 totales iguales |
| Rendimiento (20 llamadas por herramienta desde Lima) | 100 % de éxito; mediana 2,1 s (`buscar_inversiones`), 1,4 s (`detalle_inversion`), 2,0 s (`alertas_inversion`), 1,4 s (`resumen_inversiones`); máximo 3,1 s |

Fuente: elaboración propia (Anexo 01, carpeta `metricas/resultados/`). Ojo: `pruebas.csv` aún dice 115 pruebas (medición anterior, que es la de la cobertura); el 20/11/2026 `cd worker && npx vitest run` da 149. Si antes de entregar se ejecuta `python metricas/pruebas.py`, usen las cifras nuevas de ambos archivos.

### 3.7 Diseño de la evaluación (Piero, ½ a 1 página)

**Qué decir:**
1. En este párrafo explican que se elaboraron ___ (40 preguntas: 10 de búsqueda, 10 de detalle, 10 de alertas y 10 de resumen) y que la respuesta de referencia de cada una se verificó en ___ (el archivo del MEF al 10/11/2026) **antes** de ejecutar. Ejemplo: ___ (B01 «¿Cuántos proyectos de transporte tiene el Gobierno Regional en Cusco?», referencia 74). Mencionen que hay 3 preguntas sin datos (B10, D10, A10) para ver si el modelo inventa.
2. Explican que cada pregunta se hizo ___ (al mismo modelo, con el mismo mensaje base) en dos condiciones: sin MCP ___ (solo la pregunta, con la instrucción de citar la fuente) y con MCP ___ (con las 4 herramientas y hasta 5 pasos).
3. Explican que el modelo principal fue ___ (la IA del servidor del grupo: un servicio gratuito con límite de uso cuya versión exacta no se controla; sin MCP podía buscar en la web) y que se ejecutó el ___ (10/11/2026; R02, R03 y R07–R10 el 18/11/2026), en una sola corrida.
4. Explican la puntuación automática con las métricas de la Tabla 8 y las ecuaciones de 2.8.
5. Explican que se añadió la exactitud estricta porque ___ (una revisión externa del 18/11 mostró que la regla original deja pasar una respuesta con una cifra correcta y otra errónea: caso D04).
6. Explican que, para ver si la mejora depende del modelo, se repitió con ___ (gpt-oss-120b en Groq y Gemini 3.5 Flash-Lite de Google, fijos, el 19/11/2026).
7. Explican que recall y precisión se calcularon en ___ (13 preguntas de búsqueda y alertas que piden contar o listar obras), comparando los códigos únicos que nombra la respuesta con los que devuelve la herramienta correcta (máximo 20).

**Tabla 8. *Métricas de la evaluación*** (columnas: Métrica · Qué mide · Regla):

| Métrica | Qué mide | Regla |
|---|---|---|
| Exactitud | Si acertó | Una cifra a ±1 % del valor oficial; o la entidad esperada; o «no hay resultados» si no hay datos |
| Exactitud estricta | Si acertó sin errores adicionales | Exacta y ninguna cifra relevante sin sustento |
| Citación correcta | Si dijo de dónde salió el dato | Menciona MEF o el dataset **y** la fecha de corte o descarga |
| Información inventada | Si dio datos falsos | Las 3 condiciones de la definición única |
| Cifras no sustentadas | Si alguna cifra no tiene respaldo | Al menos una cifra relevante que no está en la fuente ni sale de un cálculo simple con ella |
| Recall | Cuántas de las obras esperadas encontró | Obras correctas mencionadas / esperadas (13 preguntas) |
| Precisión | Cuántas de las obras nombradas son correctas | Obras correctas / mencionadas |
| Tiempo de respuesta | Cuánto tarda | Mediana y percentil 90, en segundos |

Fuente: elaboración propia (Anexo 01, `eval/resultados/resumen.md`).

**Errores a evitar en toda la sección 3:** diagramas hechos con IA o capturas del diagrama del sitio; nombres inventados de herramientas; presentar las alertas como obras paralizadas; decir que el modelo calcula las alertas; olvidar que el 50 % es una regla del equipo.

**Verificación de la sección 3:** ☐ 3–5 páginas ☐ ≥ 4 subsecciones ☐ Figura 3 dibujada por el grupo con LLM, servidor MCP, 4 herramientas y base ☐ cada herramienta con ejemplo ☐ ETL con cifras ☐ fórmulas + Ley 31589 + comparación con las 684 ☐ tecnologías ☐ métricas definidas.

## 7. Resultados e interpretación de resultados (sección 4)

**Extensión:** **una a dos páginas, con gráficos y/o tablas.** Prioridad: Tabla 9, Figura 6, Figura 7 y Tabla 10. Si no cabe, las Tablas 11 y 12 pasan al Anexo 01. **Peso:** con Conclusiones, 4 de 14 puntos («Se analiza e interpreta correctamente los resultados. Se presentan conclusiones derivadas del análisis»).

**Qué pidió el profesor (avance, 16/11):** «Presentar los resultados de las **40 preguntas** propuestas, comparando el asistente **con y sin MCP**. Incluir **tablas, gráficos y ejemplos de respuestas** para analizar la **exactitud, citación de fuentes y generación de información incorrecta**.» En la clase del 18/11, a todos los grupos: no basta mostrar números; hay que **interpretarlos**.

### 4.1 Resultados globales (Camila)

**Qué decir:** en este párrafo explican que la Tabla 9 y la Figura 6 comparan las dos condiciones en las 40 preguntas; que sin MCP el modelo acertó ___ (3 de 40, 8 %) y con MCP ___ (40 de 40, 100 %); que con la regla estricta fue ___ (2 de 40, 5 %, frente a 39 de 40, 98 %); que citó la fuente y la fecha en ___ (4, 10 %) frente a ___ (40, 100 %); que la información inventada bajó de ___ (21, 53 %) a ___ (0) y las cifras no sustentadas de ___ (22, 55 %) a ___ (1, 3 %). Interpretan: ___ (con MCP la cifra sale de la herramienta y no de la memoria del modelo); con MCP el modelo usó la herramienta esperada en ___ (37 de 40) preguntas.

**Tabla 9. *Resultados de las 40 preguntas sin MCP y con MCP*** (columnas: Métrica · Sin MCP · Con MCP; valores «cantidad de 40 (porcentaje)»):

| Métrica | Sin MCP | Con MCP |
|---|---|---|
| Exactitud | 3 (8 %) | 40 (100 %) |
| Exactitud estricta | 2 (5 %) | 39 (98 %) |
| Citación correcta | 4 (10 %) | 40 (100 %) |
| Información inventada | 21 (53 %) | 0 (0 %) |
| Cifras no sustentadas | 22 (55 %) | 1 (3 %) |
| Casos dudosos («revisar») | 20 | 0 |

Nota: «Porcentajes sobre 40 preguntas; una corrida; datos al 10/11/2026.» Fuente: elaboración propia a partir de la evaluación del grupo (Anexo 01, `eval/resultados/graficos_global.csv`).

**Figura 6. *Comparación de métricas sin MCP y con MCP*** (Excel, columnas agrupadas):
- Eje X, 5 categorías en este orden: «Exactitud», «Exactitud estricta», «Citación», «Información inventada», «Cifras no sustentadas».
- 2 barras por categoría: «Sin MCP» (gris) y «Con MCP» (azul).
- Valores Sin MCP / Con MCP: Exactitud 8 / 100; Exactitud estricta 5 / 98; Citación 10 / 100; Información inventada 53 / 0; Cifras no sustentadas 55 / 3.
- Eje Y: «Porcentaje de las 40 preguntas (%)», de 0 a 100; etiquetas de datos encima.
- Cómo: en `graficos_global.csv` copien las columnas `exactitud_pct`, `exacta_estricta_pct`, `citacion_pct`, `inventada_pct`, `no_sustentadas_pct` de las dos filas y péguenlas con Pegado especial → Transponer (métricas en filas, condiciones en columnas).
- Nota: «En información inventada y cifras no sustentadas, un valor menor es mejor.» Fuente: igual que la Tabla 9.

### 4.2 Resultados por tipo de pregunta (Camila)

**Qué decir:** explican con la Figura 7 que con MCP los cuatro tipos llegaron a ___ (100 % de exactitud), que sin MCP el peor tipo fue ___ (búsqueda: 0 % de exactitud y 80 % de información inventada, porque contar obras exige el archivo completo, que el modelo no tiene), seguido de ___ (alertas: 0 % y 70 %), y que el único tipo con algunos aciertos sin MCP fue ___ (detalle: 20 %, con 30 % de citación). La exactitud estricta con MCP solo bajó en ___ (detalle: 9 de 10, por D04).

**Figura 7. *Exactitud e información inventada por tipo de pregunta*** (Excel, columnas agrupadas, `eval/resultados/graficos_por_tipo.csv`):
- Eje X, 4 categorías: «Búsqueda», «Detalle», «Alertas», «Resumen».
- 4 series: «Exactitud sin MCP» (gris), «Exactitud con MCP» (azul), «Inventada sin MCP» (gris claro rayado), «Inventada con MCP» (azul claro).
- Valores: Búsqueda 0 / 100 / 80 / 0; Detalle 20 / 100 / 20 / 0; Alertas 0 / 100 / 70 / 0; Resumen 10 / 100 / 40 / 0.
- Eje Y de 0 a 100 %. Si queda cargado, hagan dos gráficos (a) exactitud y (b) información inventada, uno al lado del otro.
- Nota: «10 preguntas por tipo.» Datos de apoyo por tipo (citación sin/con): búsqueda 0/100, detalle 30/100, alertas 0/100, resumen 10/100; estricta sin/con: 0/100, 20/90, 0/100, 0/100.

### 4.3 Ejemplos de respuestas (Camila)

**Qué decir:** explican que la Tabla 10 muestra ___ (4) preguntas respondidas en las dos condiciones y comentan cada una en 1–2 oraciones: qué cifra dio sin MCP, de dónde parece venir y qué cambió con MCP. Pueden añadir como figura **una captura propia** (Win + Mayús + S) de la tabla de https://obraclara.adrielorihuela.net/evaluacion con «Ver respuesta» abierto, citada como «captura del sitio del proyecto».

**Tabla 10. *Ejemplos de respuestas sin MCP y con MCP*** (columnas: Pregunta y referencia · Sin MCP · Con MCP):

| Pregunta (referencia oficial) | Sin MCP | Con MCP |
|---|---|---|
| B01 ¿Cuántos proyectos de transporte tiene el Gobierno Regional en Cusco? (74) | «…cuenta con una cartera de 56 inversiones e intervenciones en transporte…» → no exacta, inventada | «…tiene 74 proyectos de inversión pública en la función Transporte registrados en el MEF…» → exacta, cita |
| A01 ¿Cuántas obras de Ayacucho podrían estar paralizadas? (815) | «Según la Contraloría…, en Ayacucho se registraban 150 obras públicas paralizadas al 30 de junio de 2026.» → otra fuente y fecha; cuenta como inventada | «…se identifican 815 inversiones públicas con posibles indicios de paralización…» → exacta, cita |
| R01 ¿Cuánto suman las inversiones registradas en Moquegua? (S/ 20 049 064 306,37) | Reparte por nivel de gobierno con otras cifras → inventada | «…suman un costo actualizado total de S/ 20,049,064,306.37… 1,767 inversiones…» → exacta, cita |
| D04 ¿Cuánto ha subido el costo de la obra 2226075 respecto a lo aprobado? (578,39 %: de S/ 7 033 676,00 a S/ 47 715 860,89) | No exacta | Da 578,39 % (correcto) pero escribe un incremento de S/ 40 279 184,89 en vez de S/ 40 682 184,89 → exacta, **no estricta** |

Nota: «Respuestas recortadas; texto completo en el Anexo 01 (`eval/resultados/raw_sin_mcp.jsonl` y `raw_con_mcp.jsonl`) y en el sitio, página /evaluacion.» Fuente: elaboración propia.

### 4.4 Interpretación (Camila)

**Qué decir (una oración o dos por idea):**
- La citación con MCP es casi automática porque ___ (cada herramienta devuelve la fuente y la fecha); el mérito es que el modelo la incluya en la respuesta.
- El caso D04 muestra que ___ (con los datos correctos el modelo puede equivocarse en una resta: 47 715 860,89 − 7 033 676,00 = 40 682 184,89, pero escribió 40 279 184,89); por eso ___ (se añadió la exactitud estricta; la exactitud original sobrestima porque basta que una cifra coincida).
- La información inventada sin MCP es ___ (una cota superior: incluye cifras reales de otras fuentes, como la Contraloría, o de otras fechas, que no coinciden con el MEF al 10/11/2026).
- Revisión manual (si la hicieron, apartado 4.7): dos integrantes revisaron por separado ___ (los 20 casos «revisar» sin MCP) y coincidieron en ___ de 20.

### 4.5 Comparación entre modelos, recall y precisión (Piero)

**Qué decir:**
1. Explican con la Tabla 11 (o Figura 8) que con otros dos modelos la exactitud también subió: Gemini 3.5 Flash-Lite de ___ (0 %) a ___ (95 %) y gpt-oss-120b de ___ (3 %) a ___ (25 %); y que la mejora depende de ___ (que el modelo use la herramienta: gpt-oss-120b no la llamó en 33 de 40 respuestas e inventó el resultado, y 4 respuestas no llegaron por el límite de uso: respondió 36 de 40).
2. Explican que en las 13 preguntas de conteo o lista la precisión con MCP fue ___ (100 %: todas las obras que nombró eran correctas, frente a 17 % sin MCP), pero el recall fue ___ (10 %, frente a 1 %) porque ___ (la herramienta devuelve hasta 20 obras y el modelo suele dar solo el total o unas pocas); el F1 fue ___ (12 % frente a 2 %). Es una mejora pendiente.

**Tabla 11. *Resultados con tres modelos de lenguaje*** (columnas: Modelo · Exactitud sin → con · Estricta sin → con · Inventada sin → con · Respondidas con MCP):

| Modelo | Exactitud | Exactitud estricta | Información inventada | Respondidas con MCP |
|---|---|---|---|---|
| IA del servidor (principal) | 8 % → 100 % | 5 % → 98 % | 53 % → 0 % | 40/40 |
| Gemini 3.5 Flash-Lite (Google) | 0 % → 95 % | 0 % → 93 % | 45 % → 3 % | 40/40 |
| gpt-oss-120b (Groq) | 3 % → 25 % | 3 % → 25 % | 93 % → 55 % | 36/40 |

Nota: «Una corrida por modelo; los dos últimos se ejecutaron fijos el 19/11/2026. Citación sin → con: 10 % → 100 %; 0 % → 100 %; 0 % → 25 %.» Fuente: elaboración propia (Anexo 01, `eval/resultados/modelos/`).

**Figura 8 (opcional). *Exactitud sin MCP y con MCP en tres modelos*** (Excel, columnas agrupadas): X = «IA del servidor», «Gemini 3.5 Flash-Lite», «gpt-oss-120b»; series «Sin MCP» (8; 0; 3) y «Con MCP» (100; 95; 25); eje Y 0–100 %.

### 4.6 Tiempo de respuesta (Piero)

**Qué decir:** explican que con MCP la respuesta tarda más porque ___ (primero consulta los datos): mediana ___ (21,0 s) frente a ___ (12,9 s); que los ___ (3) casos de más de 300 s (máximo 401,3 s) se deben a ___ (reintentos: el proveedor a veces tardó minutos y el programa repitió la consulta una vez, sumando ambos intentos), por eso ___ (se informa la mediana y el percentil 90, no solo la media, que con reintentos fue 99,9 s y engaña); y que sin contar reintentos la mediana fue ___ (14,8 s frente a 11,0 s).

**Tabla 12. *Tiempo de respuesta por condición (segundos)*** (columnas: Medida · Sin MCP · Con MCP):

| Medida | Sin MCP | Con MCP |
|---|---|---|
| Mediana | 12,9 | 21,0 |
| Percentil 90 | 17,9 | 214,2 |
| Máximo | 199,8 | 401,3 |
| Respuestas de más de 300 s | 0 | 3 |
| Mediana sin reintentos | 11,0 | 14,8 |
| Percentil 90 sin reintentos | 13,9 | 20,0 |
| Media (con reintentos) | 22,1 | 99,9 |

Nota: «"Sin reintentos" se midió desde la pregunta B08.» Fuente: elaboración propia (Anexo 01, `eval/resultados/graficos_latencia.csv`).

### 4.7 Revisión manual de los casos «revisar» (recomendada; Camila y Piero, miércoles 25/11)

1. Abrir `eval/resultados/resultados.csv` en Excel → filtrar `condicion = sin_mcp` y la columna `revisar` no vacía → 20 filas.
2. Cada uno, **por separado**, lee la respuesta en `/evaluacion` («Ver respuesta») y anota: ¿exacta? ¿información inventada según la definición única? (sí/no).
3. Contar en cuántas de las 20 coinciden los dos y en cuántas cambia el veredicto automático. Eso va en 4.4.

**Errores a evitar:** dar solo la media de tiempo; «100 % de precisión» sin decir que es sobre las obras nombradas; presentar los otros modelos como la corrida principal; omitir que es una sola corrida; cifras distintas entre tabla, figura y texto.

**Verificación:** ☐ 1–2 páginas ☐ 40 preguntas, sin y con MCP ☐ ≥ 1 tabla y 2 figuras hechas por el grupo ☐ 4 ejemplos ☐ exactitud, citación e información inventada interpretadas ☐ D04 explicado ☐ modelos ☐ mediana y p90.

## 8. Conclusiones (sección 5)

**Extensión:** **dos párrafos. El segundo, sobre limitaciones y trabajos futuros. Sin citas, sin gráficos ni tablas.**

**Qué pidió el profesor (avance, 16/11):** «Las conclusiones finales deberán **derivarse de los resultados obtenidos** y explicar **las limitaciones del sistema**.»

**Párrafo 1 (logros, 5–7 oraciones):**
- Explican que se cumplió el objetivo de ___ (construir un servidor MCP público con 4 herramientas sobre los datos oficiales del MEF).
- Explican que los resultados muestran que ___ (con MCP la exactitud pasó de 8 % a 100 %, la estricta de 5 % a 98 % y la información inventada de 53 % a 0 %, en las mismas 40 preguntas).
- Explican que esto confirma que ___ (anclar el modelo a la fuente oficial reduce la información inventada) y que la mejora ___ (se repitió en otros dos modelos, de 0 % a 95 % y de 3 % a 25 %, y depende de que el modelo use la herramienta).
- Explican que el sistema ___ (entrega exactamente lo que está en la base: 30 de 30 fichas, 10 de 10 resúmenes y 14 de 14 totales de alertas).
- Cierran con el ODS 16: ___ (acceso más fácil a información pública verificable).

**Párrafo 2 (limitaciones y trabajo futuro, 5–7 oraciones):**
- Limitaciones (elijan 4–5): ___ (una sola corrida por condición; puntuación automática con reglas simples, incluida la estricta; modelo principal gratuito cuya versión no se controla; alertas aproximadas, sin ejecución física mensual ni modalidad y con avance físico vacío en el 57,3 %; recall de 10 % porque el modelo nombra pocas obras; mayor tiempo con MCP, mediana 21,0 s frente a 12,9 s; datos al 10/11/2026).
- Trabajo futuro: ___ (repetir la evaluación varias veces y revisar a mano todos los casos; acercar la alerta de paralización a la ley con modalidad y avance reciente; añadir otras fuentes oficiales, como las contrataciones del OECE que se dejaron fuera por alcance; llamadas nativas a herramientas; mejorar el recall).

**Errores a evitar:** citas; cifras que no estén en Resultados; afirmaciones que no salen del análisis («reducirá la corrupción»); un tercer párrafo.

**Verificación:** ☐ 2 párrafos ☐ 0 citas, 0 tablas ☐ cada cifra del párrafo 1 está en la sección 4 ☐ el párrafo 2 empieza con limitaciones.

## 9. Referencias

**Extensión:** **al menos 10, APA 7 o IEEE** (usen APA 7, como en el avance). Hay **20**: las 19 verificadas de `fuentes/REFERENCIAS.md` + Anthropic (2026). **Peso: 2 de 14 puntos** («formato APA… Esto incluye la referencia **a todo nivel**, por ejemplo, **de texto y figuras**»).

**Qué pidió el profesor (avance):** «Mantener el formato APA 7, **verificar la correspondencia entre las citas y referencias** y revisar la presentación de **tablas, fuentes y enlaces**.»

**Cómo hacerlo (Piero):** (1) copiar cada referencia tal como está abajo; (2) orden alfabético; sangría francesa 1,27 cm (Párrafo → Especial → Francesa); títulos de libros, revistas y conjuntos de datos en cursiva; DOI o URL como enlace; (3) **cruce**: Ctrl + B con cada apellido; toda referencia se cita al menos una vez y toda cita está en la lista; (4) las notas de tablas y figuras con datos ajenos citan al autor y ese autor está en la lista.

**Las 20 referencias: qué afirma cada una y dónde citarla**

| Referencia APA 7 | Qué afirma (lo que ustedes usan) | Dónde |
|---|---|---|
| Anthropic. (2026). *Claude* (versión Opus 5.5) [Modelo de lenguaje grande]. https://claude.ai | Herramienta de IA usada para el código | Introducción (declaración) |
| Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., Neelakantan, A., Shyam, P., Sastry, G., Askell, A., Agarwal, S., Herbert-Voss, A., Krueger, G., Henighan, T., Child, R., Ramesh, A., Ziegler, D. M., Wu, J., Winter, C., . . . Amodei, D. (2020). Language models are few-shot learners. En *Advances in Neural Information Processing Systems* (Vol. 33). https://arxiv.org/abs/2005.14165 | Los modelos grandes resuelven tareas con instrucciones y pocos ejemplos, sin reentrenarse | 2.1 |
| Congreso de la República. (2022). *Ley N.° 31589*. https://busquedas.elperuano.pe/normaslegales/ley-que-garantiza-la-reactivacion-de-obras-publicas-paraliza-ley-n-31589-2118030-3/ | Obra paralizada: avance ≥ 40 % y ≥ 6 meses sin ejecución física, o contrato resuelto o nulo (art. 2); 50 % en administración directa | 3.5, Tabla 5 |
| Es, S., James, J., Espinosa Anke, L., & Schockaert, S. (2024). RAGAs: Automated evaluation of retrieval augmented generation. En *Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics: System Demonstrations* (pp. 150–158). https://doi.org/10.18653/v1/2024.eacl-demo.16 | Hay métricas automáticas para evaluar sistemas con recuperación | 2.8 |
| Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., Dai, Y., Sun, J., Wang, M., & Wang, H. (2023). *Retrieval-augmented generation for large language models: A survey*. arXiv. https://arxiv.org/abs/2312.10997 | Apoyar las respuestas en fuentes externas reduce respuestas sin base | 2.3 |
| Hou, X., Zhao, Y., Wang, S., & Wang, H. (2025). *Model Context Protocol (MCP): Landscape, security threats, and future research directions*. arXiv. https://arxiv.org/abs/2503.23278 | MCP tiene un ecosistema en crecimiento y riesgos de seguridad | 2.5, 3.6 |
| Janssen, M., Charalabidis, Y., & Zuiderwijk, A. (2012). Benefits, adoption barriers and myths of open data and open government. *Information Systems Management, 29*(4), 258–268. https://doi.org/10.1080/10580530.2012.716740 | Publicar datos abiertos no basta: barreras técnicas y de uso | Introducción, 2.7 |
| Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y. J., Madotto, A., & Fung, P. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys, 55*(12), 1–38. https://doi.org/10.1145/3571730 | Los modelos generativos producen texto fluido pero falso (alucinación) | Introducción, 2.2 |
| Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.-t., Rocktäschel, T., Riedel, S., & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. En *Advances in Neural Information Processing Systems* (Vol. 33). https://arxiv.org/abs/2005.11401 | Combinar el modelo con recuperación externa mejora tareas de conocimiento | 2.3, figura opcional |
| Li, J., Hui, B., Qu, G., Yang, J., Li, B., Li, B., Wang, B., Qin, B., Cao, R., Geng, R., Huo, N., Zhou, X., Ma, C., Li, G., Chang, K. C. C., Huang, F., Cheng, R., & Li, Y. (2023). Can LLM already serve as a database interface? A BIg bench for large-scale database grounded text-to-SQLs. En *Advances in Neural Information Processing Systems* (Vol. 36). https://arxiv.org/abs/2305.03111 | En BIRD, 40,08 % de exactitud de ejecución del mejor modelo frente a 92,96 % de personas | Introducción, 2.6, 3.3 |
| Ministerio de Economía y Finanzas. (2026a). *Nota Informativa N.° 02* [Obras paralizadas, julio de 2026]. https://www.mef.gob.pe/contenidos/inv_publica/docs/novedades/notas_informativas/2026/20260717.pdf | 684 inversiones vinculadas a obras paralizadas y sus cifras | Introducción, 3.5, Tabla 5 |
| Ministerio de Economía y Finanzas. (2026b). *Información de inversiones públicas 2001–2026* [Conjunto de datos]. Plataforma Nacional de Datos Abiertos. https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-inversiones-p%C3%BAblicas-2001%E2%80%932026-mef | Fuente única de datos, licencia ODC-BY | Introducción, 3.2, notas de tablas y figuras |
| Model Context Protocol. (2025). *Specification (versión 2025-06-18)*. https://modelcontextprotocol.io/specification/2025-06-18 | Define el protocolo (herramientas, Streamable HTTP) | 2.5, 3.3 |
| Naciones Unidas. (s. f.). *Objetivo 16: Paz, justicia e instituciones sólidas*. https://sdgs.un.org/es/goals/goal16 | Metas 16.5, 16.6 y 16.10 | Introducción |
| Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., Cancedda, N., & Scialom, T. (2023). Toolformer: Language models can teach themselves to use tools. En *Advances in Neural Information Processing Systems* (Vol. 36). https://arxiv.org/abs/2302.04761 | Los modelos pueden aprender cuándo y cómo usar herramientas | 2.4 |
| Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. En *Advances in Neural Information Processing Systems* (Vol. 30). https://arxiv.org/abs/1706.03762 | Arquitectura Transformer, base de los modelos actuales | 2.1 |
| Wang, L., Ma, C., Feng, X., Zhang, Z., Yang, H., Zhang, J., Chen, Z., Tang, J., Chen, X., Lin, Y., Zhao, W. X., Wei, Z., & Wen, J. (2024). A survey on large language model based autonomous agents. *Frontiers of Computer Science, 18*(6). https://doi.org/10.1007/s11704-024-40231-1 | Panorama de agentes basados en modelos de lenguaje | 2.4 |
| Wirtz, B. W., Weyerer, J. C., Becker, M., & Müller, W. M. (2022). Open government data: A systematic literature review of empirical research. *Electronic Markets, 32*(4), 2381–2404. https://doi.org/10.1007/s12525-022-00582-8 | Marco de beneficios y barreras de los datos abiertos de gobierno | 2.7 |
| Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). ReAct: Synergizing reasoning and acting in language models. En *International Conference on Learning Representations (ICLR 2023)*. https://arxiv.org/abs/2210.03629 | Ciclo razonar-actuar: usar una herramienta, leer el resultado, decidir otra | 2.4, 3.3 |
| Yu, T., Zhang, R., Yang, K., Yasunaga, M., Wang, D., Li, Z., Ma, J., Li, I., Yao, Q., Roman, S., Zhang, Z., & Radev, D. (2018). Spider: A large-scale human-labeled dataset for complex and cross-domain semantic parsing and text-to-SQL task. En *Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing* (pp. 3911–3921). https://doi.org/10.18653/v1/D18-1425 | Banco de texto a SQL entre dominios: es difícil que un modelo escriba SQL correcto | 2.6 |

**Errores a evitar:** mezclar APA e IEEE; «et al.» en la lista (en la lista van todos los autores, hasta 20); enlaces rotos.

**Verificación:** ☐ 20 referencias ☐ orden alfabético y sangría francesa ☐ cruce completo ☐ tablas y figuras con fuente.

## 10. Anexo 01: Documentación del trabajo

**Qué pide la plantilla:** «Hojas técnicas, simulaciones, prompts, código fuente con las debidas instrucciones para su ejecución (pueden subir todo en GitHub y compartirlo como enlace público), etc.» **Peso: 1 punto** («el código fuente es entendible y se encuentra disponible para la descarga con las debidas instrucciones para su ejecución»).

**Qué pidió el profesor (avance):** «Incluir el código fuente, arquitectura, herramientas MCP, procedimientos de procesamiento de datos, **prompts utilizados**, evidencias de pruebas e instrucciones para ejecutar el sistema… enlace público y **verificando que el proyecto pueda reproducirse**.»

**Qué poner (Adriel; lista, no prosa larga):**
1. Repositorio público: https://github.com/adrielorihuela/obraclara-mcp
2. Sitio: https://obraclara.adrielorihuela.net (páginas `/proyecto`, `/evaluacion`, `/conectar`, `/demo`) y servidor MCP: https://obraclara.adrielorihuela.net/mcp
3. Tabla *Contenido del repositorio* (Carpeta · Qué contiene): `worker/` servidor MCP, sitio y pruebas · `etl/` limpieza y carga de datos · `conector/` enlace entre el servidor, la base local y la IA del grupo · `eval/` 40 preguntas, respuestas, puntuador, resultados y 80 capturas · `metricas/` calidad de datos, rendimiento, exactitud y pruebas · `fuentes/` referencias y documentos oficiales · `docs/` documentación completa · `.github/workflows/` despliegue automático.
4. Prompts: `README.md` § Prompts utilizados (instrucciones del servidor MCP, descripciones de las 4 herramientas, prompt del asistente, prompts de las dos condiciones de la evaluación).
5. Evidencias de pruebas: 149 pruebas automáticas que pasan; `metricas/resultados/`; historial de despliegues en la pestaña «Actions» del repositorio.
6. Instrucciones de ejecución: `README.md` § Cómo reproducir y § Cómo conectar el servidor a un cliente MCP; prueba rápida: `npx @modelcontextprotocol/inspector`, transporte Streamable HTTP, URL https://obraclara.adrielorihuela.net/mcp, pestaña Tools → List Tools (aparecen las 4 herramientas).
7. Tablas que no cupieron en el cuerpo (11, 12) y 1–2 capturas propias.

**Verificación:** ☐ enlace abre sin iniciar sesión ☐ prompts ubicados ☐ instrucciones ☐ evidencias de pruebas.

## 11. Anexo 02: Coevaluación de la participación individual en el trabajo grupal

**Qué pide la plantilla:** tabla con columnas **Estudiante · Nivel de participación (0 % a 100 %) · Observaciones**. Si todos trabajaron por igual, 100 % cada uno; el porcentaje **multiplica la Nota 03** de cada uno (20 con 50 % → 10). **Observaciones obligatorias**, específicas y concisas; si alguien tiene menos de 100 %, justificar con cumplimiento de tareas, participación en reuniones, calidad del trabajo, responsabilidad y puntualidad. **Peso: 1 punto.**

**Qué pidió el profesor (avance):** «tabla con todos los integrantes, porcentaje de participación (0 % a 100 %) y **observaciones obligatorias que describan concretamente el aporte de cada estudiante**».

**Cómo hacerlo (sábado 28/11):** 4 filas (Camila, Piero, Sebastián, Adriel). En cada observación, 2–3 líneas con hechos verificables: qué secciones redactó, qué tablas y figuras hizo, qué expuso en las mentorías del 18/11 y 20/11 (en la del 20/11: Camila, resultados de la evaluación; Piero, modelos y recall; Sebastián, métricas, datos y alertas; Adriel, asistente y demo), qué partes del sistema o de la evaluación hizo o revisó. Esquema: «Redactó ___; elaboró ___; expuso ___ en la mentoría del ___; revisó ___.»

**Errores a evitar:** «participó activamente» sin detalle; porcentajes sin justificar; dejar «por acordar».

**Verificación:** ☐ 4 filas ☐ % de 0 a 100 ☐ observaciones concretas ☐ justificación si < 100 %.

---

## F. Lista de verificación global contra la rúbrica (domingo 29/11)

| Criterio (Nota 03, informe final = 14 puntos) | Puntos | Qué debe estar | ☐ |
|---|---|---|---|
| Citas y referencias APA | 2 | APA 7 en texto, tablas y figuras; 20 referencias; cruce completo; Anthropic (2026) | ☐ |
| Introducción y marco teórico | 2 | Pertinente, bien citado, conectado con la propuesta; ODS 16; declaración de IA; ecuaciones | ☐ |
| Diseño y desarrollo | 4 | ≥ 4 subsecciones; Figura 3 dibujada por el grupo; ETL; 4 herramientas; alertas justificadas frente a lo oficial; tecnologías; diseño de la evaluación | ☐ |
| Análisis, interpretación y conclusiones | 4 | 40 preguntas sin/con MCP; tablas, figuras y ejemplos; interpretación; conclusiones derivadas; limitaciones | ☐ |
| Documentación | 1 | Anexo 01: enlace público, prompts, pruebas, instrucciones | ☐ |
| Aporte de cada alumno | 1 | Anexo 02 con tabla, % y observaciones | ☐ |
| Avance (3) y mentoría (3) | 6 | Ya calificados (avance 3/3) | — |

**Antes de subir:**
- ☐ Nada redactado ni dibujado con IA; leído en voz alta.
- ☐ Glosario respetado (nombres de herramientas, una definición de información inventada, «exactitud estricta», «cifras no sustentadas»).
- ☐ Cifras del Resumen, Resultados y Conclusiones idénticas a las de esta guía.
- ☐ Extensiones: Resumen 150–200 palabras; Introducción 1 página; Marco teórico 2–3; Diseño 3–5; Resultados 1–2; Conclusiones 2 párrafos; ≥ 5 palabras clave.
- ☐ Tablas y figuras numeradas en orden, con título, nota y fuente, y mencionadas en el texto.
- ☐ Portada con ODS 16, 4 nombres, profesor y «Noviembre - 2026».
- ☐ Ningún «se espera», «se evaluará» ni «resultados pendientes».
- ☐ Alertas siempre como indicios.
- ☐ PDF revisado (figuras en su sitio).

## G. Figuras y tablas que el grupo hace a mano (resumen)

| N.° | Elemento | Sección | Herramienta | Datos | Quién | Obligatoria |
|---|---|---|---|---|---|---|
| Figura 1 | Ciclo CRISP-DM | 3.1 | draw.io | — | Adriel | Opcional |
| Figura 2 | Flujo de datos ETL | 3.2 | draw.io | `docs/PROYECTO.md` § 5 | Sebastián | Recomendada |
| Figura 3 | Arquitectura (workflow) | 3.3 | draw.io | `README.md` § Arquitectura (solo para entender) | Adriel | **Sí** |
| Figura 4 | 7 etapas de una consulta | 3.3 | draw.io | `docs/PROYECTO.md` § 7 | Adriel | Recomendada (o dentro de la 3) |
| Figura 5 | Histograma de sobrecosto | 3.5 | Excel | `metricas/resultados/alertas_hist_sobrecosto.csv` | Sebastián | Recomendada |
| Figura 6 | Métricas sin/con MCP | 4.1 | Excel | `eval/resultados/graficos_global.csv` | Camila | **Sí** |
| Figura 7 | Exactitud e inventada por tipo | 4.2 | Excel | `eval/resultados/graficos_por_tipo.csv` | Camila | **Sí** |
| Figura 8 | Exactitud en 3 modelos | 4.5 | Excel | `eval/resultados/modelos/*/graficos_global.csv` | Piero | Opcional |
| Tabla 1 | CRISP-DM | 3.1 | Word | `docs/PROYECTO.md` § 4 | Adriel | Recomendada |
| Tabla 2 | Columnas conservadas | 3.2 | Word | `docs/PROYECTO.md` § 5 | Sebastián | Recomendada |
| Tabla 3 | Valores vacíos | 3.2 | Word | `metricas/resultados/calidad_nulos.csv` | Sebastián | Recomendada |
| Tabla 4 | 4 herramientas | 3.4 | Word | `README.md` § Herramientas MCP | Adriel | **Sí** |
| Tabla 5 | Alertas frente a lo oficial | 3.5 | Word | `alertas_totales.csv`, MEF (2026a) | Sebastián | **Sí** |
| Tabla 6 | Tecnologías | 3.6 | Word | `docs/PROYECTO.md` § 9 | Adriel | Recomendada |
| Tabla 7 | Verificación del sistema | 3.6 | Word | `metricas/resultados/exactitud_*.csv`, `rendimiento_mcp.csv` | Adriel | Recomendada |
| Tabla 8 | Métricas de evaluación | 3.7 | Word | `eval/resultados/resumen.md` | Piero | **Sí** |
| Tabla 9 | Resultados globales | 4.1 | Word | `graficos_global.csv` | Camila | **Sí** |
| Tabla 10 | Ejemplos de respuestas | 4.3 | Word | `docs/PROYECTO.md` § 10 | Camila | **Sí** |
| Tabla 11 | Tres modelos | 4.5 | Word | `modelos/*/graficos_global.csv` | Piero | Recomendada |
| Tabla 12 | Tiempo de respuesta | 4.6 | Word | `graficos_latencia.csv` | Piero | Recomendada |
| Anexo 02 | Coevaluación | Anexo 02 | Word | — | Todos | **Sí** |

Si Diseño pasa de 5 páginas o Resultados de 2, las «recomendadas» van al Anexo 01 con «ver Anexo 01» en el texto.

## H. Después del informe: exposición (semana 15)

PPT con la plantilla ULima (IA permitida, declarándola en el PPT); póster con la plantilla (**sin IA**); video pitch de **exactamente 3 minutos** (IA solo para el diseño, no para el contenido); demo en vivo (página `/demo`). La nota de la exposición es en su mayor parte **individual**: cada integrante debe poder explicar todo el proyecto. Guion y preguntas probables: `docs/EXPOSICION.md`.
