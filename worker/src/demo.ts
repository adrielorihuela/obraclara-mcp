import {
  buildSystemPrompt, construirPeticion, extraerRespuesta, migrarConfig, normalizarConexion, parseSse, parseToolCall,
  presetsIA, textoLimpio, truncate, validarConexion, limitesImagen, validarImagen, escalarImagen, construirContenido, aBloquesAnthropic,
  tituloChat, grupoFecha, recortarChats, serializarChats, deserializarChats, sinImagenes, normalizarMensaje, normalizarChat,
} from "./lib/agente";

// Panel "Prueba el asistente" (página /asistente): HTML, CSS y script del navegador.
// SINCRONÍA con src/lib/agente.ts: el script incrusta esas funciones con Function.prototype.toString(),
// así que hay una sola fuente de verdad. test/agente.test.ts evalúa este script y lo compara con las exportaciones
// (y falla si el empaquetador inyecta helpers como __name dentro de ellas).

export const demoCss = String.raw`
body.es-app{height:100dvh;overflow:hidden;display:flex;flex-direction:column}
body.es-app main{flex:1;min-height:0}
.chat{height:100%;display:grid;grid-template-columns:300px minmax(0,1fr)}
.lado{border-right:1px solid var(--line);background:var(--bg-2);padding:16px;display:flex;flex-direction:column;gap:20px;overflow-y:auto}
.lado .lbl{display:block;font:500 12px/1 var(--mono);color:var(--mut);margin:0 0 10px}
.lado p.ayuda{font-size:13px;line-height:1.5;color:var(--mut);margin-top:10px}
.lado .pie-l{margin-top:auto;font-size:12px;line-height:1.5;color:var(--mut);display:grid;gap:8px;padding-top:16px;border-top:1px solid var(--line)}
.nueva{display:flex;align-items:center;gap:10px;width:100%;min-height:42px;padding:0 14px;border-radius:10px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:500 14px/1 var(--sans);cursor:pointer}
.nueva:hover{border-color:var(--ink)}
.nueva svg,.cfg-b svg{width:16px;height:16px;flex:none}

.b-chats{display:grid;grid-template-columns:minmax(0,1fr);gap:6px;min-height:0;min-width:0;max-width:100%}
#oc-chats{min-width:0;max-width:100%;overflow:hidden}
.b-chats h4{font:500 11px/1 var(--mono);color:var(--mut);margin:10px 0 2px;letter-spacing:.04em;text-transform:uppercase}
.b-chats ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:2px;min-width:0}
.b-chats li{display:flex;align-items:center;gap:2px;min-width:0;border-radius:8px;border:1px solid transparent}
.b-chats li.act{background:var(--accent-soft);border-color:var(--accent)}
.b-chats li:hover:not(.act){background:var(--surface)}
.b-chats .ch-t{flex:1;min-width:0;text-align:left;background:transparent;border:0;color:var(--ink);font:400 13.5px/1.3 var(--sans);padding:8px 8px;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.b-chats .ch-b{flex:none;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:var(--mut);font:500 13px/1 var(--sans);cursor:pointer}
.b-chats .ch-b:hover{background:var(--surface-2);color:var(--ink)}
.b-chats input.ch-i{flex:1;min-width:0;margin:3px;min-height:30px;padding:0 8px;border:1px solid var(--ink-2);border-radius:6px;background:var(--bg);color:var(--ink);font:inherit;font-size:13.5px}
.b-chats .ch-todos{margin-top:6px;background:transparent;border:0;color:var(--mut);font:500 12.5px/1 var(--sans);text-align:left;padding:6px 4px;cursor:pointer;text-decoration:underline}
.b-chats .ch-est{font-size:12px;color:var(--risk);margin:0}
.b-chats button:focus-visible,.b-chats input:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.sw{display:flex;align-items:center;gap:14px;width:100%;padding:14px 14px 14px 16px;border-radius:12px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);cursor:pointer;text-align:left;font:inherit;transition:border-color .2s,background .2s,box-shadow .2s}
.sw .sw-t{flex:1;min-width:0;display:grid;gap:3px}
.sw #oc-swt{font:700 15px/1.2 var(--mono);letter-spacing:.01em}
.sw small{font-size:12.5px;color:var(--mut)}
.sw .pista{width:52px;height:30px;border-radius:15px;background:var(--line-2);position:relative;flex:none;transition:background .2s}
.sw .pista::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s cubic-bezier(.3,.7,.3,1)}
.sw[aria-checked=true]{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 14%,transparent)}
.sw[aria-checked=true] #oc-swt{color:var(--accent)}
.sw[aria-checked=true] .pista{background:var(--accent)}
.sw[aria-checked=true] .pista::after{transform:translateX(22px)}
.cfg-b{display:flex;align-items:center;gap:8px;margin-top:8px;min-height:38px;padding:0 12px;border-radius:10px;border:1px solid transparent;background:transparent;color:var(--ink-2);font:500 14px/1 var(--sans);cursor:pointer;width:100%}
.cfg-b:hover{background:var(--surface);border-color:var(--line)}

.conv{display:flex;flex-direction:column;min-height:0;min-width:0}
.scroll{flex:1;overflow-y:auto;overscroll-behavior:contain}
.col{max-width:780px;margin:0 auto;padding:0 24px}
.vacio{padding:clamp(40px,10vh,120px) 0 24px}
.vacio h1{font-size:var(--s3);max-width:18ch}
.vacio p{color:var(--ink-2);margin-top:14px;max-width:56ch}
.chips{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:28px}
.chips button{text-align:left;padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);font:inherit;font-size:14.5px;line-height:1.45;cursor:pointer;transition:border-color .15s,transform .15s}
.chips button:hover{border-color:var(--ink-2);transform:translateY(-1px)}
#oc-log{display:flex;flex-direction:column;gap:18px;padding:24px 0 32px}
#oc-log:empty{padding:0}
.msg{overflow-wrap:anywhere;line-height:1.6;animation:entra .3s ease-out}
@keyframes entra{from{opacity:0;transform:translateY(4px)}}
.msg.u .ims,.thumbs{display:flex;flex-wrap:wrap;gap:8px}
.msg.u .ims{margin-top:8px}
.msg.u .ims img{max-width:160px;max-height:160px;border-radius:10px;border:1px solid var(--line);object-fit:cover}
.msg.a .t p.mod{font:400 12px/1.4 var(--mono);color:var(--mut)}
.msg.u{align-self:flex-end;max-width:85%;background:var(--surface-2);border:1px solid var(--line);padding:10px 16px;border-radius:18px 18px 4px 18px;white-space:pre-wrap}
.msg.a{display:grid;grid-template-columns:28px minmax(0,1fr);gap:14px}
.msg.a::before{content:"";width:28px;height:28px;border-radius:8px;background:var(--ink) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='14.5' r='6.5' fill='none' stroke='white' stroke-width='2.6'/%3E%3Crect x='8' y='24' width='10' height='2.6' rx='1.3' fill='%234fc39c'/%3E%3C/svg%3E") center/22px no-repeat}
.msg.a .t{display:grid;gap:10px;min-width:0;padding-top:2px}
.msg.a .t p.h{font-weight:700}
.msg.a .t ul,.msg.a .t ol{margin:0;padding-left:1.3em;display:grid;gap:4px}
.msg.a .t .tb{overflow-x:auto;border:1px solid var(--line);border-radius:10px}
.msg.a .t table{border-collapse:collapse;width:100%;font-size:13.5px;line-height:1.45}
.msg.a .t th,.msg.a .t td{text-align:left;vertical-align:top;padding:8px 12px;border-bottom:1px solid var(--line)}
.msg.a .t th{font-weight:600;background:var(--surface-2);white-space:nowrap}
.msg.a .t tr:last-child td{border-bottom:0}
.msg.a .t code{background:var(--surface-2);padding:1px 5px;border-radius:4px}
.msg.e{border:1px solid color-mix(in srgb,var(--risk) 40%,transparent);background:var(--risk-soft);color:var(--risk);padding:10px 14px;border-radius:10px;font-size:14.5px}
.msg.n{align-self:center;font:500 12px/1.4 var(--mono);color:var(--mut);text-align:center;padding:4px 10px}
.msg.w{align-self:flex-start;display:flex;align-items:center;gap:10px;font:400 14px/1 var(--sans);color:var(--mut);padding:6px 0 6px 42px}
.msg.w::before{content:"";width:36px;height:8px;background:radial-gradient(circle,var(--mut) 3px,transparent 3.5px) 0 0/12px 8px repeat-x;animation:puntos 1.2s infinite linear;opacity:.7}
@keyframes puntos{50%{opacity:.25}}
.tc{margin-left:42px;border:1px solid var(--line);border-radius:12px;background:var(--surface);overflow:hidden;animation:entra .3s ease-out}
.tc summary{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;list-style:none;font-size:13.5px;color:var(--ink-2)}
.tc summary::-webkit-details-marker{display:none}
.tc summary:hover{background:var(--surface-2)}
.tc .tc-i{width:22px;height:22px;border-radius:6px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;flex:none}
.tc .tc-i svg{width:13px;height:13px}
.tc summary code{font:600 13px/1.3 var(--mono);color:var(--ink)}
.tc .tc-a{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:400 12.5px/1.3 var(--mono);color:var(--mut)}
.tc .tc-c{width:8px;height:8px;border-right:1.5px solid var(--mut);border-bottom:1.5px solid var(--mut);transform:rotate(-45deg);transition:transform .2s;flex:none;margin-right:4px}
.tc[open] .tc-c{transform:rotate(45deg)}
.tc .tc-b{border-top:1px solid var(--line);background:var(--code-bg);color:var(--code-ink)}
.tc .tc-b p{margin:0;padding:10px 14px 0;font:500 11px/1 var(--mono);color:var(--code-mut);letter-spacing:.04em;text-transform:uppercase}
.tc pre{margin:0;padding:8px 14px 12px;white-space:pre-wrap;overflow-wrap:anywhere;font:400 12px/1.55 var(--mono);max-height:300px;overflow:auto}

.composer{padding:8px 24px 14px;background:linear-gradient(to bottom,transparent,var(--bg) 30%)}
.composer .caja{max-width:780px;margin:0 auto;border:1px solid var(--line-2);border-radius:18px;background:var(--surface);box-shadow:var(--shadow);transition:border-color .15s}
.composer .caja:focus-within{border-color:var(--ink-2)}
.composer textarea{display:block;width:100%;border:0;background:transparent;resize:none;padding:14px 16px 4px;font:inherit;color:var(--ink);outline:none;max-height:200px;min-height:52px;line-height:1.5}
.thumbs{padding:12px 14px 0}
.thumbs[hidden]{display:none}
.thumbs .th{position:relative}
.thumbs img{display:block;width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}
.thumbs .th button{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:600 13px/1 var(--sans);cursor:pointer;display:grid;place-items:center;padding:0}
.caja.arrastre{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
#oc-adj{width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:var(--ink-2);display:grid;place-items:center;cursor:pointer;flex:none}
#oc-adj:hover{background:var(--surface-2)}#oc-adj svg{width:18px;height:18px}
#oc-adj:focus-visible,.thumbs button:focus-visible,#oc-send:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.composer .barra{display:flex;align-items:center;gap:6px;padding:6px 8px 8px 14px}
.composer .barra .ind{margin-right:auto}
.ind{display:inline-flex;align-items:center;gap:6px;font:500 12px/1 var(--mono);color:var(--mut)}
.ind i{width:7px;height:7px;border-radius:50%;background:var(--line-2)}
.ind.on{color:var(--accent)}.ind.on i{background:var(--accent)}
#oc-send{margin-left:0;width:36px;height:36px;border-radius:50%;border:0;background:var(--ink);color:var(--bg);display:grid;place-items:center;cursor:pointer}
#oc-send:disabled{opacity:.35;cursor:default}
#oc-send svg{width:16px;height:16px}
.composer .nota-c{max-width:780px;margin:8px auto 0;text-align:center;font-size:12px;color:var(--mut)}

#oc-cfg{width:min(620px,calc(100vw - 32px));max-height:min(88vh,860px);padding:0;border:1px solid var(--line-2);border-radius:16px;background:var(--surface);color:var(--ink);box-shadow:0 30px 80px -20px rgba(0,0,0,.45);overflow:auto}
#oc-cfg::backdrop{background:rgba(10,12,13,.55);backdrop-filter:blur(2px)}
#oc-cfg .cfg-h{position:sticky;top:0;background:var(--surface);display:flex;align-items:center;gap:12px;padding:18px 22px;border-bottom:1px solid var(--line);z-index:1}
#oc-cfg .cfg-h h2{font-size:var(--s1);font-family:var(--sans);letter-spacing:-.01em}
#oc-cfg .cfg-in{padding:18px 22px 22px}
#oc-cfg h3{font:500 12px/1 var(--mono);color:var(--mut);margin:22px 0 10px}
#oc-cfg h3:first-child{margin-top:0}
#oc-cfg .intro{font-size:14px;color:var(--ink-2);background:var(--surface-2);border-radius:10px;padding:12px 14px}
#oc-cfg label{display:block;margin:14px 0 6px;font-size:13.5px;font-weight:600}
#oc-cfg input:not([type=checkbox]):not([type=radio]),#oc-cfg select{width:100%;min-height:42px;padding:0 12px;border:1px solid var(--line-2);border-radius:10px;background:var(--bg);color:var(--ink);font:inherit;font-size:14.5px}
#oc-cfg input:focus,#oc-cfg select:focus{outline:none;border-color:var(--ink)}
#oc-cfg label.chk{display:flex;gap:10px;align-items:center;font-weight:400}
#oc-cfg label.chk input{width:18px;height:18px;accent-color:var(--accent)}
#oc-lista{list-style:none;margin:0;padding:0;display:grid;gap:6px}
#oc-lista li{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:8px 8px 8px 14px;font-size:14px}
#oc-lista li span{flex:1;overflow-wrap:anywhere}
#oc-lista li.act{border-color:var(--accent);background:var(--accent-soft)}
#oc-lista label.usar{display:flex;align-items:center;gap:8px;margin:0;font-size:13.5px;font-weight:500;cursor:pointer;flex-basis:100%}
#oc-lista label.usar input{width:18px;height:18px;min-height:0;accent-color:var(--accent);margin:0}
#oc-presets{display:flex;flex-wrap:wrap;gap:6px}
#oc-cfg .b,#oc-presets button,#oc-lista button{min-height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:500 13.5px/1 var(--sans);cursor:pointer}
#oc-cfg .b:hover,#oc-presets button:hover,#oc-lista button:hover{border-color:var(--ink)}
#oc-cfg .b-p{background:var(--ink);color:var(--bg);border-color:var(--ink)}
#oc-cfg .acc-c{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
#oc-cest{font-size:13.5px;color:var(--ink-2);margin-top:12px;min-height:1.2em}
#oc-cfg-x{margin-left:auto}
.sw:focus-visible,.chips button:focus-visible,#oc-cfg button:focus-visible,#oc-cfg input:focus-visible,#oc-cfg select:focus-visible,.tc summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

@media (max-width:860px){
 .chat{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}
 .lado{border-right:0;border-bottom:1px solid var(--line);padding:10px 16px;gap:8px;display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;overflow:visible}
 .lado .b-sw{grid-column:1/-1}
 .lado .lbl,.lado p.ayuda,.lado .pie-l,.lado .b-chats{display:none}
 .sw{padding:8px 10px 8px 14px}.sw small{display:none}.sw #oc-swt{font-size:14px}
 .sw .pista{width:44px;height:26px}.sw .pista::after{width:20px;height:20px}.sw[aria-checked=true] .pista::after{transform:translateX(18px)}
 .lado .b-mod{display:contents}
 .cfg-b{margin:0;width:42px;height:42px;padding:0;justify-content:center;border-color:var(--line-2);background:var(--surface)}
 .cfg-b span,.nueva span{display:none}
 .nueva{width:42px;height:42px;padding:0;justify-content:center}
 .lado .b-nueva{order:3}
 .col{padding:0 16px}.composer{padding:6px 12px 10px}
 .vacio{padding:28px 0 16px}
 .chips{grid-template-columns:minmax(0,1fr);margin-top:20px}
 .tc{margin-left:0}.msg.a{grid-template-columns:minmax(0,1fr)}.msg.a::before{display:none}.msg.w{padding-left:0}
}
`;

