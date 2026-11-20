# Prompt de reconstrucción de ObraClara Perú

> **Prompt reconstruido a partir del proyecto desarrollado; no corresponde necesariamente a las instrucciones originales.**

Cómo se generó: leyendo el código del repositorio (`worker/`, `conector/`, `etl/`, `eval/`, `metricas/`, `.github/workflows/`, `README.md`, `docs/PROYECTO.md`) el 20/11/2026, con ayuda de IA. Úsalo como punto de partida para que otra IA construya una aplicación equivalente desde cero.

---

## 0. Cómo debes trabajar

Eres un ingeniero de software senior. Construye la aplicación descrita abajo, completa y con pruebas. Reglas generales:

- Responde y escribe todos los textos visibles, comentarios, mensajes de commit y documentación en **español**.
- No inventes datos: toda cifra que muestre la aplicación sale de la base de datos o de los resultados de evaluación, nunca de una IA ni de texto escrito a mano.
- Entrega por fases, ejecutando las pruebas al terminar cada una: (1) ETL y base de datos, (2) servidor MCP y consultas, (3) sitio web, (4) asistente con agente y conector, (5) evaluación y métricas, (6) despliegue.
- Si algo no queda definido aquí, elige la opción más simple y déjala anotada en `docs/PROYECTO.md`.

---

## 1. Objetivo y público

**Construye ObraClara Perú**: un sitio y un servidor MCP (Model Context Protocol) público que permiten a cualquier persona preguntar, en castellano, por las **inversiones públicas activas del Perú** (colegios, hospitales, carreteras, saneamiento) y recibir una respuesta con **la cifra oficial, la fuente, el enlace y la fecha de descarga**.

- **Público**: ciudadanos sin conocimientos de tecnología, IA ni MCP. Toda página, texto y documentación debe explicar primero en lenguaje sencillo (analogías, glosario), y dejar el detalle técnico para después.
- **Problema que resuelve**: un asistente de IA que responde «de memoria» inventa cifras. Con ObraClara, la IA consulta primero los datos oficiales mediante herramientas MCP y cita la fuente. La aplicación debe poder demostrar la diferencia **sin MCP vs con MCP**.
- **Alineación**: ODS 16 (Paz, justicia e instituciones sólidas): transparencia y acceso a la información pública.
- **Aviso permanente**: las alertas (sobrecosto, posible paralización) son **indicios técnicos para orientar la revisión; no prueban irregularidades ni corrupción**. Debe aparecer en las respuestas de las herramientas de alertas, en la página de datos y en el asistente.
- Diseño profesional, sobrio, con animaciones sutiles (hover, clic, carga); que no parezca una plantilla genérica. Claro y oscuro; legible en 1366 px y 390 px.

---

## 2. Datos

### 2.1 Fuente única
Ministerio de Economía y Finanzas (MEF), «Información de inversiones públicas 2001–2026», archivo **`DETALLE_INVERSIONES.csv`** (datos abiertos).
Descarga: `https://fs.datosabiertos.mef.gob.pe/datastorefiles/DETALLE_INVERSIONES.csv`.
Página del conjunto: `https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-inversiones-p%C3%BAblicas-2001%E2%80%932026-mef`.
Son unas 150 mil inversiones activas. La **fecha de corte/descarga** (en la evaluación: `2026-11-10`) se guarda en la tabla `meta` y se muestra en todo.

### 2.2 Columnas del CSV que se usan (CSV → tabla `inversiones`)
`CODIGO_UNICO`→`codigo_unico` (clave), `NOMBRE_INVERSION`→`nombre`, `ENTIDAD`→`entidad`, `NIVEL`→`nivel` (códigos GL local, GR regional, GN nacional), `SECTOR`→`sector`, `FUNCION`→`funcion`, `DEPARTAMENTO`, `PROVINCIA`, `DISTRITO`, `UBIGEO`, `MONTO_VIABLE`→`monto_viable`, `COSTO_ACTUALIZADO`→`costo_actualizado`, `PIM_ANIO_ACTUAL`→`pim_anio`, `DEV_ANIO_ACTUAL`→`dev_anio`, `SALDO_EJECUTAR`→`saldo_ejecutar`, `MONTO_LAUDO`→`monto_laudo`, `AVANCE_FISICO`→`avance_fisico`, `AVANCE_EJECUCION`→`avance_ejecucion`, `ULTIMO_DEVENGADO` (AAAAMM)→`ultimo_devengado`, `FEC_INI_EJECUCION`, `FEC_FIN_EJECUCION` (se recortan a 10 caracteres), `SITUACION`, `NUM_HABITANTES_BENEF`→`habitantes`.

