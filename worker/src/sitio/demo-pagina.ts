import { CASOS_DEMO, RESUMEN_DEMO, type CasoDemo, type LadoDemo } from "./demo-datos";
import { enSencillo, esc, fechaLarga, shell, type Meta } from "./layout";

// Página /demo: casos preparados, gráficos con los datos reales de cada herramienta y «Probar en vivo».
// Los textos de cada respuesta y los datos de los gráficos vienen de demo-datos.ts (generado por eval/exportar_demo.mjs).

const TEXTOS: Record<string, { etiqueta: string; titulo: string; significa: string }> = {
  B02: { etiqueta: "Buscar", titulo: "Las obras de salud más caras de Piura", significa: "Cada barra es una obra y su largo es lo que cuesta hoy. La primera es la más cara. La búsqueda devuelve hasta 20 y dice cuántas hay en total, así que la IA no tiene que adivinar ni contar a ojo." },
  D04: { etiqueta: "Detalle de una obra", titulo: "Una obra: lo aprobado frente a lo que cuesta hoy", significa: "La barra gris es lo que se aprobó al inicio y la roja, lo que cuesta hoy. Si la roja es mucho más larga, la obra se encareció. Es una señal para mirarla con atención, no una prueba de que algo esté mal." },
  A07: { etiqueta: "Alertas", titulo: "Obras con más meses sin gastar", significa: "Cada barra es una obra con avance parcial que lleva muchos meses sin registrar gasto. Cuanto más larga la barra, más tiempo detenida. Es un indicio de posible paralización, no una acusación." },
  R03: { etiqueta: "Resumen", titulo: "Un grupo de obras en tres cifras", significa: "Las barras suman en soles todas las obras del grupo: lo que cuestan, lo que falta por ejecutar y lo que ya se gastó este año. Las cifras de abajo cuentan cuántas obras tienen alertas." },
};

const ICONOS = [
  `<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>`,
  `<path d="M14 7 17 4l3 3-3 3M10 17l-3 3-3-3 3-3"/><path d="M17 7 7 17"/>`,
  `<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>`,
  `<path d="M6 3h9l4 4v14H6V3Z"/><path d="m9 14 2 2 4-4"/>`,
];
const PASOS: [string, string][] = [
  ["Pregunta", "Una persona escribe una duda sobre una obra pública."],
  ["La IA elige una herramienta", "Decide cuál de las 4 herramientas del MCP le sirve."],
  ["El servidor consulta los datos", "Busca en los datos oficiales del MEF, sin inventar."],
  ["Respuesta con fuente", "La IA responde con las cifras y dice de dónde salieron."],
];

