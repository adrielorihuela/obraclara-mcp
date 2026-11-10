import { esc, fechaLarga, MCP_URL, REPO, shell, type Meta } from "./layout";

const css = String.raw`
.pag-h{padding:clamp(40px,6vw,88px) 0 clamp(32px,4vw,56px);border-bottom:1px solid var(--line)}
.pag-h .lead{margin-top:20px}
.pag-h .inline-url{margin-top:28px}
.doc{display:grid;grid-template-columns:220px minmax(0,1fr);gap:clamp(32px,5vw,72px);padding-top:clamp(40px,5vw,72px);padding-bottom:var(--sec)}
.toc{position:sticky;top:84px;align-self:start;font-size:14px}
.toc p{font:500 12px/1 var(--mono);color:var(--mut);margin-bottom:12px}
.toc ol{list-style:none;margin:0;padding:0;border-left:1px solid var(--line)}
.toc a{display:block;padding:6px 0 6px 14px;margin-left:-1px;border-left:1px solid transparent;text-decoration:none;color:var(--mut)}
.toc a:hover{color:var(--ink)}
.toc a.act{color:var(--ink);border-left-color:var(--accent);font-weight:600}
.doc article>section{padding-bottom:clamp(40px,5vw,64px);margin-bottom:clamp(40px,5vw,64px);border-bottom:1px solid var(--line);scroll-margin-top:84px}
.doc article>section:last-child{border-bottom:0;margin-bottom:0}
.doc h2{font-size:var(--s2);margin-bottom:14px}
.doc p,.doc li{color:var(--ink-2);max-width:68ch}
.doc p+p,.doc ol+p,.doc p+.code,.doc .code+p,.doc ol+.code,.doc .code+.code{margin-top:16px}
.doc ol.pasos-n{margin:16px 0 0;padding-left:1.3em;display:grid;gap:8px}
.doc ol.pasos-n b{color:var(--ink)}
.ref{width:100%;border-collapse:collapse;font-size:15px;margin-top:20px}
.ref th,.ref td{text-align:left;padding:10px 12px 10px 0;border-bottom:1px solid var(--line);vertical-align:top}
.ref th{font:500 12px/1.3 var(--mono);color:var(--mut)}
.ref td:first-child{font-family:var(--mono);font-size:14px;white-space:nowrap;color:var(--ink)}
.ref td{color:var(--ink-2)}
.tool-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;margin:36px 0 6px}
.tool-h:first-of-type{margin-top:12px}
.tool-h h3{font:600 17px/1.3 var(--mono)}
@media (max-width:900px){.doc{grid-template-columns:minmax(0,1fr)}.toc{display:none}}
@media (max-width:560px){.ref td:first-child{white-space:normal;word-break:break-word}}
`;

const scriptToc = String.raw`(function(){var ls=document.querySelectorAll('.toc a');if(!ls.length||!('IntersectionObserver' in window))return;
var m={};ls.forEach(function(a){m[a.getAttribute('href').slice(1)]=a});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){ls.forEach(function(a){a.classList.remove('act')});var a=m[e.target.id];if(a)a.classList.add('act')}})},{rootMargin:'-20% 0px -70% 0px'});
document.querySelectorAll('.doc article>section[id]').forEach(function(s){io.observe(s)})})();`;

const bloque = (titulo: string, copia: string, html: string) =>
  `<div class="code"><div class="code-h">${titulo}<button class="copiar" type="button" data-copy="${esc(copia)}">Copiar</button></div><pre>${html}</pre></div>`;

type Param = [string, string, string];
const FILTROS: Param[] = [
  ["entidad", "texto", "Nombre o parte del nombre de la entidad, p. ej. «Municipalidad Provincial de Piura»."],
  ["departamento", "texto", "Departamento, p. ej. «Cusco»."],
  ["funcion", "texto", "Función exacta, sin importar tildes ni mayúsculas: Transporte, Educación, Saneamiento, Salud, Agropecuaria, Vivienda y Desarrollo Urbano, Energía, entre otras."],
  ["nivel", "texto", "Nivel de gobierno: local, regional o nacional."],
];
const LIMITE: Param = ["limite", "entero", "Cantidad máxima de resultados, de 1 a 20 (por defecto 20)."];

