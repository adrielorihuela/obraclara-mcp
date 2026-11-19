# Evaluación ObraClara: sin MCP vs con MCP

Fecha: 2026-11-19 · 40 preguntas (`preguntas.csv`) · modelo: Gemini 3.5 Flash-Lite (Google) · una corrida (todas las preguntas, mismo día, con el modelo fijo).

## Resultado global (porcentaje de las 40 preguntas)

| Condición | Exacta | Cita fuente y fecha | Inventada | Revisar | Latencia media total (s) | Latencia media sin reintentos (s) | Llamadas medias | Reintentos | Ejecutadas |
|---|---|---|---|---|---|---|---|---|---|
| sin_mcp | 0 % | 0 % | 45 % | 29 | 4.9 | 2.8 | 0.0 | 1 | 40/40 |
| con_mcp | 95 % | 100 % | 3 % | 2 | 10.9 | 3.3 | 1.0 | 3 | 40/40 |

## Exacta estricta y cifras no sustentadas (métricas añadidas; «Exacta» e «Inventada» no cambian)

| Condición | Exacta | Exacta estricta | Cifras no sustentadas |
|---|---|---|---|
| sin_mcp | 0 % | 0 % | 25 % |
| con_mcp | 95 % | 93 % | 3 % |

## Precisión y recall de elementos (preguntas que piden contar o listar obras)

Se aplican a las 13 preguntas de búsqueda y alertas cuya respuesta es un conteo o una lista (las de una sola obra, como «la más cara», no entran). **Referencia**: los códigos únicos de obra que devuelve la herramienta esperada con los filtros correctos (`reconstruir_referencia.mjs` -> `resultados/referencia_items.json`; la herramienta muestra como máximo 20, aunque el total sea mayor). **Mencionados**: códigos únicos (7 dígitos, empiezan con 2) que aparecen en la respuesta (sin contar los de la pregunta).

- **Recall** = aciertos / elementos esperados, donde aciertos = mencionados que están en la referencia. Responde: «de las obras que debía encontrar, ¿qué porcentaje encontró?». Una respuesta que solo da el total y no nombra obras tiene recall 0.
- **Precisión** = aciertos / mencionados. Responde: «de las obras que nombró, ¿qué porcentaje es correcto?». Solo se calcula si la respuesta menciona al menos un código; en las preguntas sin datos (B10, A10) cualquier código mencionado es un error.
- **F1** = 2 · precisión · recall / (precisión + recall), con 0 si ambos son 0 (una precisión sin calcular cuenta como 0).
- Promedio simple entre preguntas (cada pregunta pesa igual).

| Condición | Preguntas con referencia | Recall medio | Precisión media (con códigos mencionados) | F1 medio |
|---|---|---|---|---|
| sin_mcp | 13 | 0 % | - | 0 % |
| con_mcp | 13 | 0 % | - | 0 % |

Respuestas que pasan de exacta a **no estricta** (la cifra de la referencia aparece, pero otra cifra no se sustenta en la fuente):

| Pregunta | Condición | Cifras no sustentadas |
|---|---|---|
| R10 | con_mcp | 1,373,424; 266,565.26; 43,691; 317,724.50; 996,957; 917,142.24 |

## Latencia: mediana y p90 por condición (segundos)

| Condición | Mediana total | p90 total | Máximo total | Respuestas > 300 s | Mediana sin reintentos | p90 sin reintentos |
|---|---|---|---|---|---|---|
| sin_mcp | 4.2 | 5.7 | 20.1 | 0 | 2.2 | 3.7 |
| con_mcp | 8.3 | 13.2 | 79.5 | 0 | 2.6 | 4.2 |

Los máximos (más de 300 s) se deben a reintentos: el proveedor de IA a veces tarda varios minutos en responder, el ejecutor espera y repite la consulta una vez, y la latencia total suma ambos intentos. La mediana y el p90 describen mejor el tiempo típico que la media. Percentil por rango más cercano; «sin reintentos» solo existe desde B08.

## Por tipo de pregunta (10 preguntas cada uno)

| Tipo | Condición | Exacta | Cita | Inventada | Revisar |
|---|---|---|---|---|---|
| busqueda | sin_mcp | 0 % | 0 % | 50 % | 6 |
| busqueda | con_mcp | 100 % | 100 % | 0 % | 0 |
| detalle | sin_mcp | 0 % | 0 % | 40 % | 8 |
| detalle | con_mcp | 90 % | 100 % | 0 % | 1 |
| alertas | sin_mcp | 0 % | 0 % | 50 % | 8 |
| alertas | con_mcp | 90 % | 100 % | 10 % | 1 |
| resumen | sin_mcp | 0 % | 0 % | 40 % | 7 |
| resumen | con_mcp | 100 % | 100 % | 0 % | 0 |