const css = String.raw`
.dm-h{padding:clamp(40px,6vw,80px) 0 clamp(24px,3vw,40px)}
.dm-h .lead{margin-top:20px}
.dm-flujo{list-style:none;margin:clamp(28px,4vw,48px) 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;counter-reset:p}
.dm-flujo li{position:relative;border:1px solid var(--line);background:var(--surface);border-radius:var(--r-l);padding:18px 16px 16px;box-shadow:var(--shadow)}
.dm-flujo li:not(:last-child)::after{content:"";position:absolute;right:-12px;top:50%;width:12px;height:2px;background:var(--line-2)}
.dm-flujo svg{width:34px;height:34px;color:var(--accent);margin-bottom:10px}
.dm-flujo b{display:block;font:600 var(--s0)/1.3 var(--sans);margin-bottom:4px}
.dm-flujo b span{font:500 var(--s-1)/1 var(--mono);color:var(--mut);margin-right:6px}
.dm-flujo p{font-size:var(--s-1);color:var(--ink-2);line-height:1.45}
.dm-nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}
.dm-nav a{border:1px solid var(--line-2);border-radius:999px;padding:7px 14px;font-size:var(--s-1);text-decoration:none;background:var(--surface)}
.dm-nav a:hover{border-color:var(--ink)}
.dm-caso{padding:clamp(40px,5vw,72px) 0;border-top:1px solid var(--line);scroll-margin-top:72px}
.dm-etq{font:500 var(--s-1)/1 var(--mono);color:var(--mut);margin-bottom:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.dm-etq b{color:var(--accent);font-weight:500}
.dm-etq code{background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:2px 7px}
.dm-q{font-size:var(--s2);max-width:30ch;max-width:none}
.dm-comp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:24px}
.dm-lado{border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);padding:18px;display:flex;flex-direction:column;gap:12px;min-width:0}
.dm-lado.sin{border-top:4px solid var(--risk)}
.dm-lado.con{border-top:4px solid var(--accent)}
.dm-lado h3{display:flex;justify-content:space-between;gap:8px;align-items:baseline;flex-wrap:wrap}
.dm-lado h3 small{font:400 var(--s-1)/1 var(--mono);color:var(--mut)}
.dm-resp{white-space:pre-line;overflow-wrap:anywhere;font-size:var(--s-1);line-height:1.55;color:var(--ink-2);flex:1}
.dm-lado details summary{cursor:pointer;font-size:var(--s-1);color:var(--accent);font-weight:600}
.dm-lado details .dm-resp{margin-top:8px;max-height:320px;overflow:auto;border-top:1px dashed var(--line);padding-top:8px}
.dm-sel{display:flex;flex-wrap:wrap;gap:8px}
.dm-sel span{font-size:var(--s-1);font-weight:600;border-radius:999px;padding:4px 11px;display:inline-flex;gap:6px;align-items:center}
.dm-sel .ok{background:var(--accent-soft);color:var(--accent-2)}
.dm-sel .mal{background:var(--risk-soft);color:var(--risk)}
.dm-ref{margin-top:16px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:var(--r);background:var(--accent-soft);padding:14px 18px}
.dm-ref b{display:block;font:500 var(--s-1)/1 var(--mono);color:var(--mut);margin-bottom:6px}
.dm-ref p{overflow-wrap:anywhere}
.dm-graf{margin-top:28px;border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);padding:clamp(16px,3vw,28px);box-shadow:var(--shadow)}
.dm-graf>h3{font-family:var(--serif);font-size:var(--s2)}
.dm-graf>h3 small{display:block;font:500 var(--s-1)/1.3 var(--mono);color:var(--mut);margin-bottom:6px}
.dm-gcols{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(20px,4vw,48px);align-items:start;margin-top:18px}
.dm-fig{margin:0;max-width:560px}
.dm-fig svg{width:100%;height:auto;overflow:visible}
.dm-fig .gl{font:500 11.5px var(--sans);fill:var(--ink-2)}
.dm-fig .gv{font:700 11.5px var(--sans);fill:var(--ink)}
.dm-fig .gb{fill:var(--bg-2)}
.dm-fig .b1{fill:var(--accent)}.dm-fig .b2{fill:var(--mut)}.dm-fig .b3{fill:var(--warn)}.dm-fig .b4{fill:var(--risk)}
.dm-fig .leg{margin-top:10px;font-size:var(--s-1);color:var(--ink-2)}
.dm-fig figcaption{margin-top:6px;font:400 12px/1.4 var(--mono);color:var(--mut)}
.dm-sig{border-left:4px solid var(--accent);padding:2px 0 2px 14px}
.dm-vivo{margin-top:18px;display:flex;flex-wrap:wrap;gap:10px 12px;align-items:center}
.dm-vivo .btn{cursor:pointer;font-family:inherit}
.dm-vivo .btn[disabled]{opacity:.6;cursor:progress}
.dm-est{font-size:var(--s-1);color:var(--ink-2);min-height:1.4em}
.dm-est.err{color:var(--risk)}
.dm-llamada{margin-top:10px;background:var(--code-bg);color:var(--code-ink);border-radius:var(--r);padding:10px 14px;font:400 12px/1.5 var(--mono);overflow-wrap:anywhere}
.dm-res{padding:clamp(48px,6vw,88px) 0;border-top:1px solid var(--line)}
.dm-cifras{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:28px}
.dm-cifra{border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);padding:18px}
.dm-cifra h3{font-size:var(--s-1);color:var(--mut);font-weight:500;margin-bottom:10px}
.dm-cifra div{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.dm-cifra strong{font:600 var(--s3)/1 var(--serif)}
.dm-cifra .n1{color:var(--risk)}.dm-cifra .n2{color:var(--accent)}
.dm-cifra small{color:var(--mut)}
.dm-res .btn{margin-top:28px}
@media (max-width:900px){.dm-flujo{grid-template-columns:repeat(2,minmax(0,1fr))}.dm-flujo li:nth-child(2)::after{display:none}.dm-flujo li::after{display:none!important}}
@media (max-width:900px){.dm-gcols{grid-template-columns:minmax(0,1fr)}.dm-lado-d{margin-top:16px}}
@media (max-width:760px){.dm-comp,.dm-cifras{grid-template-columns:minmax(0,1fr)}}
@media (max-width:480px){.dm-flujo{grid-template-columns:minmax(0,1fr)}}
`;