Columnas calculadas por el ETL: `sobrecosto_pct`, `meses_sin_devengado`, `alerta_sobrecosto` (0/1), `alerta_paralizacion` (0/1), y columnas de búsqueda normalizadas (mayúsculas, sin tildes): `busqueda` (nombre + entidad + distrito + provincia), `entidad_n`, `funcion_n`, `departamento_n`.

### 2.3 ETL (`etl/`)
- `etl/inversiones.py`: Python 3.12, **solo biblioteca estándar**. Uso: `python etl/inversiones.py --csv DETALLE_INVERSIONES.csv --out build/ [--fecha AAAA-MM-DD] [--lote 40] [--filas-por-archivo 4000]`.
  Lee el CSV (`utf-8-sig`), **descarta códigos únicos repetidos** (se queda con el primero y cuenta los omitidos), convierte números vacíos a `NULL`, calcula los indicadores y escribe `build/data_000.sql, data_001.sql…` (INSERT por lotes de 40 filas, 4000 filas por archivo) y `build/meta.sql`. Imprime `filas`, `repetidos_omitidos`, `alerta_sobrecosto`, `alerta_paralizacion`.
  `meta` guarda: `fecha_descarga`, `total_inversiones`, `alertas_sobrecosto`, `alertas_paralizacion`, `fuente` («Ministerio de Economía y Finanzas, Información de inversiones públicas 2001-2026») y `url`.
  **Todo cálculo lo hace este código determinista; el modelo de lenguaje no calcula nada.**
- `etl/schema.sql`: crea `meta(clave PK, valor)` e `inversiones(...)` con índices sobre `entidad_n`, `departamento_n`, `funcion_n`, `nivel`, `(alerta_sobrecosto, sobrecosto_pct)` y `(alerta_paralizacion, costo_actualizado)`.
- `etl/cargar_sqlite.py`: `python etl/cargar_sqlite.py --build build/ --db ~/.local/share/obraclara/inversiones.db`. Crea la base SQLite **local** (en una máquina propia) con el mismo esquema, carga los `data_*.sql` y `meta.sql`, ejecuta `ANALYZE` y la reemplaza de forma atómica (archivo temporal + renombrar).
- Carga a **D1** (respaldo): manual, con `wrangler d1 execute obraclara --remote --file ...` (schema, `meta.sql`, cada `data_*.sql`) y verificación con `SELECT COUNT(*)`. Está en el workflow `etl.yml`, solo `workflow_dispatch`, porque recargar ~150 mil filas con sus índices supera las 100 000 escrituras diarias del plan gratuito.

### 2.4 Alertas: reglas exactas
Constantes del ETL (`UMBRAL_SOBRECOSTO = 0.50`, `UMBRAL_AVANCE_MIN = 40.0`, `MESES_SIN_DEVENGADO = 6`):

- `sobrecosto_pct = round((costo_actualizado − monto_viable) / monto_viable × 100, 2)`, solo si `monto_viable > 0` y `costo_actualizado` no es nulo; si no, `NULL`.
- **Alerta de sobrecosto** = `sobrecosto_pct >= 50`.
- `meses_sin_devengado = (año_ref − año_ultimo_devengado) × 12 + (mes_ref − mes_ultimo_devengado)`, con la fecha de descarga como referencia; `NULL` si `ultimo_devengado` no es `AAAAMM` válido (mes 1–12).
- **Alerta de posible paralización** = `40 <= avance_fisico < 100` **y** `meses_sin_devengado >= 6`. Es una aproximación de la Ley 31589 (avance físico y último mes con gasto devengado).
- Limitación documentada: `avance_fisico` está vacío en ~57 % de las inversiones, así que la alerta solo se evalúa donde hay dato.

---

## 3. Funcionalidades

### 3.1 Servidor MCP (`POST /mcp`, Streamable HTTP, público, sin login)
Servidor `obraclara-peru` v0.1.0 con las siguientes `instructions` (resúmelas fielmente): cita siempre `fuente` y `fecha_descarga`; si hay cero resultados o error, dilo y no completes cifras; los montos están en soles (S/) y no se hacen cálculos propios; las alertas son indicios, no prueban irregularidades; la paralización es aproximación de la Ley 31589.

Filtros comunes (todos opcionales): `entidad` (texto; cada palabra se busca por separado, ignorando enlaces «de, del, la, los…»), `departamento` (igualdad sin tildes ni mayúsculas), `funcion` (igualdad exacta normalizada: «Salud» no trae «SALUD Y SANEAMIENTO»), `nivel` (`local|regional|nacional` y sinónimos → GL/GR/GN; si no se reconoce, error claro). `limite`: entero 1–20 (por defecto y máximo 20).

