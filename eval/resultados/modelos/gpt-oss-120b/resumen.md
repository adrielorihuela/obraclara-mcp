# Evaluación ObraClara: sin MCP vs con MCP

Fecha: 2026-11-19 · 40 preguntas (`preguntas.csv`) · modelo: gpt-oss-120b (Groq) · una corrida (todas las preguntas, mismo día, con el modelo fijo).

## Resultado global (porcentaje de las 40 preguntas)

| Condición | Exacta | Cita fuente y fecha | Inventada | Revisar | Latencia media total (s) | Latencia media sin reintentos (s) | Llamadas medias | Reintentos | Ejecutadas |
|---|---|---|---|---|---|---|---|---|---|
| sin_mcp | 3 % | 0 % | 93 % | 10 | 4.7 | 2.5 | 0.0 | 1 | 40/40 |
| con_mcp | 25 % | 25 % | 55 % | 9 | 14.2 | 1.0 | 0.2 | 21 | 36/40 |

## Exacta estricta y cifras no sustentadas (métricas añadidas; «Exacta» e «Inventada» no cambian)

| Condición | Exacta | Exacta estricta | Cifras no sustentadas |
|---|---|---|---|
| sin_mcp | 3 % | 3 % | 63 % |
| con_mcp | 25 % | 25 % | 30 % |

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

(ninguna)

## Latencia: mediana y p90 por condición (segundos)

| Condición | Mediana total | p90 total | Máximo total | Respuestas > 300 s | Mediana sin reintentos | p90 sin reintentos |
|---|---|---|---|---|---|---|
| sin_mcp | 4.4 | 5.5 | 9.7 | 0 | 2.4 | 3.5 |
| con_mcp | 8.0 | 68.1 | 73.8 | 0 | 0.9 | 1.8 |

Los máximos (más de 300 s) se deben a reintentos: el proveedor de IA a veces tarda varios minutos en responder, el ejecutor espera y repite la consulta una vez, y la latencia total suma ambos intentos. La mediana y el p90 describen mejor el tiempo típico que la media. Percentil por rango más cercano; «sin reintentos» solo existe desde B08.

### Solo las 36 preguntas con respuesta válida en ambas condiciones

| Condición | Exacta | Cita | Inventada |
|---|---|---|---|
| sin_mcp | 3 % | 0 % | 92 % |
| con_mcp | 28 % | 28 % | 61 % |

Faltan: B03, B09, A04, A07 (el proveedor de IA alcanzó su límite de uso; en la tabla global cuentan como no acertadas).

## Por tipo de pregunta (10 preguntas cada uno)

| Tipo | Condición | Exacta | Cita | Inventada | Revisar |
|---|---|---|---|---|---|
| busqueda | sin_mcp | 0 % | 0 % | 100 % | 1 |
| busqueda | con_mcp | 20 % | 20 % | 60 % | 2 |
| detalle | sin_mcp | 0 % | 0 % | 80 % | 5 |
| detalle | con_mcp | 40 % | 40 % | 40 % | 3 |
| alertas | sin_mcp | 10 % | 0 % | 90 % | 2 |
| alertas | con_mcp | 30 % | 20 % | 30 % | 4 |
| resumen | sin_mcp | 0 % | 0 % | 100 % | 2 |
| resumen | con_mcp | 10 % | 20 % | 90 % | 0 |

Con MCP, la herramienta esperada se usó en 7/40 preguntas; 33 respuestas no llamaron a ninguna herramienta.

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
