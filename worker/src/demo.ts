import { buildSystemPrompt, parseSse, parseToolCall, truncate } from "./lib/agente";

// Panel "Prueba el asistente": HTML, CSS y script del navegador.
// SINCRONÍA con src/lib/agente.ts: el script incrusta esas cuatro funciones con Function.prototype.toString(),
// así que hay una sola fuente de verdad. test/agente.test.ts evalúa este script y lo compara con las exportaciones
// (y falla si el empaquetador inyecta helpers como __name dentro de ellas).

export const WEBLLM_VERSION = "0.2.86";
export const WEBLLM_URL = `https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@${WEBLLM_VERSION}/+esm`;
export const MODELO_LOCAL = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
export const MODELO_LOCAL_F32 = "Qwen2.5-1.5B-Instruct-q4f32_1-MLC";

export const demoCss = String.raw`
.demo{border:2px solid var(--ac);border-radius:12px;padding:12px 16px;margin:16px 0;background:var(--card)}
.demo h2{margin:.2em 0 .4em}
.sw{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:14px 16px;font-size:18px;font-weight:700;border-radius:12px;border:2px solid var(--bd);background:var(--bg);color:var(--fg);cursor:pointer;text-align:left}
.sw .pista{width:56px;height:30px;border-radius:15px;background:#8a929c;position:relative;flex:none;transition:background .15s}
.sw .pista::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;transition:left .15s}
.sw[aria-checked=true]{border-color:#1a8f4c;background:rgba(26,143,76,.14)}
.sw[aria-checked=true] .pista{background:#1a8f4c}
.sw[aria-checked=true] .pista::after{left:29px}
.sw:focus-visible,.demo button:focus-visible,.demo input:focus-visible,.demo select:focus-visible,.demo textarea:focus-visible{outline:3px solid var(--ac);outline-offset:2px}
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
.fila{display:flex;gap:8px}.fila textarea{flex:1;min-width:0}
progress{width:100%}
`;

export const demoHtml = String.raw`
<section class="demo" aria-labelledby="oc-t">
<h2 id="oc-t">Prueba el asistente</h2>
<button type="button" id="oc-sw" class="sw" role="switch" aria-checked="true"><span class="pista" aria-hidden="true"></span><span id="oc-swt">MCP: ACTIVADO</span></button>
<p class="mut" id="oc-swd" style="margin:6px 0"></p>

<label for="oc-modo">Modelo</label>
<select id="oc-modo">
<option value="local">Modelo local en tu dispositivo (se ejecuta en tu navegador, nada pasa por nuestro servidor)</option>
<option value="clave">Mi propia clave de API</option>
</select>
<div id="oc-local">
<p class="mut" style="margin:6px 0">Descarga unos 1 GB la primera vez (el navegador lo guarda para después) y requiere WebGPU: Chrome o Edge de escritorio. Un modelo pequeño comete más errores que uno grande.</p>
<button type="button" id="oc-cargar">Descargar y cargar el modelo</button>
<progress id="oc-prog" max="1" value="0" hidden></progress>
<div id="oc-estado" class="mut" role="status"></div>
</div>
<div id="oc-clave" hidden>
<label for="oc-prov">Proveedor</label>
<select id="oc-prov">
<option value="openai">OpenAI</option><option value="groq">Groq</option><option value="gemini">Google Gemini (compatible con OpenAI)</option>
<option value="nvidia">NVIDIA NIM</option><option value="anthropic">Anthropic</option><option value="otro">Otro compatible con OpenAI</option>
</select>
<div id="oc-basew" hidden><label for="oc-base">URL base (termina antes de /chat/completions)</label><input id="oc-base" type="url" placeholder="https://mi-proveedor.com/v1" autocomplete="off"></div>
<label for="oc-model">Nombre del modelo</label><input id="oc-model" autocomplete="off" spellcheck="false">
<label for="oc-key">Clave de API</label><input id="oc-key" type="password" autocomplete="off" spellcheck="false">
<label style="display:flex;gap:8px;align-items:center"><input id="oc-rec" type="checkbox" style="width:auto"> Recordar en este dispositivo</label>
<p class="mut" style="margin:6px 0">La clave se guarda solo en tu navegador (por defecto, hasta cerrar la pestaña) y las solicitudes van directo de tu navegador al proveedor. Nunca llega a nuestro servidor.</p>
</div>

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

const nombres = `${parseToolCall.toString()}\n${parseSse.toString()}\n${buildSystemPrompt.toString()}\n${truncate.toString()}`;

const app = String.raw`
var OC_WEBLLM='__WEBLLM_URL__',OC_MODEL='__MODELO__',OC_MODEL32='__MODELO32__';
var OC_PROV={
 openai:{base:'https://api.openai.com/v1',model:'gpt-4o-mini'},
 groq:{base:'https://api.groq.com/openai/v1',model:'llama-3.3-70b-versatile'},
 gemini:{base:'https://generativelanguage.googleapis.com/v1beta/openai',model:'gemini-2.5-flash'},
 nvidia:{base:'https://integrate.api.nvidia.com/v1',model:'meta/llama-3.3-70b-instruct'},
 anthropic:{base:'https://api.anthropic.com/v1',model:'claude-haiku-4-5'},
 otro:{base:'',model:''}
};
var ocMcp=true,ocHist=[],ocTools=null,ocEngine=null,ocBusy=false;
function $(id){return document.getElementById(id)}
function ocLog(cls,txt){var d=document.createElement('div');d.className='msg '+cls;d.textContent=txt;$('oc-log').appendChild(d);d.scrollIntoView({block:'nearest'});return d}
function ocTool(name,args,res){var d=document.createElement('details'),s=document.createElement('summary'),p=document.createElement('pre');
 s.textContent='Herramienta usada: '+name;p.textContent='Argumentos: '+JSON.stringify(args)+String.fromCharCode(10)+String.fromCharCode(10)+truncate(res,1200);
 d.appendChild(s);d.appendChild(p);$('oc-log').appendChild(d);d.scrollIntoView({block:'nearest'})}