| Herramienta | Parámetros | Salida |
|---|---|---|
| `buscar_inversiones` | `texto?`, filtros, `limite?` | `{total, mostrados, inversiones[]}` ordenadas por `costo_actualizado` desc. `total` es el conteo completo aunque solo se muestren 20. |
| `detalle_inversion` | `codigo_unico` (string) | Ficha completa (montos, avance físico y de ejecución, último devengado, fechas, ubicación, habitantes, alertas) o `null` con aviso «No existe una inversión activa con código único X». |
| `alertas_inversion` | `tipo`: `sobrecosto` \| `paralizacion`, filtros, `limite?` | Igual que buscar; orden por `sobrecosto_pct` desc, o por `meses_sin_devengado` desc y luego costo desc. |
| `resumen_inversiones` | filtros | `inversiones`, `costo_actualizado_total`, `devengado_anio_actual`, `saldo_por_ejecutar` (solo saldos positivos), `alertas_sobrecosto`, `alertas_paralizacion`. |

**Formato de salida de toda herramienta**: un bloque de texto con JSON `{datos, fuente, url, fecha_descarga, aviso?}`; `aviso` lleva el texto de que las alertas son indicios. Los errores devuelven `isError: true` con `{error}`.

### 3.2 API HTTP auxiliar
`GET /salud` (estado + `meta`), `GET /api/buscar` y `GET /api/alertas` (mismos filtros por query string; `tipo=paralizacion|sobrecosto`), `GET /api/ia-estado` (si el conector, la base local, imágenes y agente están conectados).

### 3.3 Páginas del sitio (router en `worker/src/pagina.ts`)
Renderizadas en el Worker, sin framework, con una hoja de estilos común servida con caché larga (`worker/src/sitio/layout.ts`):
- `/` inicio; `/asistente` chat; `/proyecto` documentación completa con diagramas y métricas (misma información que `docs/PROYECTO.md`); `/evaluacion` resultados de las 40 preguntas; `/demo` casos preparados; `/datos` explicación de los datos y alertas; `/conectar` cómo conectar el MCP (claude.ai, Claude Code `claude mcp add --transport http obraclara <URL>/mcp`, Claude Desktop, MCP Inspector, `curl`); `/acerca`; `/c/:id` chat compartido; página 404 amigable.

