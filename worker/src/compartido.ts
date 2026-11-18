import { demoComun, demoCss } from "./demo";
import { esc, fechaLarga, shell, type Meta } from "./sitio/layout";
import type { CompartidoLeido, MensajeComp } from "./lib/compartir";

// Página pública de solo lectura de un chat compartido (/c/:id). Reutiliza el estilo y el renderizador de Markdown
// seguro (solo textContent) del asistente; los datos viajan en un bloque JSON, nunca como HTML.

const css = String.raw`
.cmp{max-width:780px;margin:0 auto;padding:28px 24px 72px}
.cmp .aviso{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line-2);background:var(--surface-2);border-radius:12px;padding:12px 14px;font-size:13.5px;line-height:1.5;color:var(--ink-2)}
.cmp .aviso strong{color:var(--ink);white-space:nowrap}
.cmp h1{font-size:var(--s3);margin:26px 0 8px;overflow-wrap:anywhere}
.cmp .datos{font:500 12.5px/1.5 var(--mono);color:var(--mut);display:flex;flex-wrap:wrap;gap:6px 16px}
.cmp .acc-p{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0 4px}
.cmp .acc-p .btn{cursor:pointer;font:inherit}
.cmp #oc-log{padding:22px 0 8px}
.cmp #cmp-est{font-size:13.5px;color:var(--risk);margin:8px 0 0}
.cmp .pie-c{margin-top:28px;padding-top:16px;border-top:1px solid var(--line);font-size:13px;color:var(--mut)}
.cmp noscript .msg{white-space:pre-wrap;margin:0 0 14px}
@media (max-width:860px){.cmp{padding:20px 16px 56px}}
`;

const script = String.raw`
var cmpD=null;try{cmpD=JSON.parse(document.getElementById('cmp-datos').textContent)}catch(e){}
function ocLog(c,t){var e=$('cmp-est');if(e){e.textContent=t;e.hidden=false}}
function cmpImg(u){return typeof u==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/]+={0,2}$/.test(u)}
function cmpPintar(){if(!cmpD)return;var log=$('oc-log');
 cmpD.m.forEach(function(m){var d=document.createElement('div');
  if(m.rol==='t'){d.className='msg n';d.textContent='Usó la herramienta '+m.texto;log.appendChild(d);return}
  d.className='msg '+m.rol;
  if(m.rol==='u'){d.textContent=m.texto;
   if(Array.isArray(m.imagenes)&&m.imagenes.length){var g=document.createElement('div');g.className='ims';m.imagenes.filter(cmpImg).forEach(function(u){var im=document.createElement('img');im.alt='Imagen adjunta';im.src=u;g.appendChild(im)});d.appendChild(g)}
   if(Array.isArray(m.adjuntos)&&m.adjuntos.length){var g2=document.createElement('div');g2.className='ims';m.adjuntos.forEach(function(x){g2.appendChild(ocChip({n:String(x.nombre),t:String(x.tipo),c:Number(x.tamano)||0},false,null))});d.appendChild(g2)}}
  else{var t=document.createElement('div');t.className='t';ocMd(t,m.texto);
   if(m.modelo){var p=document.createElement('p');p.className='mod';p.textContent='Respondió: '+m.modelo;t.appendChild(p)}
   if(Array.isArray(m.adjuntos)&&m.adjuntos.length){var bx=document.createElement('div');bx.className='adjs';m.adjuntos.forEach(function(x){bx.appendChild(ocTarjeta({n:String(x.nombre),b:Number(x.tamano)||0},null))});t.appendChild(bx)}
   d.appendChild(t)}
  log.appendChild(d)})}
function cmpContinuar(){if(!cmpD)return;var b=$('cmp-cont'),ahora=Date.now(),ms=[];
 cmpD.m.forEach(function(m){
  if(m.rol==='u'){var o={rol:'u',texto:m.texto,mcp:!!cmpD.mcp},ad=(m.adjuntos||[]).map(function(x){return {n:String(x.nombre),t:String(x.tipo),c:Number(x.tamano)||0}});
   if((m.imagenes||[]).length)o.texto+=(o.texto?'\n':'')+m.imagenes.map(function(){return '[imagen adjunta]'}).join(' ');
   if(ad.length)o.adj=ad;ms.push(o)}
  else if(m.rol==='a')ms.push({rol:'a',texto:m.texto,modelo:m.modelo||'',mcp:!!cmpD.mcp})});
 b.disabled=true;
 ocAlmLeer().then(function(t){var cs=deserializarChats(t),id='c'+ahora.toString(36)+Math.random().toString(36).slice(2,6);
  cs.push({id:id,titulo:tituloChat(cmpD.titulo),creado:ahora,actualizado:ahora,mensajes:ms});
  return ocAlmEscribir(serializarChats(recortarChats(cs))).then(function(){location.href='/asistente?abrir='+encodeURIComponent(id)})})
 .catch(function(){b.disabled=false;ocLog('n','No se pudo guardar el chat en este navegador (almacenamiento lleno o bloqueado).')})}
cmpPintar();$('cmp-cont').addEventListener('click',cmpContinuar);
`;

