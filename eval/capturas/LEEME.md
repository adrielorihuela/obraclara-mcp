# Capturas de las respuestas de la evaluación

Cada imagen muestra, en el chat del sitio (`/asistente`), una de las 40 preguntas de la evaluación y la respuesta de la IA **tal como se registró** en `resultados/raw_sin_mcp.jsonl` y `raw_con_mcp.jsonl`. **No se volvieron a preguntar**: el script abre el chat, le carga la conversación registrada (con las herramientas y argumentos reales que usó la IA, en «con MCP») y la fotografía. Solo se quita el marcado interno del proveedor (etiquetas y saltos de línea escapados), como en el resto del sitio. El veredicto sale de `resultados/resultados.csv`.

Fechas: R02, R03 y R07–R10 se ejecutaron el 18/11/2026; el resto, el 10/11/2026.

Regenerar las 80 de una vez (desde la raíz del repo; si no hay un `wrangler dev` en el puerto 8791, el script lo arranca y lo cierra al terminar):

```bash
node eval/capturar_respuestas.mjs            # las 80, este LEEME.md e indice.json
node eval/capturar_respuestas.mjs "" B01,R02  # solo algunas (no reescribe el índice)
```

`indice.json` lista cada captura con `{id, condicion, archivo, miniatura, veredicto, fecha}`.

Las imágenes están en `worker/public/evaluacion/capturas/` y se ven en https://obraclara.adrielorihuela.net/evaluacion (tabla de las 40 preguntas).

Total: 80 capturas, 13.7 MB (WebP: grande a 2× y calidad 90 para el visor; miniatura de 480 px y calidad 80 para la tabla).

