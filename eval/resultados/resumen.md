# Evaluación ObraClara: sin MCP vs con MCP

Fecha: 2026-11-10 · 40 preguntas (`preguntas.csv`) · modelo: chatgpt.com anónimo vía gpt-headless · una corrida.

## Resultado global (porcentaje de las 40 preguntas)

| Condición | Exacta | Cita fuente y fecha | Inventada | Revisar | Latencia media total (s) | Latencia media sin reintentos (s) | Llamadas medias | Reintentos | Ejecutadas |
|---|---|---|---|---|---|---|---|---|---|
| sin_mcp | 5 % | 15 % | 48 % | 23 | 53.2 | 16.7 | 0.0 | 4 | 37/40 |
| con_mcp | 85 % | 90 % | 0 % | 6 | 133.4 | 21.4 | 0.9 | 18 | 37/40 |

### Solo las 36 preguntas con respuesta válida en ambas condiciones

| Condición | Exacta | Cita | Inventada |
|---|---|---|---|
| sin_mcp | 6 % | 14 % | 53 % |
| con_mcp | 94 % | 100 % | 0 % |

Faltan: R07, R08, R09, R10 (chatgpt.com anónimo alcanzó su límite de uso: «pide iniciar sesión»; en la tabla global cuentan como no acertadas).

## Por tipo de pregunta (10 preguntas cada uno)

| Tipo | Condición | Exacta | Cita | Inventada | Revisar |
|---|---|---|---|---|---|
| busqueda | sin_mcp | 0 % | 0 % | 80 % | 3 |
| busqueda | con_mcp | 100 % | 100 % | 0 % | 0 |
| detalle | sin_mcp | 20 % | 30 % | 20 % | 6 |
| detalle | con_mcp | 100 % | 100 % | 0 % | 0 |
| alertas | sin_mcp | 0 % | 0 % | 70 % | 6 |
| alertas | con_mcp | 100 % | 100 % | 0 % | 0 |
| resumen | sin_mcp | 0 % | 30 % | 20 % | 8 |
| resumen | con_mcp | 40 % | 60 % | 0 % | 6 |

Con MCP, la herramienta esperada se usó en 34/40 preguntas; 3 respuestas no llamaron a ninguna herramienta.

## Cómo se puntuó (automático)

- **Exacta**: si el valor oficial es numérico, se extraen los números de la respuesta (formatos «1 234,56», «1,234.56», «1.234,56», «S/ 2,5 millones», «mil millones»; los separadores ambiguos se leen de las dos formas) sin contar años ni números que ya estaban en la pregunta, y basta que uno quede a ±1 % del valor oficial. Texto: aparece la entidad esperada. Sin datos (B10, D10, A10): la respuesta dice que no hay resultados.
- **Cita**: menciona MEF / Ministerio de Economía y Finanzas / datosabiertos.gob.pe / el dataset **y** la fecha de corte 2026-11-10 o la fecha de descarga.
- **Inventada**: da cifras (en preguntas en soles, cifras ≥ 1000) y ninguna coincide con la referencia; o afirma resultados en una pregunta sin datos; o nombra otra entidad.
- **Revisar**: casos dudosos para revisión manual (columna `revisar` de `resultados.csv` con el motivo).

## Advertencias
- chatgpt.com **anónimo** (sin cuenta) a través de un navegador headless; no se sabe qué modelo responde y puede cambiar entre preguntas. En «sin MCP» el chat puede usar su búsqueda web.
- Con MCP se usa un protocolo de herramientas **en texto** (JSON en la respuesta), no llamadas nativas; resultados de más de 15000 caracteres se recortan.
- Puntuación **automática** con reglas simples: puede contar como exacta una coincidencia casual o perder respuestas correctas con otro formato. Los casos «revisar» deben verificarlos a mano dos integrantes del grupo.
- La latencia total incluye los reintentos: gpt-headless a veces se queda 3 min sin leer la respuesta y el ejecutor reintenta una vez; «sin reintentos» suma solo los intentos exitosos (medida desde B08; antes no se registraba).
- «Inventada» es una cota superior: sin MCP el chat suele citar otras fuentes reales (Contraloría, notas de prensa, otras fechas) cuyas cifras no coinciden con el MEF al 2026-11-10; la regla las cuenta como inventadas aunque no sean fabricadas. Conviene revisarlas a mano.
- gpt-headless lee solo el último mensaje del asistente; cuando chatgpt.com usa búsqueda web, algunas respuestas sin MCP llegan con marcado interno (<Cite>, imágenes) o empiezan a mitad de texto. Afecta sobre todo a «cita» sin MCP.
- Abstenciones («no he podido verificar…») no cuentan como exactas ni como inventadas (se marcan «revisar»).
- **Una sola corrida** por condición: no mide la variabilidad entre corridas.
- Datos de referencia con corte 2026-11-10; el chat sin herramientas puede tener datos de otra fecha.