const icoMas = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>`;
const icoEngranaje = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>`;
const icoClip = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 11.5-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l8-8"/></svg>`;
const icoEnviar = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>`;

export const demoHtml = String.raw`
<div class="chat">
<aside class="lado" aria-label="Opciones del asistente">
<div class="b-nueva"><button type="button" id="oc-nueva" class="nueva" aria-label="Nueva conversación">${icoMas}<span>Nueva conversación</span></button></div>
<nav class="b-chats" aria-label="Chats guardados"><p class="ch-est" id="oc-chat-est" role="status" hidden></p><div id="oc-chats"></div></nav>
<div class="b-sw"><span class="lbl" id="oc-swl">Herramientas</span>
<button type="button" id="oc-sw" class="sw" role="switch" aria-checked="true" aria-describedby="oc-swd"><span class="sw-t"><span id="oc-swt">MCP: ACTIVADO</span><small>obraclara · 4 herramientas</small></span><span class="pista" aria-hidden="true"></span></button>
<p class="ayuda" id="oc-swd"></p></div>
<div class="b-mod"><p class="ayuda" id="oc-info" style="margin:0 0 8px"></p>
<button type="button" id="oc-gear" class="cfg-b" aria-haspopup="dialog" aria-label="Configuración de IA">${icoEngranaje}<span>Configuración</span></button></div>
<div class="pie-l"><p>Los chats se guardan solo en este navegador y dispositivo (no en nuestro servidor). Si borras los datos del sitio, se pierden.</p><p>Las alertas son indicios para revisar, no prueba de irregularidades.</p><p>Universidad de Lima · I.A. Aplicada · Grupo 1. Código hecho con ayuda de IA generativa y revisado por el grupo.</p></div>
</aside>