### 3.4 Asistente con agente (`/asistente`)
Cliente web que habla con la «IA del servidor», una **API de agente compatible con OpenAI que ejecuta turnos, herramientas MCP remotas y archivos**. ObraClara **no implementa la lógica del agente**: solo la muestra como chat y le añade su propio servidor MCP (`/mcp`) cuando el visitante activa «con MCP». Construye:
- Chat con pantalla inicial de **sugerencias** al azar (banco en `worker/src/lib/sugerencias.ts`: tipos `xlsx`, `docx`, `pdf`, `pptx`, `rapida`; al menos una de archivo y una rápida; botón para barajar).
- Interruptor **con MCP / sin MCP** para comparar.
- **Pasos / línea de tiempo** del turno («Proceso · N pasos · tiempo · modelo»): eventos `paso`, `herramienta`, `archivo`, `mensaje_incorporado`, `fin`, `error`, consultados con `GET /api/agente/eventos?chat_id=…&desde=N`.
- **Reconexión**: si el conector cae, el navegador muestra «Reconectando…», espera su regreso y reenvía, o **recupera** la respuesta del turno que la API siguió haciendo (`POST /api/agente/recuperar`). Los chats no se pierden.
- **Editar y reintentar** un mensaje (`/api/agente/rehacer`) y **ramas** de conversación (`/api/agente/rama`).
- **Archivos adjuntos** (hasta ~25 MB en total por petición, en base64): texto, PDF, DOCX, imágenes y `.zip` (se lista su árbol y se ignoran archivos basura); **archivos generados** por el agente (Word, PDF, Excel, presentaciones) que se descargan uno a uno o como `.zip` (`GET /api/agente/archivos.zip?chat_id=…`).
- **Gráficos** dentro de la respuesta: bloques de código ```` ```grafico ```` con JSON `{tipo: barras|columnas|lineas|torta|dispersion, titulo, x[], series[{nombre, valores[]}], unidad}`, validados (1–80 categorías, 1–8 series, alias de tipo) y dibujados en SVG; si el JSON no sirve se muestra como código (`worker/src/lib/grafico.ts`, `worker/src/grafico-js.ts`).
- **Memoria** del asistente (notas ≤ 300 caracteres, máx. 30) guardada **solo en el navegador** (IndexedDB, respaldo en localStorage) y enviada con cada mensaje; con interruptor y botón para borrarla.
- **Historial de chats local**: IndexedDB (`obraclara`, almacén `kv`), con recorte de imágenes viejas.
- **Chats compartidos**: botón «Compartir» → `POST /api/compartir` crea un enlace público de solo lectura `/c/:id` (id base62 de 12 caracteres) y devuelve un **token de borrado**; `DELETE /api/compartir/:id` con cabecera `x-token`. Se guarda en D1 (tabla `compartidos`: `id, creado, titulo, datos, token_hash` con SHA-256 del token; migración `worker/migrations/0002_compartidos.sql`). Límites: 60 mensajes, 20 000 caracteres por mensaje, 200 KB de texto, 3 imágenes de ≤ 300 KB (JPEG/PNG/WebP). Se enmascaran claves de API (`sk-…`, `gsk_…`, `AIza…`, `Bearer …`) y caracteres de control.
- **Configuración / «Mi propia clave de API»**: el visitante puede usar su propio proveedor desde el navegador (plantillas OpenAI, Groq, Google Gemini, NVIDIA NIM, OpenRouter, Anthropic, u otra API compatible con OpenAI). La clave nunca pasa por el Worker.
- Fallback sin agente: `POST /api/chat` (chat simple, ver 5.3).

### 3.5 `/demo`, `/evaluacion` y métricas
- `/demo`: 4 casos preparados (buscar, detalle, alertas, resumen) con gráficos hechos con datos reales de la evaluación (`worker/src/sitio/demo-datos.ts`, generado por `eval/exportar_demo.mjs`), explicación de 4 pasos y «Probar en vivo»: un panel doble que envía la misma pregunta a la IA sola y a la IA + MCP.
- `/evaluacion`: resultados globales, por tipo, latencia, tabla de las 40 respuestas (datos generados por `eval/exportar_sitio.mjs` en `worker/src/sitio/evaluacion-datos.ts`) y exportación de cada respuesta a Markdown.
- Métricas (`metricas/`, Python solo con biblioteca estándar): calidad de datos y alertas, rendimiento del MCP (30 llamadas por herramienta; media, p50, p90, p95, máximo, éxito, tamaño), exactitud frente a la base, pruebas y cobertura, evaluación, asistente/agente y tiempos de carga. `bash metricas/todo.sh` regenera todo, con `--sin-red` opcional; salida en `metricas/resultados/` (`metricas.json` y CSV UTF-8 con BOM). Ninguna cifra se escribe a mano. `metricas/exportar_sitio.mjs` alimenta los gráficos de `/proyecto`.

---

## 4. Tecnologías y versiones principales

- **Worker**: TypeScript `^7.0.2` (modo estricto, `ES2022`, `moduleResolution: Bundler`), Cloudflare Workers con `compatibility_date 2026-11-01` y bandera `nodejs_compat`; `wrangler ^4.160.0`; `@cloudflare/workers-types ^5.20261110.1`.
- **MCP**: `@modelcontextprotocol/server ^2.4.0`, `@modelcontextprotocol/sdk ^1.32.2`, `agents ^0.33.0` (`createMcpHandler`), `zod ^4.6.7` (`zod/v4`).
- **Pruebas**: `vitest ^5.1.0`, `@vitest/coverage-v8 ^5.1.0`.
- **Datos**: Python 3.12 (solo biblioteca estándar); SQLite local vía `node:sqlite` (`DatabaseSync`) en el conector; Cloudflare D1.
- **Conector y evaluación**: Node 22 (módulos ESM `.mjs`).
- **Frontend**: HTML/CSS/JS generado desde el Worker (sin bundler ni framework), fuentes locales `public-sans`, `source-serif-4` y `jetbrains-mono` en `worker/public/fonts/` (`woff2`).
- **CI/CD**: GitHub Actions (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/setup-python@v5`).

---

## 5. Arquitectura

### 5.1 Componentes (`worker/wrangler.jsonc`)
- **Worker** `obraclara-mcp` (`src/index.ts`), dominio propio vía `routes` (custom domain), activos estáticos en `./public`, `observability` activada.
- **Durable Object `ColaIA`** (binding `COLA`, clase SQLite; migraciones `v1` crea `ColaGpt` y `v2` la renombra a `ColaIA`; usa una única instancia con nombre fijo). Es una **cola en memoria**: no escribe en D1 ni en disco. Hace de puente con el conector:
  - acepta el WebSocket del conector (`/ws`) y reemplaza la conexión anterior;
  - recibe `hola` (capacidades: `sql`, `imagenes`, `agente`), `ping/pong`, `resultado` y `evento`;
  - reenvía consultas SQL (`/consultar`, espera máx. 8 s), preguntas del chat simple (`/preguntar`, máx. 5 pendientes, 85 s), turnos del agente (`/agente`, hasta 6 a la vez, 450 s), descarga de `.zip` (`/zip`, 60 s) y progreso (`/eventos`: hasta 40 chats y 300 eventos por chat, texto ≤ 200 caracteres);
  - si el conector no está o cae a mitad de turno responde `503 {reconectando: true, enviado: bool}`.
