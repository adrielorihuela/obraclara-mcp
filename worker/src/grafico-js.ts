import { agruparMiles, formatoValor, marcasEje, validarGrafico } from "./lib/grafico";

// Gráficos SVG dentro de las respuestas del asistente (/asistente, chats guardados y /c/:id).
// Solo createElementNS + textContent: el contenido del modelo nunca se interpreta como HTML.
export const graficoCss = String.raw`
:root{--g1:#0b6b55;--g2:#2f62c9;--g3:#b8680a;--g4:#b42318;--g5:#7a4fc0;--g6:#4b8f9e;--g7:#a0527a;--g8:#6b737b}
:root[data-theme=dark]{--g1:#4fc39c;--g2:#7aa2f7;--g3:#e2a24a;--g4:#f07a6b;--g5:#b896f0;--g6:#6fc4d4;--g7:#e08cb4;--g8:#9aa6b0}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--g1:#4fc39c;--g2:#7aa2f7;--g3:#e2a24a;--g4:#f07a6b;--g5:#b896f0;--g6:#6fc4d4;--g7:#e08cb4;--g8:#9aa6b0}}
.ocg{margin:12px 0;padding:14px 14px 10px;border:1px solid var(--line);border-radius:12px;background:var(--surface);max-width:760px;min-width:0}
.ocg-t{font:600 14.5px/1.35 var(--sans);color:var(--ink);margin:0 0 8px}
.ocg-c{position:relative;width:100%;min-width:0}
.ocg-c svg{display:block;width:100%;height:auto;overflow:visible;touch-action:pan-y}
.ocg svg text{font:400 11.5px/1 var(--sans);fill:var(--mut)}
.ocg svg .ocg-lt{fill:var(--ink-2)}
.ocg svg .ocg-ct{font-weight:700;font-size:15px;fill:var(--ink)}
.ocg svg .ocg-grid{stroke:var(--line);stroke-width:1}
.ocg svg .ocg-cero{stroke:var(--line-2);stroke-width:1.2}
.ocg-s0{fill:var(--g1);stroke:var(--g1)}.ocg-s1{fill:var(--g2);stroke:var(--g2)}.ocg-s2{fill:var(--g3);stroke:var(--g3)}.ocg-s3{fill:var(--g4);stroke:var(--g4)}
.ocg-s4{fill:var(--g5);stroke:var(--g5)}.ocg-s5{fill:var(--g6);stroke:var(--g6)}.ocg-s6{fill:var(--g7);stroke:var(--g7)}.ocg-s7{fill:var(--g8);stroke:var(--g8)}
.ocg svg .ocg-m{stroke-width:0;cursor:pointer;transition:opacity .15s}
.ocg svg .ocg-sl{stroke:var(--surface);stroke-width:2}
.ocg svg .ocg-ln{fill:none;stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round}
.ocg svg .ocg-pt{stroke:var(--surface);stroke-width:1.5}
.ocg svg.foco .ocg-m:not(.on){opacity:.45}
.ocg-tip{position:absolute;z-index:3;pointer-events:none;background:var(--ink);color:var(--bg);font:500 12.5px/1.4 var(--sans);padding:7px 10px;border-radius:8px;box-shadow:var(--shadow);max-width:240px;white-space:normal;opacity:0;transform:translateY(4px);transition:opacity .12s,transform .12s}
.ocg-tip.ver{opacity:1;transform:none}
.ocg-tip b{display:block;font-weight:600;margin-bottom:2px}
.ocg-pie{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:8px;border-top:1px solid var(--line);padding-top:8px}
.ocg-pie details{flex:1 1 auto;min-width:0}
.ocg-pie summary{cursor:pointer;font:500 12.5px/1.6 var(--sans);color:var(--mut)}
.ocg-pie summary:hover{color:var(--ink)}
.ocg-pie .tb{margin-top:6px;overflow-x:auto}
.ocg-pie table{border-collapse:collapse;font-size:12.5px}
.ocg-pie th,.ocg-pie td{border:1px solid var(--line);padding:4px 8px;text-align:left}
.ocg-pie td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.ocg-dl{margin-left:auto;display:flex;gap:6px}
.ocg-dl button{font:500 12px/1 var(--mono);padding:6px 9px;border-radius:7px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink-2);cursor:pointer;transition:border-color .15s,color .15s,transform .1s}
.ocg-dl button:hover{border-color:var(--ink);color:var(--ink)}.ocg-dl button:active{transform:scale(.96)}
.ocg-a .ocg-bh{animation:ocg-h .7s var(--ease,ease-out) both;transform-box:fill-box;transform-origin:left center}
.ocg-a .ocg-bv{animation:ocg-v .7s var(--ease,ease-out) both;transform-box:fill-box;transform-origin:center bottom}
.ocg-a .ocg-ln{stroke-dasharray:1;stroke-dashoffset:1;animation:ocg-l 1s var(--ease,ease-out) .1s forwards}
.ocg-a .ocg-pt,.ocg-a .ocg-sl{animation:ocg-f .5s ease-out both}
@keyframes ocg-h{from{transform:scaleX(0)}}@keyframes ocg-v{from{transform:scaleY(0)}}@keyframes ocg-l{to{stroke-dashoffset:0}}@keyframes ocg-f{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.ocg-a *{animation:none!important;stroke-dasharray:none!important;stroke-dashoffset:0!important}.ocg-tip{transition:none}}
`;