const lado = (l: LadoDemo, cond: "sin" | "con", id: string): string => {
  const marca = (ok: boolean, t: string) => `<span class="${ok ? "ok" : "mal"}"><span aria-hidden="true">${ok ? "✓" : "✗"}</span>${t}: ${ok ? "sí" : "no"}</span>`;
  return `<div class="dm-lado ${cond}">
<h3>${cond === "sin" ? "IA sola (sin MCP)" : "IA + MCP"}<small>tardó ${Math.round(l.latencia_s)} s en la evaluación</small></h3>
<p class="dm-resp">${esc(l.corta)}</p>
${l.completa.length > l.corta.length ? `<details><summary>Ver completa</summary><p class="dm-resp">${esc(l.completa)}</p></details>` : ""}
<div class="dm-sel" aria-label="Resultado en la evaluación de ${esc(id)}">${marca(l.exacta, "Exacta")}${marca(l.cita, "Cita la fuente")}${l.inventada ? `<span class="mal"><span aria-hidden="true">✗</span>Trae cifras que no coinciden</span>` : ""}</div>
</div>`;
};

const caso = (c: CasoDemo, i: number): string => {
  const t = TEXTOS[c.id];
  return `<section class="dm-caso" id="caso-${i + 1}" aria-labelledby="caso-${i + 1}-t" data-caso="${i}">
<div class="wrap">
<p class="dm-etq"><b>Caso ${i + 1}</b><span>${esc(t.etiqueta)}</span><code>${esc(c.herramienta)}</code><span>pregunta ${esc(c.id)} de la evaluación</span></p>
<h2 class="dm-q" id="caso-${i + 1}-t">«${esc(c.pregunta)}»</h2>
<div class="dm-comp">${lado(c.sin, "sin", c.id)}${lado(c.con, "con", c.id)}</div>
<div class="dm-ref"><b>Respuesta oficial de referencia</b><p>${esc(c.referencia)}</p></div>
<div class="dm-graf">
<h3><small>El MCP con gráficas</small>${esc(t.titulo)}</h3>
<div class="dm-gcols"><figure class="dm-fig" data-herr="${esc(c.herramienta)}" data-caso="${i}"><div class="svgbox"></div><p class="leg"></p><figcaption class="orig">Datos que devolvió la herramienta el ${esc(fechaLarga(c.fecha_corte))}.</figcaption></figure>
<div class="dm-lado-d"><p class="dm-sig"><b>Qué significa:</b> ${esc(t.significa)}</p>
<div class="dm-vivo">
<button class="btn btn-p" type="button" data-vivo="${i}">Probar en vivo</button>
<a class="btn btn-s" href="/asistente" target="_blank" rel="noopener" data-pregunta="${esc(c.pregunta)}">Preguntarle al asistente</a>
<span class="dm-est" role="status" aria-live="polite"></span>
</div>
<p class="dm-llamada"><span aria-hidden="true">→ </span>tools/call ${esc(c.herramienta)} ${esc(JSON.stringify(c.args))}</p>
</div></div>
</div>
</div>
</section>`;
};

