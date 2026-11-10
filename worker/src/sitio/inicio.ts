import { arquitecturaAncha, arquitecturaCss, arquitecturaVertical } from "./arquitectura";
import { esc, fechaLarga, MCP_URL, num, REPO, shell, type Meta } from "./layout";

// Consulta real hecha al servidor el 2026-11-10 (alertas_inversion, Cusco, Salud, paralización, límite 3).
const TRAZA_FECHA = "10 de noviembre de 2026";

const css = String.raw`
.hero{padding:clamp(40px,7vw,96px) 0 clamp(56px,8vw,112px)}
.hero .wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.02fr);gap:clamp(32px,5vw,72px);align-items:center}
.hero h1{max-width:13ch}
.hero .lead{margin-top:24px}
.hero .acc{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.hero .url{margin-top:28px;display:grid;grid-template-columns:minmax(0,1fr);justify-items:start;gap:8px}
.hero .url .small{color:var(--mut)}
.pulso{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 0 var(--accent);animation:pulso 2.4s infinite}
@keyframes pulso{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 50%,transparent)}70%,100%{box-shadow:0 0 0 8px transparent}}
@media (max-width:960px){.hero .wrap{grid-template-columns:minmax(0,1fr)}.hero h1{max-width:16ch}}

.traza{background:var(--code-bg);color:var(--code-ink);border:1px solid var(--code-line);border-radius:var(--r-l);box-shadow:var(--shadow),0 40px 80px -40px rgba(0,0,0,.35);font:400 13.5px/1.6 var(--mono);overflow:hidden}
.traza-h{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--code-line);color:var(--code-mut);font-size:12px}
.traza-h i{width:10px;height:10px;border-radius:50%;background:#30353a;display:block}
.traza-h span{margin-left:8px}
.traza-h .rep{margin-left:auto}
.traza ol{list-style:none;margin:0;padding:18px 18px 20px;display:grid;gap:16px;min-height:430px;align-content:start}
.traza li{display:grid;grid-template-columns:76px minmax(0,1fr);gap:12px}
.traza .who{color:var(--code-mut);font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;padding-top:2px}
.traza .q{font-family:var(--sans);font-size:15px;color:#fff}
.traza .q .cur{display:inline-block;width:8px;height:1.1em;background:var(--c-str);vertical-align:-3px;margin-left:2px;animation:parp 1s steps(1) infinite}
@keyframes parp{50%{opacity:0}}
.traza .call b{color:var(--c-fn);font-weight:500}
.traza .res table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}
.traza .res td{padding:5px 12px 5px 0;border-top:1px solid var(--code-line);vertical-align:top}
.traza .res td:first-child{color:var(--c-num)}
.traza .res td.r{text-align:right;white-space:nowrap}
.traza .a{font-family:var(--sans);font-size:14.5px;line-height:1.55;color:#ecebe6}
.traza .a em{font-style:normal;color:var(--c-key)}
.js .traza li.paso{opacity:0;transform:translateY(6px);transition:opacity .5s,transform .5s}
.js .traza li.paso.ver{opacity:1;transform:none}
@media (max-width:520px){.traza li{grid-template-columns:minmax(0,1fr);gap:4px}.traza ol{min-height:0}.traza .res td.ent{display:none}}

.cifras{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--bg-2)}
.cifras dl{margin:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.cifras div{padding:clamp(28px,4vw,48px) clamp(16px,2.4vw,32px)}
.cifras div+div{border-left:1px solid var(--line)}
.cifras dt{font:600 clamp(2rem,1.3rem + 2.6vw,3.4rem)/1 var(--serif);letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.cifras dd{margin:12px 0 0;color:var(--ink-2);font-size:var(--s-1);max-width:26ch}
.cifras .w dt{color:var(--warn)}.cifras .r dt{color:var(--risk)}
.cifras-p{padding:14px 0;font-size:var(--s-1);color:var(--mut)}
@media (max-width:860px){.cifras dl{grid-template-columns:repeat(2,minmax(0,1fr))}.cifras div:nth-child(3){border-left:0}.cifras div:nth-child(n+3){border-top:1px solid var(--line)}}

.pasos{list-style:none;margin:0 0 clamp(48px,6vw,80px);padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;counter-reset:p}
.pasos li{padding:24px 24px 0 0;border-top:1px solid var(--line-2);position:relative}
.pasos li::before{counter-increment:p;content:"0" counter(p);display:block;font:500 13px/1 var(--mono);color:var(--accent);margin-bottom:16px}
.pasos li::after{content:"";position:absolute;top:-4px;left:0;width:7px;height:7px;border-radius:50%;background:var(--accent)}
.pasos h3{margin-bottom:8px}
.pasos p{color:var(--ink-2);font-size:var(--s-1)}
.pasos code{font-size:.92em;color:var(--ink)}
@media (max-width:860px){.pasos{grid-template-columns:minmax(0,1fr) minmax(0,1fr);row-gap:32px}}
@media (max-width:520px){.pasos{grid-template-columns:minmax(0,1fr)}}
.arq-fig{padding:clamp(20px,3vw,40px);border:1px solid var(--line);border-radius:var(--r-l);background:var(--bg-2)}

.duo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(16px,2.5vw,32px)}
.duo figcaption b{color:var(--ink);font-weight:600}
@media (max-width:760px){.duo{grid-template-columns:minmax(0,1fr)}}
.duo .lbl{display:flex;align-items:center;gap:8px;margin-bottom:12px;font:500 13px/1 var(--mono)}
.duo .lbl i{width:28px;height:16px;border-radius:9px;background:var(--line-2);position:relative;display:block}
.duo .lbl i::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff}
.duo .on i{background:var(--accent)}.duo .on i::after{left:14px}

.tools{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(32px,5vw,72px);align-items:start}
.tools dl{margin:0}
.tools dt{font:500 15px/1.3 var(--mono);padding-top:20px;border-top:1px solid var(--line);color:var(--ink)}
.tools dt:first-child{border-top:0;padding-top:0}
.tools dd{margin:6px 0 20px;color:var(--ink-2)}
.tools dd .params{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.tools dd .params span{font:400 12px/1.6 var(--mono);color:var(--mut);border:1px solid var(--line);border-radius:6px;padding:0 7px}
.tools dd .params span.req{color:var(--ink);border-color:var(--line-2)}
.tools .shot{position:sticky;top:84px}
@media (max-width:960px){.tools{grid-template-columns:minmax(0,1fr)}.tools .shot{position:static}}

.alertas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r-l);overflow:hidden}
.alertas>div{background:var(--surface);padding:clamp(24px,3vw,40px)}
.alertas h3{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.alertas .f{font:500 15px/1.6 var(--mono);margin:16px 0;padding:14px 16px;background:var(--surface-2);border-radius:8px;overflow-x:auto}
.alertas p{color:var(--ink-2)}
@media (max-width:760px){.alertas{grid-template-columns:minmax(0,1fr)}}
.aviso{margin-top:28px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;align-items:start;max-width:760px}
.aviso svg{width:22px;height:22px;color:var(--warn);margin-top:3px}

.final{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(32px,5vw,72px);align-items:center}
.final .acc{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
@media (max-width:860px){.final{grid-template-columns:minmax(0,1fr)}}
${arquitecturaCss}
`;

