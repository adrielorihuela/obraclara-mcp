import { esc, fechaLarga, num, shell, type Meta } from "./layout";

const css = String.raw`
.pag-h{padding:clamp(40px,6vw,88px) 0 clamp(32px,4vw,56px)}
.pag-h .lead{margin-top:20px}
.prop{margin-top:clamp(28px,4vw,44px);display:grid;gap:14px;max-width:880px}
.prop .barra{height:14px;border-radius:7px;background:var(--surface-2);border:1px solid var(--line);display:flex;overflow:hidden}
.prop .barra span{display:block;height:100%;transform-origin:left;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}
.js .prop:not(.in) .barra span{transform:scaleX(0)}
.prop .b-w{background:var(--warn)}.prop .b-r{background:var(--risk)}
.prop ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px 28px;font-size:var(--s-1);color:var(--ink-2)}
.prop li{display:flex;align-items:center;gap:8px}
.prop li i{width:10px;height:10px;border-radius:3px;display:block}

.buscador{border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);box-shadow:var(--shadow)}
.buscador form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:16px;border-bottom:1px solid var(--line)}
.buscador .campo{display:flex;align-items:center;gap:10px;border:1px solid var(--line-2);border-radius:999px;padding:0 6px 0 16px;background:var(--bg);min-height:48px}
.buscador .campo:focus-within{border-color:var(--ink)}
.buscador .campo svg{width:18px;height:18px;color:var(--mut);flex:none}
.buscador input[type=search]{flex:1;min-width:0;border:0;background:transparent;font:inherit;color:var(--ink);outline:none;padding:10px 0}
.seg{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px}
.seg label{position:relative}
.seg input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}
.seg span{display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border:1px solid var(--line);border-radius:999px;font-size:14px;color:var(--ink-2);cursor:pointer}
.seg input:checked+span{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.seg input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}
.res-p{padding:14px 18px;font-size:var(--s-1);color:var(--mut);border-bottom:1px solid var(--line);margin:0}
.res-v{padding:40px 18px;text-align:center;color:var(--mut)}
.filas{list-style:none;margin:0;padding:0}
.filas li{display:grid;grid-template-columns:96px minmax(0,1fr) repeat(3,minmax(0,120px));gap:16px;padding:16px 18px;border-bottom:1px solid var(--line);align-items:start}
.filas li:last-child{border-bottom:0}
.filas .cod{font:500 13px/1.5 var(--mono);color:var(--ink-2)}
.filas .nom{font-weight:600;line-height:1.4}
.filas .ent{font-size:var(--s-1);color:var(--mut);margin-top:4px}
.filas .v{font-variant-numeric:tabular-nums;text-align:right;font-size:15px}
.filas .v small{display:block;font-size:12px;color:var(--mut)}
.filas .tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.filas li.cab{padding-top:12px;padding-bottom:12px;font:500 12px/1.3 var(--mono);color:var(--mut);background:var(--surface-2)}
@media (max-width:760px){.filas li{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px 12px}.filas .cod,.filas .main{grid-column:1/-1}.filas .v{text-align:left}.filas li.cab{display:none}}

.criterios{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4vw,56px)}
.criterios h3{margin:0 0 12px;display:flex;gap:10px;align-items:center}
.criterios p+p{margin-top:12px}
.criterios p{color:var(--ink-2)}
.criterios .f{font:500 14px/1.6 var(--mono);padding:12px 14px;background:var(--surface-2);border-radius:8px;margin:14px 0;color:var(--ink);overflow-x:auto}
@media (max-width:760px){.criterios{grid-template-columns:minmax(0,1fr)}}
.campos{margin:0;display:grid;grid-template-columns:220px minmax(0,1fr);border-top:1px solid var(--line)}
.campos dt,.campos dd{padding:14px 0;border-bottom:1px solid var(--line);margin:0}
.campos dt{font:500 14px/1.5 var(--mono)}
.campos dd{color:var(--ink-2)}
@media (max-width:640px){.campos{grid-template-columns:minmax(0,1fr)}.campos dt{border-bottom:0;padding-bottom:0}.campos dd{padding-top:4px}}
`;