const script = String.raw`(function(){
var d=document,W=360,TXT=null;
try{TXT=JSON.parse(d.getElementById('demo-datos').textContent)}catch(e){return}
function E(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function nf(v,n){return Number(v).toLocaleString('es-PE',{minimumFractionDigits:n||0,maximumFractionDigits:n||0}).replace(/,/g,' ')}
function sol(v){v=Number(v);if(v>=1e9)return 'S/ '+nf(v/1e9,2)+' mil millones';if(v>=1e6)return 'S/ '+nf(v/1e6,1)+' millones';if(v>=1e3)return 'S/ '+nf(v/1e3,0)+' mil';return 'S/ '+nf(v,0)}
function nom(s,n){s=String(s||'').toLowerCase();s=s.charAt(0).toUpperCase()+s.slice(1);return s.length>n?s.slice(0,n-1)+'…':s}
function barras(filas,desc){var H=8+filas.length*40,mx=0,i,s;for(i=0;i<filas.length;i++)if(filas[i].v>mx)mx=filas[i].v;if(!mx)mx=1;
 s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+E(desc)+'" focusable="false">';
 for(i=0;i<filas.length;i++){var f=filas[i],y=8+i*40,w=Math.max(3,Math.min(1,Math.max(0,f.v)/mx)*W);
  s+='<text class="gl" x="0" y="'+(y+11)+'">'+E(f.l)+'</text><text class="gv" x="'+W+'" y="'+(y+11)+'" text-anchor="end">'+E(f.t)+'</text><rect class="gb" x="0" y="'+(y+18)+'" width="'+W+'" height="10" rx="5"/><rect class="'+f.c+'" x="0" y="'+(y+18)+'" width="'+w.toFixed(1)+'" height="10" rx="5"/>'}
 return s+'</svg>'}
function dibujar(fig,herr,args,datos){var f=[],leg='',desc='',inv=(Array.isArray(datos.inversiones)?datos.inversiones:[]).slice(0,8),i,x;
 if(herr==='buscar_inversiones'){inv.sort(function(a,b){return b.costo_actualizado-a.costo_actualizado});
  for(i=0;i<inv.length;i++){x=inv[i];f.push({l:x.codigo_unico+' · '+nom(x.nombre,30),v:x.costo_actualizado,t:sol(x.costo_actualizado),c:i?'b2':'b1'})}
  desc='Barras con el costo actualizado de las '+inv.length+' inversiones más caras';leg='Se muestran '+inv.length+' de '+nf(datos.total||inv.length)+' inversiones encontradas.'}
 else if(herr==='alertas_inversion'){var sob=args.tipo==='sobrecosto';
  inv.sort(function(a,b){return sob?b.sobrecosto_pct-a.sobrecosto_pct:b.meses_sin_devengado-a.meses_sin_devengado});
  for(i=0;i<inv.length;i++){x=inv[i];f.push({l:x.codigo_unico+' · '+nom(x.entidad||x.nombre,30),v:sob?x.sobrecosto_pct:x.meses_sin_devengado,t:sob?nf(x.sobrecosto_pct,0)+' % más':nf(x.meses_sin_devengado)+' meses',c:i?'b3':'b4'})}
  desc=sob?'Barras con el sobrecosto de las inversiones con alerta':'Barras con los meses sin gasto de las inversiones con alerta';leg='Se muestran '+inv.length+' de '+nf(datos.total||inv.length)+' inversiones con alerta.'}
 else if(herr==='detalle_inversion'){
  f=[{l:'Monto aprobado (viable)',v:datos.monto_viable,t:sol(datos.monto_viable),c:'b2'},{l:'Costo actualizado',v:datos.costo_actualizado,t:sol(datos.costo_actualizado),c:'b4'},{l:'Presupuesto de este año',v:datos.pim_anio,t:sol(datos.pim_anio),c:'b1'},{l:'Gastado este año',v:datos.dev_anio,t:sol(datos.dev_anio),c:'b3'}];
  desc='Barras que comparan el monto aprobado, el costo actualizado y el gasto del año de una obra';
  leg=E(nom(datos.nombre,70))+'. El costo subió '+nf(datos.sobrecosto_pct,1)+' % sobre lo aprobado ('+nf(datos.costo_actualizado/datos.monto_viable,1)+' veces). Avance físico: '+nf(datos.avance_fisico,0)+' %.'}
 else{f=[{l:'Costo actualizado total',v:datos.costo_actualizado_total,t:sol(datos.costo_actualizado_total),c:'b1'},{l:'Falta por ejecutar',v:datos.saldo_por_ejecutar,t:sol(datos.saldo_por_ejecutar),c:'b3'},{l:'Gastado este año',v:datos.devengado_anio_actual,t:sol(datos.devengado_anio_actual),c:'b2'}];
  desc='Barras con el costo total, lo que falta ejecutar y lo gastado este año';
  leg=nf(datos.inversiones)+' inversiones · '+nf(datos.alertas_sobrecosto)+' con alerta de sobrecosto · '+nf(datos.alertas_paralizacion)+' con posible paralización.'}
 if(herr==='resumen_inversiones'&&datos.costo_actualizado_total==null)f=[];
 if(!f.length){fig.querySelector('.svgbox').innerHTML='<p class="dm-est">La herramienta no devolvió inversiones para este caso.</p>';fig.querySelector('.leg').textContent='';return}
 fig.querySelector('.svgbox').innerHTML=barras(f,desc);fig.querySelector('.leg').innerHTML=leg}
function lee(txt){var t=String(txt).trim(),j=null;if(t.charAt(0)==='{')j=JSON.parse(t);else{var ls=t.split('\n');for(var i=0;i<ls.length;i++)if(ls[i].indexOf('data:')===0){j=JSON.parse(ls[i].slice(5));break}}
 if(!j)throw new Error('sin respuesta');if(j.error)throw new Error(j.error.message||'error');
 var r=j.result;if(!r||r.isError)throw new Error('error de la herramienta');return JSON.parse(r.content[0].text).datos}
var figs=d.querySelectorAll('.dm-fig');
for(var k=0;k<figs.length;k++){var c=TXT[figs[k].getAttribute('data-caso')];if(c)dibujar(figs[k],c.herramienta,c.args,c.datos)}
d.addEventListener('click',function(e){var t=e.target,b=t.closest&&t.closest('[data-vivo]'),a=t.closest&&t.closest('[data-pregunta]');
 if(a){var est=a.parentNode.querySelector('.dm-est'),q=a.getAttribute('data-pregunta');
  if(navigator.clipboard)navigator.clipboard.writeText(q).then(function(){est.className='dm-est';est.textContent='Pregunta copiada: pégala en el asistente.'},function(){est.textContent='Copia la pregunta a mano y pégala en el asistente.'});
  else est.textContent='Copia la pregunta a mano y pégala en el asistente.';return}
 if(!b)return;var i=b.getAttribute('data-vivo'),c=TXT[i],sec=b.closest('.dm-caso'),fig=sec.querySelector('.dm-fig'),est=sec.querySelector('.dm-est'),t0=performance.now();
 b.disabled=true;est.className='dm-est';est.textContent='Consultando el servidor MCP…';
 fetch('/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:c.herramienta,arguments:c.args}})})
 .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(function(x){var datos=lee(x),s=((performance.now()-t0)/1000);
  dibujar(fig,c.herramienta,c.args,datos);fig.querySelector('.orig').textContent='Datos de hoy, consultados en vivo al servidor MCP.';
  est.textContent='Listo: el servidor respondió en '+nf(s,1)+' s y el gráfico se redibujó con los datos de hoy.'})
 .catch(function(){est.className='dm-est err';est.textContent='No se pudo consultar ahora. El gráfico grabado sigue siendo válido; vuelve a intentar.'})
 .then(function(){b.disabled=false})});
})();`;

