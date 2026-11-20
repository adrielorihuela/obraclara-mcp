import { arquitecturaAncha, arquitecturaCss, arquitecturaVertical } from "./arquitectura";
import { cifrasCss, cifrasScript, franjaCifras } from "./cifras";
import { enSencilloAncho, MCP_URL, num, REPO, shell, type Meta } from "./layout";

// Consulta real hecha al servidor el 2026-11-10 (alertas_inversion, Cusco, Salud, paralización, límite 3).
const TRAZA_FECHA = "10 de noviembre de 2026";

const css = String.raw`
.hero{padding:clamp(40px,7vw,96px) 0 clamp(48px,6vw,80px)}
.hero .wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.02fr);gap:clamp(32px,5vw,72px);align-items:center}
.hero h1{max-width:13ch}
.hero .lead{margin-top:24px}
.hero .acc{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.hero .url{margin-top:28px;display:grid;grid-template-columns:minmax(0,1fr);justify-items:start;gap:8px}
.hero .url .small{color:var(--mut)}
.hero .sencillo{grid-column:1/-1}
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
${cifrasCss}
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
  const total = Number(m.total_inversiones ?? 0);
  const cuerpo = `
<section class="hero"><div class="wrap">
<div>
<p class="eyebrow"><span class="pulso" aria-hidden="true"></span>Datos oficiales del Estado · consulta gratuita</p>
<h1>Las obras públicas del Perú, en una conversación.</h1>
<p class="lead">ObraClara permite preguntar en castellano por las obras públicas del Perú. Un asistente de inteligencia artificial (un programa que conversa como un chat) revisa el registro oficial del Ministerio de Economía y Finanzas (MEF) y responde con la cifra, la fuente y la fecha de los datos.</p>
<div class="acc"><a class="btn btn-p" href="/asistente">Probar el asistente ${icoFlecha}</a><a class="btn btn-s" href="/conectar">Conectarlo a Claude</a></div>
<div class="url"><span class="small">Dirección del servidor (el «enchufe» para conectar tu asistente), sin inicio de sesión</span>
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
${enSencilloAncho(
  "Cuando una obra pública se retrasa o cuesta mucho más de lo previsto, saberlo no debería exigir descargar un archivo gigante ni ser experto. ObraClara deja que cualquier persona pregunte, por ejemplo, «¿qué obras de salud en Cusco llevan seis meses sin gastar dinero?».",
  "Un asistente de IA normalmente responde de memoria, como alguien que contesta sin mirar ningún papel, y a veces se equivoca o inventa. Con ObraClara, el asistente primero revisa el registro oficial del MEF y luego te cuenta lo que encontró, mostrando de dónde sacó cada dato. En una prueba de 40 preguntas, sin esta conexión el asistente acertó 3; con ella acertó las 40.",
  "Las «alertas» son señales para mirar una obra con más atención. <b>No prueban que haya algo malo.</b>")}
</div></section>

${franjaCifras(m)}