const script = String.raw`(function(){
var f=document.getElementById('f'),r=document.getElementById('r');if(!f)return;
var esc=function(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var nf=function(n,d){return Number(n).toLocaleString('es-PE',{maximumFractionDigits:d==null?2:d}).replace(/,/g,' ')};
var soles=function(n){if(n==null)return '—';n=Number(n);return n>=1e6?'S/ '+nf(n/1e6,1)+' M':'S/ '+nf(n,0)};
var pct=function(n){return n==null?'—':nf(n,1)+' %'};
var menores={de:1,del:1,la:1,las:1,el:1,los:1,en:1,y:1,e:1,a:1,al:1,para:1,con:1,por:1,su:1,sus:1,o:1};
var nombre=function(t){return String(t||'').replace(/\s+/g,' ').trim().toLowerCase().split(' ').map(function(w,i){if(/^(i{1,3}|iv|vi{0,3})(-\d)?$/.test(w))return w.toUpperCase();return i>0&&menores[w]?w:w.charAt(0).toUpperCase()+w.slice(1)}).join(' ')};
function tipo(){var x=f.querySelector('input[name=t]:checked');return x?x.value:'buscar'}
async function consultar(e){if(e)e.preventDefault();var t=tipo(),q=document.getElementById('q').value.trim();
 r.setAttribute('aria-busy','true');r.innerHTML='<p class="res-v">Consultando…</p>';
 var u=t==='buscar'?'/api/buscar?texto='+encodeURIComponent(q):'/api/alertas?tipo='+t+'&texto='+encodeURIComponent(q);
 try{var d=await (await fetch(u)).json();
  if(d.error){r.innerHTML='<p class="res-v">'+esc(d.error)+'</p>';return}
  var inv=d.datos.inversiones||[];
  if(!inv.length){r.innerHTML='<p class="res-v">Sin resultados para «'+esc(q)+'». Prueba con otra palabra o con el nombre de un distrito.</p>';return}
  var h='<p class="res-p">'+nf(d.datos.total,0)+' resultados, se muestran '+esc(d.datos.mostrados)+' ordenados por costo actualizado. Fuente: '+esc(d.fuente)+', '+esc(d.fecha_descarga)+'.</p><ul class="filas"><li class="cab" aria-hidden="true"><span>Código</span><span>Inversión</span><span style="text-align:right">Costo actualizado</span><span style="text-align:right">Avance físico</span><span style="text-align:right">Sin devengado</span></li>';
  inv.forEach(function(i){var tg='';if(i.alerta_sobrecosto)tg+='<span class="tag tag-w">sobrecosto '+pct(i.sobrecosto_pct)+'</span>';if(i.alerta_paralizacion)tg+='<span class="tag tag-r">posible paralización</span>';
   h+='<li><span class="cod">'+esc(i.codigo_unico)+'</span><div class="main"><div class="nom">'+esc(nombre(i.nombre))+'</div><div class="ent">'+esc(i.entidad)+' · '+esc(i.departamento)+'</div>'+(tg?'<div class="tags">'+tg+'</div>':'')+'</div>'+
   '<span class="v">'+soles(i.costo_actualizado)+'<small>costo actualizado</small></span><span class="v">'+pct(i.avance_fisico)+'<small>avance físico</small></span><span class="v">'+(i.meses_sin_devengado==null?'—':esc(i.meses_sin_devengado)+(i.meses_sin_devengado==1?' mes':' meses'))+'<small>sin devengado</small></span></li>'});
  r.innerHTML=h+'</ul>';
 }catch(x){r.innerHTML='<p class="res-v">No se pudo consultar. Intenta de nuevo en un momento.</p>'}
 finally{r.removeAttribute('aria-busy')}}
f.addEventListener('submit',consultar);
f.querySelectorAll('input[name=t]').forEach(function(x){x.addEventListener('change',function(){consultar()})});
})();`;

const lupa = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;