const jsonSeguro = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

function resumen(c: CompartidoLeido): string {
  const r = c.mensajes.find((m) => m.rol === "a" && m.texto);
  const t = (r?.texto ?? "").replace(/<[^>]*>?/g, " ").replace(/[#*`|>_-]+/g, " ").replace(/\s+/g, " ").trim();
  return t ? (t.length > 160 ? t.slice(0, 157) + "…" : t) : "Conversación compartida del asistente de ObraClara Perú.";
}

function sinJs(ms: MensajeComp[]): string {
  return ms.filter((m) => m.rol !== "t").map((m) => `<div class="msg ${m.rol}">${esc(m.texto)}</div>`).join("");
}

const ROBOTS = "noindex, nofollow, noarchive";

export const CABECERAS_COMPARTIDO = {
  "content-type": "text/html; charset=utf-8",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-robots-tag": ROBOTS,
  "cache-control": "private, no-store",
};

export function paginaCompartida(c: CompartidoLeido, m: Meta, origen: string): string {
  const url = `${origen}/c/${c.id}`;
  const desc = resumen(c);
  const html = shell({
    titulo: `${c.titulo} · Chat compartido`,
    descripcion: desc,
    ruta: "",
    m,
    cssExtra: demoCss + css,
    scriptExtra: demoComun + "\n" + script,
    cuerpo: `<div class="cmp">
<p class="aviso"><strong>Chat compartido</strong><span>Las respuestas pueden contener errores; verifica en la fuente oficial del MEF.</span></p>
<h1>${esc(c.titulo)}</h1>
<p class="datos"><span>${esc(fechaLarga(c.creado.slice(0, 10)))}</span><span>${c.mensajes.some((x) => x.rol === "a") ? (c.mcp ? "Con MCP: datos oficiales del MEF" : "Sin MCP: sin acceso a los datos") : ""}</span><span>Solo lectura</span></p>
<div class="acc-p"><button type="button" id="cmp-cont" class="btn btn-p">Continuar este chat</button><a class="btn btn-s" href="/asistente">Abrir el asistente</a></div>
<p id="cmp-est" role="status" hidden></p>
<div id="oc-log"><noscript>${sinJs(c.mensajes)}</noscript></div>
<p class="pie-c">Quien creó este enlace puede eliminarlo en cualquier momento. Los archivos que generó el asistente no se comparten: solo se ven su nombre y su tamaño. «Continuar este chat» copia la conversación a este navegador; no cambia el original.</p>
</div>
<script type="application/json" id="cmp-datos">${jsonSeguro({ titulo: c.titulo, mcp: c.mcp, m: c.mensajes })}</script>`,
  });
  const extra = `<meta name="robots" content="${ROBOTS}"><meta property="og:url" content="${esc(url)}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(c.titulo)}"><meta name="twitter:description" content="${esc(desc)}"><link rel="canonical" href="${esc(url)}">`;
  return html.replace("</head>", () => extra + "</head>").replace('<meta property="og:type" content="website">', () => '<meta property="og:type" content="article"><meta property="og:site_name" content="ObraClara Perú">');
}

export function compartidoNoEncontrado(m: Meta): string {
  return shell({
    titulo: "Chat no disponible · ObraClara Perú",
    descripcion: "Este enlace no existe o fue eliminado.",
    ruta: "",
    m,
    cuerpo: `<section class="sec"><div class="wrap narrow"><p class="eyebrow">Chat compartido</p><h1>Este chat ya no está disponible.</h1>
<p class="lead" style="margin-top:20px">El enlace puede estar mal escrito, o quien lo creó lo eliminó. Puedes <a href="/asistente">probar el asistente</a> y crear tus propias conversaciones.</p></div></section>`,
  }).replace("</head>", () => `<meta name="robots" content="${ROBOTS}"></head>`);
}
