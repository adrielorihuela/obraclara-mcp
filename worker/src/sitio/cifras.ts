// Franja de cifras del inicio: cuatro casillas grandes que rotan entre varias cifras (fundido, deslizamiento y conteo)
// y una marquesina continua con muchas más. Cada número sale de los datos generados (metricas-datos.ts,
// evaluacion-datos.ts, evaluacion-tabla.ts) o de la tabla meta que también publica /salud; ninguno se escribe a mano.
// Sin JavaScript queda estática: la primera cifra de cada casilla y la marquesina como lista. Con movimiento reducido
// sigue rotando sin desplazamientos: las casillas cambian con un fundido cruzado y la cinta pasa por páginas de una línea.
import { EVAL } from "./evaluacion-datos";
import { MODELOS } from "./evaluacion-tabla";
import { esc, fechaLarga, type Meta } from "./layout";
import { METRICAS } from "./metricas-datos";
import { nf } from "./proyecto-diagramas";

type Tono = "" | "w" | "r" | "a";
export interface Cifra { v: number; d?: number; pre?: string; suf?: string; t: string; href: string; tono?: Tono }

const DESTINO: Record<string, string> = {
  "/evaluacion": "Evaluación", "/evaluacion#modelos": "Evaluación", "/proyecto#datos": "Datos", "/proyecto#alertas": "Alertas",
  "/proyecto#metricas": "Métricas", "/proyecto#pruebas": "Pruebas", "/proyecto#herramientas": "Herramientas",
};
const NIVEL: Record<string, string> = { GL: "municipalidades (gobiernos locales)", GR: "gobiernos regionales", GN: "Gobierno nacional" }
const aCargo = (k: string) => `a cargo ${k === "GN" ? "del" : "de"} ${NIVEL[k]}`;
const titulo = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