<section class="conv" aria-labelledby="oc-t">
<div class="scroll" id="oc-scroll"><div class="col">
<div class="vacio" id="oc-vacio">
<h1 id="oc-t">¿Qué quieres saber de la inversión pública?</h1>
<p>Pregunta por una obra, una entidad o una región. Con el MCP activado, el modelo consulta los datos del MEF y te muestra qué herramienta usó.</p>
<div class="chips" id="oc-chips">
<button type="button">¿Qué obras de salud en Cusco llevan 6 meses sin gasto?</button>
<button type="button">Resume las inversiones de la Municipalidad Provincial de Piura</button>
<button type="button">¿Cuál es el avance de la inversión 2716769?</button>
</div></div>
<div id="oc-log" aria-live="polite"></div>
</div></div>
<form id="oc-form" class="composer">
<div class="caja"><div class="thumbs" id="oc-thumbs" hidden></div><textarea id="oc-in" rows="1" placeholder="Escribe tu pregunta" aria-label="Tu pregunta"></textarea>
<div class="barra"><span class="ind on" id="oc-ind"><i></i><span>MCP activado</span></span><input type="file" id="oc-file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden><button type="button" id="oc-adj" aria-label="Adjuntar imagen" title="Adjuntar imagen">${icoClip}</button><button id="oc-send" aria-label="Enviar">${icoEnviar}</button></div></div>
<p class="nota-c">El modelo puede equivocarse. Verifica las cifras en la fuente oficial del MEF.</p>
</form>
</section>
</div>