// Animación de la traza del hero: escribe la pregunta y muestra los pasos en orden. Con movimiento reducido, todo visible.
const script = String.raw`(function(){
var t=document.getElementById('traza');if(!t)return;
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches,pasos=t.querySelectorAll('.paso'),q=t.querySelector('.q span'),full=q?q.getAttribute('data-t'):'',tim=[];
function mostrarTodo(){tim.forEach(clearTimeout);tim=[];if(q)q.textContent=full;pasos.forEach(function(p){p.classList.add('ver')});var c=t.querySelector('.cur');if(c)c.style.display='none'}
function play(){tim.forEach(clearTimeout);tim=[];if(rm){mostrarTodo();return}
 pasos.forEach(function(p){p.classList.remove('ver')});var c=t.querySelector('.cur');if(c)c.style.display='';q.textContent='';pasos[0].classList.add('ver');
 var i=0;function tipo(){i++;q.textContent=full.slice(0,i);if(i<full.length)tim.push(setTimeout(tipo,22+Math.random()*30));else{tim.push(setTimeout(function(){if(c)c.style.display='none';siguiente(1)},500))}}
 function siguiente(k){if(k>=pasos.length)return;pasos[k].classList.add('ver');tim.push(setTimeout(function(){siguiente(k+1)},k===1?900:1100))}
 tim.push(setTimeout(tipo,400))}
t.addEventListener('play',play);
var b=document.getElementById('traza-rep');if(b)b.addEventListener('click',play);
})();`;