function tabla(ps: Param[], req: string[] = []): string {
  return `<table class="ref"><thead><tr><th>parámetro</th><th>tipo</th><th>descripción</th></tr></thead><tbody>${ps
    .map(([n, t, d]) => `<tr><td>${n}${req.includes(n) ? " *" : ""}</td><td>${t}</td><td>${d}</td></tr>`)
    .join("")}</tbody></table>`;
}

export function conectar(m: Meta): string {
  const curlLista = `curl -s ${MCP_URL} -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;
  const curlLlamada = `curl -s ${MCP_URL} -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"detalle_inversion","arguments":{"codigo_unico":"2117268"}}}'`;
  const cuerpo = `
<section class="pag-h"><div class="wrap">
<p class="eyebrow">Documentación</p>
<h1 style="max-width:15ch">Conecta ObraClara a tu asistente.</h1>
<p class="lead">Es un servidor MCP público por Streamable HTTP. No pide cuenta, clave ni instalación: solo la dirección.</p>
<span class="inline-url"><code>${MCP_URL}</code><button class="copiar" type="button" data-copy="${MCP_URL}">Copiar</button></span>
</div></section>
<div class="wrap doc">
<nav class="toc" aria-label="En esta página"><p>En esta página</p><ol>
<li><a href="#claude-ai">claude.ai</a></li><li><a href="#claude-code">Claude Code</a></li><li><a href="#desktop">Claude Desktop</a></li>
<li><a href="#inspector">MCP Inspector</a></li><li><a href="#http">Desde código</a></li><li><a href="#herramientas">Herramientas</a></li>
<li><a href="#respuesta">Formato de respuesta</a></li><li><a href="#limites">Límites</a></li></ol></nav>
<article>
<section id="claude-ai"><h2>claude.ai</h2>
<ol class="pasos-n"><li>Abre <b>Configuración</b> y entra a <b>Conectores</b>.</li><li>Elige <b>Agregar conector personalizado</b>.</li><li>Ponle un nombre, por ejemplo «ObraClara», y pega la dirección del servidor.</li><li>En una conversación nueva, activa el conector y pregunta.</li></ol>
<p>No hay que iniciar sesión: el conector queda listo al guardarlo.</p></section>

<section id="claude-code"><h2>Claude Code</h2>
<p>Agrega el servidor con un comando y compruébalo con <code>/mcp</code> dentro de una sesión.</p>
${bloque("Terminal", `claude mcp add --transport http obraclara ${MCP_URL}`, `<span class="c">$</span> <span class="f">claude</span> mcp add --transport http obraclara <span class="s">${MCP_URL}</span>`)}
</section>

<section id="desktop"><h2>Claude Desktop</h2>
<p>En <b>Configuración › Conectores</b>, agrega un conector personalizado con la misma dirección. Funciona igual que en claude.ai.</p></section>

<section id="inspector"><h2>MCP Inspector</h2>
<p>Para ver las herramientas y probarlas a mano, abre el inspector oficial, elige el transporte <b>Streamable HTTP</b> y pega la dirección.</p>
${bloque("Terminal", "npx @modelcontextprotocol/inspector", `<span class="c">$</span> <span class="f">npx</span> @modelcontextprotocol/inspector`)}
</section>

<section id="http"><h2>Desde código</h2>
<p>Cualquier cliente que hable JSON-RPC sobre HTTP puede usarlo. Estas dos llamadas listan las herramientas y piden la ficha de una inversión.</p>
${bloque("tools/list", curlLista, `<span class="c">$</span> <span class="f">curl</span> -s <span class="s">${MCP_URL}</span> \\
  -H <span class="s">'content-type: application/json'</span> \\
  -H <span class="s">'accept: application/json, text/event-stream'</span> \\
  -d <span class="s">'{"jsonrpc":"2.0","id":1,"method":"tools/list"}'</span>`)}
${bloque("tools/call", curlLlamada, `<span class="c">$</span> <span class="f">curl</span> -s <span class="s">${MCP_URL}</span> \\
  -H <span class="s">'content-type: application/json'</span> \\
  -H <span class="s">'accept: application/json, text/event-stream'</span> \\
  -d <span class="s">'{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"detalle_inversion",
                 "arguments":{"codigo_unico":"2117268"}}}'</span>`)}
