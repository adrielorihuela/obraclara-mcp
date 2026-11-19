# Guía de exposición: ObraClara Perú

Guía para que los 4 integrantes del Grupo 1 expliquen el proyecto a un público **sin conocimientos de tecnología, inteligencia artificial ni MCP**. Todas las cifras salen de la evaluación (`eval/resultados/`), de las métricas (`metricas/resultados/`) y del archivo del MEF con corte al 10 de noviembre de 2026. Detalle completo en [`PROYECTO.md`](PROYECTO.md); referencias en [`../fuentes/REFERENCIAS.md`](../fuentes/REFERENCIAS.md).

> **Recordatorio de las reglas del curso.** Se puede usar IA para el código (declarado en la Introducción) y para el PPT (declarándolo en una diapositiva). **No** se puede usar IA para la redacción del informe, el workflow, los gráficos del informe ni el póster: esos los hace el grupo con sus palabras.

## 1. El mensaje central, en una frase

**«Un asistente de IA que responde de memoria puede equivocarse; ObraClara lo conecta con el registro oficial de obras públicas para que responda con datos reales, con su fuente y su fecha.»**

Si el público solo recuerda una cosa: *de 40 preguntas, sin la conexión acertó 3 y con la conexión acertó las 40.*

## 2. Guion por bloques (10 minutos)

| Bloque | Tiempo | Quién (sugerido) | Qué decir |
|---|---|---|---|
| 1. Problema | 1:30 | Integrante 1 | Hay obras públicas (colegios, hospitales, carreteras) que se detienen. El MEF identificó **684 inversiones vinculadas a obras paralizadas**, que cuestan **S/ 21 141 millones**; faltan por gastar S/ 8 041 millones. Los datos son públicos, pero están en un archivo de 247 MB con 150 641 filas: nadie común lo puede leer. |
| 2. La idea | 1:00 | Integrante 1 | Que cualquier persona pregunte en castellano y reciba una respuesta con la cifra oficial. «No queremos una IA que opine; queremos una que consulte y cite.» |
| 3. Cómo funciona | 1:30 | Integrante 2 | Analogía de la **biblioteca**: el asistente es quien pregunta, el servidor es el bibliotecario y la base de datos es el archivo. Sin MCP, el asistente responde de memoria; con MCP, abre el registro oficial y te muestra la página. El MCP es el «enchufe» estándar que lo permite. |
| 4. Demostración en vivo | 2:30 | Integrante 3 | Ver sección 3. |
| 5. Resultados | 1:30 | Integrante 4 | 40 preguntas, mismas en ambas condiciones. Sin conexión: 3 correctas (8 %), 4 con fuente (10 %), 21 con cifras que no coinciden (53 %). Con conexión: 40 correctas (100 %), 40 con fuente, 0 inventadas. Además, las herramientas coinciden con la base: 30 de 30 fichas, 810 de 810 campos, 10 de 10 resúmenes y 14 de 14 listas de alertas. Costo: con la conexión tarda más (20,2 s frente a 11,1 s). |
| 6. Límites | 1:00 | Integrante 2 | Las alertas son señales, no pruebas; los datos tienen fecha de corte; la evaluación se hizo una sola vez; el asistente gratuito puede estar apagado y entonces responde un respaldo. |
| 7. Impacto (ODS 16) | 0:30 | Integrante 4 | Instituciones transparentes y acceso a la información (metas 16.6 y 16.10): cualquier ciudadano, periodista o regidor puede consultar sin ser experto. |
| Cierre | 0:30 | Integrante 1 | Repetir el mensaje central e invitar a probarlo: https://obraclara.adrielorihuela.net |

**Consejos.** Un solo mensaje por diapositiva; no leer el texto; no decir «MCP» sin la analogía del enchufe; mostrar los números como «3 de 40» y «40 de 40» antes que porcentajes.

## 3. Demostración en vivo (`/asistente`)

Abrir https://obraclara.adrielorihuela.net/asistente. Hacer **la misma pregunta dos veces**: primero con el interruptor de MCP **apagado**, luego **encendido**. Mostrar la tarjeta de la herramienta que se despliega (qué pidió y qué recibió).

**Pregunta 1 (obra concreta).** «¿Cuánto cuesta el Hospital de Alta Complejidad de Piura?»
- Con MCP debe dar el costo actualizado **S/ 955 063 507,44** y el monto viable **S/ 926 136 650,00** (código 2507146), citando al MEF y la fecha 10/11/2026.
- Sin MCP dará una cifra de memoria o de otra fuente, sin la fecha de corte.

**Pregunta 2 (resumen).** «¿Cuántas inversiones hay en Moquegua y cuántas tienen alertas?»
- Con MCP: **1 767 inversiones**, costo S/ 20 049 064 306,37, **514** con alerta de sobrecosto y **252** con posible paralización.
- Sin MCP: números distintos o sin fuente.