<section class="sec" id="como"><div class="wrap">
<div class="head rv"><p class="eyebrow"><b>01</b> Cómo funciona</p>
<h2>Tu asistente pregunta. El servidor responde con el dato oficial.</h2>
<p class="lead">Imagina a alguien que, antes de contestar, abre el libro oficial y te muestra la página de donde sacó el dato. Eso hace ObraClara. La pieza que lo permite se llama MCP (Model Context Protocol): un «enchufe» estándar que deja a un asistente de IA consultar una fuente de datos real en lugar de responder de memoria. Nuestro «servidor» (un programa que está siempre encendido en internet esperando preguntas) ofrece cuatro herramientas y el asistente elige cuál usar.</p></div>
<ol class="pasos">
<li class="rv"><h3>Preguntas en castellano</h3><p>«¿Cuánto se ha devengado este año en las obras de la Municipalidad Provincial de Piura?»</p></li>
<li class="rv d1"><h3>El asistente elige una herramienta</h3><p>Como si escogiera un cajón del archivo: aquí, el resumen de una entidad (<code>resumen_inversiones</code>).</p></li>
<li class="rv d2"><h3>El servidor consulta la base de datos</h3><p>Busca en una copia ordenada del archivo del MEF (una «base de datos» es un archivo organizado para buscar rápido). No estima ni completa cifras. <small class="mut">Detalle técnico: SQL parametrizado.</small></p></li>
<li class="rv d3"><h3>La respuesta cita la fuente</h3><p>Cada resultado trae la fuente, el enlace y la fecha de los datos, para que el asistente te diga de dónde salió.</p></li>
</ol>
<figure class="arq-fig rv">${arquitecturaAncha()}${arquitecturaVertical()}
<figcaption>Dibujo técnico del recorrido de un dato: del archivo del MEF al asistente. Todo funciona con servicios gratuitos de Cloudflare más un computador del grupo. Si ese computador está apagado, el servidor usa una copia de respaldo y el sitio sigue funcionando.</figcaption></figure>
<p class="que rv" style="margin:20px 0 0;max-width:none"><b>Qué significa:</b> entre tu pregunta y la respuesta hay un paso de revisión del registro oficial; sin ese paso, el asistente solo adivina.</p>
</div></section>

<section class="sec"><div class="wrap">
<div class="head rv"><p class="eyebrow"><b>02</b> Con y sin MCP</p>
<h2>Con datos y sin ellos.</h2>
<p class="lead">En el panel de prueba puedes apagar la conexión (el MCP). Sin ella, el asistente responde de memoria y puede dar cifras que no existen. Con ella, consulta la base y responde con los registros del MEF. Medimos la diferencia: de 40 preguntas, <b>sin la conexión acertó 3 (8 %) y con la conexión acertó las 40 (100 %)</b>. Sin la conexión, 21 de las 40 respuestas traían cifras que no coinciden con el registro oficial (53 %); con la conexión, ninguna.</p></div>
<div class="duo">
<figure class="rv"><p class="lbl on"><i aria-hidden="true"></i>MCP activado</p><div class="shot"><img src="/img/con-mcp.png" width="1200" height="900" alt="Panel del asistente con MCP activado: la respuesta muestra la herramienta usada y cita al MEF" loading="lazy" decoding="async"></div>
<figcaption><b>Con la conexión (MCP).</b> El asistente consultó la herramienta de alertas y lista códigos de obra reales. La tarjeta se despliega para ver qué pidió y qué recibió.</figcaption></figure>
<figure class="rv d1"><p class="lbl"><i aria-hidden="true"></i>MCP desactivado</p><div class="shot"><img src="/img/sin-mcp.png" width="1200" height="900" alt="Panel del asistente con MCP desactivado: el modelo responde sin consultar datos" loading="lazy" decoding="async"></div>
<figcaption><b>Sin la conexión.</b> La misma pregunta. Los números de expediente, montos y fechas de esta tabla no existen en los datos del MEF: el asistente los inventó.</figcaption></figure>
</div>
<p class="small mut" style="margin-top:20px">Capturas reales del panel, tomadas el 10 de noviembre de 2026. Las respuestas de un asistente cambian entre intentos. <a href="/evaluacion">Ver los benchmarks y las 40 preguntas</a> · <a href="/proyecto#evaluacion">método de la evaluación</a>.</p>
</div></section>