<p>La respuesta llega como evento SSE (<code>event: message</code>, <code>data: {…}</code>). El texto de la herramienta está en <code>result.content[0].text</code>.</p>
</section>

<section id="herramientas"><h2>Herramientas</h2>
<p>Los parámetros marcados con * son obligatorios. Los filtros de texto ignoran tildes y mayúsculas.</p>
<div class="tool-h"><h3>buscar_inversiones</h3></div>
<p>Busca inversiones activas por texto libre (nombre de la obra, distrito, provincia) y filtros opcionales. Devuelve hasta 20, ordenadas por costo actualizado.</p>
${tabla([["texto", "texto", "Palabras del nombre de la inversión o del lugar."], ...FILTROS, LIMITE])}
<div class="tool-h"><h3>detalle_inversion</h3></div>
<p>Ficha completa de una inversión a partir de su código único: montos, avance físico y de ejecución, último devengado, fechas, ubicación y alertas.</p>
${tabla([["codigo_unico", "texto", "Código único de la inversión, p. ej. «2716769»."]], ["codigo_unico"])}
<div class="tool-h"><h3>alertas_inversion</h3></div>
<p>Inversiones con alerta de sobrecosto o de posible paralización. Ver los <a href="/datos">criterios</a>.</p>
${tabla([["tipo", "sobrecosto | paralizacion", "Tipo de alerta."], ...FILTROS, LIMITE], ["tipo"])}
<div class="tool-h"><h3>resumen_inversiones</h3></div>
<p>Cantidad, costo actualizado total, devengado del año, saldo por ejecutar y cantidad de alertas de cada tipo para un conjunto de inversiones.</p>
${tabla(FILTROS)}
</section>

<section id="respuesta"><h2>Formato de respuesta</h2>
<p>Todas las herramientas devuelven un JSON con los datos y su procedencia, para que el asistente pueda citarla. Las de alertas añaden un aviso.</p>
<div class="code"><div class="code-h">result.content[0].text · recortado</div><pre>{
  <span class="k">"datos"</span>: { <span class="k">"total"</span>: <span class="n">35</span>, <span class="k">"mostrados"</span>: <span class="n">3</span>, <span class="k">"inversiones"</span>: [ … ] },
  <span class="k">"fuente"</span>: <span class="s">"Ministerio de Economía y Finanzas, Información de inversiones públicas 2001-2026"</span>,
  <span class="k">"url"</span>: <span class="s">"https://www.datosabiertos.gob.pe/dataset/…"</span>,
  <span class="k">"fecha_descarga"</span>: <span class="s">"${esc(m.fecha_descarga ?? "")}"</span>,
  <span class="k">"aviso"</span>: <span class="s">"Las alertas son indicios técnicos, no prueban irregularidades. …"</span>
}</pre></div>
<p>El servidor también entrega instrucciones al modelo: citar fuente y fecha, decir cuando no hay resultados, no hacer cálculos propios y tratar las alertas como indicios.</p>
</section>

<section id="limites"><h2>Límites</h2>
<table class="ref"><tbody>
<tr><td>/mcp</td><td>60 solicitudes por minuto por dirección IP.</td></tr>
<tr><td>panel web</td><td>20 preguntas por minuto al modelo gpt-headless. Con tu propia clave, el límite es el de tu proveedor.</td></tr>
<tr><td>resultados</td><td>Hasta 20 inversiones por consulta; <code>total</code> indica cuántas coinciden.</td></tr>
<tr><td>datos</td><td>Corte del ${esc(fechaLarga(m.fecha_descarga))}. Se recargan cada lunes; durante la recarga, unos minutos, las consultas pueden devolver menos resultados.</td></tr>
</tbody></table>
<p style="margin-top:20px">Estado del servidor y fecha de los datos: <a href="/salud"><code>/salud</code></a>. Código y ETL: <a href="${REPO}">GitHub</a>.</p>
</section>
</article></div>`;
  return shell({
    titulo: "Conectar · ObraClara Perú",
    descripcion: "Cómo conectar el servidor MCP público de ObraClara a claude.ai, Claude Code, Claude Desktop o cualquier cliente MCP.",
    ruta: "/conectar",
    cuerpo,
    m,
    cssExtra: css,
    scriptExtra: scriptToc,
  });
}

const cssAcerca = String.raw`
.pag-h{padding:clamp(40px,6vw,88px) 0 clamp(32px,4vw,56px)}
.pag-h .lead{margin-top:20px}
.filas-a{display:grid;grid-template-columns:240px minmax(0,1fr);border-top:1px solid var(--line)}
.filas-a>h2{font-size:var(--s1);font-family:var(--sans);letter-spacing:-.01em;padding:28px 24px 28px 0;border-bottom:1px solid var(--line)}
.filas-a>div{padding:28px 0;border-bottom:1px solid var(--line);color:var(--ink-2)}
.filas-a>div p+p,.filas-a>div p+ul{margin-top:12px}
.filas-a ul{margin:0;padding-left:1.2em;display:grid;gap:6px}
@media (max-width:720px){.filas-a{grid-template-columns:minmax(0,1fr)}.filas-a>h2{border-bottom:0;padding-bottom:0}.filas-a>div{padding-top:10px}}
`;

export function acerca(m: Meta): string {
  const cuerpo = `
