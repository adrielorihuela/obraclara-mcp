# Evaluación ObraClara: sin MCP vs con MCP

Fecha: 2026-11-10 · 40 preguntas (`preguntas.csv`) · modelo: chatgpt.com anónimo vía gpt-headless · una corrida.

## Resultado global (porcentaje de las 40 preguntas)

| Condición | Exacta | Cita fuente y fecha | Inventada | Revisar | Latencia media (s) | Llamadas medias | Ejecutadas |
|---|---|---|---|---|---|---|---|
| sin_mcp | 0 % | 0 % | 8 % | 38 | 13.1 | 0.0 | 3/40 |
| con_mcp | 3 % | 3 % | 0 % | 39 | 13.2 | 0.0 | 3/40 |

## Por tipo de pregunta (10 preguntas cada uno)

| Tipo | Condición | Exacta | Cita | Inventada | Revisar |
|---|---|---|---|---|---|
| busqueda | sin_mcp | 0 % | 0 % | 30 % | 8 |
| busqueda | con_mcp | 10 % | 10 % | 0 % | 9 |
| detalle | sin_mcp | 0 % | 0 % | 0 % | 10 |
| detalle | con_mcp | 0 % | 0 % | 0 % | 10 |
| alertas | sin_mcp | 0 % | 0 % | 0 % | 10 |
| alertas | con_mcp | 0 % | 0 % | 0 % | 10 |
| resumen | sin_mcp | 0 % | 0 % | 0 % | 10 |
| resumen | con_mcp | 0 % | 0 % | 0 % | 10 |

Con MCP, la herramienta esperada se usó en 0/40 preguntas; 39 respuestas no llamaron a ninguna herramienta.

## Cómo se puntuó (automático)

- **Exacta**: si el valor oficial es numérico, se extraen los números de la respuesta (formatos «1 234,56», «1,234.56», «1.234,56», «S/ 2,5 millones», «mil millones»; los separadores ambiguos se leen de las dos formas) sin contar años ni números que ya estaban en la pregunta, y basta que uno quede a ±1 % del valor oficial. Texto: aparece la entidad esperada. Sin datos (B10, D10, A10): la respuesta dice que no hay resultados.
- **Cita**: menciona MEF / Ministerio de Economía y Finanzas / datosabiertos.gob.pe / el dataset **y** la fecha de corte 2026-11-10 o la fecha de descarga.
- **Inventada**: da cifras (en preguntas en soles, cifras ≥ 1000) y ninguna coincide con la referencia; o afirma resultados en una pregunta sin datos; o nombra otra entidad.
- **Revisar**: casos dudosos para revisión manual (columna `revisar` de `resultados.csv` con el motivo).

## Advertencias
- chatgpt.com **anónimo** (sin cuenta) a través de un navegador headless; no se sabe qué modelo responde y puede cambiar entre preguntas. En «sin MCP» el chat puede usar su búsqueda web.
- Con MCP se usa un protocolo de herramientas **en texto** (JSON en la respuesta), no llamadas nativas; resultados de más de 15000 caracteres se recortan.
- Puntuación **automática** con reglas simples: puede contar como exacta una coincidencia casual o perder respuestas correctas con otro formato. Los casos «revisar» deben verificarlos a mano dos integrantes del grupo.
- **Una sola corrida** por condición: no mide la variabilidad entre corridas.
- Datos de referencia con corte 2026-11-10; el chat sin herramientas puede tener datos de otra fecha.