export function demo(m: Meta): string {
  const datosJs = JSON.stringify(CASOS_DEMO.map((c) => ({ herramienta: c.herramienta, args: c.args, datos: c.datos }))).replace(/</g, "\\u003c");
  const r = RESUMEN_DEMO;
  const cifra = (t: string, a: number, b: number) =>
    `<div class="dm-cifra"><h3>${t}</h3><div><strong class="n1">${a}/${r.total}</strong><small>IA sola</small></div><div><strong class="n2">${b}/${r.total}</strong><small>IA + MCP</small></div></div>`;
  const cuerpo = `
<section class="dm-h"><div class="wrap">
<p class="eyebrow"><b>Demo</b> · pensada para proyectar</p>
<h1 style="max-width:22ch;font-size:var(--s3)">Mira el MCP trabajando, con casos reales.</h1>
<p class="lead">Cuatro preguntas ya preparadas, una por herramienta. En cada una ves a la IA sola frente a la IA conectada al MCP, un gráfico hecho con los datos que devolvió y, si quieres, la consulta en vivo.</p>
${enSencillo("La IA tarda en contestar, así que las respuestas de abajo ya están grabadas de la evaluación y aparecen al instante. El MCP es un «enchufe» que deja a la IA consultar los datos oficiales del Estado en vez de adivinar. «Probar en vivo» llama a ese enchufe ahora mismo y dibuja el gráfico con los datos de hoy.")}
<ol class="dm-flujo" aria-label="El flujo en cuatro pasos">${PASOS.map(([t, p], i) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[i]}</svg><b><span>${i + 1}</span>${esc(t)}</b><p>${esc(p)}</p></li>`).join("")}</ol>
<nav class="dm-nav" aria-label="Casos">${CASOS_DEMO.map((c, i) => `<a href="#caso-${i + 1}">Caso ${i + 1} · ${esc(TEXTOS[c.id].etiqueta)}</a>`).join("")}</nav>
</div></section>
${CASOS_DEMO.map(caso).join("\n")}
<section class="dm-res" id="resultados"><div class="wrap">
<h2>Así le fue en las 40 preguntas</h2>
<p class="lead" style="margin-top:16px">Las mismas 40 preguntas, con y sin el MCP. Con la conexión, la IA acertó ${r.con.exactas} de ${r.total}; sola, ${r.sin.exactas} de ${r.total}.</p>
<div class="dm-cifras">${cifra("Respuestas exactas", r.sin.exactas, r.con.exactas)}${cifra("Respuestas que citan la fuente", r.sin.citas, r.con.citas)}${cifra("Con cifras inventadas", r.sin.inventadas, r.con.inventadas)}</div>
<a class="btn btn-p" href="/evaluacion">Ver la evaluación completa</a>
</div></section>
<script type="application/json" id="demo-datos">${datosJs}</script>`;
  return shell({
    titulo: "Demo · ObraClara Perú",
    descripcion: "Casos preparados: la IA sola frente a la IA con el MCP de ObraClara, con gráficos de los datos reales y consulta en vivo.",
    ruta: "/demo",
    cuerpo,
    m,
    cssExtra: css,
    scriptExtra: script,
  });
}
