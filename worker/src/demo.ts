import {
  buildSystemPrompt, construirPeticion, extraerRespuesta, migrarConfig, normalizarConexion, parseSse, parseToolCall,
  presetsIA, textoLimpio, truncate, validarConexion,
} from "./lib/agente";

// Panel "Prueba el asistente": HTML, CSS y script del navegador.
// SINCRONÍA con src/lib/agente.ts: el script incrusta esas funciones con Function.prototype.toString(),
// así que hay una sola fuente de verdad. test/agente.test.ts evalúa este script y lo compara con las exportaciones
// (y falla si el empaquetador inyecta helpers como __name dentro de ellas).

export const demoCss = String.raw`
.demo{border:2px solid var(--ac);border-radius:12px;padding:12px 16px;margin:16px 0;background:var(--card)}
.demo h2{margin:.2em 0 .4em}
.sw{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:14px 16px;font-size:18px;font-weight:700;border-radius:12px;border:2px solid var(--bd);background:var(--bg);color:var(--fg);cursor:pointer;text-align:left}
.sw .pista{width:56px;height:30px;border-radius:15px;background:#8a929c;position:relative;flex:none;transition:background .15s}
.sw .pista::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:left .15s}
.sw[aria-checked=true]{border-color:#1a8f4c;background:rgba(26,143,76,.14)}
.sw[aria-checked=true] .pista{background:#1a8f4c}
.sw[aria-checked=true] .pista::after{left:29px}
.sw:focus-visible,.demo button:focus-visible,#oc-cfg button:focus-visible,#oc-cfg input:focus-visible,#oc-cfg select:focus-visible,.demo input:focus-visible,.demo select:focus-visible,.demo textarea:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
.demo label{display:block;margin:8px 0 2px;font-size:14px}
.demo input,.demo select,.demo textarea{width:100%;box-sizing:border-box}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
.chips button,.sec{background:var(--bg);color:var(--fg);border:1px solid var(--bd);font-size:14px;text-align:left}
#oc-log{max-height:480px;overflow-y:auto;margin:12px 0;display:flex;flex-direction:column;gap:8px}
.msg{padding:8px 12px;border-radius:10px;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--bd);background:var(--bg)}
.msg.u{background:var(--ac);color:#fff;border-color:var(--ac);align-self:flex-end;max-width:90%}
.msg.e{border-color:#c62828;color:#c62828}
.msg.n{font-size:13px;color:var(--mut);border-style:dashed;text-align:center}
#oc-log details{border:1px solid var(--bd);border-radius:8px;padding:6px 10px;background:var(--bg)}
#oc-log pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;margin:6px 0 0;max-height:240px;overflow:auto}
.cab{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}.cab>div{flex:1;min-width:180px}
#oc-cfg{max-width:min(640px,94vw);width:100%;box-sizing:border-box;border:2px solid var(--ac);border-radius:12px;padding:16px;background:var(--card);color:var(--fg);max-height:90vh;overflow:auto}
#oc-cfg::backdrop{background:rgba(0,0,0,.5)}
#oc-lista{list-style:none;margin:8px 0;padding:0;display:flex;flex-direction:column;gap:6px}
#oc-lista li{display:flex;gap:8px;align-items:center;border:1px solid var(--bd);border-radius:8px;padding:6px 10px;background:var(--bg)}
#oc-lista li span{flex:1;overflow-wrap:anywhere}
#oc-presets{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
.fila{display:flex;gap:8px}.fila textarea{flex:1;min-width:0}
`;

