# Cómo se desarrolló ObraClara con IA

## 1. Contexto

El profesor pidió conocer los prompts usados en el desarrollo. Se le explicó por correo el método de trabajo y respondió el 20/11/2026 recomendando dos cosas: documentar lo sucedido y generar un prompt integral que permita reconstruir el proyecto. Este documento cumple lo primero; lo segundo está en [`PROMPT-RECONSTRUCCION.md`](PROMPT-RECONSTRUCCION.md).

## 2. Método

- **Herramienta:** desarrollo conversacional con Claude Code, usando el modelo Claude Opus 5.5 con ventana de contexto de 1 M de tokens.
- **Los prompts no fueron uno solo.** Fueron mensajes cortos y sueltos (pedir una función, corregir un error, ajustar un texto) dentro de conversaciones largas. Por eso no existe «el prompt» del proyecto.
- **Los chats no se conservan completos.** Se compactan (la herramienta los resume sola) o se borran, porque con mucho contexto la IA rinde peor y consume más créditos.
- **La continuidad vive en el repositorio:** el README, la carpeta `docs/` y los archivos de instrucciones para agentes. En Claude Code ese archivo se llama `CLAUDE.md`; en Codex o Antigravity el equivalente es `AGENTS.md` (ver [`../AGENTS.md`](../AGENTS.md)). Así, una conversación nueva retoma el trabajo sin recordar la anterior.
- **Revisión humana:** el grupo revisó y probó lo que la IA produjo (pruebas automáticas, evaluación de 40 preguntas, métricas).
- **Reglas del curso:** el uso de IA está permitido en el código y se declara en la Introducción del informe. Está prohibido en la redacción del informe, el workflow, los gráficos del informe y el póster.

## 3. Síntesis por etapas

Redactada a partir del historial de git (79 commits entre el 10 y el 20/11/2026), `docs/PROYECTO.md` y el README. Se resume; no se listan todos los commits.

1. **Servidor MCP, datos y ETL (10/11).** Se solicitó a la IA un servidor MCP sobre el archivo de inversiones del MEF, con carga de datos (ETL), pruebas y despliegue automático. Resultó: `worker/`, `etl/` y la base de datos (`0c9caba`).
2. **Banco de evaluación (10/11).** Se pidió un banco de 40 preguntas con verificadores automáticos, para medir la IA sola frente a la IA con MCP. Resultó: `eval/` (`f5d5943`).
3. **Panel y asistente (10–11/11).** Se pidió una página para probar el asistente con y sin MCP, con la IA del servidor como proveedor, cola de mensajes y chats guardados en el navegador (`f761b3d`, `661f4f6`, `0dab124`).
4. **Rediseño del sitio (10/11 y 19–20/11).** Se pidió un sitio de varias páginas con chat a pantalla completa, capturas reales, sistema visual y animaciones (`d6b06d6`, `4b9555d`).
5. **Archivos y modo agente (13/11).** Se solicitó adjuntar PDF, Word, texto, código y .zip, y descargar respuestas como Word, PDF u otros formatos; el conector hace de intermediario hacia el agente del servidor (`b9a3433`, `cc38b6b`, `7609cd9`).
6. **Evaluación completa y métricas (18/11).** Se pidió ejecutar las 40 preguntas en ambas condiciones, con criterios estrictos (exactitud, cifras no sustentadas, latencia mediana y p90), y métricas reproducibles de calidad de datos, alertas, rendimiento y exactitud. Resultó: `metricas/` y `eval/` (`f1c9437`, `360c9f8`, `39b00bc`).
7. **Documentación en lenguaje sencillo (18/11).** Se pidió la página `/proyecto`, `docs/PROYECTO.md`, una guía de exposición y una guía para redactar el informe (`80e101f`, `abea42f`, `d5fc303`).
8. **Correcciones tras las mentorías del 18/11.** Se pidió que el asistente fuera un cliente de la API del agente, con cola de mensajes, botón Detener, mensajes al turno en curso, chats compartibles por enlace y vista previa de adjuntos (`e9182c5`, `e643c00`, `ab8b95f`, `f5186dd`).
9. **Varios modelos y página de evaluación (19/11).** Se solicitaron corridas con otros modelos (gpt-oss-120b en Groq y Gemini 3.5 Flash-Lite), la página `/evaluacion` con las 40 preguntas y filtros, y la página `/demo` con casos preparados y prueba en vivo (`955ec9b`, `a0c70f1`, `52ebb99`).
10. **Demo en vivo y gráficos en el chat (20/11).** Se pidió un panel doble (IA sola frente a IA con MCP), gráficos dentro de las respuestas, cifras rotativas en el inicio y un banco de 49 sugerencias (`7261d9e`, `7d6fffc`, `22ce054`).
11. **Cambios tras la exposición del 20/11.** Se solicitó una reconexión sin «modo de emergencia», recuperar turnos interrumpidos, varias conversaciones a la vez, memoria del asistente en el navegador y un aviso de despliegue solo para exposiciones anunciadas (`95af9d4`, `e3ae59e`, `aada622`, `a7e94a1`).
12. **Reglas contra engaños y recall redefinido (20/11).** Se pidió exigir la consulta a las herramientas antes de responder (de 4 de 24 a 21 de 24 correctas en la prueba de punta a punta; al repetirla el mismo día dio 20 de 24), ampliar el rendimiento a 120 llamadas y redefinir recall y precisión según lo que pide cada pregunta (`4ba78f9`, `3428d36`, `c06d493`).

## 4. Qué conserva el repositorio como evidencia

- **Historial de git:** cada cambio con fecha y mensaje en español.
- **GitHub Actions:** registro de pruebas y despliegues.
- **`eval/`:** banco de 40 preguntas, resultados por modelo y puntajes.
- **`metricas/`:** scripts y resultados reproducibles.
- **`docs/`:** [`PROYECTO.md`](PROYECTO.md), [`EXPOSICION.md`](EXPOSICION.md), [`PROMPT-RECONSTRUCCION.md`](PROMPT-RECONSTRUCCION.md) y el material de apoyo.