function datos(m: Meta) {
  const n = EVAL.preguntas;
  const de = (pct: number) => Math.round((pct * n) / 100);
  const sin = EVAL.global.find((g) => g.condicion === "sin_mcp")!, con = EVAL.global.find((g) => g.condicion === "con_mcp")!;
  const total = Number(m.total_inversiones ?? METRICAS.corte.total_inversiones);
  const sob = Number(m.alertas_sobrecosto ?? METRICAS.corte.alertas_sobrecosto), par = Number(m.alertas_paralizacion ?? METRICAS.corte.alertas_paralizacion);
  const al = (k: string) => METRICAS.alertasTotales.find((a) => a.alerta === k)!;
  const mo = METRICAS.montos;
  const herr = METRICAS.rendimiento.filter((r) => r.prueba.includes("_"));
  const llam = herr.reduce((s, r) => s + r.llamadas, 0), ok = herr.reduce((s, r) => s + r.exitosas, 0);
  const p50 = herr.map((r) => r.p50 / 1000), vacioAvance = METRICAS.vacios.find((x) => x.columna === "avance_fisico")!;
  const ex = METRICAS.exactitud, pr = METRICAS.pruebas, dep = METRICAS.topDepartamentos[0];
  const niv = (k: string) => METRICAS.porNivel.find((x) => x.nivel === k)!;

  const casillas: Cifra[][] = [
    [
      { v: total, t: "obras y proyectos públicos registrados por el MEF", href: "/proyecto#datos" },
      { v: mo.costo_actualizado_total / 1e12, d: 2, pre: "S/ ", suf: " billones", t: "es lo que hoy cuestan, sumadas, todas esas inversiones", href: "/proyecto#metricas" },
      { v: Math.round(mo.saldo_por_ejecutar_total / 1e9), pre: "S/ ", suf: " mil millones", t: "falta gastar en ellas para terminarlas (saldo por ejecutar)", href: "/proyecto#metricas" },
      { v: niv("GL").pct, d: 1, suf: " %", t: `de las inversiones están ${aCargo("GL")}`, href: "/proyecto#metricas" },
    ],
    [
      { v: sob, tono: "w", t: "con alerta de sobrecosto: hoy cuestan la mitad o más de lo aprobado al inicio", href: "/proyecto#alertas" },
      { v: al("sobrecosto").pct, d: 1, suf: " %", tono: "w", t: "de todas las inversiones tiene alerta de sobrecosto", href: "/proyecto#metricas" },
      { v: al("ambas").inversiones, tono: "w", t: "tienen las dos alertas a la vez: sobrecosto y posible paralización", href: "/proyecto#metricas" },
    ],
    [
      { v: par, tono: "r", t: "con alerta de posible paralización: van entre 40 % y 99 % de avance y llevan 6 meses sin gastar dinero", href: "/proyecto#alertas" },
      { v: al("posible_paralizacion").pct, d: 1, suf: " %", tono: "r", t: "de todas las inversiones tiene alerta de posible paralización", href: "/proyecto#metricas" },
      { v: vacioAvance.pct, d: 1, suf: " %", t: "no tiene registrado el avance físico en el archivo oficial: un vacío de los datos que mostramos", href: "/proyecto#metricas" },
    ],
    [
      { v: 4, t: "«herramientas» (funciones que el asistente puede usar), sin cuenta ni clave", href: "/proyecto#herramientas" },
      { v: de(con.exactitud), suf: ` de ${n}`, tono: "a", t: `preguntas de prueba acertadas con ObraClara; sin él, ${de(sin.exactitud)} de ${n}`, href: "/evaluacion" },
      { v: de(con.inventada), suf: ` de ${n}`, tono: "a", t: `respuestas con cifras inventadas con ObraClara; sin él, ${de(sin.inventada)} de ${n}`, href: "/evaluacion" },
      { v: pr.pasan, suf: ` de ${pr.total}`, t: "pruebas automáticas pasan antes de publicar cada cambio", href: "/proyecto#pruebas" },
    ],
  ];

  const cinta: Cifra[] = [
    { v: total, t: "inversiones activas en el registro del MEF", href: "/proyecto#datos" },
    ...(["GL", "GR", "GN"] as const).map((k): Cifra => ({ v: niv(k).pct, d: 1, suf: " %", t: aCargo(k), href: "/proyecto#metricas" })),
    { v: dep.inversiones, t: `en ${titulo(dep.departamento)}, el departamento con más inversiones`, href: "/proyecto#metricas" },
    { v: mo.costo_actualizado_total / 1e12, d: 2, pre: "S/ ", suf: " billones", t: "de costo actualizado, sumando todas", href: "/proyecto#metricas" },
    { v: Math.round(mo.saldo_por_ejecutar_total / 1e9), pre: "S/ ", suf: " mil millones", t: "por ejecutar", href: "/proyecto#metricas" },
    { v: Math.round(mo.devengado_anio_total / 1e6), pre: "S/ ", suf: " millones", t: "gastados (devengados) este año", href: "/proyecto#metricas" },
    { v: sob, tono: "w", t: "alertas de sobrecosto", href: "/proyecto#alertas" },
    { v: par, tono: "r", t: "alertas de posible paralización", href: "/proyecto#alertas" },
    { v: al("ninguna").pct, d: 1, suf: " %", t: "de las inversiones sin ninguna alerta", href: "/proyecto#metricas" },
    { v: de(con.exactitud), pre: `${de(sin.exactitud)} → `, suf: ` de ${n}`, tono: "a", t: "respuestas exactas, sin y con ObraClara", href: "/evaluacion" },
    { v: de(con.inventada), pre: `${de(sin.inventada)} → `, tono: "a", t: "respuestas con cifras inventadas", href: "/evaluacion" },
    { v: de(con.estricta), suf: ` de ${n}`, t: "exactas con el criterio estricto", href: "/evaluacion" },
    { v: de(con.citacion), suf: ` de ${n}`, t: "citan la fuente oficial", href: "/evaluacion" },
    { v: EVAL.herramientaEsperada.usada, suf: ` de ${EVAL.herramientaEsperada.total}`, t: "usaron la herramienta esperada", href: "/evaluacion" },
    { v: MODELOS.length, t: "modelos de IA comparados, sin y con ObraClara", href: "/evaluacion#modelos" },
    ...MODELOS.filter((x) => x.id !== "principal").map((x): Cifra => ({ v: de(x.con.exactitud), pre: `${de(x.sin.exactitud)} → `, suf: ` de ${n}`, t: `exactas con ${x.nombre.replace(/\s*\(.*\)/, "")}`, href: "/evaluacion#modelos" })),
    { v: ok, suf: ` de ${llam}`, t: "llamadas al servidor respondidas sin error", href: "/proyecto#metricas" },
    { v: Math.min(...p50), d: 1, suf: ` a ${nf(Math.max(...p50), 1)} s`, t: "tarda en responder cada herramienta (mediana)", href: "/proyecto#metricas" },
    { v: ex.detalle.coinciden, suf: ` de ${ex.detalle.casos}`, t: "fichas idénticas al archivo oficial", href: "/proyecto#metricas" },
    { v: ex.detalle.camposIguales, suf: ` de ${ex.detalle.campos}`, t: "campos comprobados uno por uno", href: "/proyecto#metricas" },
    { v: ex.resumen.coinciden + ex.alertas.coinciden, suf: ` de ${ex.resumen.casos + ex.alertas.casos}`, t: "resúmenes y alertas recalculados que coinciden", href: "/proyecto#metricas" },
    { v: pr.pasan, suf: ` de ${pr.total}`, t: "pruebas automáticas pasan", href: "/proyecto#pruebas" },
    { v: Math.round(pr.coberturaLineas), suf: " %", t: "del código cubierto por las pruebas", href: "/proyecto#pruebas" },
  ];
  return { casillas, cinta, fecha: fechaLarga(m.fecha_descarga) };
}