export const demoHtml = String.raw`
<section class="demo" aria-labelledby="oc-t">
<h2 id="oc-t">Prueba el asistente</h2>
<button type="button" id="oc-sw" class="sw" role="switch" aria-checked="true"><span class="pista" aria-hidden="true"></span><span id="oc-swt">MCP: ACTIVADO</span></button>
<p class="mut" id="oc-swd" style="margin:6px 0"></p>

<div class="cab">
<div><label for="oc-modo">Modelo de IA</label>
<select id="oc-modo"><option value="gpt-headless" selected>gpt-headless</option></select></div>
<button type="button" id="oc-gear" class="sec" aria-haspopup="dialog">&#9881; Configuración</button>
</div>
<p class="mut" id="oc-info" style="margin:6px 0"></p>

<dialog id="oc-cfg" aria-labelledby="oc-cfg-t">
<h3 id="oc-cfg-t" style="margin:.2em 0">Configuración de IA</h3>
<p class="mut">Agrega tus propias conexiones de IA. La clave se guarda solo en tu navegador (por defecto hasta cerrar la pestaña) y las solicitudes van directo de tu navegador al proveedor: la clave nunca llega a nuestro servidor.</p>
<h4 style="margin:.6em 0 .2em">Conexiones guardadas</h4>
<ul id="oc-lista"></ul>
<form id="oc-cform" autocomplete="off">
<h4 id="oc-cform-t" style="margin:.6em 0 .2em">Agregar conexión</h4>
<div id="oc-presets" role="group" aria-label="Plantillas de proveedor"></div>
<label for="oc-cnombre">Nombre</label><input id="oc-cnombre" maxlength="60" autocomplete="off">
<label for="oc-ctipo">Tipo de API</label>
<select id="oc-ctipo"><option value="openai">Compatible con OpenAI (/chat/completions)</option><option value="anthropic">Anthropic</option></select>
<label for="oc-cbase">URL base (termina antes de /chat/completions)</label><input id="oc-cbase" type="url" placeholder="https://mi-proveedor.com/v1" autocomplete="off" spellcheck="false">
<label for="oc-cmodel">Nombre del modelo</label><input id="oc-cmodel" autocomplete="off" spellcheck="false">
<label for="oc-ckey">Clave de API</label><input id="oc-ckey" type="password" autocomplete="off" spellcheck="false">
<label style="display:flex;gap:8px;align-items:center"><input id="oc-crec" type="checkbox" style="width:auto"> Recordar en este dispositivo</label>
<p id="oc-cest" class="mut" role="status" aria-live="polite" style="margin:6px 0"></p>
<div class="fila" style="flex-wrap:wrap">
<button type="submit" id="oc-csave">Guardar</button>
<button type="button" id="oc-ctest" class="sec">Probar conexión</button>
<button type="button" id="oc-ccancel" class="sec" hidden>Cancelar edición</button>
<button type="button" id="oc-cfg-x" class="sec" style="margin-left:auto">Cerrar</button>
</div>
</form>
</dialog>

<div class="chips" id="oc-chips">
<button type="button" class="sec">¿Qué obras de salud en Cusco llevan 6 meses sin gasto?</button>
<button type="button" class="sec">Resume las inversiones de la Municipalidad Provincial de Piura</button>
<button type="button" class="sec">¿Cuál es el avance de la inversión 2716769?</button>
</div>
<div id="oc-log" aria-live="polite"></div>
<form id="oc-form" class="fila">
<textarea id="oc-in" rows="2" placeholder="Escribe tu pregunta" aria-label="Tu pregunta"></textarea>
<button id="oc-send">Enviar</button>
</form>
<p style="margin:8px 0 0"><button type="button" id="oc-nueva" class="sec">Nueva conversación</button></p>
</section>
`;

const nombres = [
  parseToolCall, parseSse, buildSystemPrompt, truncate, presetsIA, textoLimpio, normalizarConexion, validarConexion,
  migrarConfig, construirPeticion, extraerRespuesta,
].map((f) => f.toString()).join("\n");