| Pregunta | Condición | Herramientas | Veredicto | Fecha | Captura |
|---|---|---|---|---|---|
| A01 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [A01-sin.webp](../../worker/public/evaluacion/capturas/A01-sin.webp) (109 KB) |
| A01 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A01-con.webp](../../worker/public/evaluacion/capturas/A01-con.webp) (169 KB) |
| A02 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [A02-sin.webp](../../worker/public/evaluacion/capturas/A02-sin.webp) (175 KB) |
| A02 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A02-con.webp](../../worker/public/evaluacion/capturas/A02-con.webp) (183 KB) |
| A03 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [A03-sin.webp](../../worker/public/evaluacion/capturas/A03-sin.webp) (167 KB) |
| A03 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A03-con.webp](../../worker/public/evaluacion/capturas/A03-con.webp) (187 KB) |
| A04 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [A04-sin.webp](../../worker/public/evaluacion/capturas/A04-sin.webp) (192 KB) |
| A04 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A04-con.webp](../../worker/public/evaluacion/capturas/A04-con.webp) (153 KB) |
| A05 | sin MCP | — | ✗ no exacta | 10/11/2026 | [A05-sin.webp](../../worker/public/evaluacion/capturas/A05-sin.webp) (291 KB) |
| A05 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A05-con.webp](../../worker/public/evaluacion/capturas/A05-con.webp) (289 KB) |
| A06 | sin MCP | — | ✗ no exacta | 10/11/2026 | [A06-sin.webp](../../worker/public/evaluacion/capturas/A06-sin.webp) (170 KB) |
| A06 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A06-con.webp](../../worker/public/evaluacion/capturas/A06-con.webp) (222 KB) |
| A07 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [A07-sin.webp](../../worker/public/evaluacion/capturas/A07-sin.webp) (190 KB) |
| A07 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A07-con.webp](../../worker/public/evaluacion/capturas/A07-con.webp) (239 KB) |
| A08 | sin MCP | — | ✗ no exacta | 10/11/2026 | [A08-sin.webp](../../worker/public/evaluacion/capturas/A08-sin.webp) (162 KB) |
| A08 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A08-con.webp](../../worker/public/evaluacion/capturas/A08-con.webp) (151 KB) |
| A09 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [A09-sin.webp](../../worker/public/evaluacion/capturas/A09-sin.webp) (198 KB) |
| A09 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A09-con.webp](../../worker/public/evaluacion/capturas/A09-con.webp) (172 KB) |
| A10 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [A10-sin.webp](../../worker/public/evaluacion/capturas/A10-sin.webp) (270 KB) |
| A10 | con MCP | `alertas_inversion` | ✓ exacta | 10/11/2026 | [A10-con.webp](../../worker/public/evaluacion/capturas/A10-con.webp) (145 KB) |
| B01 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [B01-sin.webp](../../worker/public/evaluacion/capturas/B01-sin.webp) (188 KB) |
| B01 | con MCP | `buscar_inversiones` | ✓ exacta | 10/11/2026 | [B01-con.webp](../../worker/public/evaluacion/capturas/B01-con.webp) (126 KB) |
| B02 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [B02-sin.webp](../../worker/public/evaluacion/capturas/B02-sin.webp) (294 KB) |
| B02 | con MCP | `buscar_inversiones` | ✓ exacta | 10/11/2026 | [B02-con.webp](../../worker/public/evaluacion/capturas/B02-con.webp) (172 KB) |
| B03 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [B03-sin.webp](../../worker/public/evaluacion/capturas/B03-sin.webp) (110 KB) |
| B03 | con MCP | `resumen_inversiones` | ✓ exacta | 10/11/2026 | [B03-con.webp](../../worker/public/evaluacion/capturas/B03-con.webp) (153 KB) |
| B04 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [B04-sin.webp](../../worker/public/evaluacion/capturas/B04-sin.webp) (140 KB) |
| B04 | con MCP | `resumen_inversiones` | ✓ exacta | 10/11/2026 | [B04-con.webp](../../worker/public/evaluacion/capturas/B04-con.webp) (166 KB) |
| B05 | sin MCP | — | ✗ no exacta | 10/11/2026 | [B05-sin.webp](../../worker/public/evaluacion/capturas/B05-sin.webp) (157 KB) |
| B05 | con MCP | `buscar_inversiones` | ✓ exacta | 10/11/2026 | [B05-con.webp](../../worker/public/evaluacion/capturas/B05-con.webp) (115 KB) |
| B06 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [B06-sin.webp](../../worker/public/evaluacion/capturas/B06-sin.webp) (200 KB) |
| B06 | con MCP | `buscar_inversiones` | ✓ exacta | 10/11/2026 | [B06-con.webp](../../worker/public/evaluacion/capturas/B06-con.webp) (189 KB) |
| B07 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [B07-sin.webp](../../worker/public/evaluacion/capturas/B07-sin.webp) (132 KB) |
| B07 | con MCP | `resumen_inversiones` | ✓ exacta | 10/11/2026 | [B07-con.webp](../../worker/public/evaluacion/capturas/B07-con.webp) (126 KB) |
| B08 | sin MCP | — | ✗ no exacta | 10/11/2026 | [B08-sin.webp](../../worker/public/evaluacion/capturas/B08-sin.webp) (128 KB) |
| B08 | con MCP | `buscar_inversiones` | ✓ exacta | 10/11/2026 | [B08-con.webp](../../worker/public/evaluacion/capturas/B08-con.webp) (108 KB) |
| B09 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [B09-sin.webp](../../worker/public/evaluacion/capturas/B09-sin.webp) (288 KB) |
| B09 | con MCP | `buscar_inversiones` | ✓ exacta | 10/11/2026 | [B09-con.webp](../../worker/public/evaluacion/capturas/B09-con.webp) (224 KB) |
| B10 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [B10-sin.webp](../../worker/public/evaluacion/capturas/B10-sin.webp) (482 KB) |
| B10 | con MCP | `buscar_inversiones` | ✓ exacta | 10/11/2026 | [B10-con.webp](../../worker/public/evaluacion/capturas/B10-con.webp) (146 KB) |
| D01 | sin MCP | — | ✗ no exacta | 10/11/2026 | [D01-sin.webp](../../worker/public/evaluacion/capturas/D01-sin.webp) (147 KB) |
| D01 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D01-con.webp](../../worker/public/evaluacion/capturas/D01-con.webp) (163 KB) |
| D02 | sin MCP | — | ✗ no exacta | 10/11/2026 | [D02-sin.webp](../../worker/public/evaluacion/capturas/D02-sin.webp) (429 KB) |
| D02 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D02-con.webp](../../worker/public/evaluacion/capturas/D02-con.webp) (190 KB) |
| D03 | sin MCP | — | ✗ no exacta | 10/11/2026 | [D03-sin.webp](../../worker/public/evaluacion/capturas/D03-sin.webp) (107 KB) |
| D03 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D03-con.webp](../../worker/public/evaluacion/capturas/D03-con.webp) (103 KB) |
| D04 | sin MCP | — | ✗ no exacta | 10/11/2026 | [D04-sin.webp](../../worker/public/evaluacion/capturas/D04-sin.webp) (195 KB) |
| D04 | con MCP | `detalle_inversion` | ✓ exacta (laxa) · ✗ no exacta (estricta): otra cifra sin fuente | 10/11/2026 | [D04-con.webp](../../worker/public/evaluacion/capturas/D04-con.webp) (167 KB) |
| D05 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [D05-sin.webp](../../worker/public/evaluacion/capturas/D05-sin.webp) (237 KB) |
| D05 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D05-con.webp](../../worker/public/evaluacion/capturas/D05-con.webp) (174 KB) |
| D06 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [D06-sin.webp](../../worker/public/evaluacion/capturas/D06-sin.webp) (170 KB) |
| D06 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D06-con.webp](../../worker/public/evaluacion/capturas/D06-con.webp) (209 KB) |
| D07 | sin MCP | — | ✗ no exacta | 10/11/2026 | [D07-sin.webp](../../worker/public/evaluacion/capturas/D07-sin.webp) (140 KB) |
| D07 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D07-con.webp](../../worker/public/evaluacion/capturas/D07-con.webp) (95 KB) |
| D08 | sin MCP | — | ✓ exacta | 10/11/2026 | [D08-sin.webp](../../worker/public/evaluacion/capturas/D08-sin.webp) (157 KB) |
| D08 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D08-con.webp](../../worker/public/evaluacion/capturas/D08-con.webp) (88 KB) |
| D09 | sin MCP | — | ✗ no exacta | 10/11/2026 | [D09-sin.webp](../../worker/public/evaluacion/capturas/D09-sin.webp) (167 KB) |
| D09 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D09-con.webp](../../worker/public/evaluacion/capturas/D09-con.webp) (145 KB) |
| D10 | sin MCP | — | ✓ exacta | 10/11/2026 | [D10-sin.webp](../../worker/public/evaluacion/capturas/D10-sin.webp) (147 KB) |
| D10 | con MCP | `detalle_inversion` | ✓ exacta | 10/11/2026 | [D10-con.webp](../../worker/public/evaluacion/capturas/D10-con.webp) (103 KB) |
| R01 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [R01-sin.webp](../../worker/public/evaluacion/capturas/R01-sin.webp) (115 KB) |
| R01 | con MCP | `resumen_inversiones` | ✓ exacta | 10/11/2026 | [R01-con.webp](../../worker/public/evaluacion/capturas/R01-con.webp) (167 KB) |
| R02 | sin MCP | — | ✗ no exacta | 18/11/2026 | [R02-sin.webp](../../worker/public/evaluacion/capturas/R02-sin.webp) (157 KB) |
| R02 | con MCP | `resumen_inversiones` | ✓ exacta | 18/11/2026 | [R02-con.webp](../../worker/public/evaluacion/capturas/R02-con.webp) (142 KB) |
| R03 | sin MCP | — | ✗ no exacta · con cifras inventadas | 18/11/2026 | [R03-sin.webp](../../worker/public/evaluacion/capturas/R03-sin.webp) (234 KB) |
| R03 | con MCP | `resumen_inversiones` | ✓ exacta | 18/11/2026 | [R03-con.webp](../../worker/public/evaluacion/capturas/R03-con.webp) (157 KB) |
| R04 | sin MCP | — | ✗ no exacta | 10/11/2026 | [R04-sin.webp](../../worker/public/evaluacion/capturas/R04-sin.webp) (77 KB) |
| R04 | con MCP | `resumen_inversiones` | ✓ exacta | 10/11/2026 | [R04-con.webp](../../worker/public/evaluacion/capturas/R04-con.webp) (98 KB) |
| R05 | sin MCP | — | ✗ no exacta | 10/11/2026 | [R05-sin.webp](../../worker/public/evaluacion/capturas/R05-sin.webp) (107 KB) |
| R05 | con MCP | `resumen_inversiones` | ✓ exacta | 10/11/2026 | [R05-con.webp](../../worker/public/evaluacion/capturas/R05-con.webp) (157 KB) |
| R06 | sin MCP | — | ✗ no exacta · con cifras inventadas | 10/11/2026 | [R06-sin.webp](../../worker/public/evaluacion/capturas/R06-sin.webp) (203 KB) |
| R06 | con MCP | `resumen_inversiones` | ✓ exacta | 10/11/2026 | [R06-con.webp](../../worker/public/evaluacion/capturas/R06-con.webp) (153 KB) |
| R07 | sin MCP | — | ✗ no exacta | 18/11/2026 | [R07-sin.webp](../../worker/public/evaluacion/capturas/R07-sin.webp) (211 KB) |
| R07 | con MCP | `resumen_inversiones` | ✓ exacta | 18/11/2026 | [R07-con.webp](../../worker/public/evaluacion/capturas/R07-con.webp) (114 KB) |
| R08 | sin MCP | — | ✗ no exacta | 18/11/2026 | [R08-sin.webp](../../worker/public/evaluacion/capturas/R08-sin.webp) (222 KB) |
| R08 | con MCP | `resumen_inversiones` | ✓ exacta | 18/11/2026 | [R08-con.webp](../../worker/public/evaluacion/capturas/R08-con.webp) (191 KB) |
| R09 | sin MCP | — | ✗ no exacta · con cifras inventadas | 18/11/2026 | [R09-sin.webp](../../worker/public/evaluacion/capturas/R09-sin.webp) (100 KB) |
| R09 | con MCP | `resumen_inversiones` | ✓ exacta | 18/11/2026 | [R09-con.webp](../../worker/public/evaluacion/capturas/R09-con.webp) (160 KB) |
| R10 | sin MCP | — | ✓ exacta (laxa) · ✗ no exacta (estricta): otra cifra sin fuente | 18/11/2026 | [R10-sin.webp](../../worker/public/evaluacion/capturas/R10-sin.webp) (252 KB) |
| R10 | con MCP | `resumen_inversiones` | ✓ exacta | 18/11/2026 | [R10-con.webp](../../worker/public/evaluacion/capturas/R10-con.webp) (168 KB) |