- **D1** (binding `DB`, base `obraclara`): copia de respaldo de `inversiones` y `meta`, y tabla `compartidos`.
- **Workers AI** (binding `AI`): respaldo de emergencia.
- **Rate limiting** (`ratelimits` simples): `LIMITER` 60 solicitudes/60 s (MCP, API de datos, `/c/:id`) y `CHAT_LIMITER` 20/60 s (chat, agente, compartir, zip; `recuperar` cuenta aparte). Clave: `cf-connecting-ip`.
- **No hay R2 ni KV**: no los declares.
- **Secretos**: `CONECTOR_SECRET` (contraseña del WebSocket) y `GROQ_API_KEY` (opcional); se cargan como secretos del Worker, nunca en el repositorio.

### 5.2 Conector local (`conector/conector.mjs`, ~270 líneas)
Programa Node que corre en una máquina propia y se conecta **hacia afuera** por WebSocket a `/conector/ws` (la contraseña viaja como subprotocolo y se compara en tiempo constante); **no abre puertos**. Configuración fuera de git (`~/.config/obraclara/conector.env`): `IA_URL` (API compatible con OpenAI, obligatoria; su dirección **no debe aparecer en el repositorio**), `IA_KEY`, `IA_MODELO`, `CONECTOR_SECRET_FILE`, `DB_PATH`, `SITIO`. Hace tres cosas:
1. **SQL local**: abre la base SQLite en **solo lectura** y ejecuta únicamente sentencias `SELECT` de una sola instrucción (rechaza `;`) que **escribe el Worker**, no los visitantes. Así las consultas pesadas no gastan lecturas de D1.
2. **Chat simple**: reenvía los mensajes a `IA_URL/v1/chat/completions` (tiempo máx. 170 s).
3. **Modo agente**: anuncia `agente: true`; llama a `IA_URL/v1/agente` pasando `chat_id`, `mensaje`, `archivos` y, si procede, el servidor MCP del sitio (`SITIO/mcp`); sigue los eventos SSE del chat y los empuja por el WebSocket; descarga adjuntos (≤ 25 MB) y el `.zip` bajo demanda. Es un **cliente delgado**.
Reconexión automática con espera creciente 0,5 s → 1 s → 2 s … hasta 15 s; `ping` periódico. Se ejecuta como servicio de usuario (systemd) con `EnvironmentFile`.

**Caída a D1**: `RespaldoDb` (`worker/src/lib/remotedb.ts`) implementa la misma interfaz `Db`: primero consulta por el conector; si no está conectado, responde error o expira, marca el remoto como caído y ejecuta la misma consulta en D1.

### 5.3 Cadena de proveedores de IA (`worker/src/lib/cadena.ts`)
Para `POST /api/chat` (chat simple), en este orden y **sin que el visitante elija**:
1. **La IA del servidor** (vía el conector; espera hasta 60 s; ya tiene sus propios respaldos; la etiqueta visible es «IA del servidor»).
2. **Workers AI** (respaldo de emergencia): `@cf/openai/gpt-oss-20b` para texto y `@cf/meta/llama-4-scout-17b-16e-instruct` para imágenes. **No debe ser el proveedor principal.**
3. **Groq** (si existe `GROQ_API_KEY`), rotando de modelo: texto `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, `allam-2-7b` (límite de contexto menor); visión `qwen/qwen3.8-27b`.
Cada proveedor que falla (límite, error, apagado) queda **en pausa** un rato (p. ej. 60 s por límite de Groq, 10 min si Workers AI agota su cupo) y se pasa al siguiente; si la conversación excede el contexto del proveedor, se **recortan** los mensajes antiguos en vez de fallar. Los respaldos llevan la etiqueta «respaldo de ObraClara · …». Validación del chat: ≤ 24 mensajes, ≤ 150 000 caracteres, ≤ 3 imágenes (data URL png/jpeg/webp/gif, ≤ ~2 MB cada una). Google Gemini **no** forma parte de esta cadena del servidor: solo es una plantilla del formulario «Mi propia clave».

### 5.4 Diagrama

```
 Visitante (navegador)                         Cliente MCP (Claude, Inspector, curl)
   │  /asistente, /demo, /proyecto …                  │
   │  /api/agente, /api/chat, /api/compartir          │ POST /mcp (Streamable HTTP)
   ▼                                                  ▼
 ┌──────────────────────── Cloudflare Worker (src/index.ts) ───────────────────────┐
 │ páginas del sitio · API · servidor MCP (4 herramientas) · límites de uso        │
 │      │ consultas (interfaz Db = RespaldoDb)             │ chat simple           │
 │      ▼                                                  ▼                       │
 │  Durable Object ColaIA ◄── WebSocket saliente ──►  Conector local (Node)        │
 │      │ (sin conector)                                   │        │              │
 │      ▼                                                  ▼        ▼              │
 │     D1 (respaldo + chats compartidos)        SQLite local   API de agente       │
 │                                              (solo SELECT)  compatible con      │
 │  Respaldo de emergencia: Workers AI → Groq (rotando modelos)  OpenAI + MCP      │
 └─────────────────────────────────────────────────────────────────────────────────┘
 CSV del MEF ─► etl/inversiones.py ─► SQL ─► etl/cargar_sqlite.py ─► SQLite local
                                         └──► wrangler d1 execute (manual) ─► D1