<dialog id="oc-cfg" aria-labelledby="oc-cfg-t">
<div class="cfg-h"><h2 id="oc-cfg-t">Configuración de IA</h2><button type="button" id="oc-cfg-x" class="b">Cerrar</button></div>
<div class="cfg-in">
<p class="intro">Por defecto la respuesta la da el servidor de ObraClara, que prueba gpt-headless, luego Workers AI y luego Groq. Si prefieres, agrega tus propias conexiones de IA y elige cuál usar. La clave se guarda solo en tu navegador (por defecto hasta cerrar la pestaña) y las solicitudes van directo de tu navegador al proveedor: tus claves nunca llegan a nuestro servidor.</p>
<h3>Conexión activa</h3>
<ul id="oc-lista"></ul>
<form id="oc-cform" autocomplete="off">
<h3 id="oc-cform-t">Agregar conexión</h3>
<div id="oc-presets" role="group" aria-label="Plantillas de proveedor"></div>
<label for="oc-cnombre">Nombre</label><input id="oc-cnombre" maxlength="60" autocomplete="off">
<label for="oc-ctipo">Tipo de API</label>
<select id="oc-ctipo"><option value="openai">Compatible con OpenAI (/chat/completions)</option><option value="anthropic">Anthropic</option></select>
<label for="oc-cbase">URL base (termina antes de /chat/completions)</label><input id="oc-cbase" type="url" placeholder="https://mi-proveedor.com/v1" autocomplete="off" spellcheck="false">
<label for="oc-cmodel">Nombre del modelo</label><input id="oc-cmodel" autocomplete="off" spellcheck="false">
<label for="oc-ckey">Clave de API</label><input id="oc-ckey" type="password" autocomplete="off" spellcheck="false">
<label class="chk"><input id="oc-crec" type="checkbox"> Recordar en este dispositivo</label>
<p id="oc-cest" role="status" aria-live="polite"></p>
<div class="acc-c">
<button type="submit" id="oc-csave" class="b b-p">Guardar</button>
<button type="button" id="oc-ctest" class="b">Probar conexión</button>
<button type="button" id="oc-ccancel" class="b" hidden>Cancelar edición</button>
</div>
</form>
</div>
</dialog>
`;

const nombres = [
  parseToolCall, parseSse, buildSystemPrompt, truncate, presetsIA, textoLimpio, normalizarConexion, validarConexion,
  migrarConfig, construirPeticion, extraerRespuesta, limitesImagen, validarImagen, escalarImagen, construirContenido, aBloquesAnthropic,
  tituloChat, grupoFecha, recortarChats, serializarChats, deserializarChats, sinImagenes, normalizarMensaje, normalizarChat,
].map((f) => f.toString()).join("\n");

const app = String.raw`
var ocMcp=true,ocHist=[],ocTools=null,ocBusy=false,ocConns=[],ocActiva='gpt-headless',ocEdit='',ocHL='gpt-headless',ocImgs=[],ocMsgs=[],ocChats=[],ocChatId='',ocRest=false,ocRen='';
var OC_ICO_TOOL='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h12M2 8h8M2 12h5"/><path d="m11 10 2 2-2 2"/></svg>';
function $(id){return document.getElementById(id)}
function ocBajar(){var s=$('oc-scroll');if(s)s.scrollTop=s.scrollHeight}
function ocInl(n,s){String(s).split(/(\*\*[^*]+\*\*|` + "`[^`]+`" + String.raw`)/).forEach(function(x){if(!x)return;
 if(x.length>4&&x.slice(0,2)==='**'&&x.slice(-2)==='**'){var b=document.createElement('strong');b.textContent=x.slice(2,-2);n.appendChild(b)}
 else if(x.length>2&&x.charAt(0)==='` + "`" + String.raw`'&&x.slice(-1)==='` + "`" + String.raw`'){var c=document.createElement('code');c.textContent=x.slice(1,-1);n.appendChild(c)}
 else n.appendChild(document.createTextNode(x))})}
function ocMd(el,txt){var lst=null,p=null,tb=null;String(txt).replace(/\r/g,'').split('\n').forEach(function(l){var t=l.trim(),mm=/^([-*•]|\d+[.)])\s+(.*)$/.exec(t);
 if(t.charAt(0)==='|'){lst=null;p=null;if(/^\|?[\s:|-]+$/.test(t))return;
  var cs=t.replace(/^\||\|$/g,'').split('|');if(!tb){var w=document.createElement('div');w.className='tb';tb=document.createElement('table');w.appendChild(tb);el.appendChild(w);tb.ocHead=true}
  var tr=document.createElement('tr');cs.forEach(function(x){var c=document.createElement(tb.ocHead?'th':'td');ocInl(c,x.trim());tr.appendChild(c)});tb.ocHead=false;tb.appendChild(tr);return}
 tb=null;
 if(!t){lst=null;p=null;return}
 if(/^#{1,4}\s/.test(t)){lst=null;p=null;var h=document.createElement('p');h.className='h';ocInl(h,t.replace(/^#+\s*/,''));el.appendChild(h);return}
 if(mm){var ord=/\d/.test(mm[1]);if(!lst||lst.ocOrd!==ord){lst=document.createElement(ord?'ol':'ul');lst.ocOrd=ord;el.appendChild(lst)}p=null;var li=document.createElement('li');ocInl(li,mm[2]);lst.appendChild(li);return}
 lst=null;if(!p){p=document.createElement('p');el.appendChild(p)}else p.appendChild(document.createElement('br'));ocInl(p,t)})}
function ocRec(m){if(!ocRest)ocMsgs.push(m)}
function ocLog(cls,txt,extra){if(cls==='u')ocRec({rol:'u',texto:txt+(extra&&extra.length?'\n'+extra.map(function(){return '[imagen adjunta]'}).join(' '):''),mcp:ocMcp});
 if(cls==='a')ocRec({rol:'a',texto:txt,modelo:typeof extra==='string'?extra:'',mcp:ocMcp});
var d=document.createElement('div');d.className='msg '+cls;$('oc-vacio').hidden=true;
 if(cls==='a'){var t=document.createElement('div');t.className='t';ocMd(t,txt);
  if(typeof extra==='string'&&extra){var m=document.createElement('p');m.className='mod';m.textContent='Respondió: '+extra;t.appendChild(m)}
  d.appendChild(t)}
 else{d.textContent=txt;
  if(cls==='u'&&extra&&extra.length){var g=document.createElement('div');g.className='ims';extra.forEach(function(u){var im=document.createElement('img');im.alt='Imagen adjunta';im.src=u;g.appendChild(im)});d.appendChild(g)}}
 $('oc-log').appendChild(d);ocBajar();return d}
function ocTool(name,args,res){ocRec({rol:'t',texto:'',herramienta:{nombre:name,args:args||{},resultado:truncate(typeof res==='string'?res:String(res),2400)}});var d=document.createElement('details'),s=document.createElement('summary'),b=document.createElement('div');d.className='tc';
 var i=document.createElement('span');i.className='tc-i';i.innerHTML=OC_ICO_TOOL;
 var n=document.createElement('code');n.textContent=name;var a=document.createElement('span');a.className='tc-a';
 a.textContent=Object.keys(args||{}).map(function(k){return k+': '+JSON.stringify(args[k])}).join(' · ');
 var c=document.createElement('span');c.className='tc-c';c.setAttribute('aria-hidden','true');
 var lb=document.createElement('span');lb.className='sr';lb.textContent='Herramienta usada: ';
 s.appendChild(i);s.appendChild(lb);s.appendChild(n);s.appendChild(a);s.appendChild(c);
 var r=res;try{r=JSON.stringify(JSON.parse(res),null,2)}catch(e){}
 var h1=document.createElement('p'),p1=document.createElement('pre'),h2=document.createElement('p'),p2=document.createElement('pre');
 h1.textContent='Argumentos';p1.textContent=JSON.stringify(args||{},null,2);h2.textContent='Resultado';p2.textContent=truncate(r,2400);
 b.className='tc-b';b.appendChild(h1);b.appendChild(p1);b.appendChild(h2);b.appendChild(p2);
 d.appendChild(s);d.appendChild(b);$('oc-vacio').hidden=true;$('oc-log').appendChild(d);ocBajar()}
function ocRead(st,k){try{return JSON.parse(st.getItem(k)||'null')}catch(e){return null}}
function ocWrite(st,k,v){try{if(v===null)st.removeItem(k);else st.setItem(k,JSON.stringify(v))}catch(e){}}
function ocSwitchText(){var sw=$('oc-sw');sw.setAttribute('aria-checked',String(ocMcp));$('oc-swt').textContent=ocMcp?'MCP: ACTIVADO':'MCP: DESACTIVADO';
 $('oc-swd').textContent=ocMcp?'Con MCP: el modelo puede consultar los datos oficiales del MEF mediante las herramientas de este servidor.':'Sin MCP: chat normal con el mismo modelo, sin acceso a los datos; puede equivocarse o inventar.';
 var ind=$('oc-ind');ind.className='ind'+(ocMcp?' on':'');ind.lastChild.textContent=ocMcp?'MCP activado':'MCP desactivado · sin datos'}
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
function ocUi(){if(ocActiva!==ocHL&&!ocConnById(ocActiva))ocActiva=ocHL;
 $('oc-info').textContent=ocActiva===ocHL?'Por defecto la respuesta viene del servidor de ObraClara, que prueba gpt-headless, luego Workers AI y luego Groq. En «Configuración» puedes usar tu propia IA con tu clave: nunca llega a nuestro servidor.':'Usando tu conexión «'+ocConnById(ocActiva).nombre+'»: las solicitudes van directo desde tu navegador al proveedor; la clave nunca llega a nuestro servidor.'}
function ocElegir(id){ocActiva=id;ocPersist();ocUi();ocRenderLista()}
function ocRenderLista(){var u=$('oc-lista');u.textContent='';
 function fila(id,txt,extras){var li=document.createElement('li'),sp=document.createElement('span'),lb=document.createElement('label'),r=document.createElement('input');
  li.className=ocActiva===id?'act':'';sp.textContent=txt;
  lb.className='usar';r.type='radio';r.name='oc-act';r.checked=ocActiva===id;r.addEventListener('change',function(){ocElegir(id)});
  lb.appendChild(r);lb.appendChild(document.createTextNode(id===ocHL?'Usar el servidor de ObraClara (predeterminado)':'Usar esta conexión'));
  li.appendChild(sp);(extras||[]).forEach(function(x){li.appendChild(x)});li.appendChild(lb);u.appendChild(li)}
 fila(ocHL,'Servidor de ObraClara: gpt-headless, luego Workers AI, luego Groq',[]);
 ocConns.forEach(function(c){var be=document.createElement('button'),bd=document.createElement('button');
  be.type='button';be.textContent='Editar';be.setAttribute('aria-label','Editar '+c.nombre);be.addEventListener('click',function(){ocFormFill(c)});
  bd.type='button';bd.textContent='Eliminar';bd.setAttribute('aria-label','Eliminar '+c.nombre);bd.addEventListener('click',function(){ocDelete(c.id)});
  fila(c.id,c.nombre+' ('+c.modelo+')'+(c.recordar?' · recordada en este dispositivo':''),[be,bd])})}
function ocFormFill(c){ocEdit=c?c.id:'';$('oc-cnombre').value=c?c.nombre:'';$('oc-ctipo').value=c?c.tipo:'openai';$('oc-cbase').value=c?c.baseUrl:'';
 $('oc-cmodel').value=c?c.modelo:'';$('oc-ckey').value=c?c.clave:'';$('oc-crec').checked=c?!!c.recordar:false;$('oc-cest').textContent='';
 $('oc-cform-t').textContent=c?'Editar conexión':'Agregar conexión';$('oc-ccancel').hidden=!c;$('oc-cnombre').focus()}
function ocFormRead(){return normalizarConexion({id:ocEdit,nombre:$('oc-cnombre').value,tipo:$('oc-ctipo').value,baseUrl:$('oc-cbase').value,modelo:$('oc-cmodel').value,clave:$('oc-ckey').value,recordar:$('oc-crec').checked})}
function ocPreset(id){var p=presetsIA().filter(function(x){return x.id===id})[0];if(!p)return;
 $('oc-ctipo').value=p.tipo;$('oc-cbase').value=p.baseUrl;$('oc-cmodel').value=p.modelo;if(!$('oc-cnombre').value.trim()&&id!=='otro')$('oc-cnombre').value=p.nombre;$('oc-cbase').focus()}
function ocSave(){var c=ocFormRead(),er=validarConexion(c);if(er.length){$('oc-cest').textContent=er.join(' ');return}
 if(ocEdit){ocConns=ocConns.map(function(x){return x.id===ocEdit?c:x})}else{c.id='c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);ocConns.push(c)}
 ocPersist();ocUi();ocRenderLista();ocFormFill(null);$('oc-cest').textContent='Conexión guardada. Marca «Usar esta conexión» en la lista para activarla.'}
function ocDelete(id){var c=ocConnById(id);if(!c||!confirm('¿Eliminar la conexión «'+c.nombre+'»?'))return;
 ocConns=ocConns.filter(function(x){return x.id!==id});if(ocActiva===id)ocActiva=ocHL;if(ocEdit===id)ocFormFill(null);ocPersist();ocUi();ocRenderLista()}
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
  if(r.status===503||r.status===504)throw new Error('El servidor de ObraClara no pudo responder ahora (ninguna IA disponible). Inténtalo de nuevo o agrega tu propia IA en Configuración.');
  if(!r.ok){var et=d&&typeof d.error==='string'?d.error:'El servidor respondió con error '+r.status+'.';throw new Error(et.slice(0,200))}
  if(!d||typeof d.content!=='string')throw new Error('Respuesta del servidor no válida.');
  return {texto:d.content,modelo:typeof d.modelo==='string'?d.modelo:''}}
 var c=ocConnById(ocActiva);if(!c)throw new Error('La IA seleccionada ya no existe. Elige otra.');
 return {texto:await ocLlmConn(c,msgs),modelo:c.nombre}}