<section class="pag-h"><div class="wrap narrow">
<p class="eyebrow">Acerca del proyecto</p>
<h1>Un proyecto de curso, hecho para usarse.</h1>
<p class="lead">ObraClara Perú es el proyecto final del Grupo 1 del curso Inteligencia Artificial Aplicada de la Universidad de Lima, ciclo 2026-2.</p>
</div></section>
<section style="padding-bottom:var(--sec)"><div class="wrap narrow">
<div class="filas-a rv">
<h2>Por qué</h2><div><p>Los datos de inversión pública del Perú son abiertos, pero consultarlos exige descargar un CSV de cientos de megabytes y saber leer sus columnas. Un asistente de IA puede hacer esa consulta por ti, siempre que tenga acceso al dato oficial y no lo invente.</p></div>
<h2>Qué es</h2><div><p>Un servidor MCP público con cuatro herramientas sobre el archivo de inversiones del MEF, este sitio y un panel para probarlo con o sin MCP.</p></div>
<h2>Datos</h2><div><p>Ministerio de Economía y Finanzas, <a href="${esc(m.url ?? "https://www.datosabiertos.gob.pe")}">Información de inversiones públicas 2001-2026</a>. Licencia Open Data Commons Attribution (ODC-BY). Descarga del ${esc(fechaLarga(m.fecha_descarga))}.</p></div>
<h2>Limitaciones</h2><div><ul>
<li>Los datos se actualizan una vez por semana y pueden no reflejar el estado más reciente en el MEF.</li>
<li>Las alertas son aproximaciones con reglas simples. No prueban irregularidades.</li>
<li>El modelo por defecto del panel, gpt-headless, corre en un equipo del grupo: es compartido, tiene límite de uso y puede estar apagado.</li>
<li>Durante la recarga semanal, por unos minutos, las consultas pueden devolver pocos resultados.</li></ul></div>
<h2>Código</h2><div><p>Abierto con licencia MIT en <a href="${REPO}">github.com/adrielorihuela/obraclara-mcp</a>: ETL en Python, Worker en TypeScript, pruebas y banco de preguntas de evaluación.</p></div>
<h2>Uso de IA</h2><div><p>El código se desarrolló con ayuda de IA generativa y fue revisado y probado por el grupo.</p></div>
<h2>Curso</h2><div><p>Universidad de Lima · Inteligencia Artificial Aplicada · sección 356 · Grupo 1.</p></div>
</div>
</div></section>`;
  return shell({
    titulo: "Acerca · ObraClara Perú",
    descripcion: "ObraClara Perú: proyecto del Grupo 1 del curso Inteligencia Artificial Aplicada de la Universidad de Lima.",
    ruta: "/acerca",
    cuerpo,
    m,
    cssExtra: cssAcerca,
  });
}

export function noEncontrada(m: Meta): string {
  return shell({
    titulo: "Página no encontrada · ObraClara Perú",
    descripcion: "La página no existe.",
    ruta: "",
    m,
    cuerpo: `<section class="sec"><div class="wrap narrow"><p class="eyebrow">404</p><h1>Esta página no existe.</h1>
<p class="lead" style="margin-top:20px">Puede que el enlace esté mal escrito. <a href="/">Volver al inicio</a> o <a href="/asistente">probar el asistente</a>.</p></div></section>`,
  });
}