export function datos(m: Meta): string {
  const total = Number(m.total_inversiones ?? 0), sob = Number(m.alertas_sobrecosto ?? 0), par = Number(m.alertas_paralizacion ?? 0);
  const p = (n: number) => (total ? ((n / total) * 100).toFixed(1) : "0");
  const cuerpo = `
<section class="pag-h"><div class="wrap">
<p class="eyebrow">Datos y alertas</p>
<h1 style="max-width:16ch">Lo que dicen los datos del MEF, sin intermediarios.</h1>
<p class="lead">Una sola fuente: el archivo <code>DETALLE_INVERSIONES.csv</code> del portal de datos abiertos del MEF, con las inversiones activas del Banco de Inversiones. Descargado el ${esc(fechaLarga(m.fecha_descarga))}.</p>
<div class="prop rv" aria-label="Proporción de inversiones con alertas">
<div class="barra" role="img" aria-label="${p(sob)} % con alerta de sobrecosto y ${p(par)} % con alerta de posible paralización, sobre ${num(total)} inversiones. Una inversión puede tener ambas."><span class="b-w" style="width:${p(sob)}%"></span><span class="b-r" style="width:${p(par)}%"></span></div>
<ul><li><i style="background:var(--warn)"></i>${num(sob)} con sobrecosto (${p(sob)} %)</li><li><i style="background:var(--risk)"></i>${num(par)} con posible paralización (${p(par)} %)</li><li><i style="background:var(--surface-2);border:1px solid var(--line-2)"></i>${num(total)} inversiones activas</li></ul>
<p class="small mut">Una inversión puede tener las dos alertas a la vez, por eso las barras pueden sumar más que el total con alguna alerta.</p>
</div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
<div class="buscador rv">
<form id="f" role="search">
<label class="campo"><span class="sr">Texto a buscar</span>${lupa}<input id="q" type="search" placeholder="Por ejemplo: hospital Piura" autocomplete="off"></label>
<button class="btn btn-p">Consultar</button>
<div class="seg" role="radiogroup" aria-label="Tipo de consulta">
<label><input type="radio" name="t" value="buscar" checked><span>Todas las inversiones</span></label>
<label><input type="radio" name="t" value="sobrecosto"><span>Con alerta de sobrecosto</span></label>
<label><input type="radio" name="t" value="paralizacion"><span>Con posible paralización</span></label>
</div>
</form>
<div id="r" aria-live="polite"><p class="res-v">Escribe una obra, entidad o lugar. Esta búsqueda usa las mismas consultas que las herramientas MCP, sin IA.</p></div>
</div>
</div></section>

<section class="sec"><div class="wrap">
<div class="head rv"><p class="eyebrow"><b>Criterios</b></p><h2>Cómo se calcula cada alerta.</h2></div>
<div class="criterios">
<div class="rv"><h3><span class="tag tag-w">sobrecosto</span></h3>
<p class="f">(costo_actualizado − monto_viable) / monto_viable ≥ 0.5</p>
<p>Compara el costo actualizado de la inversión con el monto con que fue declarada viable. Un aumento puede tener causas legítimas, como un expediente técnico con mayor alcance.</p>
<p>No se calcula cuando el monto viable es cero o falta.</p></div>
<div class="rv d1"><h3><span class="tag tag-r">posible paralización</span></h3>
<p class="f">40 ≤ avance_fisico &lt; 100 y meses_sin_devengado ≥ 6</p>
<p>Aproxima la definición de obra paralizada de la Ley 31589 con dos campos del archivo: el avance físico y el último mes con gasto devengado.</p>
<p>El archivo no registra si la entidad declaró la paralización; por eso es «posible».</p></div>
</div>
<p class="nota rv" style="margin-top:36px;max-width:760px">Las alertas son indicadores calculados con datos abiertos. No constituyen evidencia de irregularidades ni de corrupción y deben verificarse en la fuente oficial.</p>
</div></section>

<section class="sec"><div class="wrap narrow">
<div class="head rv"><p class="eyebrow"><b>Campos</b></p><h2>Qué significa cada cifra.</h2></div>
<dl class="campos rv">
<dt>codigo_unico</dt><dd>Identificador de la inversión en el Banco de Inversiones (Invierte.pe).</dd>
<dt>monto_viable</dt><dd>Monto con el que la inversión fue declarada viable, en soles.</dd>
<dt>costo_actualizado</dt><dd>Costo total vigente según el MEF, en soles.</dd>
<dt>avance_fisico</dt><dd>Porcentaje de avance físico reportado por la entidad.</dd>
<dt>avance_ejecucion</dt><dd>Avance de la ejecución financiera que publica el MEF, en porcentaje.</dd>
<dt>ultimo_devengado</dt><dd>Año y mes (AAAAMM) del último gasto devengado.</dd>
<dt>meses_sin_devengado</dt><dd>Meses entre el último devengado y la fecha de descarga.</dd>
</dl>
<p class="small mut rv" style="margin-top:24px">Fuente: <a href="${esc(m.url ?? "https://www.datosabiertos.gob.pe")}">${esc(m.fuente ?? "Ministerio de Economía y Finanzas")}</a>. Licencia Open Data Commons Attribution (ODC-BY). Atribución: «Fuente: MEF, Datos Abiertos».</p>
</div></section>`;
  return shell({
    titulo: "Datos y alertas · ObraClara Perú",
    descripcion: "Criterios de las alertas de sobrecosto y posible paralización, y búsqueda directa en los datos de inversión pública del MEF.",
    ruta: "/datos",
    cuerpo,
    m,
    cssExtra: css,
    scriptExtra: script,
  });
}