Con MCP, la herramienta esperada se usó en 36/40 preguntas; 0 respuestas no llamaron a ninguna herramienta.

## Cómo se puntuó (automático)

- **Exacta**: si el valor oficial es numérico, se extraen los números de la respuesta (formatos «1 234,56», «1,234.56», «1.234,56», «S/ 2,5 millones», «mil millones»; los separadores ambiguos se leen de las dos formas) sin contar años ni números que ya estaban en la pregunta, y basta que uno quede a ±1 % del valor oficial. Texto: aparece la entidad esperada. Sin datos (B10, D10, A10): la respuesta dice que no hay resultados.
- **Cita**: menciona MEF / Ministerio de Economía y Finanzas / datosabiertos.gob.pe / el dataset **y** la fecha de corte 2026-11-10 o la fecha de descarga.
- **Inventada**: da cifras (en preguntas en soles, cifras ≥ 1000) y ninguna coincide con la referencia; o afirma resultados en una pregunta sin datos; o nombra otra entidad.
- **Exacta estricta**: exacta según la regla anterior **y** ninguna cifra relevante de la respuesta queda sin sustento. Cifra relevante: porcentaje o cantidad/monto ≥ 1000; se ignoran años, fechas, códigos únicos, números de la pregunta y conteos pequeños. Una cifra está sustentada si aparece en la fuente, o es la suma, diferencia o cociente (también en %) de dos cifras de la fuente que la propia respuesta cita, o coincide con la referencia. Fuente con MCP: el texto de los resultados de las herramientas de esa respuesta (`fuentes_con_mcp.json`, reproducido con `reconstruir_fuentes.mjs` porque `raw_con_mcp.jsonl` solo guardaba el largo del resultado; coincide en las 40). Fuente sin MCP: no hay herramientas, así que se usan la referencia y su nota y, en detalle, los campos de la fila de la base para el código de la pregunta. La tolerancia depende de la precisión con que se escribe la cifra (hasta 1 %: «40,7 millones» admite 0,12 %; «40,682,184.89», solo redondeo de 0,05 %); con ±1 % fijo, una cifra errónea como 40,279,184.89 pasaría por cercana a 40,682,184.89.
- **Cifras no sustentadas**: porcentaje de respuestas con al menos una cifra relevante sin sustento según la definición anterior. No es lo mismo que «inventada»: «inventada» exige que ninguna cifra coincida con la referencia; «no sustentada» basta con una cifra suelta sin respaldo, aunque otra sea correcta. Sin MCP incluye cifras reales de otras fuentes (web, Contraloría) que simplemente no están en los datos del MEF al corte.
- **Revisar**: casos dudosos para revisión manual (columna `revisar` de `resultados.csv` con el motivo).

## Advertencias
- Modelo fijo (sin cadena de respaldo) servido con una cuenta gratuita: puede haber esperas por límite de uso; el ejecutor espera a que se libere y no cambia de modelo. Sin MCP el modelo responde de memoria, sin búsqueda web.
- Con MCP se usa un protocolo de herramientas **en texto** (JSON en la respuesta), no llamadas nativas; resultados de más de 15000 caracteres se recortan.
- Puntuación **automática** con reglas simples: puede contar como exacta una coincidencia casual o perder respuestas correctas con otro formato. Los casos «revisar» deben verificarlos a mano dos integrantes del grupo.
- La latencia total incluye los reintentos: el proveedor a veces tarda hasta 3 min en responder y el ejecutor reintenta una vez; «sin reintentos» suma solo los intentos exitosos (medida desde B08; antes no se registraba).
- «Inventada» es una cota superior: sin MCP el chat suele citar otras fuentes reales (Contraloría, notas de prensa, otras fechas) cuyas cifras no coinciden con el MEF al 2026-11-10; la regla las cuenta como inventadas aunque no sean fabricadas. Conviene revisarlas a mano.

- Abstenciones («no he podido verificar…») no cuentan como exactas ni como inventadas (se marcan «revisar»).
- «Exacta estricta» sigue siendo automática y aproximada: no entiende el contexto de cada cifra (una cifra correcta con otro significado cuenta como sustentada; una derivación válida que la respuesta no explicita puede contarse como no sustentada) y no mide si la conclusión es correcta. La «Exacta» original sigue publicada para comparar y sobrestima el acierto porque basta con que una cifra coincida.
- **Una sola corrida** por condición: no mide la variabilidad entre corridas.
- Datos de referencia con corte 2026-11-10; el chat sin herramientas puede tener datos de otra fecha.