const app = String.raw`
var ocMcp=true,ocHist=[],ocTools=null,ocBusy=false,ocConns=[],ocActiva='gpt-headless',ocEdit='',ocHL='gpt-headless';
function $(id){return document.getElementById(id)}
function ocLog(cls,txt){var d=document.createElement('div');d.className='msg '+cls;d.textContent=txt;$('oc-log').appendChild(d);d.scrollIntoView({block:'nearest'});return d}
function ocTool(name,args,res){var d=document.createElement('details'),s=document.createElement('summary'),p=document.createElement('pre');
 s.textContent='Herramienta usada: '+name;p.textContent='Argumentos: '+JSON.stringify(args)+String.fromCharCode(10)+String.fromCharCode(10)+truncate(res,1200);
 d.appendChild(s);d.appendChild(p);$('oc-log').appendChild(d);d.scrollIntoView({block:'nearest'})}
function ocRead(st,k){try{return JSON.parse(st.getItem(k)||'null')}catch(e){return null}}
function ocWrite(st,k,v){try{if(v===null)st.removeItem(k);else st.setItem(k,JSON.stringify(v))}catch(e){}}
function ocSwitchText(){var sw=$('oc-sw');sw.setAttribute('aria-checked',String(ocMcp));$('oc-swt').textContent=ocMcp?'MCP: ACTIVADO':'MCP: DESACTIVADO';
 $('oc-swd').textContent=ocMcp?'Con MCP: el modelo puede consultar los datos oficiales del MEF mediante las herramientas de este servidor.':'Sin MCP: chat normal con el mismo modelo, sin acceso a los datos; puede equivocarse o inventar.'}
function ocConnById(id){for(var i=0;i<ocConns.length;i++)if(ocConns[i].id===id)return ocConns[i];return null}
function ocPersist(){var s=[],l=[];ocConns.forEach(function(c){(c.recordar?l:s).push(c)});
 ocWrite(sessionStorage,'oc_conns',s.length?s:null);ocWrite(localStorage,'oc_conns',l.length?l:null);ocWrite(localStorage,'oc_activa',ocActiva)}
function ocLoad(){var a=ocRead(sessionStorage,'oc_conns')||[],b=ocRead(localStorage,'oc_conns')||[];
 ocConns=(Array.isArray(a)?a:[]).concat(Array.isArray(b)?b:[]).map(normalizarConexion).filter(function(c){return c.id});
 var old=ocRead(localStorage,'oc_cfg')||ocRead(sessionStorage,'oc_cfg');
 if(old){var m=migrarConfig(old);if(!ocConns.length&&m.conexiones.length){ocConns=m.conexiones;ocActiva=m.activa}
  try{localStorage.removeItem('oc_cfg');sessionStorage.removeItem('oc_cfg')}catch(e){}ocPersist()}
 var act=null;try{act=localStorage.getItem('oc_activa');if(act)act=JSON.parse(act)}catch(e){act=null}
 if(typeof act==='string'&&(act===ocHL||ocConnById(act)))ocActiva=act}
function ocRenderSel(){var s=$('oc-modo');s.textContent='';
 var o=document.createElement('option');o.value=ocHL;o.textContent='gpt-headless';s.appendChild(o);
 ocConns.forEach(function(c){var x=document.createElement('option');x.value=c.id;x.textContent=c.nombre;s.appendChild(x)});
 if(ocActiva!==ocHL&&!ocConnById(ocActiva))ocActiva=ocHL;
 s.value=ocActiva;ocUi()}
function ocUi(){$('oc-info').textContent=ocActiva===ocHL?'gpt-headless se ejecuta en el servidor propio del grupo (no en tu dispositivo). Es compartido, tiene límite de uso por visitante y puede estar apagado. En «Configuración» puedes agregar tu propia IA con tu clave.':'Con tu propia IA, las solicitudes van directo desde tu navegador al proveedor; la clave nunca llega a nuestro servidor.'}
function ocRenderLista(){var u=$('oc-lista');u.textContent='';
 if(!ocConns.length){var e=document.createElement('li');var sp=document.createElement('span');sp.textContent='Aún no hay conexiones. Agrega una abajo.';e.appendChild(sp);u.appendChild(e);return}
 ocConns.forEach(function(c){var li=document.createElement('li'),sp=document.createElement('span'),be=document.createElement('button'),bd=document.createElement('button');
  sp.textContent=c.nombre+' ('+c.modelo+')'+(c.recordar?' · recordada en este dispositivo':'');
  be.type='button';be.className='sec';be.textContent='Editar';be.setAttribute('aria-label','Editar '+c.nombre);be.addEventListener('click',function(){ocFormFill(c)});
  bd.type='button';bd.className='sec';bd.textContent='Eliminar';bd.setAttribute('aria-label','Eliminar '+c.nombre);bd.addEventListener('click',function(){ocDelete(c.id)});
  li.appendChild(sp);li.appendChild(be);li.appendChild(bd);u.appendChild(li)})}
function ocFormFill(c){ocEdit=c?c.id:'';$('oc-cnombre').value=c?c.nombre:'';$('oc-ctipo').value=c?c.tipo:'openai';$('oc-cbase').value=c?c.baseUrl:'';
 $('oc-cmodel').value=c?c.modelo:'';$('oc-ckey').value=c?c.clave:'';$('oc-crec').checked=c?!!c.recordar:false;$('oc-cest').textContent='';
 $('oc-cform-t').textContent=c?'Editar conexión':'Agregar conexión';$('oc-ccancel').hidden=!c;$('oc-cnombre').focus()}
function ocFormRead(){return normalizarConexion({id:ocEdit,nombre:$('oc-cnombre').value,tipo:$('oc-ctipo').value,baseUrl:$('oc-cbase').value,modelo:$('oc-cmodel').value,clave:$('oc-ckey').value,recordar:$('oc-crec').checked})}
function ocPreset(id){var p=presetsIA().filter(function(x){return x.id===id})[0];if(!p)return;
 $('oc-ctipo').value=p.tipo;$('oc-cbase').value=p.baseUrl;$('oc-cmodel').value=p.modelo;if(!$('oc-cnombre').value.trim()&&id!=='otro')$('oc-cnombre').value=p.nombre;$('oc-cbase').focus()}
function ocSave(){var c=ocFormRead(),er=validarConexion(c);if(er.length){$('oc-cest').textContent=er.join(' ');return}
 if(ocEdit){ocConns=ocConns.map(function(x){return x.id===ocEdit?c:x})}else{c.id='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);ocConns.push(c);ocActiva=c.id}
 ocPersist();ocRenderSel();ocRenderLista();ocFormFill(null);$('oc-cest').textContent='Conexión guardada.'}
function ocDelete(id){var c=ocConnById(id);if(!c||!confirm('¿Eliminar la conexión «'+c.nombre+'»?'))return;
 ocConns=ocConns.filter(function(x){return x.id!==id});if(ocActiva===id)ocActiva=ocHL;if(ocEdit===id)ocFormFill(null);ocPersist();ocRenderSel();ocRenderLista()}
async function ocTest(){var c=ocFormRead(),er=validarConexion(c),st=$('oc-cest');if(er.length){st.textContent=er.join(' ');return}
 st.textContent='Probando…';$('oc-ctest').disabled=true;
 try{var t=await ocLlmConn(c,[{role:'system',content:'Eres un asistente breve.'},{role:'user',content:'Responde solo: ok'}]);st.textContent='Conexión correcta. Respuesta del modelo: '+(t.trim().slice(0,80)||'(vacía)')}
 catch(e){st.textContent='Error: '+(e&&e.message?e.message:'desconocido')}
 $('oc-ctest').disabled=false}
function ocOpen(){var d=$('oc-cfg');ocRenderLista();ocFormFill(null);if(d.showModal)d.showModal();else d.setAttribute('open','')}
function ocClose(){var d=$('oc-cfg');if(d.close)d.close();else d.removeAttribute('open');$('oc-gear').focus()}
function ocHttpError(st){if(st===401||st===403)return 'El proveedor rechazó la clave (error '+st+'). Revisa que sea correcta y tenga permiso para ese modelo.';
 if(st===429)return 'Límite de uso del proveedor alcanzado (429). Espera un momento o revisa tu cuota.';
 if(st===404)return 'El proveedor no encontró el modelo o la dirección (404). Revisa el nombre del modelo y la URL base.';
 return 'El proveedor respondió con error '+st+'.'}
async function ocPost(url,headers,body){var r;
 try{r=await fetch(url,{method:'POST',headers:headers,body:JSON.stringify(body)})}catch(e){throw new Error('No se pudo conectar con el proveedor. Revisa tu conexión (o si el proveedor permite llamadas desde el navegador).')}
 if(!r.ok){var eb=null;try{eb=await r.json()}catch(e){}
  var fg=eb&&eb.error&&eb.error.failed_generation;
  // Algunos modelos (p. ej. gpt-oss en Groq) intentan llamar a una herramienta con su formato propio y el proveedor lo rechaza con 400, pero devuelve lo generado: se usa como respuesta del modelo.
  if(r.status===400&&typeof fg==='string'&&fg)return {choices:[{message:{content:fg}}]};
  var det=eb&&eb.error&&typeof eb.error.message==='string'?' Detalle: '+eb.error.message.slice(0,200):'';
  throw new Error(ocHttpError(r.status)+det)}
 try{return await r.json()}catch(e){throw new Error('Respuesta del proveedor no válida.')}}
async function ocLlmConn(c,msgs){var q=construirPeticion(c,msgs);var j=await ocPost(q.url,q.headers,q.body);return extraerRespuesta(c.tipo,j)}
async function ocLlm(msgs){
 if(ocActiva===ocHL){var r;
  try{r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:msgs})})}catch(e){throw new Error('No se pudo conectar con el servidor.')}
  var d=null;try{d=await r.json()}catch(e){}
  if(r.status===429)throw new Error('Muchas preguntas seguidas, espera un minuto o agrega tu propia IA en Configuración.');
  if(r.status===503||r.status===504)throw new Error('gpt-headless no está disponible ahora (el servidor del grupo puede estar apagado). Agrega otra IA en Configuración.');
  if(!r.ok){var et=d&&typeof d.error==='string'?d.error:'El servidor respondió con error '+r.status+'.';throw new Error(et.slice(0,200))}
  if(!d||typeof d.content!=='string')throw new Error('Respuesta del servidor no válida.');
  return d.content}
 var c=ocConnById(ocActiva);if(!c)throw new Error('La IA seleccionada ya no existe. Elige otra.');
 return ocLlmConn(c,msgs)}
async function ocMcpCall(method,params){
 var r;try{r=await fetch('/mcp',{method:'POST',headers:{'content-type':'application/json','accept':'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:Date.now(),method:method,params:params||{}})})}
 catch(e){throw new Error('No se pudo conectar con el servidor MCP.')}
 if(r.status===429)throw new Error('Demasiadas solicitudes al servidor MCP (429). Espera un minuto.');
 if(!r.ok)throw new Error('El servidor MCP respondió con error '+r.status+'.');
 var d=parseSse(await r.text());if(!d)throw new Error('Respuesta MCP no válida.');if(d.error)throw new Error(d.error.message||'Error MCP.');return d.result}
async function ocRun(q){
 ocHist.push({role:'user',content:q});
 if(ocMcp&&!ocTools){ocTools=((await ocMcpCall('tools/list')).tools)||[]}
 var sys=buildSystemPrompt(ocTools||[],ocMcp);
 for(var step=0;step<5;step++){
  var out=await ocLlm([{role:'system',content:sys}].concat(ocHist));
  var c=parseToolCall(out);
  if(!c){ocHist.push({role:'assistant',content:out});ocLog('a',out.trim()||'(sin respuesta)');return}
  if(c.tipo==='respuesta'){ocHist.push({role:'assistant',content:out});ocLog('a',c.texto);return}
  if(!ocMcp){ocHist.push({role:'assistant',content:out});ocLog('a',out.trim());return}
  var txt;try{var rs=await ocMcpCall('tools/call',{name:c.tool,arguments:c.args});txt=(rs.content||[]).map(function(x){return x.text||''}).join('')||JSON.stringify(rs)}catch(e){txt='Error: '+e.message}
  ocTool(c.tool,c.args,txt);
  ocHist.push({role:'assistant',content:out});
  ocHist.push({role:'user',content:'Resultado de '+c.tool+':'+String.fromCharCode(10)+truncate(txt,6000)+String.fromCharCode(10)+'Continúa: llama otra herramienta o termina con {"respuesta":"..."}.'});
 }
 ocLog('n','Se alcanzó el máximo de 5 pasos sin respuesta final. Prueba con una pregunta más concreta.')}
async function ocSend(q){q=(q||'').trim();if(!q||ocBusy)return;ocBusy=true;$('oc-send').disabled=true;$('oc-in').value='';ocLog('u',q);var w=ocLog('n','Pensando…');
 try{await ocRun(q)}catch(e){ocLog('e',e&&e.message?e.message:'Error inesperado.')}
 w.remove();ocBusy=false;$('oc-send').disabled=false}
$('oc-sw').addEventListener('click',function(){ocMcp=!ocMcp;ocSwitchText();ocLog('n','— MCP '+(ocMcp?'ACTIVADO':'DESACTIVADO')+' a partir de aquí —')});
$('oc-modo').addEventListener('change',function(){ocActiva=$('oc-modo').value;ocPersist();ocUi()});
$('oc-gear').addEventListener('click',ocOpen);
$('oc-cfg-x').addEventListener('click',ocClose);
$('oc-cfg').addEventListener('click',function(e){if(e.target===$('oc-cfg'))ocClose()});
$('oc-cform').addEventListener('submit',function(e){e.preventDefault();ocSave()});
$('oc-ctest').addEventListener('click',ocTest);
$('oc-ccancel').addEventListener('click',function(){ocFormFill(null)});
presetsIA().forEach(function(p){var b=document.createElement('button');b.type='button';b.className='sec';b.textContent=p.nombre.split(' (')[0];b.addEventListener('click',function(){ocPreset(p.id)});$('oc-presets').appendChild(b)});
$('oc-form').addEventListener('submit',function(e){e.preventDefault();ocSend($('oc-in').value)});
$('oc-in').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ocSend($('oc-in').value)}});
$('oc-chips').addEventListener('click',function(e){var t=e.target;if(t&&t.tagName==='BUTTON')ocSend(t.textContent)});
$('oc-nueva').addEventListener('click',function(){ocHist=[];$('oc-log').textContent='';ocLog('n','Nueva conversación.')});
ocLoad();ocRenderSel();ocSwitchText();
`;

export const demoScript = nombres + "\n" + app;
