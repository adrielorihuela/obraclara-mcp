# Revisión independiente asistida por IA de los casos «revisar» (sin MCP)

> **Revisión independiente asistida por IA; pendiente de confirmación por el grupo.** No sustituye la revisión manual humana (apartado 4.7 de `docs/GUIA-INFORME.md`).

## Método
- Universo: filas de `resultados.csv` con `condicion = sin_mcp` y `revisar` que empieza con «sí»: **20** (la columna trae «0» en las demás, no vacío).
- Por caso se leyó la pregunta (`preguntas.csv`), la respuesta completa (`raw_sin_mcp.jsonl`) y la referencia oficial (`respuesta_referencia` / `valor_oficial`), con las reglas de `score_eval.mjs`.
- **Exacta**: la cifra principal coincide con la oficial (±1 %). **Inventa**: da como respuesta una cifra o dato que ni sale del MEF ni de una fuente real citada y fechada. Una cifra de otra fuente verificable (Contraloría, CPC, Congreso) con alcance distinto cuenta como «no exacta», no como «inventada»; una abstención tampoco es inventar. **Cita**: nombra una fuente con enlace o documento identificable (criterio más amplio que el automático, que exige MEF y fecha de corte; por eso no entra en «coincide»).
- «Coincide» = exacta e inventada iguales al automático.

## Resultado
| id | pregunta | auto exacta/inv. | IA exacta/inv. | cita | coincide |
|---|---|---|---|---|---|
| B03 | ¿Cuántos proyectos de agua y saneamiento tienen a su cargo las municip | no/sí | no/no | sí | no |
| B05 | ¿Cuántos proyectos que mencionan un puente hay en Amazonas? | no/no | no/no | sí | sí |
| B08 | ¿Cuántos proyectos de comisarías hay registrados en el departamento de | no/no | no/no | sí | sí |
| D01 | ¿Qué avance físico tiene la obra con código 2194680? | no/no | no/no | sí | sí |
| D02 | ¿Hace cuánto que no se gasta en la inversión 2488996 y está en riesgo  | no/no | no/no | sí | sí |
| D03 | ¿Cuánto se ha devengado este año en el proyecto 2251136? | no/no | no/no | sí | sí |
| D04 | ¿Cuánto ha subido el costo de la obra 2226075 respecto a lo aprobado? | no/no | no/no | sí | sí |
| D07 | ¿A cuántas personas beneficia la obra 2178454? | no/no | no/no | sí | sí |
| D09 | ¿Cuál es el presupuesto modificado de este año para el control de desb | no/no | no/no | sí | sí |
| A01 | ¿Cuántas obras de Ayacucho podrían estar paralizadas? | no/sí | no/no | sí | no |
| A04 | ¿Cuántas obras municipales en Cajamarca tienen señales de estar parali | no/sí | no/no | sí | no |
| A05 | ¿Cuántos colegios u obras educativas del Gobierno Regional en Ica podr | no/no | no/no | sí | sí |
| A06 | ¿Cuántos proyectos de seguridad ciudadana en Lima tienen sobrecostos d | no/no | no/no | sí | sí |
| A07 | En Tacna, ¿cuál es la obra con alerta de paralización que lleva más ti | no/sí | no/no | sí | no |
| A08 | ¿Cuántos proyectos de transporte del Gobierno Nacional tienen sobrecos | no/no | no/no | sí | sí |
| R02 | ¿Cuánto ha gastado este año el Gobierno Regional de Arequipa en sus pr | no/no | no/no | no | sí |
| R04 | ¿Cuántas inversiones públicas tiene registradas Tumbes? | no/no | no/no | sí | sí |
| R05 | ¿Cuánto ha devengado este año el Gobierno Nacional en educación en Uca | no/no | no/no | sí | sí |
| R07 | ¿Cuánto se ha devengado en 2026 en inversiones públicas en San Martín? | no/no | no/no | sí | sí |
| R08 | ¿Cuánto le falta ejecutar al Gobierno Nacional en sus proyectos del Ca | no/no | no/no | sí | sí |

Justificación caso por caso: `revision_ia_casos_revisar.csv`.

## Totales
- Coincide con el automático en **16 de 20** casos.
- **Exacta**: 20 de 20 coinciden (ninguno es exacto; el automático tampoco). Ninguna respuesta oficial se recupera.
- **Inventada**: cambian **4** (B03, A01, A04, A07), todos de «sí» (automático) a «no» (IA): citan una fuente real y fechada con otra medida (10 proyectos PNSU; 150 y 140 obras paralizadas Contraloría; otra obra de Electrosur). Siguen siendo respuestas incorrectas, pero no fabricadas. Ningún caso cambia de «no» a «sí».
- Cita: 19 de 20 con fuente verificable; solo R02 con cita débil.

## Impacto en cifras globales sin MCP (no se modifican las oficiales)
- Exacta: 3/40 (8 %), sin cambio (los 3 aciertos no están entre los 20).
- Inventada automática: 21/40 (53 %). Si el grupo confirma los 4 cambios sería 17/40 (43 %). Refuerza que la cifra automática es una cota superior (ver `resumen.md`).
- Las cifras oficiales de `resultados.csv` y `resumen.md` quedan **sin cambios**.

> Revisión independiente asistida por IA; pendiente de confirmación por el grupo. Comprobar a mano al menos 5 casos antes de citarla.