**Plan B si el asistente tarda o está apagado.** Las respuestas pueden tardar hasta 20 s; llenar el silencio explicando qué hace el servidor. Si no responde, usar la página `/datos` (búsqueda directa, sin IA) o mostrar las capturas de la página de inicio, que son reales. Probar las dos preguntas **antes** de exponer: las respuestas del asistente cambian entre intentos.

**Demostración de benchmarks (`/evaluacion`).** Abrir https://obraclara.adrielorihuela.net/evaluacion: (1) mostrar las tarjetas («sin MCP acertó 3 de 40; con MCP, 40»); (2) bajar a los gráficos y a la comparación entre modelos («el MCP mejora a todos los modelos, no solo a uno»); (3) en «Las 40 preguntas», filtrar por tipo (por ejemplo **Alertas**) o buscar «Cusco»; (4) abrir **Ver respuesta** de una pregunta y comparar lo que contestó la IA sola (cifras de otras fuentes, sin fecha de corte) con lo que contestó con MCP (cifra oficial, fuente y fecha, y la herramienta usada). Funciona también en el celular.

## 4. Los conceptos, explicados sencillo

- **Inteligencia artificial (IA):** programas que hacen tareas que antes pedían una persona, como entender un texto o responder una pregunta.
- **Modelo de lenguaje:** el programa de IA que entiende y escribe texto, como el asistente de un chat. Aprendió leyendo muchísimos textos, por eso redacta bien, pero no consulta datos actuales por sí solo.
- **Alucinación:** cuando el asistente da un dato falso con total seguridad porque responde de memoria y rellena lo que no sabe. Es como alguien que no quiere decir «no sé».
- **MCP:** un «enchufe» estándar que permite a un asistente consultar una fuente de datos real en vez de responder de memoria.
- **Herramientas:** las funciones que el asistente puede usar por el enchufe. ObraClara tiene cuatro: buscar obras, ver el detalle de una, listar alertas y resumir una entidad o región.
- **Servidor:** programa siempre encendido en internet que recibe preguntas y las responde.
- **Base de datos:** archivo organizado para encontrar información rápido, como un fichero con cajones y etiquetas.
- **Datos abiertos:** información pública que cualquiera puede descargar. Aquí, el archivo de inversiones del MEF (licencia ODC-BY).
- **Alertas:** señales para revisar una obra con más atención. *Sobrecosto:* hoy cuesta 50 % o más de lo aprobado. *Posible paralización:* 40 % a 99 % de avance y 6 meses o más sin gasto. No son prueba de nada.
- **Métricas:** números que miden qué tan bien funciona: cuántas respuestas fueron correctas (exactitud), cuántas dijeron la fuente y la fecha (cita) y cuántas traían cifras que no coinciden (inventada).
- **Devengado, monto viable, costo actualizado:** devengado es el gasto que el Estado reconoce como ya realizado; monto viable es lo que costaba la obra al aprobarse; costo actualizado es lo que cuesta hoy.

## 5. Veinte preguntas probables y respuestas cortas

**1. ¿Qué problema resuelven exactamente?**
Los datos de obras públicas son abiertos pero difíciles de usar: un archivo de 247 MB con 150 641 filas y términos técnicos. ObraClara deja preguntar en castellano y responde con la cifra oficial, la fuente y la fecha.

**2. ¿Qué es el MCP y por qué lo necesitan?**
Es un «enchufe» estándar para que un asistente de IA consulte una fuente real. Sin él, el asistente responde de memoria. Con él, primero revisa el registro y luego responde.

**3. ¿Por qué no basta con preguntarle a un chat de IA?**
Porque responde de memoria y puede inventar. En nuestra prueba, sin la conexión acertó 3 de 40 preguntas y en 21 dio cifras que no coinciden con el registro oficial.

**4. ¿Cómo midieron que funciona?**
Con 40 preguntas (10 de búsqueda, 10 de detalle, 10 de alertas y 10 de resumen) cuya respuesta verificamos antes en el archivo del MEF. Se las hicimos al mismo asistente sin y con la conexión. Con conexión acertó las 40 y citó la fuente en las 40.

**5. ¿100 % no es sospechoso?**
Es razonable: con la conexión el asistente no adivina, copia datos de la base. Además comprobamos las herramientas contra la base directamente: 30 de 30 fichas idénticas (810 de 810 campos), 10 de 10 resúmenes y 14 de 14 listas de alertas. Aun así, fue una sola corrida y la puntuación es automática; lo decimos como limitación.

**6. ¿Qué significa «inventada» y por qué 53 %?**
Que la respuesta trae cifras que no coinciden con el registro del MEF. Es un máximo: sin conexión el asistente a veces cita otras fuentes reales (Contraloría, prensa) con cifras distintas; la regla las cuenta como inventadas aunque no sean falsas. Además medimos «exacta estricta» (todas las cifras relevantes se pueden comprobar): sin conexión 2 de 40, con conexión 39 de 40; la regla original era algo generosa porque bastaba que una cifra coincidiera.

**7. ¿Por qué con la conexión tarda más?**
Porque primero consulta el registro (en la evaluación, 20,2 s frente a 11,1 s por pregunta, sin reintentos). Preferimos esperar unos segundos más a recibir un dato equivocado.