export const graficoJs = [validarGrafico, agruparMiles, formatoValor, marcasEje].map((f) => f.toString()).join("\n") + "\n" + String.raw`
var OC_GNS='http://www.w3.org/2000/svg';
function ocSv(tag,at,par){var e=document.createElementNS(OC_GNS,tag);for(var k in at)if(at[k]!==undefined&&at[k]!==null)e.setAttribute(k,String(at[k]));if(par)par.appendChild(e);return e}
function ocSvT(par,x,y,txt,at,max){var t=ocSv('text',at||{},par);t.setAttribute('x',x);t.setAttribute('y',y);var s=String(txt);
 if(max&&s.length>max){t.textContent=s.slice(0,Math.max(1,max-1)).trim()+'…';var ti=ocSv('title',{},t);ti.textContent=s}else t.textContent=s;return t}
// Marcas del eje horizontal que caben sin encimarse.
function ocGTicks(lo,hi,pw,u){var t=[];for(var c=6;c>=2;c--){t=marcasEje(lo,hi,c);var lw=t.reduce(function(m,v){return Math.max(m,formatoValor(v,u,true).length)},0)*6.6+10;if(pw/Math.max(1,t.length-1)>=lw)return t}return t}
function ocGCh(px){return Math.max(3,Math.floor(px/6.4))}
// Torta con más de 8 porciones: las menores se agrupan en «Otros».
function ocGTorta(g){var p=g.x.map(function(n,i){return {n:n,v:g.series[0].valores[i]||0}}).filter(function(o){return o.v>0});
 if(p.length>8){p.sort(function(a,b){return b.v-a.v});var r=p.slice(7).reduce(function(s,o){return s+o.v},0);p=p.slice(0,7);p.push({n:'Otros',v:r})}return p}
function ocGDibuja(cv,g,w,anim,tip){cv.textContent='';var svg,h,u=g.unidad,ns=g.series.length,ley=ns>1&&g.tipo!=='torta';
 var todos=[];g.series.forEach(function(s){s.valores.forEach(function(v){if(v!==null)todos.push(v)})});
 var mk=function(el,cat,ser,val,i){el.ocInfo={c:cat,s:ns>1?ser:'',v:val,i:i};el.classList.add('ocg-m');return el};
 var leyenda=function(y0){if(!ley)return 0;var x=0,y=y0,fil=0;g.series.forEach(function(s,j){var tw=Math.min(s.nombre.length,28)*6.4+26;if(x>0&&x+tw>w){x=0;y+=20;fil++}
   ocSv('rect',{x:x,y:y-9,width:11,height:11,rx:3,'class':'ocg-s'+(j%8)},svg);ocSvT(svg,x+16,y+1,s.nombre,{'class':'ocg-lt'},28);x+=tw});return (fil+1)*20+6};
 var lh=0;if(ley){var tmp=0,fl=1;g.series.forEach(function(s){var tw=Math.min(s.nombre.length,28)*6.4+26;if(tmp>0&&tmp+tw>w){tmp=0;fl++}tmp+=tw});lh=fl*20+6}
 if(g.tipo==='torta'){var por=ocGTorta(g),tot=por.reduce(function(s,o){return s+o.v},0),lado=w>=560,R=Math.min(lado?150:w/2-8,130),r0=R*0.58,
   filas=por.length*22,hh=lado?Math.max(2*R,filas)+8:2*R+16+filas;h=hh;
  svg=ocSv('svg',{viewBox:'0 0 '+w+' '+h,width:w,height:h,role:'img'});var cx=lado?R+4:w/2,cy=R+4,a=-Math.PI/2;
  por.forEach(function(o,i){var f=o.v/tot,a2=a+f*2*Math.PI,el;
   if(f>=0.9999){el=ocSv('path',{d:'M'+(cx-R)+' '+cy+'a'+R+' '+R+' 0 1 0 '+(2*R)+' 0a'+R+' '+R+' 0 1 0 '+(-2*R)+' 0M'+(cx-r0)+' '+cy+'a'+r0+' '+r0+' 0 1 1 '+(2*r0)+' 0a'+r0+' '+r0+' 0 1 1 '+(-2*r0)+' 0','fill-rule':'evenodd'},svg)}
   else{var big=a2-a>Math.PI?1:0,p1=[cx+R*Math.cos(a),cy+R*Math.sin(a)],p2=[cx+R*Math.cos(a2),cy+R*Math.sin(a2)],q1=[cx+r0*Math.cos(a2),cy+r0*Math.sin(a2)],q2=[cx+r0*Math.cos(a),cy+r0*Math.sin(a)];
    el=ocSv('path',{d:'M'+p1.join(' ')+'A'+R+' '+R+' 0 '+big+' 1 '+p2.join(' ')+'L'+q1.join(' ')+'A'+r0+' '+r0+' 0 '+big+' 0 '+q2.join(' ')+'Z'},svg)}
   el.setAttribute('class','ocg-sl ocg-s'+(i%8));el.style.animationDelay=(i*60)+'ms';mk(el,o.n,'',o.v,i);el.ocInfo.p=f;a=a2});
  ocSvT(svg,cx,cy-2,formatoValor(tot,u,true),{'class':'ocg-ct','text-anchor':'middle'});ocSvT(svg,cx,cy+16,'total',{'text-anchor':'middle'});
  var lx=lado?2*R+28:0,ly=lado?Math.max(14,cy-filas/2+14):2*R+30,lw=w-lx;
  por.forEach(function(o,i){var y=ly+i*22,val=formatoValor(o.v,u,true)+' · '+agruparMiles(o.v/tot*100,1)+' %';
   ocSv('rect',{x:lx,y:y-10,width:11,height:11,rx:3,'class':'ocg-s'+(i%8)},svg);
   ocSvT(svg,lx+18,y,o.n,{'class':'ocg-lt'},ocGCh(lw-18-val.length*6.6-10));ocSvT(svg,w,y,val,{'text-anchor':'end'})})}
 else if(g.tipo==='barras'){var n=g.x.length,bw=ns>1?Math.max(8,16-ns*1.5):18,fila=Math.max(26,ns*bw+10),maxl=g.x.reduce(function(m,s){return Math.max(m,s.length)},0),
   ml=Math.min(Math.max(60,maxl*6.4+10),w*0.4),tk=ocGTicks(Math.min(0,Math.min.apply(null,todos)),Math.max(0,Math.max.apply(null,todos)),w-Math.min(Math.max(60,maxl*6.4+10),w*0.4)-16,u),
   lo=tk[0],hi=tk[tk.length-1],mr=Math.max(16,formatoValor(hi,u,true).length*3.4),pw=w-ml-mr,top=lh+4;h=top+n*fila+26;
  svg=ocSv('svg',{viewBox:'0 0 '+w+' '+h,width:w,height:h,role:'img'});leyenda(14);
  var sx=function(v){return ml+(v-lo)/(hi-lo)*pw};
  tk.forEach(function(t){var x=sx(t);ocSv('line',{x1:x,x2:x,y1:top,y2:top+n*fila,'class':t===0?'ocg-cero':'ocg-grid'},svg);ocSvT(svg,x,top+n*fila+17,formatoValor(t,u,true),{'text-anchor':'middle'})});
  g.x.forEach(function(c,i){var y0=top+i*fila,gy=y0+(fila-ns*bw)/2;ocSvT(svg,ml-8,y0+fila/2+4,c,{'text-anchor':'end','class':'ocg-lt'},ocGCh(ml-10));
   g.series.forEach(function(s,j){var v=s.valores[i];if(v===null)return;var x0=sx(Math.min(0,v)),x1=sx(Math.max(0,v));
    var el=ocSv('rect',{x:x0,y:gy+j*bw,width:Math.max(1,x1-x0),height:bw-2,rx:3,'class':'ocg-bh ocg-s'+(j%8)},svg);el.style.animationDelay=Math.min(i*35,500)+'ms';mk(el,c,s.nombre,v,i)})})}
 else{var n2=g.x.length,num=g.tipo==='dispersion'&&g.x.every(function(s){return s!==''&&isFinite(Number(s))}),
   tk2=marcasEje(g.tipo==='lineas'||g.tipo==='dispersion'?Math.min.apply(null,todos):Math.min(0,Math.min.apply(null,todos)),g.tipo==='lineas'||g.tipo==='dispersion'?Math.max.apply(null,todos):Math.max(0,Math.max.apply(null,todos)),w<480?4:5),
   lo2=tk2[0],hi2=tk2[tk2.length-1],ml2=Math.max(36,tk2.reduce(function(m,t){return Math.max(m,formatoValor(t,u,true).length)},0)*6.4+10),pw2=w-ml2-12,
   slot=pw2/n2,maxl2=g.x.reduce(function(m,s){return Math.max(m,s.length)},0),rot=!num&&maxl2*6.4>slot-6,cada=rot?Math.max(1,Math.ceil(n2/Math.max(1,Math.floor(pw2/18)))):Math.max(1,Math.ceil(maxl2*6.4/Math.max(1,slot-6))),
   lmax=rot?16:Math.max(3,Math.floor((slot*cada-6)/6.4)),mb=rot?Math.min(16,maxl2)*6.4*0.64+22:28,top2=lh+10,ph=Math.round(Math.max(170,Math.min(300,w*0.45)));h=top2+ph+mb;
  svg=ocSv('svg',{viewBox:'0 0 '+w+' '+h,width:w,height:h,role:'img'});leyenda(14);
  var xlo=num?Math.min.apply(null,g.x.map(Number)):0,xhi=num?Math.max.apply(null,g.x.map(Number)):0;
  var sy=function(v){return top2+ph-(v-lo2)/(hi2-lo2)*ph},cxp=function(i){return num?ml2+(xhi>xlo?(Number(g.x[i])-xlo)/(xhi-xlo):0.5)*(pw2-16)+8:ml2+slot*(i+0.5)};
  tk2.forEach(function(t){var y=sy(t);ocSv('line',{x1:ml2,x2:w-4,y1:y,y2:y,'class':t===0?'ocg-cero':'ocg-grid'},svg);ocSvT(svg,ml2-8,y+4,formatoValor(t,u,true),{'text-anchor':'end'})});
  g.x.forEach(function(c,i){if(i%cada)return;var x=cxp(i),y=top2+ph+16;
   if(rot){var tt=ocSvT(svg,x+3,y-4,c,{'text-anchor':'end',transform:'rotate(-40 '+(x+3)+' '+(y-4)+')'},lmax)}else ocSvT(svg,x,y,c,{'text-anchor':'middle'},lmax)});
  if(g.tipo==='columnas'){var bw2=Math.min(48,slot*0.78/ns),y0v=sy(Math.max(lo2,Math.min(0,hi2)));
   g.x.forEach(function(c,i){g.series.forEach(function(s,j){var v=s.valores[i];if(v===null)return;var x=ml2+slot*i+(slot-bw2*ns)/2+j*bw2,ya=sy(Math.max(0,v)),yb=sy(Math.min(0,v));
    var el=ocSv('rect',{x:x+1,y:ya,width:Math.max(1,bw2-2),height:Math.max(1,yb-ya),rx:3,'class':'ocg-bv ocg-s'+(j%8)},svg);el.style.animationDelay=Math.min(i*35,500)+'ms';mk(el,c,s.nombre,v,i)})})}
  else{g.series.forEach(function(s,j){var d='',pen=false;
    if(g.tipo==='lineas'){s.valores.forEach(function(v,i){if(v===null){pen=false;return}d+=(pen?'L':'M')+cxp(i).toFixed(1)+' '+sy(v).toFixed(1);pen=true});
     if(d)ocSv('path',{d:d,pathLength:1,'class':'ocg-ln ocg-s'+(j%8),fill:'none'},svg)}
    s.valores.forEach(function(v,i){if(v===null)return;var el=ocSv('circle',{cx:cxp(i),cy:sy(v),r:g.tipo==='dispersion'?5:(n2>30?2.5:4),'class':'ocg-pt ocg-s'+(j%8)},svg);
     el.style.animationDelay=(g.tipo==='lineas'?600:0)+Math.min(i*20,400)+'ms';mk(el,g.x[i],s.nombre,v,i)})})}}
 var ti=ocSv('title',{},null),de=ocSv('desc',{},null);ti.textContent=g.titulo||'Gráfico';
 de.textContent=(g.tipo==='torta'?'Gráfico de torta':'Gráfico de '+g.tipo)+' con '+g.x.length+' categorías'+(ns>1?' y '+ns+' series':'')+'. Los datos están en la tabla «Ver datos».';
 svg.insertBefore(de,svg.firstChild);svg.insertBefore(ti,svg.firstChild);
 cv.classList.toggle('ocg-a',!!anim);cv.appendChild(svg);cv.appendChild(tip);
 var ver=function(ev,el){var o=el.ocInfo;if(!o)return;tip.textContent='';var b=document.createElement('b');b.textContent=o.c;tip.appendChild(b);
   tip.appendChild(document.createTextNode((o.s?o.s+': ':'')+formatoValor(o.v,u,false)+(o.p!==undefined?' ('+agruparMiles(o.p*100,1)+' %)':'')));
   svg.querySelectorAll('.ocg-m.on').forEach(function(x){x.classList.remove('on')});el.classList.add('on');svg.classList.add('foco');
   var r=cv.getBoundingClientRect(),px=ev.clientX-r.left,py=ev.clientY-r.top;tip.classList.add('ver');
   var tw=tip.offsetWidth||140,th=tip.offsetHeight||40,lx2=Math.max(0,Math.min(r.width-tw,px-tw/2)),ly2=py-th-12;if(ly2<0)ly2=py+16;tip.style.left=lx2+'px';tip.style.top=ly2+'px'};
 var ocultar=function(){tip.classList.remove('ver');svg.classList.remove('foco');svg.querySelectorAll('.ocg-m.on').forEach(function(x){x.classList.remove('on')})};
 svg.addEventListener('pointermove',function(ev){var el=ev.target&&ev.target.closest?ev.target.closest('.ocg-m'):null;if(el)ver(ev,el);else ocultar()});
 svg.addEventListener('pointerdown',function(ev){var el=ev.target&&ev.target.closest?ev.target.closest('.ocg-m'):null;if(el)ver(ev,el);else ocultar()});
 svg.addEventListener('pointerleave',function(ev){if(ev.pointerType==='mouse')ocultar()});
 return svg}
// SVG autónomo (colores y letras ya resueltos) para descargar como SVG o PNG.
function ocGExport(f){var sv=f.querySelector('.ocg-c svg');if(!sv)return null;var w=Number(sv.getAttribute('width')),h=Number(sv.getAttribute('height')),tt=f.ocGraf.titulo,top=tt?34:12,
  cl=sv.cloneNode(true),o=sv.querySelectorAll('*'),c=cl.querySelectorAll('*'),cs=getComputedStyle(f);
 for(var i=0;i<o.length;i++){var st=getComputedStyle(o[i]),e=c[i];e.removeAttribute('class');e.removeAttribute('style');
  ['fill','stroke','stroke-width','opacity','font-size','font-family','font-weight'].forEach(function(p){var v=st.getPropertyValue(p);if(v)e.setAttribute(p,v)})}
 var out=ocSv('svg',{xmlns:OC_GNS,viewBox:'0 0 '+(w+32)+' '+(h+top+16),width:w+32,height:h+top+16},null);
 ocSv('rect',{x:0,y:0,width:w+32,height:h+top+16,fill:cs.getPropertyValue('--surface').trim()||'#fff'},out);
 if(tt){var t=ocSv('text',{x:16,y:24,fill:cs.getPropertyValue('--ink').trim()||'#111','font-size':'15','font-weight':'600','font-family':getComputedStyle(f).fontFamily},out);t.textContent=tt}
 var gg=ocSv('g',{transform:'translate(16 '+top+')'},out);while(cl.firstChild)gg.appendChild(cl.firstChild);
 return {svg:new XMLSerializer().serializeToString(out),w:w+32,h:h+top+16}}
function ocGBajar(nombre,blob){var a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=nombre;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},4000)}
function ocGNombre(g){return ((g.titulo||'grafico').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60).toLowerCase()||'grafico')}
function ocGrafico(g){var f=document.createElement('figure'),cv=document.createElement('div'),tip=document.createElement('div');f.className='ocg';f.ocGraf=g;
 if(g.titulo){var fc=document.createElement('figcaption');fc.className='ocg-t';fc.textContent=g.titulo;f.appendChild(fc)}
 cv.className='ocg-c';tip.className='ocg-tip';tip.setAttribute('aria-hidden','true');f.appendChild(cv);
 var pie=document.createElement('div');pie.className='ocg-pie';var dt=document.createElement('details'),sm=document.createElement('summary');sm.textContent='Ver datos';dt.appendChild(sm);
 var wt=document.createElement('div');wt.className='tb';var tb=document.createElement('table'),cap=document.createElement('caption'),tr=document.createElement('tr'),th=document.createElement('th');
 cap.className='sr';cap.textContent=g.titulo||'Datos del gráfico';cap.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';tb.appendChild(cap);
 th.textContent='';th.setAttribute('scope','col');tr.appendChild(th);
 g.series.forEach(function(s){var h=document.createElement('th');h.setAttribute('scope','col');h.textContent=s.nombre+(g.unidad?' ('+g.unidad+')':'');tr.appendChild(h)});tb.appendChild(tr);
 g.x.forEach(function(c,i){var r=document.createElement('tr'),hc=document.createElement('th');hc.setAttribute('scope','row');hc.textContent=c;r.appendChild(hc);
  g.series.forEach(function(s){var d=document.createElement('td');d.className='n';d.textContent=s.valores[i]===null?'—':formatoValor(s.valores[i],g.unidad,false);r.appendChild(d)});tb.appendChild(r)});
 wt.appendChild(tb);dt.appendChild(wt);pie.appendChild(dt);
 var dl=document.createElement('div');dl.className='ocg-dl';
 [['PNG','Descargar el gráfico como imagen PNG'],['SVG','Descargar el gráfico como SVG']].forEach(function(k){var b=document.createElement('button');b.type='button';b.textContent=k[0];b.title=k[1];b.setAttribute('aria-label',k[1]);
  b.addEventListener('click',function(){var x=ocGExport(f);if(!x)return;var nom=ocGNombre(g);
   if(k[0]==='SVG'){ocGBajar(nom+'.svg',new Blob([x.svg],{type:'image/svg+xml'}));return}
   var im=new Image(),u=URL.createObjectURL(new Blob([x.svg],{type:'image/svg+xml'}));
   im.onload=function(){var cn=document.createElement('canvas'),k2=2;cn.width=x.w*k2;cn.height=x.h*k2;var cx=cn.getContext('2d');cx.scale(k2,k2);cx.drawImage(im,0,0);URL.revokeObjectURL(u);
    cn.toBlob(function(bl){if(bl)ocGBajar(nom+'.png',bl)},'image/png')};im.onerror=function(){URL.revokeObjectURL(u)};im.src=u});dl.appendChild(b)});
 pie.appendChild(dl);f.appendChild(pie);
 var ancho=0,primera=true,pinta=function(){var w=Math.floor(cv.clientWidth);if(!w||Math.abs(w-ancho)<4)return;ancho=w;ocGDibuja(cv,g,w,primera,tip);primera=false};
 if(typeof ResizeObserver!=='undefined'){new ResizeObserver(function(){pinta()}).observe(cv)}
 else{requestAnimationFrame(pinta);window.addEventListener('resize',pinta)}
 return f}
`;