<section class="sec"><div class="wrap tools">
<div>
<div class="head rv" style="margin-bottom:36px"><p class="eyebrow"><b>03</b> Herramientas</p>
<h2>Cuatro herramientas, una sola fuente.</h2>
<p class="lead">Una «herramienta» es una función que el asistente puede usar, como un cajón del archivo con una etiqueta. Las cuatro leen el mismo archivo del MEF, <code>DETALLE_INVERSIONES.csv</code>, y devuelven como máximo 20 resultados por consulta.</p>
<details class="det"><summary>Para quien quiere el detalle técnico</summary><p>Cada herramienta tiene parámetros con nombre (abajo, en recuadros: los obligatorios resaltados) que el servidor valida antes de ejecutar un SQL fijo. Las definiciones completas están en <a href="/conectar#herramientas">la guía de conexión</a>.</p></details></div>
<dl class="rv">
<dt>buscar_inversiones</dt><dd>Encuentra obras por palabras (nombre, distrito, provincia) y filtros. Las ordena de la más cara a la más barata.<div class="params"><span>texto</span><span>entidad</span><span>departamento</span><span>funcion</span><span>nivel</span><span>limite</span></div></dd>
<dt>detalle_inversion</dt><dd>La ficha de una obra por su código único: montos, avance, último gasto registrado (devengado), ubicación y alertas.<div class="params"><span class="req">codigo_unico</span></div></dd>
<dt>alertas_inversion</dt><dd>Lista las obras con señal de sobrecosto o de posible paralización, con los mismos filtros.<div class="params"><span class="req">tipo</span><span>entidad</span><span>departamento</span><span>funcion</span><span>nivel</span><span>limite</span></div></dd>
<dt>resumen_inversiones</dt><dd>El «total» de un grupo de obras: cuántas son, cuánto cuestan hoy, cuánto se gastó este año, cuánto falta y cuántas tienen alerta.<div class="params"><span>entidad</span><span>departamento</span><span>funcion</span><span>nivel</span></div></dd>
</dl>
<p class="rv"><a href="/conectar#herramientas">Referencia completa de parámetros</a></p>
</div>
<figure class="shot rv d1" style="background:var(--code-bg)"><img src="/img/codigo-alertas.png" width="1280" height="991" alt="Código TypeScript real de la herramienta alertas_inversion en worker/src/server.ts" loading="lazy" decoding="async"></figure>
</div></section>

<section class="sec"><div class="wrap">
<div class="head rv"><p class="eyebrow"><b>04</b> Alertas</p>
<h2>Una alerta es una pregunta, no una acusación.</h2>
<p class="lead">Una alerta es una señal para mirar una obra con más atención, como la luz del tablero de un auto: avisa que conviene revisar, no que el motor esté dañado. Las dos alertas se calculan con reglas simples y públicas sobre los mismos datos y sirven para decidir qué revisar primero.</p></div>
<div class="alertas rv">
<div><h3><span class="tag tag-w">sobrecosto</span></h3>
<p class="f">(costo actualizado − monto viable) / monto viable ≥ 50 %</p>
<p>La obra hoy cuesta la mitad o más de lo que se aprobó al inicio («monto viable»). Puede deberse a cambios aprobados, como ampliar la obra, y no solo a problemas.</p></div>
<div><h3><span class="tag tag-r">posible paralización</span></h3>
<p class="f">40 % ≤ avance físico &lt; 100 % y ≥ 6 meses sin devengado</p>
<p>La obra va por la mitad o más y lleva seis meses o más sin registrar gasto («devengado» es el gasto que el Estado reconoce como ya realizado). Se parece a la definición de obra paralizada de la Ley 31589, pero es una aproximación.</p></div>
</div>
<div class="aviso rv">${icoAviso}<p>Las alertas son indicadores calculados con datos abiertos. <b>No constituyen evidencia de irregularidades</b> y deben verificarse en la fuente oficial. <a href="/datos">Ver criterios y buscar en los datos</a></p></div>
</div></section>

<section class="sec"><div class="wrap final">
<div class="rv"><p class="eyebrow"><b>05</b> Conectar</p>
<h2>Agrégalo a tu asistente en un minuto.</h2>
<p class="lead" style="margin-top:18px">Si usas un asistente de IA compatible (por ejemplo, Claude), solo pegas la dirección del servidor, como quien conecta un aparato a un enchufe. No necesitas cuenta ni clave. Quien programa puede hacerlo con un comando.</p>
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
    scriptExtra: script + cifrasScript,
  });
}
