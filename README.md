# ObraClara Perú

Servidor MCP público que permite a un asistente de IA consultar datos de inversión pública del Perú (MEF): buscar obras, ver su detalle, detectar alertas y resumir por entidad o región. Proyecto del Grupo 1, curso I.A. Aplicada (ULima).

- **URL del servidor MCP:** https://obraclara.adrielorihuela.net/mcp (Streamable HTTP, pública, sin login)
- Página de presentación: `/` · estado: `/salud`

## Cómo conectarlo

- **claude.ai:** Configuración > Conectores > Agregar conector personalizado, pegar la URL del servidor MCP. No requiere iniciar sesión.
- **Claude Code:**
  ```bash
  claude mcp add --transport http obraclara https://obraclara.adrielorihuela.net/mcp
  ```
- **Claude Desktop:** agregarlo como conector personalizado con la misma URL.
- **MCP Inspector:** `npx @modelcontextprotocol/inspector`, transporte *Streamable HTTP* y la URL de arriba.

## Herramientas

| Tool | Qué hace |
|---|---|
| `buscar_inversiones` | Busca inversiones por texto, entidad, región u otros filtros |
| `detalle_inversion` | Ficha completa de una inversión (costos, avance, devengado) |
| `alertas_inversion` | Lista inversiones con alertas de sobrecosto o posible paralización |
| `resumen_inversiones` | Totales y cifras agregadas por entidad o región |

## Criterios de alerta

- **Sobrecosto:** (costo actualizado − monto viable) / monto viable ≥ 50 %.
- **Posible paralización:** avance físico entre 40 % y 99 % y al menos 6 meses sin gasto devengado (aproximación de la Ley 31589).

Son indicadores calculados con datos abiertos, **no constituyen evidencia de irregularidades**; requieren verificación en la fuente oficial.

## Ejecución local

Requiere Node 22+ y Python 3.12.

```bash
# ETL: genera build/data_*.sql y build/meta.sql
curl -L -o DETALLE_INVERSIONES.csv https://fs.datosabiertos.mef.gob.pe/datastorefiles/DETALLE_INVERSIONES.csv
python etl/inversiones.py --csv DETALLE_INVERSIONES.csv --out build --fecha 2026-11-10

# Pruebas y servidor local
cd worker
npm ci && npm test && npm run typecheck
npx wrangler dev
```

Carga en D1 (desde `worker/`, con credenciales de Cloudflare en el entorno): `npx wrangler d1 execute obraclara --remote --yes --file <archivo>`, primero `etl/schema.sql`, luego `build/meta.sql` y después cada `build/data_*.sql` en orden. El workflow `etl.yml` lo automatiza.

## Arquitectura

1. Fuente única: `DETALLE_INVERSIONES.csv` del MEF (~248 MB).
2. `etl/inversiones.py` normaliza el CSV y genera SQL por lotes.
3. GitHub Actions (`etl.yml`, lunes 08:00 UTC) carga el SQL en la base D1 `obraclara`.
4. Un Cloudflare Worker (TypeScript, en `worker/`) expone el servidor MCP en `/mcp`.
5. Las cuatro tools consultan D1 con SQL parametrizado; hay límite de 60 solicitudes por minuto.
6. `deploy.yml` prueba y despliega el Worker en cada push a `main` que toque `worker/**`.
7. IA del panel: dos proyectos. `gpt-headless` es el proveedor de IA (servicio local con respaldo automático a Workers AI y Groq, acepta imágenes); ObraClara lo usa como única IA mediante un conector saliente (`gpt-bridge/`) y muestra quién respondió. Dos servicios systemd de usuario: `gpt-headless` y `obraclara` (el conector).
8. Respaldo de emergencia: si el conector no está disponible, el Worker responde con Workers AI y Groq («respaldo de ObraClara · modelo»).

## Evaluación

El banco de preguntas y resultados de evaluación está en la carpeta [`eval/`](eval/).

## Datos y licencia

- Datos: Ministerio de Economía y Finanzas (MEF), *Detalle de inversiones*, datos abiertos bajo licencia ODC-BY. Atribución: «Fuente: MEF, Datos Abiertos».
- Código: licencia MIT (ver [LICENSE](LICENSE)).

## Declaración de uso de IA

El código fue desarrollado con ayuda de IA generativa (vibe coding) y revisado y probado por el grupo.

## Limitaciones

- Los datos se actualizan semanalmente; pueden no reflejar el estado más reciente en el MEF.
- La recarga del ETL vacía brevemente la tabla (el esquema hace DROP y recrea), por lo que durante unos minutos las consultas pueden devolver pocos o ningún resultado.
- Las alertas son aproximaciones y no prueban irregularidades.