**8. ¿Qué tan rápido es el servidor?**
En 100 llamadas de prueba desde Lima, todas funcionaron (100 % de éxito) y casi todas respondieron en menos de 3 segundos (el 95 % tardó menos de 2,7 s). El asistente completo tarda unos 7 a 10 segundos.

**9. ¿Una alerta significa que hay corrupción?**
No. Es una señal para mirar con más atención, como la luz del tablero de un auto. Un sobrecosto puede deberse a una ampliación aprobada; que no haya gasto en seis meses puede ser un trámite o que la obra ya terminó. Siempre hay que verificar en la fuente oficial.

**10. ¿Por qué las alertas dan 16 502 paralizadas si el MEF dice 684?**
Son cosas distintas: el MEF cuenta obras paralizadas en el sentido de la ley (684, a marzo de 2026); ObraClara revisa las 150 574 inversiones activas con una regla simple (avance físico y último gasto) y a noviembre de 2026. Las alertas sirven para priorizar qué revisar, no para contar paralizadas.

**11. ¿De dónde salen los criterios de las alertas?**
La Ley N.° 31589 considera paralizada una obra con 40 % o más de avance y seis meses sin ejecución física. Nuestra alerta la aproxima con los datos disponibles: el archivo no trae si el contrato se resolvió ni si la entidad declaró la paralización, por eso decimos «posible».

**12. ¿Por qué no dejan que la IA escriba la consulta a la base de datos (SQL) ella sola?**
Porque no es confiable. En BIRD, un banco de pruebas de consultas a bases de datos, ChatGPT acertó 40,08 % frente a 92,96 % de las personas (Li et al., 2023). Por eso la IA solo elige una de cuatro herramientas y el servidor ejecuta una consulta fija y segura.

**13. ¿Qué datos usan y son confiables?**
Una sola fuente oficial: el archivo «Información de inversiones públicas» del MEF, datos abiertos con licencia ODC-BY. Descargado el 10 de noviembre de 2026 y recargado cada semana. Tiene vacíos (por ejemplo, falta el avance físico en 57,3 % de las obras) y lo decimos.

**14. ¿Y la privacidad y la seguridad?**
Todos los datos son públicos y de entidades, no de personas; el servidor no pide cuenta ni clave. Las herramientas solo leen (no modifican nada), los parámetros se validan y hay un límite de 60 solicitudes por minuto por cliente. El conector del grupo no abre puertos: se conecta hacia afuera.

**15. ¿Qué pasa si se cae la IA?**
El sitio sigue funcionando: la búsqueda directa de `/datos` no usa IA. Si se apaga el computador del grupo que atiende al asistente, el chat usa un respaldo automático, y el servidor consulta una copia de la base en la nube. Lo malo: ese respaldo puede dar menos resultados durante la recarga semanal.

**16. ¿Cuánto cuesta?**
Nada: usamos el plan gratuito de Cloudflare y un computador del grupo. Es la razón por la que hay límites de uso y por la que el asistente gratuito puede estar ocupado.

**17. ¿Qué hizo la IA y qué hizo el grupo?**
La IA ayudó a escribir el código, y está declarado. El grupo lo revisó y probó: 115 pruebas automáticas pasan y se evaluó contra los datos oficiales. La redacción del informe, el workflow, los gráficos del informe y el póster los hizo el grupo sin IA; el PPT puede llevar ayuda de IA declarada.

**18. ¿Cuáles son las limitaciones?**
Los datos tienen fecha de corte; las alertas son aproximaciones; la evaluación fue de una sola corrida y puntuada por un programa; el asistente gratuito es compartido y puede tardar o estar apagado.

**19. ¿Qué mejorarían?**
Repetir la evaluación varias veces y revisar a mano los casos dudosos; acercar la alerta de paralización a la ley (distinguir contrata de administración directa); sumar otras fuentes oficiales para contrastar cifras.

**20. ¿Cómo aporta al ODS 16?**
Directamente a las metas 16.6 (instituciones transparentes que rindan cuentas) y 16.10 (acceso público a la información), porque vuelve consultables datos que ya eran públicos. A la meta 16.5 (reducir la corrupción) solo de forma indirecta: facilita la vigilancia ciudadana, pero las alertas no prueban irregularidades.

## 6. Lista de verificación antes de exponer

- [ ] Probar las dos preguntas de la demostración con MCP apagado y encendido (las respuestas cambian entre intentos).
- [ ] Llevar capturas de respaldo (están en la página de inicio y en `docs/capturas/`).
- [ ] Declarar en el PPT si se usó IA para hacerlo.
- [ ] Verificar que el póster, los gráficos del informe y la redacción del informe los hizo el grupo sin IA.
- [ ] Ensayar con cronómetro: 10 minutos, cada integrante domina sus bloques y la pregunta que le toca.
- [ ] No afirmar que una alerta prueba irregularidades; no afirmar que el sistema funciona sin fallas.
