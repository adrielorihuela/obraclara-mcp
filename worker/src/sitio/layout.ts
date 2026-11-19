import { css } from "./estilos";

export const REPO = "https://github.com/adrielorihuela/obraclara-mcp";
export const MCP_URL = "https://obraclara.adrielorihuela.net/mcp";

export type Meta = Record<string, string>;

// La hoja de estilos común se sirve aparte (/sitio.css) con caché larga: así cada página pesa ~18 KB menos
// y el navegador la reutiliza al pasar de una página a otra. El parámetro v cambia cuando cambia el CSS.
function huella(t: string): string {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
export const CSS_RUTA = "/sitio.css";
export const CSS_HOJA = css;
const CSS_URL = `${CSS_RUTA}?v=${huella(css)}`;

export const esc = (t: unknown) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const num = (v: unknown) => Number(v ?? 0).toLocaleString("es-PE").replace(/,/g, " ");

/** 2026-11-10 → 10 de noviembre de 2026 */
export function fechaLarga(iso?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return "fecha no disponible";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${Number(m[3])} de ${meses[Number(m[2]) - 1]} de ${m[1]}`;
}

export const logo = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="8" fill="var(--ink)"/><circle cx="16" cy="14.5" r="6.5" fill="none" stroke="var(--bg)" stroke-width="2.6"/><rect x="8" y="24" width="16" height="2.6" rx="1.3" fill="var(--bg)" opacity=".35"/><rect x="8" y="24" width="10" height="2.6" rx="1.3" fill="var(--accent)"/></svg>`;

const icoGh = `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;
const icoSol = `<svg class="sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const icoLuna = `<svg class="luna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>`;
const icoMenu = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;

const RUTAS: [string, string][] = [
  ["/#como", "Cómo funciona"],
  ["/proyecto", "El proyecto"],
  ["/evaluacion", "Benchmarks"],
  ["/demo", "Demo"],
  ["/datos", "Datos y alertas"],
  ["/asistente", "Asistente"],
  ["/conectar", "Conectar"],
  ["/acerca", "Acerca"],
];

// En escritorio, estas páginas van dentro del menú «Proyecto ▾» para que la barra no se amontone.
const GRUPO = ["/proyecto", "/evaluacion", "/demo", "/acerca"];
const icoBaja = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5"/></svg>`;

// Antes de pintar: tema guardado, clase js y pantalla de carga solo en la primera página de la sesión.
const scriptHead = String.raw`(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('oc_tema');if(t==='dark'||t==='light')d.setAttribute('data-theme',t)}catch(e){}
try{if(!sessionStorage.getItem('oc_ses')){sessionStorage.setItem('oc_ses','1');if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))d.classList.add('con-carga')}}catch(e){}})();`;

// Comportamiento común: barra al desplazarse, menú móvil, tema, apariciones, conteos y botones de copiar.
const scriptSitio = String.raw`(function(){
var d=document,de=d.documentElement,nav=d.querySelector('.nav');
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(nav&&!nav.classList.contains('app')){var f=function(){nav.classList.toggle('sc',scrollY>8)};f();addEventListener('scroll',f,{passive:true})}
var mb=d.querySelector('.menu-b'),pm=d.getElementById('menu-m');
if(mb&&pm){mb.addEventListener('click',function(){var a=mb.getAttribute('aria-expanded')!=='true';mb.setAttribute('aria-expanded',String(a));pm.classList.toggle('abierto',a)});
 pm.addEventListener('click',function(e){if(e.target.tagName==='A'){mb.setAttribute('aria-expanded','false');pm.classList.remove('abierto')}});
 d.addEventListener('keydown',function(e){if(e.key==='Escape'&&pm.classList.contains('abierto')){mb.setAttribute('aria-expanded','false');pm.classList.remove('abierto');mb.focus()}})}
var gb=d.querySelector('.grupo-b'),gp=gb&&gb.parentNode;
if(gb){var gset=function(a){gb.setAttribute('aria-expanded',String(a));gp.classList.toggle('abierto',a)};
 gb.addEventListener('click',function(){gset(gb.getAttribute('aria-expanded')!=='true')});
 d.addEventListener('click',function(e){if(!gp.contains(e.target))gset(false)});
 gp.addEventListener('keydown',function(e){if(e.key==='Escape'){gset(false);gb.focus()}})}
var tb=d.querySelector('.tema');
if(tb)tb.addEventListener('click',function(){var osc=de.getAttribute('data-theme')==='dark'||(!de.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);var n=osc?'light':'dark';de.setAttribute('data-theme',n);try{localStorage.setItem('oc_tema',n)}catch(e){}});
function contar(el){var fin=Number(el.getAttribute('data-count'));if(!isFinite(fin))return;var fmt=function(v){return Math.round(v).toLocaleString('es-PE').replace(/,/g,' ')};
 if(rm){el.textContent=fmt(fin);return}var t0=null,dur=1400;function p(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=fmt(fin*e);if(k<1)requestAnimationFrame(p)}requestAnimationFrame(p)}
// Cifras grandes sin data-count (p. ej. «150 641», «98 %», «20,2 s»): cuentan desde 0 conservando formato y sufijo.
function contarTexto(el){var o=el.textContent,m=/^(\D{0,3}?)(\d{1,3}(?:[ \u00a0\u202f]\d{3})+|\d+)([.,]\d+)?([\s\S]*)$/.exec(o);if(!m||rm)return;
 var dec=m[3]?m[3].length-1:0,fin=Number(m[2].replace(/\D/g,'')+(m[3]?'.'+m[3].slice(1):''));if(!(fin>=5))return;
 var sep=/\d\D\d/.test(m[2])?m[2].replace(/\d/g,'').charAt(0):'',ds=m[3]?m[3].charAt(0):'';
 var fmt=function(v){var x=v.toFixed(dec).split('.'),e=x[0];if(sep)e=e.replace(/\B(?=(\d{3})+(?!\d))/g,sep);return m[1]+e+(dec?ds+x[1]:'')+m[4]};
 el.style.display='inline-block';el.style.minWidth=el.offsetWidth+'px';var t0=null,dur=1200;function p(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=k<1?fmt(fin*e):o;if(k<1)requestAnimationFrame(p);else{el.style.minWidth='';el.style.display=''}}requestAnimationFrame(p)}
// Barras de los gráficos SVG: crecen desde su base al aparecer.
function barras(r){var bs=r.querySelectorAll('svg.gx rect[class*="gx-b"],svg.gx rect.gx-sin,svg.gx rect.gx-con');if(!bs.length||rm)return;
 bs.forEach(function(b,i){var v=Number(b.getAttribute('height'))>Number(b.getAttribute('width'))*1.2;b.style.transformBox='fill-box';b.style.transformOrigin=v?'50% 100%':'0 50%';b.style.transform=v?'scaleY(0)':'scaleX(0)';b.style.transition='transform .9s cubic-bezier(.2,.7,.2,1) '+Math.min(i*45,600)+'ms'});
 r.ocBarras=bs}
function crecer(r){if(r.ocBarras)requestAnimationFrame(function(){r.ocBarras.forEach(function(b){b.style.transform='none'})})}
var vh=innerHeight;
// Bloques comunes bajo el pliegue que aún no tienen animación de entrada.
d.querySelectorAll('main .kpi,main .tbw,main details.det,main .code,main table.ref,main figure').forEach(function(el){if(el.closest('.rv')||el.getBoundingClientRect().top<vh)return;el.classList.add('rv')});
d.querySelectorAll('.rv').forEach(function(f){if(f.getBoundingClientRect().top>vh*.9)barras(f)});
d.querySelectorAll('main .kpi>b').forEach(function(el){if(el.getBoundingClientRect().top>vh*.9)el.setAttribute('data-cuenta','')});
var els=d.querySelectorAll('.rv,[data-count],[data-play],[data-cuenta]');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){var n=0;es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;
 if(t.classList.contains('rv')&&!/\bd[1-3]\b/.test(t.className)){t.style.transitionDelay=Math.min(n,5)*70+'ms';n++}
 t.classList.add('in');crecer(t);if(t.hasAttribute('data-count'))contar(t);if(t.hasAttribute('data-cuenta'))contarTexto(t);if(t.hasAttribute('data-play'))t.dispatchEvent(new CustomEvent('play'));io.unobserve(t)})},{rootMargin:'0px 0px -8% 0px',threshold:.12});
 els.forEach(function(el){if(el.hasAttribute('data-count'))el.textContent='0';io.observe(el)})}
else els.forEach(function(el){el.classList.add('in');crecer(el);if(el.hasAttribute('data-play'))el.dispatchEvent(new CustomEvent('play'))});
// Pulsación al hacer clic (onda) en botones.
if(!rm)d.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('.btn,.b-comp,.nueva,.chips button,.adj-b,.pl-d,.b-onda');if(!b||b.disabled)return;
 var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,o=d.createElement('span');o.className='onda';o.setAttribute('aria-hidden','true');o.style.width=o.style.height=s+'px';o.style.left=(e.clientX-r.left-s/2)+'px';o.style.top=(e.clientY-r.top-s/2)+'px';
 b.appendChild(o);setTimeout(function(){o.remove()},650)});
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-copy]');if(!b)return;var t=b.getAttribute('data-copy'),o=b.textContent;
 var ok=function(){b.textContent='Copiado';setTimeout(function(){b.textContent=o},1400)};
 if(navigator.clipboard)navigator.clipboard.writeText(t).then(ok,function(){});})
})();`;

export interface Opciones {
  titulo: string;
  descripcion: string;
  ruta: string;
  cuerpo: string;
  m: Meta;
  cssExtra?: string;
  scriptExtra?: string;
  app?: boolean; // página de aplicación (asistente): sin pie largo y barra fija
}

export function shell(o: Opciones): string {
  const actual = (h: string) => (h === o.ruta ? ' aria-current="page"' : "");
  const links = RUTAS.map(([h, t]) => `<a href="${h}"${actual(h)}>${t}</a>`).join("");
  const grupo = RUTAS.filter(([h]) => GRUPO.includes(h)).map(([h, t]) => `<a href="${h}"${actual(h)}>${t}</a>`).join("");
  const linksEsc = RUTAS.map(([h, t], i) =>
    !GRUPO.includes(h) ? `<a href="${h}"${actual(h)}>${t}</a>`
    : RUTAS.findIndex(([x]) => GRUPO.includes(x)) !== i ? ""
    : `<div class="grupo"><button class="grupo-b" type="button" aria-expanded="false" aria-controls="menu-g"${GRUPO.includes(o.ruta) ? " data-act" : ""}>Proyecto${icoBaja}</button><div class="grupo-m" id="menu-g">${grupo}</div></div>`,
  ).join("");
  const fecha = esc(o.m.fecha_descarga ?? "sin fecha");
  const pie = o.app ? "" : `<footer class="pie"><div class="wrap">
<div class="grid">
<div><a class="marca" href="/">${logo}<span>ObraClara Perú</span></a>
<p style="margin-top:14px;max-width:44ch">Un servidor MCP público para consultar las inversiones públicas activas del Perú con datos abiertos del Ministerio de Economía y Finanzas.</p></div>
<div><h4>Sitio</h4><ul>${RUTAS.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
<div><h4>Fuente y código</h4><ul>
<li><a href="${esc(o.m.url ?? "https://www.datosabiertos.gob.pe")}">Datos abiertos del MEF</a> · ODC-BY</li>
<li>Descargados el <time datetime="${fecha}">${fechaLarga(o.m.fecha_descarga)}</time></li>
<li><a href="${REPO}">Código en GitHub</a> · MIT</li>
<li><a href="/salud">Estado del servidor</a></li></ul></div>
</div>
<div class="legal"><span>Universidad de Lima · Inteligencia Artificial Aplicada · Grupo 1 · 2026-2</span>
<span>El código se desarrolló con ayuda de IA generativa y fue revisado y probado por el grupo.</span></div>
</div></footer>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(o.titulo)}</title>
<meta name="description" content="${esc(o.descripcion)}">
<meta property="og:title" content="${esc(o.titulo)}"><meta property="og:description" content="${esc(o.descripcion)}"><meta property="og:type" content="website">
<meta property="og:image" content="https://obraclara.adrielorihuela.net/img/og.png">
<meta name="theme-color" content="#f6f5f1" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#0e1011" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/public-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/source-serif-4-600.woff2" as="font" type="font/woff2" crossorigin>
<script>${scriptHead}</script>
<link rel="stylesheet" href="${CSS_URL}">${o.cssExtra ? `<style>${o.cssExtra}</style>` : ""}</head><body${o.app ? ' class="es-app"' : ""}>
<div id="carga" aria-hidden="true">${logo}<i></i></div>
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="nav${o.app ? " app" : ""}"><div class="wrap">
<a class="marca" href="/" aria-label="ObraClara Perú, inicio">${logo}<span>ObraClara <small>Perú</small></span></a>
<nav class="links" aria-label="Principal">${linksEsc}</nav>
<div class="nav-r">
<a class="ico gh" href="${REPO}" aria-label="Código en GitHub">${icoGh}</a>
<button class="ico tema" type="button" aria-label="Cambiar entre tema claro y oscuro">${icoLuna}${icoSol}</button>
${o.ruta === "/asistente" ? `<a class="btn btn-s" href="/conectar">Conectar a tu asistente</a>` : `<a class="btn btn-p" href="/asistente">Probar el asistente</a>`}
<button class="ico menu-b" type="button" aria-label="Menú" aria-expanded="false" aria-controls="menu-m">${icoMenu}</button>
</div></div>
<nav class="panel-m" id="menu-m" aria-label="Menú móvil"><a href="/"${actual("/")}>Inicio</a>${links}<a href="${REPO}">Código en GitHub</a></nav>
</header>
<main id="contenido">${o.cuerpo}</main>
${pie}
<script>${scriptSitio}</script>${o.scriptExtra ? `<script>${o.scriptExtra}</script>` : ""}
</body></html>`;
}

// Bloque «En pocas palabras» que abre cada página: lenguaje cotidiano, sin términos técnicos sin explicar.
export const enSencillo = (...parrafos: string[]) =>
  `<aside class="sencillo rv" aria-label="Explicación sencilla"><h2>En palabras sencillas</h2>${parrafos.map((p) => `<p>${p}</p>`).join("")}</aside>`;