const valor = (c: Cifra) =>
  `${c.pre ? `<span>${esc(c.pre)}</span>` : ""}<span class="n" data-n="${c.v}" data-d="${c.d ?? 0}">${nf(c.v, c.d ?? 0)}</span>${c.suf ? `<span>${esc(c.suf)}</span>` : ""}`;

/** Marquesina continua de cifras con enlace. El duplicado (para el bucle) queda oculto a lectores y teclado. */
export function marquesina(items: Cifra[], etiqueta: string): string {
  const grupo = (dup: boolean) => `<ul class="mq-g"${dup ? ' aria-hidden="true"' : ""}>${items.map((c) =>
    `<li class="${c.tono ?? ""}"><a href="${c.href}"${dup ? ' tabindex="-1"' : ""}><b>${valor(c)}</b> ${esc(c.t)}</a></li>`).join("")}</ul>`;
  return `<div class="mq" role="region" aria-label="${esc(etiqueta)}"><div class="mq-t">${grupo(false)}${grupo(true)}</div></div>`;
}

export function franjaCifras(m: Meta): string {
  const { casillas, cinta, fecha } = datos(m);
  const casilla = (lista: Cifra[]) => `<div class="rot">${lista.map((c, i) =>
    `<div class="it ${c.tono ?? ""}${i === 0 ? " on" : ""}"${i ? ' aria-hidden="true" inert' : ""}><dt>${valor(c)}</dt><dd>${esc(c.t)} <a class="mas" href="${c.href}">${DESTINO[c.href] ?? "Detalle"}<span aria-hidden="true"> →</span></a></dd></div>`).join("")}
${lista.length > 1 ? `<span class="pts" aria-hidden="true">${lista.map((_, i) => `<i${i === 0 ? ' class="on"' : ""}></i>`).join("")}</span>` : ""}</div>`;
  return `<section class="cifras" id="cifras" aria-label="Cifras de la base de datos y de la evaluación"><div class="wrap">
<dl aria-live="polite">${casillas.map(casilla).join("")}</dl>
${marquesina(cinta, "Más cifras")}
<div class="cifras-p"><p>Cifras de la base cargada el ${esc(fecha)} desde el archivo oficial del MEF; las de calidad y evaluación, de las mediciones publicadas en el repositorio.</p><button class="copiar cf-pausa" type="button" aria-pressed="false" hidden>Pausar</button></div>
</div></section>`;
}