function ocStore(k,v){try{if(v===undefined)return sessionStorage.getItem(k)||localStorage.getItem(k);
 if($('oc-rec').checked){localStorage.setItem(k,v);sessionStorage.removeItem(k)}else{sessionStorage.setItem(k,v);localStorage.removeItem(k)}}catch(e){return null}}
function ocSwitchText(){var sw=$('oc-sw');sw.setAttribute('aria-checked',String(ocMcp));$('oc-swt').textContent=ocMcp?'MCP: ACTIVADO':'MCP: DESACTIVADO';
 $('oc-swd').textContent=ocMcp?'Con MCP: el modelo puede consultar los datos oficiales del MEF mediante las herramientas de este servidor.':'Sin MCP: chat normal con el mismo modelo, sin acceso a los datos; puede equivocarse o inventar.'}
function ocCfgLoad(){try{var c=JSON.parse(ocStore('oc_cfg')||'null');if(!c)return;$('oc-modo').value=c.modo||'local';$('oc-prov').value=c.prov||'openai';$('oc-base').value=c.base||'';$('oc-model').value=c.model||'';$('oc-key').value=c.key||'';$('oc-rec').checked=!!c.rec}catch(e){}}
function ocCfgSave(){var c={modo:$('oc-modo').value,prov:$('oc-prov').value,base:$('oc-base').value,model:$('oc-model').value,key:$('oc-key').value,rec:$('oc-rec').checked};
 try{localStorage.removeItem('oc_cfg');sessionStorage.removeItem('oc_cfg')}catch(e){}ocStore('oc_cfg',JSON.stringify(c))}
function ocUi(){var m=$('oc-modo').value,p=$('oc-prov').value;$('oc-local').hidden=m!=='local';$('oc-clave').hidden=m!=='clave';$('oc-basew').hidden=p!=='otro';
 if(m==='local'&&!navigator.gpu)$('oc-estado').textContent='Tu navegador no tiene WebGPU. Usa Chrome o Edge de escritorio, o elige «Mi propia clave de API».'}
function ocProvChange(){var p=OC_PROV[$('oc-prov').value];if(p&&p.model)$('oc-model').value=p.model;else $('oc-model').value='';ocUi();ocCfgSave()}
function ocHttpError(st){if(st===401||st===403)return 'El proveedor rechazó la clave (error '+st+'). Revisa que sea correcta y tenga permiso para ese modelo.';
 if(st===429)return 'Límite de uso del proveedor alcanzado (429). Espera un momento o revisa tu cuota.';
 if(st===404)return 'El proveedor no encontró el modelo o la dirección (404). Revisa el nombre del modelo y la URL base.';
 return 'El proveedor respondió con error '+st+'.'}