async function ocMcpCall(method,params){
 var r;try{r=await fetch('/mcp',{method:'POST',headers:{'content-type':'application/json','accept':'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:Date.now(),method:method,params:params||{}})})}
 catch(e){throw new Error('No se pudo conectar con el servidor MCP.')}
 if(r.status===429)throw new Error('Demasiadas solicitudes al servidor MCP (429). Espera un minuto.');
 if(!r.ok)throw new Error('El servidor MCP respondió con error '+r.status+'.');
 var d=parseSse(await r.text());if(!d)throw new Error('Respuesta MCP no válida.');if(d.error)throw new Error(d.error.message||'Error MCP.');return d.result}
async function ocRun(q,urls){
 ocHist.push({role:'user',content:construirContenido(q,urls||[])});
 if(ocMcp&&!ocTools){ocTools=((await ocMcpCall('tools/list')).tools)||[]}
 var sys=buildSystemPrompt(ocTools||[],ocMcp);
 for(var step=0;step<5;step++){
  var rr=await ocLlm([{role:'system',content:sys}].concat(ocHist)),out=rr.texto,mo=rr.modelo;
  var c=parseToolCall(out);
  if(!c){ocHist.push({role:'assistant',content:out});ocLog('a',out.trim()||'(sin respuesta)',mo);return}
  if(c.tipo==='respuesta'){ocHist.push({role:'assistant',content:out});ocLog('a',c.texto,mo);return}
  if(!ocMcp){ocHist.push({role:'assistant',content:out});ocLog('a',out.trim(),mo);return}
  var txt;try{var rs=await ocMcpCall('tools/call',{name:c.tool,arguments:c.args});txt=(rs.content||[]).map(function(x){return x.text||''}).join('')||JSON.stringify(rs)}catch(e){txt='Error: '+e.message}
  ocTool(c.tool,c.args,txt);
  ocHist.push({role:'assistant',content:out});
  ocHist.push({role:'user',content:'Resultado de '+c.tool+':'+String.fromCharCode(10)+truncate(txt,6000)+String.fromCharCode(10)+'Continúa: llama otra herramienta o termina con {"respuesta":"..."}.'});
 }
 ocLog('n','Se alcanzó el máximo de 5 pasos sin respuesta final. Prueba con una pregunta más concreta.')}
function ocIdb(){return new Promise(function(ok,no){try{var r=indexedDB.open('obraclara',1);r.onupgradeneeded=function(){r.result.createObjectStore('kv')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){no(r.error)}}catch(e){no(e)}})}
async function ocAlmLeer(){var v=null;
 try{if(typeof indexedDB!=='undefined'){var db=await ocIdb();v=await new Promise(function(ok,no){var q=db.transaction('kv','readonly').objectStore('kv').get('chats');q.onsuccess=function(){ok(q.result)};q.onerror=function(){no(q.error)}});db.close()}}catch(e){v=null}
 if(typeof v==='string'&&v)return v;
 try{return localStorage.getItem('oc_chats')}catch(e){return null}}
async function ocAlmEscribir(txt){var fallo=null;
 try{if(typeof indexedDB!=='undefined'){var db=await ocIdb();await new Promise(function(ok,no){var t=db.transaction('kv','readwrite');t.objectStore('kv').put(txt,'chats');t.oncomplete=function(){ok()};t.onerror=function(){no(t.error)};t.onabort=function(){no(t.error)}});db.close();return}}catch(e){fallo=e}
 try{localStorage.setItem('oc_chats',txt)}catch(e2){throw (fallo&&fallo.name==='QuotaExceededError')||e2.name==='QuotaExceededError'?new Error('cuota'):new Error('bloqueado')}}
function ocChatEst(m){var e=$('oc-chat-est');e.textContent=m||'';e.hidden=!m}
async function ocPersistChats(){ocChats=recortarChats(ocChats);
 try{await ocAlmEscribir(serializarChats(ocChats));ocChatEst('')}
 catch(e){ocChatEst(e&&e.message==='cuota'?'No se pudo guardar el chat: el almacenamiento del navegador está lleno. Borra chats antiguos.':'Este navegador no permite guardar chats (almacenamiento bloqueado). Puedes seguir chateando, pero no se guardará.')}
 ocRenderChats()}
function ocGuardar(){var hay=false;ocMsgs.forEach(function(m){if(m.rol==='a')hay=true});if(!hay)return;
 var ahora=Date.now(),c=null;ocChats.forEach(function(x){if(x.id===ocChatId)c=x});
 if(!c){var pu='';ocMsgs.forEach(function(m){if(!pu&&m.rol==='u')pu=m.texto});
  ocChatId='c'+ahora.toString(36)+Math.random().toString(36).slice(2,6);c={id:ocChatId,titulo:tituloChat(pu),creado:ahora,actualizado:ahora,mensajes:[]};ocChats.push(c)}
 c.mensajes=ocMsgs.slice();c.actualizado=ahora;ocPersistChats()}
async function ocCargarChats(){var t=await ocAlmLeer();ocChats=deserializarChats(t);ocRenderChats()}
function ocLimpiar(){ocHist=[];ocMsgs=[];ocChatId='';ocImgs=[];ocThumbs();$('oc-log').textContent='';$('oc-vacio').hidden=false}
function ocAbrir(id){if(ocBusy)return;var c=null;ocChats.forEach(function(x){if(x.id===id)c=x});if(!c)return;
 ocLimpiar();ocChatId=c.id;ocRest=true;
 c.mensajes.forEach(function(m){
  if(m.rol==='u'){ocLog('u',m.texto);ocHist.push({role:'user',content:m.texto})}
  else if(m.rol==='a'){ocLog('a',m.texto,m.modelo||'');ocHist.push({role:'assistant',content:m.texto})}
  else if(m.rol==='t'&&m.herramienta)ocTool(m.herramienta.nombre,m.herramienta.args,m.herramienta.resultado)});
 ocRest=false;ocMsgs=c.mensajes.slice();ocRenderChats();ocBajar()}
function ocRenombrar(id,v){ocChats.forEach(function(x){if(x.id===id)x.titulo=tituloChat(v)});ocRen='';ocPersistChats()}
function ocBorrar(id){var c=null;ocChats.forEach(function(x){if(x.id===id)c=x});if(!c||!confirm('¿Borrar el chat «'+c.titulo+'»?'))return;
 ocChats=ocChats.filter(function(x){return x.id!==id});if(ocChatId===id)ocLimpiar();ocPersistChats()}
function ocBorrarTodos(){if(!ocChats.length||!confirm('¿Borrar todos los chats guardados en este navegador? No se puede deshacer.'))return;
 ocChats=[];ocLimpiar();ocPersistChats()}
function ocRenderChats(){var r=$('oc-chats');r.textContent='';if(!ocChats.length)return;
 var ahora=Date.now(),ult='',ul=null;
 ocChats.slice().sort(function(a,b){return b.actualizado-a.actualizado}).forEach(function(c){var g=grupoFecha(c.actualizado,ahora);
  if(g!==ult){ult=g;var h=document.createElement('h4');h.textContent=g;r.appendChild(h);ul=document.createElement('ul');r.appendChild(ul)}
  var li=document.createElement('li');if(c.id===ocChatId){li.className='act';li.setAttribute('aria-current','true')}
  if(ocRen===c.id){var inp=document.createElement('input');inp.className='ch-i';inp.value=c.titulo;inp.maxLength=60;inp.setAttribute('aria-label','Nuevo nombre del chat');
   var hecho=false;function fin(ok){if(hecho)return;hecho=true;if(ok)ocRenombrar(c.id,inp.value);else{ocRen='';ocRenderChats()}}
   inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();fin(true)}else if(e.key==='Escape'){fin(false)}});
   inp.addEventListener('blur',function(){fin(true)});li.appendChild(inp);ul.appendChild(li);setTimeout(function(){inp.focus();inp.select()},0);return}
  var b=document.createElement('button');b.type='button';b.className='ch-t';b.textContent=c.titulo;b.title=c.titulo;b.addEventListener('click',function(){ocAbrir(c.id)});
  var rn=document.createElement('button');rn.type='button';rn.className='ch-b';rn.textContent='✎';rn.setAttribute('aria-label','Renombrar chat «'+c.titulo+'»');rn.addEventListener('click',function(){ocRen=c.id;ocRenderChats()});
  var dl=document.createElement('button');dl.type='button';dl.className='ch-b';dl.textContent='×';dl.setAttribute('aria-label','Borrar chat «'+c.titulo+'»');dl.addEventListener('click',function(){ocBorrar(c.id)});
  li.appendChild(b);li.appendChild(rn);li.appendChild(dl);ul.appendChild(li)});
 var t=document.createElement('button');t.type='button';t.className='ch-todos';t.textContent='Borrar todos los chats';t.addEventListener('click',ocBorrarTodos);r.appendChild(t)}
function ocAlto(){var t=$('oc-in');t.style.height='auto';t.style.height=Math.min(t.scrollHeight,200)+'px'}
function ocThumbs(){var g=$('oc-thumbs');g.textContent='';g.hidden=!ocImgs.length;
 ocImgs.forEach(function(u,i){var w=document.createElement('div'),im=document.createElement('img'),b=document.createElement('button');
  w.className='th';im.alt='Imagen adjunta '+(i+1);im.src=u;b.type='button';b.textContent='×';b.setAttribute('aria-label','Quitar imagen '+(i+1));
  b.addEventListener('click',function(){ocImgs.splice(i,1);ocThumbs()});w.appendChild(im);w.appendChild(b);g.appendChild(w)})}
function ocLeer(f){return new Promise(function(ok,no){var r=new FileReader();r.onload=function(){ok(r.result)};r.onerror=function(){no(new Error('No se pudo leer el archivo.'))};r.readAsDataURL(f)})}
function ocCargarImg(url){return new Promise(function(ok,no){var im=new Image();im.onload=function(){ok(im)};im.onerror=function(){no(new Error('No se pudo abrir la imagen.'))};im.src=url})}
async function ocReducir(f){var L=limitesImagen(),src=await ocLeer(f),im=await ocCargarImg(src);
 var w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,e=escalarImagen(w,h,L.ladoMax);
 var cv=document.createElement('canvas');cv.width=e.w;cv.height=e.h;var cx=cv.getContext('2d');cx.drawImage(im,0,0,e.w,e.h);
 if(f.type==='image/png'){var pu=cv.toDataURL('image/png');if(pu.length<400000)return pu}
 cx.globalCompositeOperation='destination-over';cx.fillStyle='#fff';cx.fillRect(0,0,e.w,e.h);
 return cv.toDataURL('image/jpeg',L.calidad)}
async function ocAdjuntar(files){var msgs=[];
 for(var i=0;i<files.length;i++){var f=files[i];
  if(!f.type||f.type.indexOf('image/')!==0){msgs.push('«'+f.name+'»: no es una imagen.');continue}
  var er=validarImagen(f.type,f.size,ocImgs.length);if(er){msgs.push(er);continue}
  try{ocImgs.push(await ocReducir(f))}catch(e){msgs.push('«'+f.name+'»: '+(e&&e.message?e.message:'no se pudo procesar.'))}}
 ocThumbs();if(msgs.length)ocLog('n',msgs.join(' '))}
async function ocSend(q){q=(q||'').trim();var im=ocImgs.slice();if((!q&&!im.length)||ocBusy)return;if(!q)q='Describe la imagen y dime qué ves.';
 ocBusy=true;$('oc-send').disabled=true;$('oc-in').value='';ocAlto();ocImgs=[];ocThumbs();ocLog('u',q,im);var w=ocLog('w','Pensando…');
 try{await ocRun(q,im)}catch(e){ocLog('e',e&&e.message?e.message:'Error inesperado.')}
 w.remove();ocBusy=false;$('oc-send').disabled=false;ocBajar();ocGuardar()}
$('oc-sw').addEventListener('click',function(){ocMcp=!ocMcp;ocSwitchText();if($('oc-log').childNodes.length)ocLog('n','MCP '+(ocMcp?'activado':'desactivado')+' a partir de aquí')});
$('oc-adj').addEventListener('click',function(){$('oc-file').click()});
$('oc-file').addEventListener('change',function(){var fs=Array.prototype.slice.call($('oc-file').files||[]);$('oc-file').value='';ocAdjuntar(fs)});
$('oc-in').addEventListener('paste',function(e){var cd=e.clipboardData,fs=[];if(cd&&cd.files)for(var i=0;i<cd.files.length;i++)if(cd.files[i].type&&cd.files[i].type.indexOf('image/')===0)fs.push(cd.files[i]);if(fs.length){e.preventDefault();ocAdjuntar(fs)}});
$('oc-form').addEventListener('dragover',function(e){e.preventDefault();$('oc-form').firstElementChild.classList.add('arrastre')});
$('oc-form').addEventListener('dragleave',function(){$('oc-form').firstElementChild.classList.remove('arrastre')});
$('oc-form').addEventListener('drop',function(e){e.preventDefault();$('oc-form').firstElementChild.classList.remove('arrastre');var d=e.dataTransfer;if(d&&d.files&&d.files.length)ocAdjuntar(Array.prototype.slice.call(d.files))});
$('oc-gear').addEventListener('click',ocOpen);
$('oc-cfg-x').addEventListener('click',ocClose);
$('oc-cfg').addEventListener('click',function(e){if(e.target===$('oc-cfg'))ocClose()});
$('oc-cform').addEventListener('submit',function(e){e.preventDefault();ocSave()});
$('oc-ctest').addEventListener('click',ocTest);
$('oc-ccancel').addEventListener('click',function(){ocFormFill(null)});
presetsIA().forEach(function(p){var b=document.createElement('button');b.type='button';b.textContent=p.nombre.split(' (')[0];b.addEventListener('click',function(){ocPreset(p.id)});$('oc-presets').appendChild(b)});
$('oc-form').addEventListener('submit',function(e){e.preventDefault();ocSend($('oc-in').value)});
$('oc-in').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ocSend($('oc-in').value)}});
$('oc-in').addEventListener('input',ocAlto);
$('oc-chips').addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('button'):null;if(t)ocSend(t.textContent)});
$('oc-nueva').addEventListener('click',function(){if(ocBusy)return;ocLimpiar();ocRenderChats();$('oc-in').focus()});
ocLoad();ocUi();ocSwitchText();ocCargarChats().catch(function(){});
`;

export const demoScript = nombres + "\n" + app;