```

---

## 6. Estructura de carpetas

```
obraclara-mcp/
├── worker/                  Cloudflare Worker (TypeScript)
│   ├── src/                 index.ts (rutas), server.ts (MCP), cola.ts (Durable Object ColaIA), pagina.ts (router del sitio),
│   │                        demo.ts (chat del navegador), compartido.ts (/c/:id), grafico-js.ts
│   │   ├── lib/             queries, cadena, remotedb, compartir, agente, agenteapi, grafico, sugerencias, gptjobs
│   │   └── sitio/           páginas (inicio, proyecto, evaluacion, demo-pagina, datos, conectar), layout y estilos, datos generados
│   ├── test/                pruebas vitest (queries, mcp, cadena, compartir, agente, reconexion, sitio, d1fake, zipfake…)
│   ├── public/              fuentes woff2, favicon, imágenes y capturas de evaluación, _headers (caché)
│   ├── migrations/          0002_compartidos.sql
│   └── wrangler.jsonc       bindings, rutas, migraciones de Durable Objects, límites de uso
├── conector/                conector.mjs y LEEME.md (configuración, reconexión, modo agente)
├── etl/                     inversiones.py, cargar_sqlite.py, schema.sql, requirements.txt
├── eval/                    preguntas.csv, run_eval.mjs, score_eval.mjs, cifras.mjs, exportadores y verificadores
│   └── resultados/          raw_sin_mcp/raw_con_mcp.jsonl, resultados.csv, resumen.md, gráficos CSV, modelos/<id>/
├── metricas/                scripts Python de medición, todo.sh, LEEME.md, resultados/
├── fuentes/                 REFERENCIAS.md (APA 7) y copias de documentos oficiales de libre acceso
├── docs/                    PROYECTO.md, EXPOSICION.md, GUIA-INFORME.md, capturas/
├── .github/workflows/       deploy.yml (pruebas y despliegue), etl.yml (carga manual a D1)
├── README.md                explicación sencilla primero, detalle técnico después, diagrama mermaid
└── LICENSE
```

---

## 7. Decisiones de implementación (impleméntalas así)

1. **Consultas fijas y parametrizadas**: la IA nunca escribe SQL. `queries.ts` contiene las únicas sentencias (`?` con `bind`); los filtros pasan por `construirWhere`, que normaliza (NFD, sin tildes, mayúsculas), elimina `%` y `_` del texto y busca cada palabra por separado con `LIKE`. El conector solo ejecuta `SELECT` de una sentencia sobre una base abierta en modo lectura.
2. **Límite de resultados**: máximo 20 por llamada; `total` siempre trae el conteo completo para que la IA no tenga que contar.
3. **Cálculo en el ETL, no en el modelo**: sobrecosto, meses sin devengado y alertas se precalculan; el servidor solo filtra y resume.
4. **Plan gratuito de Cloudflare**: D1 como respaldo (100 000 escrituras/día), consultas pesadas en SQLite local por el conector, cola en memoria (sin escrituras), compartir cuesta 1 escritura por enlace y ver un enlace solo lee. Los límites de uso (`LIMITER`, `CHAT_LIMITER`) protegen el cupo.
5. **Despliegue por GitHub Actions al hacer push** a `main` con cambios en `worker/**` (`deploy.yml`): Node 22, `npm ci`, `npm run typecheck`, `npm test`, carga opcional del secreto `CONECTOR_SECRET` con `wrangler secret put`, `npx wrangler deploy`. Variables de repositorio: `EXPOSICION_EN_CURSO` solo **avisa** (no bloquea) si se despliega durante una presentación, porque desplegar desconecta el conector unos segundos. Secretos del repo: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CONECTOR_SECRET`.
6. **Seguridad**:
   - Un navegador solo puede llamar a `/api/chat`, `/api/agente*` y `/api/compartir` desde el propio sitio (cabecera `Origin` validada; 403 si no coincide). El MCP admite clientes sin `Origin` y navegadores solo desde el dominio del sitio o `localhost`.
   - `chat_id` validado con `^[A-Za-z0-9_-]{1,64}$`; cuerpos máximos (25 MB agente, 1,2 MB compartir) con 413.
   - Tokens de borrado de 192 bits, guardados solo como hash SHA-256 y comparados en tiempo constante; contraseña del conector comparada con `crypto.subtle.timingSafeEqual`.
   - Enmascarar claves de API y caracteres de control en chats compartidos; las claves propias del visitante nunca llegan al Worker.
   - Cabeceras `x-content-type-options: nosniff` y `referrer-policy` en HTML; escape de todo texto dinámico.
   - No exponer datos internos: la dirección de la IA del servidor y las credenciales viven fuera del repositorio; el visitante solo ve «IA del servidor» y no qué proveedor respondió. Verifica con `git grep` que el repositorio no contenga direcciones internas ni claves.
7. **Reglas contra engaños en las respuestas**: las `instructions` del MCP obligan a citar fuente y fecha, decir cuando no hay resultados, no calcular por cuenta propia y no presentar las alertas como prueba de irregularidad. La evaluación mide además las «cifras no sustentadas».
8. **Lógica del agente fuera del Worker**: turnos, mensajes durante un turno, lectura y creación de archivos, reintentos y MCP remoto viven en la API de agente; el Worker solo valida la forma de la petición, la reenvía y devuelve la respuesta. Los scripts del navegador se generan **incrustando funciones puras** de `lib/agente.ts` y `lib/grafico.ts` con `Function.prototype.toString()` (por eso son funciones de nivel superior sin dependencias); una prueba comprueba que el script incrustado se comporta igual que la exportación.
9. **Sin inventar fuentes**: `fuentes/REFERENCIAS.md` lista cada documento oficial (APA 7), su enlace, qué respalda y dónde se usa.

---

## 8. Evaluación (`eval/`)

- **Banco**: `eval/preguntas.csv` con **40 preguntas en 4 tipos** (10 cada uno): `busqueda` (ids B01–B10), `detalle` (D01–D10), `alertas` (A01–A10), `resumen` (R01–R10). Columnas: `id, tipo, pregunta, respuesta_referencia, valor_oficial, unidad, herramienta_esperada, parametros_esperados, fecha_corte, nota`. Hay preguntas cuya respuesta correcta es «no hay datos» (p. ej. B10, A10). Las referencias se calculan de la base con SQL y se verifican con `eval/verificar_referencias.py` y `eval/verificar_csv_pandas.py`.
- **Dos condiciones**: `sin_mcp` (la IA contesta sola) y `con_mcp` (la IA puede llamar a las 4 herramientas de `/mcp`; máx. 5 pasos por pregunta, resultado de herramienta recortado a 15 000 caracteres). `eval/run_eval.mjs` (variable `IA_URL`, API compatible con OpenAI; `--solo`, `--ids`, `--max`; `EVAL_MODELO_ID` guarda otra corrida en `resultados/modelos/<id>/`) escribe `raw_sin_mcp.jsonl` y `raw_con_mcp.jsonl`. `capturar_respuestas.mjs` guarda capturas.
- **Métricas** (`eval/score_eval.mjs`, `node score_eval.mjs`; `cifras.mjs` extrae y normaliza números), todas reproducibles:
  - **Exacta**: la respuesta contiene el valor oficial (tolerancia 1 %).
  - **Exacta estricta**: exacta **y** sin cifras no sustentadas por la fuente.
  - **Cita**: nombra la fuente (MEF, datos abiertos, etc.) **y** la fecha de corte.
  - **Inventada**: da cifras u obras que no coinciden con el registro oficial (se distingue de abstenerse).
  - **Cifras no sustentadas**: porcentaje de respuestas con alguna cifra que no aparece en la fuente.
  - **Revisar**: casos dudosos para revisión manual.
  - **Latencia** (total y sin reintentos), llamadas y reintentos.
  - **Recall, precisión y F1** (solo búsqueda y alertas; 20 preguntas). **Definición vigente**: en **conteos** («¿cuántos…?»), lo pedido es el total: recall = 1 si la respuesta da **exactamente** el total oficial (sin tolerancia); precisión = 1 si el número que da es el correcto, 0 si da otro. En **rankings** («¿cuál es la más cara…?», recall@1), lo pedido es la obra correcta: recall = 1 si su código único aparece; precisión = 1 si el primer código que nombra es el correcto. En preguntas **sin datos**, no hay recall y la precisión es 0 si nombra algún código. F1 = 2·P·R/(P+R) por pregunta; promedio simple. Conserva, por transparencia, la primera definición «de listado» (códigos listados frente a los esperados).
- **Salidas**: `resultados/resultados.csv`, `resumen.md`, `graficos_*.csv`, `fuentes_con_mcp.json`, `referencia_items.json`. `exportar_graficos.mjs`, `exportar_sitio.mjs` y `exportar_demo.mjs` generan los datos de `/evaluacion`, `/proyecto` y `/demo`.
- **Resultado de referencia** (corte 10/11/2026, una corrida con la IA del servidor): sin MCP ≈ 8 % exacta, 53 % inventada; con MCP 100 % exacta, 100 % con cita, 0 % inventada. Tu implementación debe reproducir esta diferencia con datos reales, sin ajustar la referencia a las respuestas.
- Las 40 preguntas se ejecutan de nuevo **solo cuando el responsable lo pida**.

---

## 9. Criterios de aceptación y verificación

Cumple todos antes de dar el trabajo por terminado:

1. `cd worker && npx vitest run && npx tsc --noEmit -p . && npx wrangler deploy --dry-run` termina sin errores. Hay pruebas para: consultas y filtros (`queries`), las 4 herramientas MCP y su formato `{datos, fuente, url, fecha_descarga, aviso?}` (`mcp`), cadena de proveedores y pausas (`cadena`), respaldo D1 (`remotedb`), chats compartidos (`compartir`), validación del agente y reconexión (`agenteapi`, `reconexion`), gráficos, sugerencias y que el script incrustado coincide con las funciones puras (`agente`, `demo`), y las páginas del sitio (`sitio`).
2. `python etl/inversiones.py --csv DETALLE_INVERSIONES.csv --out build --fecha 2026-11-10` produce `data_*.sql` y `meta.sql` y muestra el conteo de filas y de cada alerta; `python etl/cargar_sqlite.py --build build --db <ruta>` crea la base y `SELECT COUNT(*) FROM inversiones` coincide con `total_inversiones` de `meta`.
3. Las reglas de alerta coinciden exactamente con 2.4 (casos límite: sobrecosto de 49,99 % no alerta y 50 % sí; avance físico 40 alerta y 100 no; 6 meses sí y 5 no).
4. **MCP Inspector** (`npx @modelcontextprotocol/inspector`) contra `https://<tu-dominio>/mcp` (Streamable HTTP) lista exactamente `buscar_inversiones`, `detalle_inversion`, `alertas_inversion` y `resumen_inversiones` y las ejecuta con respuesta que incluye fuente, URL y fecha. `limite` mayor que 20 es rechazado; un `nivel` desconocido devuelve error claro.
5. `GET /salud` devuelve `{"estado":"ok", fecha_descarga, total_inversiones, …}`. Todas las rutas de 3.3 responden 200 en HTML; una ruta inexistente devuelve 404 con página amable si el cliente acepta HTML.
6. Con el conector apagado, `/mcp` y `/api/buscar` siguen respondiendo desde D1 y `/asistente` muestra «Reconectando…» o usa el respaldo de emergencia sin romperse. Con el conector encendido, las consultas pasan por la SQLite local.
7. `cd eval && node score_eval.mjs` puntúa las 40 preguntas y genera `resultados.csv` y `resumen.md` con las métricas de la sección 8; `node exportar_graficos.mjs && node exportar_sitio.mjs` regeneran los datos del sitio. `bash metricas/todo.sh --sin-red` genera `metricas/resultados/metricas.json`.
8. Pruebas visuales en navegador real a 1366 px y 390 px, en claro y oscuro: sin desbordes, tablas legibles, textos comprensibles para un ciudadano.
9. Seguridad: `git grep` no encuentra claves, la dirección de la API de IA ni nombres internos del proveedor; las respuestas de alertas incluyen el aviso «indicios, no prueban irregularidades»; los orígenes no permitidos reciben 403.
10. Un push a `main` que cambie `worker/**` ejecuta tipado, pruebas y despliegue en GitHub Actions; la carga a D1 solo corre a mano.