async function ocLoadLocal(){
 if(ocEngine)return ocEngine;
 if(!navigator.gpu)throw new Error('Tu navegador no tiene WebGPU. Usa Chrome o Edge de escritorio, o elige «Mi propia clave de API».');
 var id=OC_MODEL;try{var ad=await navigator.gpu.requestAdapter();if(ad&&!ad.features.has('shader-f16'))id=OC_MODEL32}catch(e){}
 $('oc-prog').hidden=false;$('oc-estado').textContent='Cargando el modelo…';
 var wl=await import(OC_WEBLLM);
 ocEngine=await wl.CreateMLCEngine(id,{initProgressCallback:function(p){$('oc-prog').value=p.progress||0;$('oc-estado').textContent=p.text||''}});
 $('oc-prog').hidden=true;$('oc-estado').textContent='Modelo listo ('+id+').';return ocEngine}
async function ocPost(url,headers,body){var r;
 try{r=await fetch(url,{method:'POST',headers:headers,body:JSON.stringify(body)})}catch(e){throw new Error('No se pudo conectar con el proveedor. Revisa tu conexión (o si el proveedor permite llamadas desde el navegador).')}
 if(!r.ok){var eb=null;try{eb=await r.json()}catch(e){}
  var fg=eb&&eb.error&&eb.error.failed_generation;
  // Algunos modelos (p. ej. gpt-oss en Groq) intentan llamar a una herramienta con su formato propio y el proveedor lo rechaza con 400, pero devuelve lo generado: se usa como respuesta del modelo.
  if(r.status===400&&typeof fg==='string'&&fg)return {choices:[{message:{content:fg}}]};
  var det=eb&&eb.error&&typeof eb.error.message==='string'?' Detalle: '+eb.error.message.slice(0,200):'';
  throw new Error(ocHttpError(r.status)+det)}
 try{return await r.json()}catch(e){throw new Error('Respuesta del proveedor no válida.')}}
async function ocLlm(msgs){
 var modo=$('oc-modo').value;
 if(modo==='local'){var en=await ocLoadLocal();var o=await en.chat.completions.create({messages:msgs,temperature:0.2,max_tokens:700});return o.choices[0].message.content||''}
 var prov=$('oc-prov').value,key=$('oc-key').value.trim(),model=$('oc-model').value.trim();
 var base=(prov==='otro'?$('oc-base').value.trim():OC_PROV[prov].base).replace(/\/+$/,'');
 if(!key)throw new Error('Falta la clave de API.');if(!model)throw new Error('Falta el nombre del modelo.');if(!base)throw new Error('Falta la URL base.');
 if(prov==='anthropic'){
  var m2=[];msgs.slice(1).forEach(function(m){var l=m2[m2.length-1];if(l&&l.role===m.role)l.content+=String.fromCharCode(10)+String.fromCharCode(10)+m.content;else m2.push({role:m.role,content:m.content})});
  var a=await ocPost(base+'/messages',{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},{model:model,max_tokens:1024,system:msgs[0].content,messages:m2});
  return (a.content||[]).map(function(c){return c.text||''}).join('')}
 var j=await ocPost(base+'/chat/completions',{'content-type':'application/json','authorization':'Bearer '+key},{model:model,messages:msgs,temperature:0.2});
 return j.choices[0].message.content||''}
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
$('oc-modo').addEventListener('change',function(){ocUi();ocCfgSave()});
$('oc-prov').addEventListener('change',ocProvChange);
['oc-base','oc-model','oc-key','oc-rec'].forEach(function(i){$(i).addEventListener('change',ocCfgSave)});
$('oc-cargar').addEventListener('click',function(){ocLoadLocal().catch(function(e){$('oc-prog').hidden=true;$('oc-estado').textContent=e&&e.message?e.message:'No se pudo cargar el modelo.'})});
$('oc-form').addEventListener('submit',function(e){e.preventDefault();ocSend($('oc-in').value)});
$('oc-in').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ocSend($('oc-in').value)}});
$('oc-chips').addEventListener('click',function(e){var t=e.target;if(t&&t.tagName==='BUTTON')ocSend(t.textContent)});
$('oc-nueva').addEventListener('click',function(){ocHist=[];$('oc-log').textContent='';ocLog('n','Nueva conversación.')});
ocCfgLoad();if(!$('oc-model').value){var oc0=OC_PROV[$('oc-prov').value];$('oc-model').value=oc0?oc0.model:''}
ocSwitchText();ocUi();
`
  .replace("__WEBLLM_URL__", WEBLLM_URL)
  .replace("__MODELO__", MODELO_LOCAL)
  .replace("__MODELO32__", MODELO_LOCAL_F32);

export const demoScript = nombres + "\n" + app;