export const cifrasCss = String.raw`
.cifras{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--bg-2)}
.cifras dl{margin:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.cifras .rot{display:grid;grid-template-rows:auto auto;padding:clamp(28px,4vw,48px) clamp(16px,2.4vw,32px) clamp(20px,2.6vw,28px)}
.cifras .rot+.rot{border-left:1px solid var(--line)}
.cifras .rot:first-child{padding-left:0}
.cifras .it{grid-area:1/1;align-self:start}
.cifras dt{font:600 clamp(2rem,1.3rem + 2.6vw,3.4rem)/1.05 var(--serif);letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.cifras dt .n{white-space:nowrap}
.cifras dt span:not(.n){font-size:.5em;letter-spacing:0;color:var(--ink-2)}
.cifras dd{margin:12px 0 0;color:var(--ink-2);font-size:var(--s-1);max-width:28ch}
.cifras .mas{color:var(--mut);white-space:nowrap;text-decoration:none;border-bottom:1px solid var(--line-2)}
.cifras .mas:hover,.cifras .mas:focus-visible{color:var(--accent);border-color:currentColor}
.cifras .w dt,.mq .w b{color:var(--warn)}.cifras .r dt,.mq .r b{color:var(--risk)}.cifras .a dt,.mq .a b{color:var(--accent)}
.cifras .pts{grid-area:2/1;display:flex;gap:6px;margin-top:18px;align-self:end}
.cifras .pts i{width:14px;height:2px;border-radius:2px;background:var(--line-2);transition:background .4s,width .4s}
.cifras .pts i.on{width:24px;background:var(--ink-2)}
.js .cifras .it{transition:opacity .45s ease,transform .6s cubic-bezier(.2,.7,.2,1),visibility 0s linear .6s}
.js .cifras .it:not(.on){opacity:0;transform:translateY(14px);visibility:hidden}
.js .cifras .it.sale{transform:translateY(-14px)}
.js .cifras .it.on{transition-delay:.15s,.15s,0s}
.cifras-p{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;font-size:var(--s-1);color:var(--mut)}
.cifras-p p{margin:0}
.cf-pausa{flex:none}
@media (max-width:860px){.cifras dl{grid-template-columns:repeat(2,minmax(0,1fr))}.cifras .rot:nth-child(3){border-left:0;padding-left:0}.cifras .rot:nth-child(n+3){border-top:1px solid var(--line)}}
@media (max-width:420px){.cifras .rot{padding-right:10px}.cifras .rot+.rot:nth-child(even){padding-left:14px}}

.mq{border-top:1px solid var(--line);overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.mq-t{display:flex;width:max-content;animation:mq var(--mq-dur,160s) linear infinite}
.mq:hover .mq-t,.mq:focus-within .mq-t,.cf-quieto .mq-t{animation-play-state:paused}
.mq-g{display:flex;list-style:none;margin:0;padding:0}
.mq-g li{display:flex;align-items:center;white-space:nowrap;padding:14px 0;font-size:var(--s-1);color:var(--ink-2)}
.mq-g li::after{content:"";width:4px;height:4px;border-radius:50%;background:var(--line-2);margin:0 22px}
.mq-g a{color:inherit;text-decoration:none}
.mq-g a:hover,.mq-g a:focus-visible{color:var(--ink)}
.mq-g a:hover b{text-decoration:underline;text-underline-offset:3px}
.mq-g b{font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums;margin-right:2px}
@keyframes mq{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){
 .mq{-webkit-mask-image:none;mask-image:none}.cifras .pts{display:none}
 .mq-t{width:auto}.mq-g{flex-wrap:wrap;column-gap:0}.mq-g[aria-hidden]{display:none}
 .mq-g li{padding:8px 0}
}
.js .cifras.rm .it{transform:none;transition:opacity .8s ease,visibility 0s linear .8s}
.js .cifras.rm .it.on{transition:opacity .8s ease,visibility 0s}
.cifras.rm .pts{display:flex}.cifras.rm .pts i{transition:none}
.cifras.rm .mq-t{animation:none;width:auto}
.cifras.rm .mq-g{flex-wrap:nowrap;transition:opacity .5s ease}
.cifras.rm .mq-g.cf-fade{opacity:0}
.cifras.rm .mq-g li{padding:14px 0}
.cifras.rm .mq-g li.ult::after{display:none}
.cifras.rm .mq-g li.largo{white-space:normal}
.cifras.rm .mq-g li.fuera{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

// Rota una casilla a la vez (escalonado), pausa al pasar el mouse, al enfocar, fuera de pantalla, con la pestaña oculta
// o con el botón. Con movimiento reducido (clase rm): fundido cruzado sin conteo y cinta por páginas cada 4 s.
export const cifrasScript = String.raw`(function(){
var s=document.getElementById('cifras');if(!s)return;
var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(rm)s.classList.add('rm');
var rots=[].slice.call(s.querySelectorAll('.rot')).filter(function(r){return r.querySelectorAll('.it').length>1});
var btn=s.querySelector('.cf-pausa'),mq=s.querySelector('.mq'),mqt=s.querySelector('.mq-t');
var hover=false,foco=false,visto=false,manual=false,k=0,tim=null,PASO=3200,ptim=null,PPASO=4000;
var g=s.querySelector('.mq-g:not([aria-hidden])'),lis=g?[].slice.call(g.querySelectorAll('li')):[],pags=[],pi=0;
function mostrar(n){pi=n;lis.forEach(function(li){li.classList.add('fuera');li.classList.remove('ult')});
 (pags[n]||[]).forEach(function(li,j,a){li.classList.remove('fuera');if(j===a.length-1)li.classList.add('ult')})}
function paginar(){if(!rm||!g)return;mq.style.minHeight='';
 lis.forEach(function(li){li.classList.remove('fuera','ult','largo')});
 var W=mq.clientWidth,cur=[],w=0;pags=[];
 lis.forEach(function(li){var x=li.getBoundingClientRect().width;if(cur.length&&w+x>W){pags.push(cur);cur=[];w=0}if(x>W)li.classList.add('largo');cur.push(li);w+=x});
 if(cur.length)pags.push(cur);var h=0;
 for(var i=0;i<pags.length;i++){mostrar(i);h=Math.max(h,mq.getBoundingClientRect().height)}
 mq.style.minHeight=h+'px';mostrar(pi<pags.length?pi:0)}
function pasar(){if(pags.length<2)return;g.classList.add('cf-fade');
 setTimeout(function(){mostrar((pi+1)%pags.length);g.classList.remove('cf-fade')},500)}
function ptic(){ptim=null;if(quieto())return;pasar();pprog()}
function pprog(){if(rm&&!ptim&&!quieto())ptim=setTimeout(ptic,PPASO)}
function fmt(v,d){var x=v.toFixed(d).split('.');return x[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(d?','+x[1]:'')}
function contar(el,desde){var fin=Number(el.getAttribute('data-n')),d=Number(el.getAttribute('data-d'))||0,t0=null,dur=900;
 function p(t){if(!t0)t0=t;var q=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-q,3);el.textContent=fmt(desde+(fin-desde)*e,d);if(q<1)requestAnimationFrame(p);else el.textContent=fmt(fin,d)}requestAnimationFrame(p)}
function girar(r){var its=r.querySelectorAll('.it'),pts=r.querySelectorAll('.pts i'),i=0;
 its.forEach(function(it,j){if(it.classList.contains('on'))i=j});var n=(i+1)%its.length,a=its[i],b=its[n];
 a.classList.remove('on');a.classList.add('sale');a.setAttribute('aria-hidden','true');a.inert=true;
 setTimeout(function(){a.classList.remove('sale')},650);
 b.classList.add('on');b.removeAttribute('aria-hidden');b.inert=false;
 if(pts[i])pts[i].classList.remove('on');if(pts[n])pts[n].classList.add('on');
 var num=b.querySelector('.n');if(num&&!rm){var f=Number(num.getAttribute('data-n'));contar(num,f*.7)}}
function quieto(){return hover||foco||!visto||manual||document.hidden}
function tic(){tim=null;if(quieto())return;if(rots.length){girar(rots[k%rots.length]);k++}programar()}
function programar(){if(!tim&&!quieto())tim=setTimeout(tic,PASO)}
function estado(){s.classList.toggle('cf-quieto',manual);if(quieto()){clearTimeout(tim);tim=null;clearTimeout(ptim);ptim=null}else{programar();pprog()}}
s.addEventListener('mouseenter',function(){hover=true;estado()});s.addEventListener('mouseleave',function(){hover=false;estado()});
s.addEventListener('focusin',function(){foco=true;estado()});s.addEventListener('focusout',function(e){if(!s.contains(e.relatedTarget)){foco=false;estado()}});
document.addEventListener('visibilitychange',estado);
if(btn){btn.hidden=false;btn.addEventListener('click',function(){manual=!manual;btn.setAttribute('aria-pressed',String(manual));btn.textContent=manual?'Reanudar':'Pausar';estado()})}
if(rm&&g){paginar();var rt=null;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(paginar,200)});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(paginar);
 g.addEventListener('focusin',function(e){var li=e.target.closest('li');for(var i=0;i<pags.length;i++)if(pags[i].indexOf(li)>=0&&i!==pi){g.classList.remove('cf-fade');mostrar(i)}})}
else if(mqt){var w=mqt.scrollWidth/2;if(w>0)mqt.style.setProperty('--mq-dur',Math.round(w/38)+'s')}
var primera=true;
function ver(v){visto=v;if(v&&primera){primera=false;if(!rm)s.querySelectorAll('.it.on .n').forEach(function(el){contar(el,0)})}estado()}
if('IntersectionObserver' in window)new IntersectionObserver(function(es){ver(es[0].isIntersecting)},{threshold:.25}).observe(s);else ver(true);
})();`;