const icoFlecha = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`;
const icoAviso = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17.2v.1"/></svg>`;

export function inicio(m: Meta): string {
  const total = Number(m.total_inversiones ?? 0), sob = Number(m.alertas_sobrecosto ?? 0), par = Number(m.alertas_paralizacion ?? 0);
  const fecha = fechaLarga(m.fecha_descarga);
  const cuerpo = `
<section class="hero"><div class="wrap">
<div>
<p class="eyebrow"><span class="pulso" aria-hidden="true"></span>Servidor MCP público · datos del MEF</p>
<h1>Las obras públicas del Perú, en una conversación.</h1>
<p class="lead">ObraClara conecta a un asistente de IA con el Banco de Inversiones del Ministerio de Economía y Finanzas. Preguntas en castellano y la respuesta llega con la cifra oficial, la fuente y la fecha de los datos.</p>
<div class="acc"><a class="btn btn-p" href="/asistente">Probar el asistente ${icoFlecha}</a><a class="btn btn-s" href="/conectar">Conectarlo a Claude</a></div>
<div class="url"><span class="small">Dirección del servidor, sin inicio de sesión</span>
<span class="inline-url"><code>${MCP_URL}</code><button class="copiar" type="button" data-copy="${MCP_URL}">Copiar</button></span></div>
</div>
<figure>
<div class="traza" id="traza" data-play>
<div class="traza-h"><i></i><i></i><i></i><span>obraclara · /mcp</span><button class="copiar rep" id="traza-rep" type="button">Repetir</button></div>
<ol aria-label="Ejemplo de consulta a través del servidor MCP">
<li class="paso"><span class="who">Pregunta</span><p class="q"><span data-t="¿Qué obras de salud en Cusco llevan 6 meses o más sin gasto?">¿Qué obras de salud en Cusco llevan 6 meses o más sin gasto?</span><i class="cur" aria-hidden="true"></i></p></li>
<li class="paso call"><span class="who">tools/call</span><div><b>alertas_inversion</b><br>tipo: "paralizacion"<br>departamento: "Cusco" · funcion: "Salud"</div></li>
<li class="paso res"><span class="who">Resultado</span><div>35 inversiones · fuente MEF · fecha_descarga 2026-11-10
<table><tbody>
<tr><td>2117268</td><td>P.S. Echarate Concepción</td><td class="ent">Echarati</td><td class="r">90.44 % · 59 m</td></tr>
<tr><td>2509283</td><td>Servicio funerario, Collpamayo</td><td class="ent">Pichigua</td><td class="r">63.38 % · 63 m</td></tr>
<tr><td>2509239</td><td>Servicio funerario, Ccahuaya Baja</td><td class="ent">Pichigua</td><td class="r">62.18 % · 63 m</td></tr>
</tbody></table></div></li>
<li class="paso"><span class="who">Respuesta</span><p class="a">Hay 35 inversiones de salud en Cusco con alerta de posible paralización. El mejoramiento del P.S. Echarate Concepción (código 2117268) tiene 90.44 % de avance físico y 59 meses sin gasto devengado. <em>Es un indicio para revisar, no una prueba de irregularidad.</em> Fuente: MEF, datos del 10/11/2026.</p></li>
</ol>
</div>
<figcaption>Herramienta y resultados reales del servidor, consultados el ${TRAZA_FECHA}. La respuesta final es un ejemplo de redacción del asistente.</figcaption>
</figure>
</div></section>

<section class="cifras" aria-label="Cifras de la base de datos"><div class="wrap">
<dl>
<div><dt data-count="${total}">${num(total)}</dt><dd>inversiones activas del Banco de Inversiones del MEF</dd></div>
<div class="w"><dt data-count="${sob}">${num(sob)}</dt><dd>con alerta de sobrecosto: costo actualizado 50 % o más sobre el monto viable</dd></div>
<div class="r"><dt data-count="${par}">${num(par)}</dt><dd>con alerta de posible paralización: avance entre 40 % y 99 % y 6 meses sin gasto</dd></div>
<div><dt>4</dt><dd>herramientas MCP públicas, sin cuenta ni clave</dd></div>
</dl>
<p class="cifras-p">Cifras de la base cargada el ${esc(fecha)}. La carga se repite cada lunes desde el CSV oficial.</p>
</div></section>

<section class="sec" id="como"><div class="wrap">
<div class="head rv"><p class="eyebrow"><b>01</b> Cómo funciona</p>
<h2>Tu asistente pregunta. El servidor responde con el dato oficial.</h2>
<p class="lead">MCP (Model Context Protocol) es un estándar abierto para que un modelo de IA use herramientas externas. ObraClara publica cuatro herramientas sobre los datos del MEF: el asistente elige cuál usar, el servidor ejecuta la consulta y devuelve cifras con su fuente.</p></div>
<ol class="pasos">
<li class="rv"><h3>Preguntas en castellano</h3><p>«¿Cuánto se ha devengado este año en las obras de la Municipalidad Provincial de Piura?»</p></li>
<li class="rv d1"><h3>El modelo elige una herramienta</h3><p>En este caso <code>resumen_inversiones</code>, con la entidad como filtro.</p></li>
<li class="rv d2"><h3>El servidor consulta la base</h3><p>SQL parametrizado sobre la copia del CSV del MEF. El servidor no estima ni completa cifras.</p></li>
<li class="rv d3"><h3>La respuesta cita la fuente</h3><p>Cada resultado incluye <code>fuente</code>, <code>url</code> y <code>fecha_descarga</code> para que el asistente los cite.</p></li>
</ol>
<figure class="arq-fig rv">${arquitecturaAncha()}${arquitecturaVertical()}
<figcaption>Todo corre en el plan gratuito de Cloudflare más un equipo del grupo. Si el conector del grupo está apagado, el Worker consulta D1 y el resto del sitio sigue funcionando.</figcaption></figure>
</div></section>

<section class="sec"><div class="wrap">
<div class="head rv"><p class="eyebrow"><b>02</b> Con y sin MCP</p>
<h2>Con datos y sin ellos.</h2>
<p class="lead">En el panel de prueba puedes apagar el MCP. Sin herramientas, el modelo responde de memoria y puede dar cifras que no existen. Con el MCP activado consulta la base y responde con los registros del MEF.</p></div>
<div class="duo">
<figure class="rv"><p class="lbl on"><i aria-hidden="true"></i>MCP activado</p><div class="shot"><img src="/img/con-mcp.png" width="1200" height="900" alt="Panel del asistente con MCP activado: la respuesta muestra la herramienta usada y cita al MEF" loading="lazy" decoding="async"></div>
<figcaption><b>Con MCP.</b> El modelo llamó a <code>alertas_inversion</code> y lista los códigos únicos reales. La tarjeta se despliega para ver argumentos y resultado.</figcaption></figure>
<figure class="rv d1"><p class="lbl"><i aria-hidden="true"></i>MCP desactivado</p><div class="shot"><img src="/img/sin-mcp.png" width="1200" height="900" alt="Panel del asistente con MCP desactivado: el modelo responde sin consultar datos" loading="lazy" decoding="async"></div>
<figcaption><b>Sin MCP.</b> La misma pregunta. Los números de expediente, montos y fechas de esta tabla no existen en los datos del MEF.</figcaption></figure>
</div>
<p class="small mut" style="margin-top:20px">Capturas reales del panel, tomadas el 10 de noviembre de 2026 con una conexión propia a Groq: <code>openai/gpt-oss-20b</code> con MCP y <code>openai/gpt-oss-120b</code> sin MCP (el de 20b no devolvió texto sin herramientas). Las respuestas varían entre intentos.</p>
</div></section>

<section class="sec"><div class="wrap tools">
<div>
<div class="head rv" style="margin-bottom:36px"><p class="eyebrow"><b>03</b> Herramientas</p>
<h2>Cuatro herramientas, una sola fuente.</h2>
<p class="lead">Todas leen el mismo archivo del MEF, <code>DETALLE_INVERSIONES.csv</code>, y devuelven como máximo 20 filas por consulta.</p></div>
<dl class="rv">
<dt>buscar_inversiones</dt><dd>Busca por texto libre (nombre de la obra, distrito, provincia) y filtros. Ordena por costo actualizado.<div class="params"><span>texto</span><span>entidad</span><span>departamento</span><span>funcion</span><span>nivel</span><span>limite</span></div></dd>
<dt>detalle_inversion</dt><dd>Ficha de una inversión por su código único: montos, avance físico y de ejecución, último devengado, ubicación y alertas.<div class="params"><span class="req">codigo_unico</span></div></dd>
<dt>alertas_inversion</dt><dd>Lista inversiones con alerta de sobrecosto o de posible paralización, con los mismos filtros.<div class="params"><span class="req">tipo</span><span>entidad</span><span>departamento</span><span>funcion</span><span>nivel</span><span>limite</span></div></dd>
<dt>resumen_inversiones</dt><dd>Cantidad, costo actualizado total, devengado del año, saldo por ejecutar y alertas de un conjunto.<div class="params"><span>entidad</span><span>departamento</span><span>funcion</span><span>nivel</span></div></dd>
</dl>
<p class="rv"><a href="/conectar#herramientas">Referencia completa de parámetros</a></p>
</div>
<figure class="shot rv d1" style="background:var(--code-bg)"><img src="/img/codigo-alertas.png" width="1280" height="991" alt="Código TypeScript real de la herramienta alertas_inversion en worker/src/server.ts" loading="lazy" decoding="async"></figure>
</div></section>

<section class="sec"><div class="wrap">
<div class="head rv"><p class="eyebrow"><b>04</b> Alertas</p>
<h2>Una alerta es una pregunta, no una acusación.</h2>
<p class="lead">Las dos alertas se calculan con reglas simples y públicas sobre los mismos datos. Sirven para decidir qué revisar primero.</p></div>
<div class="alertas rv">
<div><h3><span class="tag tag-w">sobrecosto</span></h3>
<p class="f">(costo actualizado − monto viable) / monto viable ≥ 50 %</p>
<p>El costo actual de la inversión supera en la mitad o más al monto con el que se declaró viable. Puede deberse a cambios de alcance aprobados, no solo a problemas.</p></div>
<div><h3><span class="tag tag-r">posible paralización</span></h3>
<p class="f">40 % ≤ avance físico &lt; 100 % y ≥ 6 meses sin devengado</p>
<p>La obra está a medio camino y lleva medio año o más sin gasto devengado. Es una aproximación a la definición de obra paralizada de la Ley 31589.</p></div>
</div>
<div class="aviso rv">${icoAviso}<p>Las alertas son indicadores calculados con datos abiertos. <b>No constituyen evidencia de irregularidades</b> y deben verificarse en la fuente oficial. <a href="/datos">Ver criterios y buscar en los datos</a></p></div>
</div></section>

<section class="sec"><div class="wrap final">
<div class="rv"><p class="eyebrow"><b>05</b> Conectar</p>
<h2>Agrégalo a tu asistente en un minuto.</h2>
<p class="lead" style="margin-top:18px">En claude.ai, pega la dirección como conector personalizado. En Claude Code, basta un comando.</p>
<div class="acc"><a class="btn btn-p" href="/conectar">Guía de conexión ${icoFlecha}</a><a class="btn btn-s" href="${REPO}">Ver el código</a></div></div>
<div class="code rv d1"><div class="code-h">Terminal<button class="copiar" type="button" data-copy="claude mcp add --transport http obraclara ${MCP_URL}">Copiar</button></div>
<pre><span class="c">$</span> <span class="f">claude</span> mcp add --transport http obraclara \
    <span class="s">${MCP_URL}</span></pre></div>
</div></section>`;
  return shell({
    titulo: "ObraClara Perú · Inversión pública consultable con IA",
    descripcion: `Servidor MCP público para consultar ${num(total)} inversiones públicas activas del MEF desde un asistente de IA, con fuente y fecha.`,
    ruta: "/",
    cuerpo,
    m,
    cssExtra: css,
    scriptExtra: script,
  });
}
