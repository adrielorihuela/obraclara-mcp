import {
  buildSystemPrompt, construirPeticion, extraerRespuesta, migrarConfig, normalizarConexion, parseSse, parseToolCall,
  presetsIA, textoLimpio, truncate, validarConexion, limitesImagen, validarImagen, escalarImagen, construirContenido, aBloquesAnthropic,
  tituloChat, grupoFecha, recortarChats, serializarChats, deserializarChats, sinImagenes, normalizarMensaje, normalizarChat,
  recortarTexto, nombreSeguro, rutaSegura, extensionArchivo, tipoAdjunto, esTextoBytes, clasificarRuta,
  zipEntradas, zipExtraer, docxATexto, leerDocx, docxEstilos, docxNumeracion, docxRelaciones, docxParrafo, docxBloques, leerDocxDoc, xmlTexto, xmlAtributo, columnaDeRef, xlsxTextoT, xlsxFilasHoja, xlsxLeer, leerXlsx, csvAFilas,
  largoContenido, acortarContenido, recortarMensajes, prepararCompartir,
  claseArchivo, mimeArchivo, tamanoLegible, resaltarLinea, htmlConRecursos, rutaRelativaZip, atributoHtml,
} from "./lib/agente";
import { ETIQUETAS_SUGERENCIA, SUGERENCIAS, elegirSugerencias, mezclarSugerencias } from "./lib/sugerencias";

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
.nueva{transition:border-color .2s,box-shadow .2s,transform .15s}
.nueva:hover{border-color:var(--ink);box-shadow:var(--shadow)}
.nueva:active{transform:scale(.98)}
.b-chats li{transition:background-color .15s,border-color .15s}
.nueva svg,.cfg-b svg{width:16px;height:16px;flex:none}

.lado>*{flex:none}
.lado>.b-chats{flex:1 1 auto;min-height:140px}
.b-chats{display:flex;flex-direction:column;gap:6px;min-width:0;max-width:100%}
#oc-chats{flex:1 1 auto;min-height:0;min-width:0;max-width:100%;overflow-x:hidden;overflow-y:auto}
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
.sw .sw-n{font:700 14px/1.2 var(--mono);letter-spacing:0;overflow-wrap:anywhere}
.sw small{font-size:12.5px;color:var(--mut)}
.sw .pista{width:52px;height:30px;border-radius:15px;background:var(--line-2);position:relative;flex:none;transition:background .2s}
.sw .pista::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s cubic-bezier(.3,.7,.3,1)}
.sw[aria-checked=true]{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 14%,transparent)}
.sw[aria-checked=true] .sw-n{color:var(--accent)}
.sw[aria-disabled=true]{opacity:.6;cursor:not-allowed;background:var(--bg-2);box-shadow:none;border-color:var(--line)}
.sw[aria-disabled=true] .sw-n{color:var(--mut)}
.sw[aria-disabled=true] .pista{background:var(--line-2)}
.sw[aria-disabled=true] .pista::after{transform:none}
.b-sw .sw+p.ayuda{margin-top:10px}
.b-sw .sw+p.ayuda+.sw{margin-top:14px}
.sw[hidden],.ayuda[hidden]{display:none}
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
.ideas{margin-top:28px}
.ideas[hidden]{display:none}
.ideas-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px}
.ideas-top .lbl{font:500 12px/1 var(--mono);color:var(--mut);letter-spacing:.04em;text-transform:uppercase}
.barajar{display:inline-flex;align-items:center;gap:7px;min-height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink-2);font:500 13px/1 var(--sans);cursor:pointer;transition:border-color .2s var(--ease),color .2s var(--ease),box-shadow .2s var(--ease),transform .15s var(--ease)}
.barajar svg{width:15px;height:15px;flex:none;transition:transform .45s var(--ease)}
.barajar:hover{border-color:var(--ink-2);color:var(--ink);box-shadow:var(--shadow)}
.barajar:active{transform:scale(.96)}
.barajar.gira svg{transform:rotate(180deg)}
.barajar:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.chips button{--tn:var(--accent);display:flex;flex-direction:column;align-items:flex-start;gap:9px;text-align:left;padding:14px 16px 15px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink);font:inherit;font-size:14.5px;line-height:1.45;cursor:pointer;transition:border-color .2s var(--ease),transform .25s var(--ease),box-shadow .25s var(--ease),opacity .18s var(--ease);animation:entra .45s var(--ease) both}
.chips button:nth-child(2){animation-delay:.05s}.chips button:nth-child(3){animation-delay:.1s}.chips button:nth-child(n+4){animation-delay:.15s}
.chips button:hover{border-color:color-mix(in srgb,var(--tn) 55%,var(--line));transform:translateY(-2px);box-shadow:var(--shadow-h)}
.chips button:active{transform:scale(.98)}
.chips.sale button{opacity:0;transform:translateY(-6px) scale(.98);animation:none}
.chips .sg-e{display:inline-flex;align-items:center;gap:6px;padding:4px 8px 4px 6px;border-radius:6px;background:color-mix(in srgb,var(--tn) 12%,transparent);color:var(--tn);font:600 11.5px/1 var(--mono);letter-spacing:.01em}
.chips .sg-e svg{width:14px;height:14px;flex:none}
.chips .sg-q{display:block}
.chips [data-t=xlsx]{--tn:#1a7a46}.chips [data-t=docx]{--tn:#2457b8}.chips [data-t=pdf]{--tn:#bd3428}.chips [data-t=pptx]{--tn:#b8531a}.chips [data-t=rapida]{--tn:var(--accent)}
:root[data-theme=dark] .chips [data-t=xlsx]{--tn:#5cc98a}:root[data-theme=dark] .chips [data-t=docx]{--tn:#7fa8f5}:root[data-theme=dark] .chips [data-t=pdf]{--tn:#f08a7e}:root[data-theme=dark] .chips [data-t=pptx]{--tn:#f2a36b}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .chips [data-t=xlsx]{--tn:#5cc98a}:root:not([data-theme=light]) .chips [data-t=docx]{--tn:#7fa8f5}:root:not([data-theme=light]) .chips [data-t=pdf]{--tn:#f08a7e}:root:not([data-theme=light]) .chips [data-t=pptx]{--tn:#f2a36b}}
.vacio h1,.vacio p{animation:entra .5s var(--ease) both}.vacio p{animation-delay:.05s}
#oc-log{display:flex;flex-direction:column;gap:18px;padding:24px 0 32px}
#oc-log:empty{padding:0}
.msg{overflow-wrap:anywhere;line-height:1.6;animation:entra .4s var(--ease) both}
@keyframes entra{from{opacity:0;transform:translateY(8px)}}
.msg.u{animation-name:entra-u;transform-origin:100% 100%}
@keyframes entra-u{from{opacity:0;transform:translate(10px,6px) scale(.97)}}
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
.msg.a .t table{border-collapse:collapse;width:max-content;min-width:100%;font-size:13.5px;line-height:1.45;font-variant-numeric:tabular-nums}
.msg.a .t th,.msg.a .t td{text-align:left;vertical-align:top;padding:8px 12px;border-bottom:1px solid var(--line);overflow-wrap:normal;word-break:normal;max-width:34ch}
.msg.a .t tbody tr,.msg.a .t tr{transition:background-color .15s}
.msg.a .t tr:hover td{background:color-mix(in srgb,var(--surface-2) 60%,transparent)}
.msg.a .t em{font-style:italic;color:var(--ink-2)}
.msg.a .t .fm,.pv-md .fm{justify-self:start;max-width:100%;padding:10px 16px;border-left:3px solid var(--accent);border-radius:0 8px 8px 0;background:var(--surface-2);font:500 14px/1.5 var(--mono);color:var(--ink);overflow-wrap:anywhere}
.msg.a .t li p.li-p{margin:4px 0 0}.msg.a .t li ul{margin:4px 0 0;padding-left:1.2em;display:grid;gap:2px;list-style:disc}
.msg.a .t th{font-weight:600;background:var(--surface-2);white-space:nowrap}
.msg.a .t tr:last-child td{border-bottom:0}
.msg.a .t code{background:var(--surface-2);padding:1px 5px;border-radius:4px}
.msg.e{border:1px solid color-mix(in srgb,var(--risk) 40%,transparent);background:var(--risk-soft);color:var(--risk);padding:10px 14px;border-radius:10px;font-size:14.5px}
.msg.n{align-self:center;font:500 12px/1.4 var(--mono);color:var(--mut);text-align:center;padding:4px 10px}
.msg.w{align-self:flex-start;display:flex;align-items:center;gap:10px;font:400 14px/1 var(--sans);color:var(--mut);padding:6px 0 6px 42px}
.msg.w::before{content:"";flex:none;width:30px;height:14px;background:radial-gradient(circle closest-side,var(--accent) 92%,transparent) 0 50%/8px 8px no-repeat,radial-gradient(circle closest-side,var(--accent) 92%,transparent) 11px 50%/8px 8px no-repeat,radial-gradient(circle closest-side,var(--accent) 92%,transparent) 22px 50%/8px 8px no-repeat;animation:puntos 1.1s infinite linear}
@keyframes puntos{0%,100%{background-position:0 50%,11px 50%,22px 50%}20%{background-position:0 0,11px 50%,22px 50%}40%{background-position:0 100%,11px 0,22px 50%}60%{background-position:0 50%,11px 100%,22px 0}80%{background-position:0 50%,11px 50%,22px 100%}}
.msg.w .w-l{background:linear-gradient(90deg,var(--mut) 0 35%,var(--ink) 50%,var(--mut) 65% 100%) 0 0/300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:brillo 2.2s linear infinite}
@keyframes brillo{from{background-position:100% 0}to{background-position:0 0}}
.tc{margin-left:42px;border:1px solid var(--line);border-radius:12px;background:var(--surface);overflow:hidden;animation:entra .35s var(--ease) both;transition:border-color .2s,box-shadow .2s}
.tc:hover{border-color:var(--line-2)}.tc[open]{box-shadow:var(--shadow)}
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

.conv-top{display:flex;justify-content:flex-end;gap:8px;padding:8px 20px;border-bottom:1px solid var(--line)}
.conv-top[hidden]{display:none}
.b-comp{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:500 13.5px/1 var(--sans);cursor:pointer}
.b-comp{transition:border-color .2s,transform .15s,box-shadow .2s}
.b-comp:hover{border-color:var(--ink);box-shadow:var(--shadow)}
.b-comp:active{transform:scale(.97)}
.b-comp svg{width:15px;height:15px;flex:none}
.b-comp:focus-visible,#oc-sh button:focus-visible,#oc-sh input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.composer{padding:8px 24px 14px;background:linear-gradient(to bottom,transparent,var(--bg) 30%)}
.composer .caja{max-width:780px;margin:0 auto;border:1px solid var(--line-2);border-radius:18px;background:var(--surface);box-shadow:var(--shadow);transition:border-color .2s,box-shadow .25s var(--ease)}
.composer .caja:focus-within{border-color:var(--ink-2);box-shadow:var(--shadow-h),0 0 0 3px color-mix(in srgb,var(--accent) 12%,transparent)}
.composer textarea{display:block;width:100%;border:0;background:transparent;resize:none;padding:14px 16px 4px;font:inherit;color:var(--ink);outline:none;max-height:200px;min-height:52px;line-height:1.5}
.thumbs{padding:12px 14px 0}
.thumbs[hidden]{display:none}
.thumbs .th{position:relative}
.thumbs img{display:block;width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}
.thumbs .th button{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:600 13px/1 var(--sans);cursor:pointer;display:grid;place-items:center;padding:0}
.thumbs .dchip{display:flex;align-items:center;gap:8px;max-width:260px;height:44px;padding:0 12px 0 8px;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);font:500 13px/1.2 var(--sans)}
.dchip .dic{flex:none;font:600 10px/1 var(--mono);padding:5px 6px;border-radius:6px;background:var(--ink);color:var(--bg)}
.dchip .dnm{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dchip .dsz{flex:none;font:400 12px/1 var(--mono);color:var(--mut)}
.msg.u .dchip{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);font:500 13px/1.2 var(--sans);max-width:100%}
.msg.a .cb{margin:10px 0}
.msg.a .t pre{margin:0;padding:10px 14px;background:var(--code-bg);color:var(--code-ink);border-radius:10px;font:400 12.5px/1.55 var(--mono);white-space:pre-wrap;overflow-wrap:anywhere;max-height:360px;overflow:auto}
.adjs{display:grid;gap:8px;margin-top:4px}
.adjs:empty{display:none}
.adj-c{display:flex;align-items:center;gap:12px;max-width:420px;padding:10px 12px;border:1px solid var(--line-2);border-radius:12px;background:var(--surface);transition:border-color .2s,background .2s,transform .25s var(--ease),box-shadow .25s var(--ease);animation:entra .4s var(--ease) both}
.adj-c:hover{transform:translateY(-2px);box-shadow:var(--shadow-h)}
.adj-c.act{border-color:var(--accent);background:var(--accent-soft)}
.adj-ic{flex:none;width:40px;height:40px;border-radius:10px;background:var(--ink);color:var(--bg);display:grid;place-items:center;font:700 10.5px/1 var(--mono);letter-spacing:.02em}
.adj-ic[data-k=html],.adj-ic[data-k=htm]{background:#b4552d;color:#fff}
.adj-ic[data-k=zip]{background:#6b5bb5;color:#fff}
.adj-ic[data-k=pdf]{background:#b3392f;color:#fff}
.adj-ic[data-k=docx]{background:#2f63b3;color:#fff}
.adj-ic[data-k=xlsx],.adj-ic[data-k=csv]{background:#2b7a4b;color:#fff}
.adj-i{flex:1;min-width:0;display:grid;gap:2px}
.adj-n{font:600 14px/1.3 var(--sans);color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.adj-s{font:400 12px/1.3 var(--mono);color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.adj-b{flex:none;min-height:34px;padding:0 14px;border-radius:8px;border:1px solid var(--line-2);background:var(--bg);color:var(--ink);font:500 13px/1 var(--sans);cursor:pointer}
.adj-b:hover{border-color:var(--ink)}
.adj-b:focus-visible,.pan button:focus-visible,.pan-b:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.chat.con-pan{grid-template-columns:300px minmax(0,1fr) clamp(380px,42vw,640px)}
.pan{display:flex;flex-direction:column;min-width:0;min-height:0;border-left:1px solid var(--line);background:var(--surface);color:var(--ink);animation:pan-in .35s var(--ease) both}
@keyframes pan-in{from{opacity:0;transform:translateX(28px)}}
.pl-i{animation:entra .3s var(--ease) both}
.pan[hidden]{display:none}
.pan-h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line)}
.pan-h h2{flex:1;min-width:0;margin:0;font:600 15px/1.3 var(--sans);letter-spacing:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pan .b,.pan [role=tab]{min-height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:500 13px/1 var(--sans);cursor:pointer}
.pan .b:hover,.pan [role=tab]:hover{border-color:var(--ink)}
.pan .b:disabled{opacity:.5;cursor:default}
.pan .b-p,.pan [role=tab][aria-selected=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.pan .pan-x{width:34px;padding:0;font-size:18px;line-height:1}
.pan-lista{border-bottom:1px solid var(--line);background:var(--bg-2);max-height:40%;overflow:auto;flex:none}
.pl-h{display:flex;align-items:center;gap:8px;justify-content:space-between;padding:10px 14px 6px;font:600 13px/1.3 var(--sans)}
.pl-l{list-style:none;margin:0;padding:0 8px 8px;display:grid;gap:4px}
.pl-i{display:flex;align-items:center;gap:6px;border:1px solid transparent;border-radius:10px}
.pl-i.act{border-color:var(--accent);background:var(--accent-soft)}
.pl-b{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:6px 8px;background:none;border:0;border-radius:10px;color:var(--ink);text-align:left;cursor:pointer;font:inherit}
.pl-b:hover{background:var(--surface)}
.pl-b .adj-ic{width:32px;height:32px;font-size:9.5px;border-radius:8px}
.pl-bd{flex:none;display:flex;gap:4px}
.bd{padding:2px 7px;border-radius:99px;border:1px solid var(--line-2);background:var(--surface);font:500 11px/1.3 var(--mono);color:var(--mut)}
.bd-n{background:var(--accent-soft);border-color:var(--accent);color:var(--ink)}
.pl-d{flex:none;min-height:30px;padding:0 10px;margin-right:6px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:500 12px/1 var(--sans);cursor:pointer}
.pl-d:hover{border-color:var(--ink)}
.pl-b:focus-visible,.pl-d:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.b-comp[hidden]{display:none}
.pan-tabs,.pan-sub{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px 14px;border-bottom:1px solid var(--line);background:var(--bg-2)}
.pan-tabs[hidden],.pan-sub[hidden]{display:none}
.pan-sub .pan-ruta{flex:1;min-width:0;font:500 12.5px/1.3 var(--mono);color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pan-b{flex:1;min-height:0;overflow:auto;background:var(--bg)}
.pan-b iframe{display:block;width:100%;height:100%;border:0;background:#fff}
.pv-img{display:block;max-width:100%;margin:0 auto;padding:16px;box-sizing:border-box}
.pv-msg{margin:0;padding:24px 20px;color:var(--ink-2);font-size:14px;line-height:1.55}
.pv-md{padding:18px 22px;display:grid;gap:10px;line-height:1.6;overflow-wrap:anywhere;font-size:14.5px}
.pv-md p{margin:0}.pv-md p.h{font-weight:700}
.pv-md ul,.pv-md ol{margin:0;padding-left:1.3em;display:grid;gap:4px}
.pv-md code{background:var(--surface-2);padding:1px 5px;border-radius:4px}
.pv-md pre{margin:0;padding:10px 14px;background:var(--code-bg);color:var(--code-ink);border-radius:10px;font:400 12.5px/1.55 var(--mono);white-space:pre-wrap;overflow-wrap:anywhere}
.pv-md .tb{overflow-x:auto;border:1px solid var(--line);border-radius:10px}
.pv-md table{border-collapse:collapse;width:max-content;min-width:100%;font-size:13.5px}
.pv-md th,.pv-md td{text-align:left;vertical-align:top;padding:8px 12px;border-bottom:1px solid var(--line);overflow-wrap:normal;word-break:normal;max-width:34ch}
.pv-doc{container-type:inline-size;padding:22px 16px 36px;background:var(--bg-2);min-height:100%;box-sizing:border-box}
.pv-hoja{max-width:720px;margin:0 auto;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.06),0 10px 30px rgba(0,0,0,.07);padding:56px 60px 64px;font:400 15px/1.7 var(--sans);overflow-wrap:break-word}
:root[data-theme=dark] .pv-doc{background:var(--bg)}:root[data-theme=dark] .pv-hoja{background:var(--surface-2);border-color:var(--line-2)}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .pv-doc{background:var(--bg)}:root:not([data-theme=light]) .pv-hoja{background:var(--surface-2);border-color:var(--line-2)}}
.pv-hoja>:first-child{margin-top:0}
.pv-hoja h1,.pv-hoja h2,.pv-hoja h3,.pv-hoja h4,.pv-hoja h5,.pv-hoja h6{font-family:var(--serif);font-weight:600;line-height:1.25;color:var(--ink);margin:1.4em 0 .5em;text-wrap:balance}
.pv-hoja h1{font-size:1.9em;margin-bottom:.3em}.pv-hoja h2{font-size:1.42em}.pv-hoja h3{font-size:1.18em}.pv-hoja h4{font-size:1.05em}
.pv-hoja h5,.pv-hoja h6{font:600 .8em/1.4 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2)}
.pv-hoja p{margin:0 0 .75em;white-space:pre-wrap}.pv-hoja p.sub{font-size:1.15em;color:var(--mut);margin-bottom:1.3em}
.pv-hoja ul,.pv-hoja ol{margin:0 0 .85em;padding-left:1.7em}.pv-hoja li{margin:.25em 0;white-space:pre-wrap;padding-left:.15em}.pv-hoja li>ul,.pv-hoja li>ol{margin:.25em 0 0}
.pv-hoja img{display:block;max-width:100%;height:auto;margin:.8em auto;border-radius:2px}
.pv-hoja strong{font-weight:700}
.pv-dt{overflow-x:auto;margin:.5em 0 1.1em}
.pv-hoja table{border-collapse:collapse;min-width:100%;font:400 13.5px/1.45 var(--sans)}
.pv-hoja td{border:1px solid var(--line-2);padding:7px 11px;vertical-align:top;min-width:6ch}.pv-hoja td p{margin:0 0 .3em;white-space:pre-wrap}.pv-hoja td p:last-child{margin:0}
.pv-hoja tr:first-child td{background:var(--bg-2);font-weight:600}
@container (max-width:600px){.pv-hoja{padding:30px 22px 36px;font-size:14.5px}.pv-hoja h1{font-size:1.65em}.pv-hoja [style*=justify]{text-align:left!important}}
@media (max-width:600px){.pv-doc{padding:12px 8px 24px}}
.pv-code{width:max-content;min-width:100%;box-sizing:border-box;margin:0;padding:12px 0;background:var(--code-bg);color:var(--code-ink);font:400 12.5px/1.55 var(--mono);counter-reset:ln;tab-size:2;min-height:100%}
.pv-code .l{display:block;white-space:pre;padding-right:16px;min-height:1.55em}
.pv-code .l::before{counter-increment:ln;content:counter(ln);display:inline-block;width:3.6em;padding-right:1em;text-align:right;color:var(--code-mut);user-select:none}
.tk-c{color:var(--code-mut);font-style:italic}.tk-s{color:#8fd3b6}.tk-n{color:#e8b86d}.tk-k{color:#9fb7ff}
.pv-tab{border-collapse:separate;border-spacing:0;font-size:13px;min-width:100%;width:max-content}
.pv-tab th,.pv-tab td{text-align:left;padding:6px 12px;border-bottom:1px solid var(--line);border-right:1px solid var(--line);white-space:nowrap;max-width:360px;overflow:hidden;text-overflow:ellipsis}
.pv-tab thead th{position:sticky;top:0;background:var(--surface-2);color:var(--ink);font-weight:600;z-index:1}
.pv-tab th.n{position:sticky;left:0;color:var(--mut);font-weight:400;text-align:right;background:var(--surface-2)}
.pv-nota{margin:0;padding:10px 14px;color:var(--mut);font-size:12.5px}
.pv-zip{list-style:none;margin:0;padding:8px;display:grid;gap:2px}
.pv-zip button{display:flex;gap:12px;width:100%;align-items:center;text-align:left;padding:9px 10px;border:0;border-radius:8px;background:transparent;color:var(--ink);font:400 13.5px/1.3 var(--mono);cursor:pointer}
.pv-zip button:hover{background:var(--surface-2)}
.pv-zip .z-n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pv-zip .z-t{flex:none;color:var(--mut);font-size:12px}
.caja.arrastre{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,transparent)}
#oc-adj{width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:var(--ink-2);display:grid;place-items:center;cursor:pointer;flex:none}
#oc-adj:hover{background:var(--surface-2)}#oc-adj svg{width:18px;height:18px}
#oc-adj:focus-visible,.thumbs button:focus-visible,#oc-send:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.composer .barra{display:flex;align-items:center;gap:6px;padding:6px 8px 8px 14px}
.composer .barra .ind{margin-right:auto}
.ind{display:inline-flex;align-items:center;gap:6px;font:500 12px/1 var(--mono);color:var(--mut)}
.ind i{width:7px;height:7px;border-radius:50%;background:var(--line-2)}
.ind.on{color:var(--accent)}.ind.on i{background:var(--accent)}
#oc-send{margin-left:0;width:36px;height:36px;border-radius:50%;border:0;background:var(--ink);color:var(--bg);display:grid;place-items:center;cursor:pointer;transition:transform .2s var(--ease),opacity .2s,background-color .2s}
#oc-send:not(:disabled):hover{transform:scale(1.08);background:color-mix(in srgb,var(--ink) 86%,var(--accent))}
#oc-send:not(:disabled):active{transform:scale(.92)}
#oc-send:disabled{opacity:.35;cursor:default}
#oc-send svg{width:16px;height:16px}
.msg.u .iny{display:block;margin-top:6px;font:500 11.5px/1.2 var(--mono);color:var(--mut)}
#oc-stop{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 14px;border-radius:18px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:500 13px/1 var(--sans);cursor:pointer}
#oc-stop[hidden]{display:none}
#oc-stop:hover{border-color:var(--ink)}
#oc-stop:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
#oc-stop i{width:10px;height:10px;border-radius:2px;background:currentColor}
.msg.w{flex-wrap:wrap}
.msg.w .w-l{min-width:0;overflow-wrap:anywhere;line-height:1.4}
.msg.w .w-p{flex-basis:100%;margin:8px 0 0 -42px;padding-left:42px;font-size:13px;color:var(--mut)}
.msg.w .w-p summary{cursor:pointer;width:max-content}
.msg.w .w-p ol{margin:6px 0 0;padding-left:1.3em;display:grid;gap:2px}
.msg.w .w-p[hidden]{display:none}
.aviso-em{max-width:780px;margin:0 auto 8px;padding:8px 14px;border:1px solid color-mix(in srgb,var(--risk) 40%,transparent);background:var(--risk-soft);color:var(--risk);border-radius:10px;font-size:13px;line-height:1.45}
.aviso-em[hidden]{display:none}
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
#oc-sh{width:min(560px,calc(100vw - 32px));max-height:min(88vh,760px);padding:0;border:1px solid var(--line-2);border-radius:16px;background:var(--surface);color:var(--ink);box-shadow:0 30px 80px -20px rgba(0,0,0,.45);overflow:auto}
#oc-sh::backdrop{background:rgba(10,12,13,.55);backdrop-filter:blur(2px)}
#oc-sh .cfg-h{position:sticky;top:0;background:var(--surface);display:flex;align-items:center;gap:12px;padding:18px 22px;border-bottom:1px solid var(--line);z-index:1}
#oc-sh .cfg-h h2{font-size:var(--s1);font-family:var(--sans);letter-spacing:-.01em}
#oc-sh .cfg-in{padding:18px 22px 22px}
#oc-sh .intro{font-size:14px;line-height:1.55;color:var(--ink-2);background:var(--surface-2);border-radius:10px;padding:12px 14px;margin:0}
#oc-sh label.chk{display:flex;gap:10px;align-items:center;margin:16px 0 0;font-size:14px}
#oc-sh label.chk[hidden]{display:none}
#oc-sh label.chk input{width:18px;height:18px;accent-color:var(--accent)}
#oc-sh .b{min-height:36px;padding:0 14px;border-radius:8px;border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font:500 13.5px/1 var(--sans);cursor:pointer}
#oc-sh .b:hover{border-color:var(--ink)}
#oc-sh .b-p{background:var(--ink);color:var(--bg);border-color:var(--ink)}
#oc-sh .b:disabled{opacity:.5;cursor:wait}
#oc-sh-est{font-size:13.5px;color:var(--ink-2);margin:14px 0 0;min-height:1.2em}
#oc-sh h3{font:500 12px/1 var(--mono);color:var(--mut);margin:22px 0 10px}
#oc-sh h3[hidden]{display:none}
#oc-sh-lista{list-style:none;margin:0;padding:0;display:grid;gap:8px}
#oc-sh-lista li{display:flex;flex-wrap:wrap;gap:8px;border:1px solid var(--line);border-radius:10px;padding:10px}
#oc-sh-lista input{flex:1 1 100%;min-width:0;min-height:36px;padding:0 10px;border:1px solid var(--line-2);border-radius:8px;background:var(--bg);color:var(--ink);font:400 13px/1 var(--mono)}
.sw:focus-visible,.chips button:focus-visible,#oc-cfg button:focus-visible,#oc-cfg input:focus-visible,#oc-cfg select:focus-visible,.tc summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

@media (max-width:860px){
 .conv-top{padding:6px 12px}
 .chat{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}
 .lado{border-right:0;border-bottom:1px solid var(--line);padding:10px 16px;gap:8px;display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;overflow:visible}
 .lado .b-sw{grid-column:1/-1;display:grid;gap:8px}.lado .b-sw .sw+p.ayuda+.sw{margin-top:0}
 .lado .lbl,.lado p.ayuda,.lado .pie-l,.lado .b-chats{display:none}
 .sw{padding:8px 10px 8px 14px}.sw small{display:none}.sw .sw-n{font-size:14px}
 .sw .pista{width:44px;height:26px}.sw .pista::after{width:20px;height:20px}.sw[aria-checked=true] .pista::after{transform:translateX(18px)}
 .lado .b-mod{display:contents}
 .cfg-b{margin:0;width:42px;height:42px;padding:0;justify-content:center;border-color:var(--line-2);background:var(--surface)}
 .cfg-b span,.nueva span{display:none}
 .nueva{width:42px;height:42px;padding:0;justify-content:center}
 .lado .b-nueva{order:3}
 .col{padding:0 16px}.composer{padding:6px 12px 10px}
 .vacio{padding:28px 0 16px}
 .ideas{margin-top:20px}.chips{grid-template-columns:minmax(0,1fr)}.chips button{padding:12px 14px 13px;gap:7px;font-size:14px}
 .chat.con-pan{grid-template-columns:minmax(0,1fr)}
 .pan{position:fixed;inset:0;z-index:50;border-left:0;animation-name:pan-sube}
 @keyframes pan-sube{from{opacity:0;transform:translateY(24px)}}
 .adj-c{max-width:none}
 .tc{margin-left:0}.msg.a{grid-template-columns:minmax(0,1fr)}.msg.a::before{display:none}.msg.w{padding-left:0}.msg.w .w-p{margin-left:0;padding-left:0}
}
`;

const icoMas = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>`;
const icoEngranaje = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>`;
const icoClip = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 11.5-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l8-8"/></svg>`;
const icoCompartir = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 10V2.5M5 5.2 8 2.5l3 2.7M3.5 9v3.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V9"/></svg>`;
const icoBarajar = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4.5h2.2c1.4 0 2.2.6 3 1.8l1.6 3.4c.8 1.2 1.6 1.8 3 1.8H14M2 11.5h2.2c1 0 1.7-.3 2.3-1M14 4.5h-2.2c-1 0-1.7.3-2.3 1M12 2.5l2 2-2 2M12 9.5l2 2-2 2"/></svg>`;
const icoEnviar = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"/></svg>`;

export const demoHtml = String.raw`
<div class="chat">
<aside class="lado" aria-label="Opciones del asistente">
<div class="b-nueva"><button type="button" id="oc-nueva" class="nueva" aria-label="Nueva conversación">${icoMas}<span>Nueva conversación</span></button></div>
<nav class="b-chats" aria-label="Chats guardados"><p class="ch-est" id="oc-chat-est" role="status" hidden></p><div id="oc-chats"></div></nav>
<div class="b-sw"><span class="lbl" id="oc-swl">Herramientas</span>
<button type="button" id="oc-sw" class="sw" role="switch" aria-checked="true" aria-describedby="oc-swd"><span class="sw-t"><span class="sw-n" id="oc-swt">MCP: ACTIVADO</span><small id="oc-sws">obraclara · 4 herramientas</small></span><span class="pista" aria-hidden="true"></span></button>
<p class="ayuda" id="oc-swd"></p></div>
<div class="b-mod"><p class="ayuda" id="oc-info" style="margin:0 0 8px"></p>
<button type="button" id="oc-gear" class="cfg-b" aria-haspopup="dialog" aria-label="Configuración de IA">${icoEngranaje}<span>Configuración</span></button></div>
<div class="pie-l"><p>Los chats se guardan solo en este navegador y dispositivo (no en nuestro servidor). Si borras los datos del sitio, se pierden.</p><p>Las alertas son indicios para revisar, no prueba de irregularidades.</p><p>Universidad de Lima · I.A. Aplicada · Grupo 1. Código hecho con ayuda de IA generativa y revisado por el grupo.</p></div>
</aside>

<section class="conv" aria-labelledby="oc-t">
<div class="conv-top" id="oc-top" hidden><button type="button" id="oc-arch-b" class="b-comp" aria-controls="oc-pan" aria-expanded="false" hidden><span>Archivos (0)</span></button><button type="button" id="oc-share" class="b-comp" aria-haspopup="dialog">${icoCompartir}<span>Compartir</span></button></div>
<div class="scroll" id="oc-scroll"><div class="col">
<div class="vacio" id="oc-vacio">
<h1 id="oc-t">¿Qué quieres saber de la inversión pública?</h1>
<p id="oc-vp">Pregunta por una obra, una entidad o una región. Con el MCP activado, el asistente consulta los datos del MEF; también puede leer tus archivos y entregarte otros (Excel, Word, PDF).</p>
<div class="ideas" id="oc-ideas"><div class="ideas-top"><span class="lbl" id="oc-ideas-t">Ideas para empezar</span><button type="button" class="barajar" id="oc-barajar" aria-controls="oc-chips">${icoBarajar}<span>Otras ideas</span></button></div>
<div class="chips" id="oc-chips" role="group" aria-labelledby="oc-ideas-t" aria-live="polite">
<button type="button" data-t="rapida" data-q="¿Qué obras de salud en Cusco llevan 6 meses o más sin gasto?"><span class="sg-q">¿Qué obras de salud en Cusco llevan 6 meses o más sin gasto?</span></button>
<button type="button" data-t="docx" data-q="Prepara un informe en Word con tablas y gráficos de las alertas de sobrecosto en Piura"><span class="sg-q">Prepara un informe en Word con tablas y gráficos de las alertas de sobrecosto en Piura</span></button>
</div></div></div>
<div id="oc-log" aria-live="polite"></div>
</div></div>
<form id="oc-form" class="composer">
<p class="aviso-em" id="oc-em" role="status" hidden>Modo de emergencia: sin archivos ni agente. El asistente responde solo con texto hasta que el servidor vuelva a estar disponible.</p>
<div class="caja"><div class="thumbs" id="oc-thumbs" hidden></div><textarea id="oc-in" rows="1" placeholder="Escribe tu pregunta" aria-label="Tu pregunta"></textarea>
<div class="barra"><span class="ind on" id="oc-ind"><i></i><span>MCP activado</span></span><input type="file" id="oc-file" multiple hidden><button type="button" id="oc-stop" class="stop" aria-label="Detener la respuesta" hidden><i aria-hidden="true"></i><span>Detener</span></button><button type="button" id="oc-adj" aria-label="Adjuntar archivos" title="Adjuntar archivos (el agente los lee: PDF, Word, Excel, PowerPoint, .zip, CSV, texto…)">${icoClip}</button><button id="oc-send" aria-label="Enviar">${icoEnviar}</button></div></div>
<p class="nota-c">El modelo puede equivocarse. Verifica las cifras en la fuente oficial del MEF.</p>
</form>
</section>
<aside class="pan" id="oc-pan" role="dialog" aria-modal="false" aria-labelledby="oc-pan-t" hidden>
<div class="pan-h"><h2 id="oc-pan-t"></h2><button type="button" id="oc-pan-d" class="b b-p">Descargar</button><button type="button" id="oc-pan-x" class="b pan-x" aria-label="Cerrar el panel">&times;</button></div>
<div class="pan-lista" id="oc-pan-lista"></div>
<div class="pan-sub" id="oc-pan-sub" hidden></div>
<div class="pan-b" id="oc-pan-b" tabindex="0"></div>
</aside>
</div>

<dialog id="oc-sh" aria-labelledby="oc-sh-t">
<div class="cfg-h"><h2 id="oc-sh-t">Compartir chat</h2><button type="button" id="oc-sh-x" class="b" style="margin-left:auto">Cerrar</button></div>
<div class="cfg-in">
<p class="intro">Se creará un <strong>enlace público de solo lectura</strong> con una copia de este chat hasta este momento: los mensajes que escribas después no se comparten. Cualquier persona que tenga el enlace podrá verlo. No se incluyen claves de API, y de los documentos adjuntos solo se muestran el nombre y el tamaño, no su texto. Puedes eliminar el enlace cuando quieras.</p>
<label class="chk" id="oc-sh-imgl" hidden><input type="checkbox" id="oc-sh-img"> Incluir las imágenes adjuntas (máximo 3, reducidas)</label>
<p id="oc-sh-est" role="status" aria-live="polite"></p>
<div class="acc-c" style="display:flex;gap:8px;margin-top:14px"><button type="button" id="oc-sh-crear" class="b b-p">Crear enlace</button></div>
<h3 id="oc-sh-lt" hidden>Enlaces de este chat</h3>
<ul id="oc-sh-lista"></ul>
</div>
</dialog>

<dialog id="oc-cfg" aria-labelledby="oc-cfg-t">
<div class="cfg-h"><h2 id="oc-cfg-t">Configuración de IA</h2><button type="button" id="oc-cfg-x" class="b">Cerrar</button></div>
<div class="cfg-in">
<p class="intro">Por defecto trabaja el agente del servidor de ObraClara: lee tus archivos, consulta los datos del MEF y te entrega archivos. Si prefieres, agrega tu propia API de IA: con ella el chat es simple (solo texto e imágenes, sin archivos ni agente). La clave se guarda solo en tu navegador (por defecto hasta cerrar la pestaña) y las solicitudes van directo de tu navegador al proveedor: tus claves nunca llegan a nuestro servidor.</p>
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
  recortarTexto, nombreSeguro, rutaSegura, extensionArchivo, tipoAdjunto, esTextoBytes, clasificarRuta,
  zipEntradas, zipExtraer, docxATexto, leerDocx, docxEstilos, docxNumeracion, docxRelaciones, docxParrafo, docxBloques, leerDocxDoc, xmlTexto, xmlAtributo, columnaDeRef, xlsxTextoT, xlsxFilasHoja, xlsxLeer, leerXlsx, csvAFilas,
  largoContenido, acortarContenido, recortarMensajes, prepararCompartir,
  claseArchivo, mimeArchivo, tamanoLegible, resaltarLinea, htmlConRecursos, rutaRelativaZip, atributoHtml,
].map((f) => f.toString()).join("\n");

// Piezas compartidas con la página pública /c/:id (renderizador de Markdown seguro, chips, Word/PDF).
const appComun = String.raw`
var OC_FENCE=new RegExp('^\\s*('+String.fromCharCode(96)+'{3,})\\s*(.*)$');
function $(id){return document.getElementById(id)}
function ocInl(n,s){String(s).split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*(?!\*)|` + "`[^`]+`" + String.raw`)/).forEach(function(x){if(!x)return;
 if(x.length>4&&x.slice(0,2)==='**'&&x.slice(-2)==='**'){var b=document.createElement('strong');b.textContent=x.slice(2,-2);n.appendChild(b)}
 else if(x.length>2&&x.charAt(0)==='*'&&x.slice(-1)==='*'&&x.charAt(1)!=='*'){var em=document.createElement('em');ocInl(em,x.slice(1,-1));n.appendChild(em)}
 else if(x.length>2&&x.charAt(0)==='` + "`" + String.raw`'&&x.slice(-1)==='` + "`" + String.raw`'){var c=document.createElement('code');c.textContent=x.slice(1,-1);n.appendChild(c)}
 else n.appendChild(document.createTextNode(x))})}
// Marcas internas de cita del buscador (caracteres de uso privado U+E200–U+E2FF, o ya sin ellos: «citeturn…»,
// «urlTítulohttps://…»): se quitan las citas y de los enlaces queda solo el título. No toca cifras ni frases.
function ocLimpia(s){return String(s).replace(/\r/g,'')
 .replace(/url([^]*)[^]*/g,'$1')
 .replace(/[a-z_]*(?:[^]*)?/g,'').replace(/[-]/g,'')
 .replace(/(^|[\s(])url(?=[A-ZÁÉÍÓÚ])([^\n]*?)https?:\/\/[^\s)]*[^\s).,;]/gm,'$1$2')
 .replace(/[ \t]*\bcite(?:turn\d+[a-z]+\d+)+/g,'')
 .replace(/\.[ \t]+\.(?![.\d])/g,'.').replace(/[ \t]+([.,;:])(?=\s|$)/gm,'$1').replace(/([^.])\.\.(?!\.)/g,'$1.')
 .replace(/^[ \t]*(?:\*\*)?Fuentes?(?: oficial(?:es)?)?:?(?:\*\*)?:?[ \t]*\.[ \t]*$/gim,'')
 .replace(/^[ \t]*[-*•][ \t]*\.?[ \t]*$/gm,'')}
// Fórmulas LaTeX (\[ … \], $$ … $$, \( … \)) como texto legible, sin librerías: \frac{a}{b} → a / b, \times → ×.
function ocTex(s){var x=String(s),k=0;
 while(/\\(?:text|mathrm|textbf|mathbf|operatorname)\s*\{[^{}]*\}/.test(x)&&k++<50)x=x.replace(/\\(?:text|mathrm|textbf|mathbf|operatorname)\s*\{([^{}]*)\}/g,'$1');
 k=0;while(/\\[dt]?frac\s*\{[^{}]*\}\s*\{[^{}]*\}/.test(x)&&k++<50)x=x.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/,function(m,a,b){
  a=a.trim();b=b.trim();return (/[\s+\-−]/.test(a)?'('+a+')':a)+' / '+(/[\s+\-−]/.test(b)?'('+b+')':b)});
 return x.replace(/\\left|\\right/g,'').replace(/\\times/g,' × ').replace(/\\cdot/g,' · ').replace(/\\div/g,' ÷ ')
  .replace(/\\leq?/g,' ≤ ').replace(/\\geq?/g,' ≥ ').replace(/\\neq/g,' ≠ ').replace(/\\approx/g,' ≈ ')
  .replace(/\\([%_$&#])/g,'$1').replace(/\\[,;:! ]/g,' ').replace(/\\\\/g,' ').replace(/\\[a-zA-Z]+/g,'')
  .replace(/[{}]/g,'').replace(/(\S)\s*[-−]\s*(?=\S)/g,'$1 − ').replace(/\s*\+\s*/g,' + ').replace(/\s*=\s*/g,' = ').replace(/\s+/g,' ').trim()}
function ocMd(el,txt){var lst=null,p=null,tb=null,cod=null,fx=null,prev=null;
 function fdiv(s){var d=document.createElement('div');d.className='fm';d.textContent=ocTex(s);el.appendChild(d);prev=d}
 ocLimpia(txt).replace(/\\\(([^\n]*?)\\\)/g,function(m,a){return ocTex(a)}).split('\n').forEach(function(l){var t=l.trim(),mm=/^([-*•]|\d+[.)])\s+(.*)$/.exec(t),fm=OC_FENCE.exec(l);
 if(cod){if(fm&&fm[1].length>=cod.n&&!fm[2].trim()){cod=null;return}cod.pre.appendChild(document.createTextNode((cod.k++?'\n':'')+l));return}
 if(fx!==null){var fin=fx.c==='$$'?t.lastIndexOf('$$'):t.lastIndexOf('\\]');if(fin>=0&&fin===t.length-2){fdiv(fx.s+' '+t.slice(0,fin));fx=null}else fx.s+=' '+t;return}
 if(t.slice(0,2)==='\\['||t.slice(0,2)==='$$'){lst=null;p=null;tb=null;var cc=t.slice(0,2)==='$$'?'$$':'\\]',rest=t.slice(2);
  if(rest.length>=2&&rest.slice(-2)===cc){fdiv(rest.slice(0,-2));return}fx={c:cc,s:rest};return}
 if(fm){lst=null;p=null;tb=null;prev=null;var wc=document.createElement('div'),pr=document.createElement('pre');wc.className='cb';
  wc.appendChild(pr);el.appendChild(wc);cod={n:fm[1].length,pre:pr,k:0};return}
 if(t.charAt(0)==='|'){lst=null;p=null;prev=null;if(/^\|?[\s:|-]+$/.test(t))return;
  var cs=t.replace(/^\||\|$/g,'').split('|');if(!tb){var w=document.createElement('div');w.className='tb';tb=document.createElement('table');w.appendChild(tb);el.appendChild(w);tb.ocHead=true}
  var tr=document.createElement('tr');cs.forEach(function(x){var c=document.createElement(tb.ocHead?'th':'td');ocInl(c,x.trim());tr.appendChild(c)});tb.ocHead=false;tb.appendChild(tr);return}
 tb=null;
 // Una lista numerada sigue abierta tras líneas en blanco: «1. … (blanco) 2. …» numera 1, 2 y no 1, 1.
 if(!t){if(!(lst&&lst.ocOrd))lst=null;p=null;return}
 if(/^#{1,4}\s/.test(t)){lst=null;p=null;var h=document.createElement('p');h.className='h';ocInl(h,t.replace(/^#+\s*/,''));el.appendChild(h);prev=h;return}
 var ind=/^\s{2,}/.test(l);
 if(mm){var ord=/\d/.test(mm[1]),n=ord?parseInt(mm[1],10):0;p=null;
  // Viñetas sangradas bajo un ítem numerado: sublista dentro de ese ítem, sin cortar la numeración.
  if(ind&&!ord&&lst&&lst.ocOrd&&lst.lastChild){var sub=lst.lastChild.ocSub;if(!sub){sub=document.createElement('ul');lst.lastChild.appendChild(sub);lst.lastChild.ocSub=sub}var si=document.createElement('li');ocInl(si,mm[2]);sub.appendChild(si);return}
  var sigue=lst&&lst.ocOrd===ord;
  if(!sigue&&ord&&prev&&prev.ocOrd&&prev.tagName==='OL'){lst=prev;sigue=true}
  if(!sigue){lst=document.createElement(ord?'ol':'ul');lst.ocOrd=ord;if(ord&&n>1)lst.start=n;el.appendChild(lst);prev=lst}
  var li=document.createElement('li');if(ord&&sigue&&n>1)li.value=n;ocInl(li,mm[2]);lst.appendChild(li);return}
 // Párrafo sangrado bajo un ítem numerado: sigue dentro del ítem.
 if(ind&&lst&&lst.ocOrd&&lst.lastChild){var q=document.createElement('p');q.className='li-p';ocInl(q,t);lst.lastChild.appendChild(q);return}
 lst=null;if(!p){p=document.createElement('p');el.appendChild(p);prev=p}else p.appendChild(document.createElement('br'));ocInl(p,t)});
 if(fx!==null)fdiv(fx.s)}
function ocTam(c){return c>=1000?(Math.round(c/100)/10)+' k car.':c+' car.'}
function ocChip(m,leyendo,quitar){var w=document.createElement('div');w.className='th dchip';
 var ic=document.createElement('span');ic.className='dic';ic.textContent=m.t==='imagen'?'IMG':(extensionArchivo(m.n)||'DOC').slice(0,4).toUpperCase();
 var nb=document.createElement('span');nb.className='dnm';nb.textContent=m.n;nb.title=m.n;
 var sz=document.createElement('span');sz.className='dsz';sz.textContent=leyendo?'Leyendo…':(m.b?(m.b<1024?m.b+' B':Math.round(m.b/1024)+' KB'):(m.c?ocTam(m.c):''));
 w.appendChild(ic);w.appendChild(nb);w.appendChild(sz);
 if(quitar){var b=document.createElement('button');b.type='button';b.textContent='×';b.setAttribute('aria-label','Quitar '+m.n);b.addEventListener('click',quitar);w.appendChild(b)}
 return w}
function ocDescargar(nombre,datos,tipo){var u=URL.createObjectURL(new Blob([datos],{type:tipo||'application/octet-stream'})),a=document.createElement('a');
 a.href=u;a.download=nombre;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}
function ocTarjeta(m,abrir){var c=document.createElement('div'),ex=extensionArchivo(m.n),ic=document.createElement('span'),i=document.createElement('div'),n=document.createElement('span'),s=document.createElement('span'),base=String(m.n).split('/').pop(),nom=m.ti||base;
 c.className='adj-c';ic.className='adj-ic';ic.setAttribute('aria-hidden','true');ic.setAttribute('data-k',ex);ic.textContent=(ex||'arch').slice(0,4).toUpperCase();
 i.className='adj-i';n.className='adj-n';n.textContent=nom;n.title=m.n;s.className='adj-s';s.textContent=[m.ti?base:'',m.b?tamanoLegible(m.b):'',m.v>1?'v'+m.v:''].filter(function(x){return x}).join(' · ');
 i.appendChild(n);i.appendChild(s);c.appendChild(ic);c.appendChild(i);
 if(abrir){var b=document.createElement('button');b.type='button';b.className='adj-b';b.textContent='Abrir';b.setAttribute('aria-label','Abrir '+nom);b.addEventListener('click',function(){abrir(b)});c.appendChild(b);c.setAttribute('data-n',m.n)}
 else c.title='Los archivos no se comparten: solo se muestran el nombre y el tamaño.';
 return c}
function ocIdb(){return new Promise(function(ok,no){try{var r=indexedDB.open('obraclara',2);r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv');if(!d.objectStoreNames.contains('adj'))d.createObjectStore('adj')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){no(r.error)}}catch(e){no(e)}})}
function ocAdjTx(modo,fn){return ocIdb().then(function(db){return new Promise(function(ok,no){var t=db.transaction('adj',modo),r=fn(t.objectStore('adj'));t.oncomplete=function(){db.close();ok(r&&r.result)};t.onerror=function(){db.close();no(t.error)};t.onabort=function(){db.close();no(t.error)}})})}
function ocAdjGet(id){return ocAdjTx('readonly',function(s){return s.get(id)})}
function ocAdjPut(id,rec){return ocAdjTx('readwrite',function(s){return s.put(rec,id)})}
function ocAdjDel(ids){if(!ids.length)return Promise.resolve();return ocAdjTx('readwrite',function(s){ids.forEach(function(i){s.delete(i)})}).catch(function(){})}
async function ocAlmLeer(){var v=null;
 try{if(typeof indexedDB!=='undefined'){var db=await ocIdb();v=await new Promise(function(ok,no){var q=db.transaction('kv','readonly').objectStore('kv').get('chats');q.onsuccess=function(){ok(q.result)};q.onerror=function(){no(q.error)}});db.close()}}catch(e){v=null}
 if(typeof v==='string'&&v)return v;
 try{return localStorage.getItem('oc_chats')}catch(e){return null}}
async function ocAlmEscribir(txt){var fallo=null;
 try{if(typeof indexedDB!=='undefined'){var db=await ocIdb();await new Promise(function(ok,no){var t=db.transaction('kv','readwrite');t.objectStore('kv').put(txt,'chats');t.oncomplete=function(){ok()};t.onerror=function(){no(t.error)};t.onabort=function(){no(t.error)}});db.close();return}}catch(e){fallo=e}
 try{localStorage.setItem('oc_chats',txt)}catch(e2){throw (fallo&&fallo.name==='QuotaExceededError')||e2.name==='QuotaExceededError'?new Error('cuota'):new Error('bloqueado')}}
`;

const app = String.raw`
var ocMcp=true,ocHist=[],ocTools=null,ocBusy=false,ocConns=[],ocActiva='servidor',ocEdit='',ocHL='servidor',ocImgs=[],ocDocs=[],ocLeyendo=0,ocMsgs=[],ocChats=[],ocChatId='',ocRest=false,ocRen='',ocAgOk=false,ocAgSabe=false,ocAgId='',ocAbort=null,ocParar=false,ocParoAvisado=false,ocPend=0,ocW=null,ocEvN=0,ocEvT=null,ocEvOcup=false;
var OC_ICO_TOOL='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h12M2 8h8M2 12h5"/><path d="m11 10 2 2-2 2"/></svg>';
function ocBajar(){var s=$('oc-scroll');if(s)s.scrollTop=s.scrollHeight}
function ocRec(m){if(ocRest)return null;ocMsgs.push(m);ocShareUi();return m}
function ocLog(cls,txt,extra,adj,arch){var rec=null;if(cls==='u')ocRec({rol:'u',texto:txt+(extra&&extra.length?'\n'+extra.map(function(){return '[imagen adjunta]'}).join(' '):''),mcp:ocMcp,adj:adj?adj.meta:undefined});
 if(cls==='a')rec=ocRec({rol:'a',texto:txt,modelo:typeof extra==='string'?extra:'',mcp:ocMcp});
var d=document.createElement('div');d.className='msg '+cls;$('oc-vacio').hidden=true;
 if(cls==='a'){var t=document.createElement('div');t.className='t';ocMd(t,txt);
  if(typeof extra==='string'&&extra){var m=document.createElement('p');m.className='mod';m.textContent='Respondió: '+extra;t.appendChild(m)}
  var bx=document.createElement('div');bx.className='adjs';t.appendChild(bx);d.appendChild(t);
  if(arch)ocArchMsg(rec,bx,arch)}
 else{d.textContent=txt;
  if(cls==='u'&&extra&&extra.length){var g=document.createElement('div');g.className='ims';extra.forEach(function(u){var im=document.createElement('img');im.alt='Imagen adjunta';im.src=u;g.appendChild(im)});d.appendChild(g)}
  if(cls==='u'&&adj&&adj.meta&&adj.meta.length){var g2=document.createElement('div');g2.className='ims';adj.meta.forEach(function(x){g2.appendChild(ocChip(x,false,null))});d.appendChild(g2)}}
 $('oc-log').appendChild(d);if(ocW)$('oc-log').appendChild(ocW);ocBajar();return d}
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
 d.appendChild(s);d.appendChild(b);$('oc-vacio').hidden=true;$('oc-log').appendChild(d);if(ocW)$('oc-log').appendChild(ocW);ocBajar()}
function ocRead(st,k){try{return JSON.parse(st.getItem(k)||'null')}catch(e){return null}}
function ocWrite(st,k,v){try{if(v===null)st.removeItem(k);else st.setItem(k,JSON.stringify(v))}catch(e){}}
function ocSwitchText(){var sw=$('oc-sw'),ag=ocAgActivo(),DESC='El asistente puede consultar los datos oficiales del MEF (si MCP está activado), leer tus archivos y entregarte archivos como Excel, Word o PDF.';sw.setAttribute('aria-checked',String(ocMcp));sw.removeAttribute('aria-disabled');
 $('oc-swt').textContent=ocMcp?'MCP: ACTIVADO':'MCP: DESACTIVADO';$('oc-sws').textContent='obraclara · 4 herramientas';
 $('oc-swd').textContent=ag?(ocMcp?DESC:'Sin MCP el asistente no consulta los datos oficiales: trabaja con tus archivos y te entrega otros, como un Excel, un Word o un PDF.'):(ocMcp?'Con MCP: el modelo puede consultar los datos oficiales del MEF mediante las herramientas de este servidor.':'Sin MCP: chat normal con el mismo modelo, sin acceso a los datos; puede equivocarse o inventar.');
 var ind=$('oc-ind');ind.className='ind'+(ocMcp?' on':'');ind.lastChild.textContent=ocMcp?'MCP activado':'Sin MCP';
 $('oc-in').placeholder=ag?(ocMcp?'Pídele datos y archivos al asistente':'Dile al asistente qué hacer (puedes adjuntar archivos)'):'Escribe tu pregunta';$('oc-ideas').hidden=ag&&!ocMcp;
 $('oc-vp').textContent=ag?DESC:'Pregunta por una obra, una entidad o una región. Con el MCP activado, el modelo consulta los datos del MEF y te muestra qué herramienta usó.';
 $('oc-em').hidden=!(ocAgSabe&&!ocAgOk&&ocActiva===ocHL)}
function ocPrefs(){ocWrite(localStorage,'oc_prefs',{mcp:ocMcp})}
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
 $('oc-info').textContent=ocActiva===ocHL?'Trabaja el agente del servidor de ObraClara: lee tus archivos y te entrega otros. Si no está disponible, responde en modo de emergencia (solo texto). En «Configuración» puedes usar tu propia API: la clave nunca llega a nuestro servidor.':'Usando tu API «'+ocConnById(ocActiva).nombre+'»: chat simple de texto e imágenes, sin archivos ni agente. Las solicitudes van directo desde tu navegador al proveedor; la clave nunca llega a nuestro servidor.'}
function ocAgActivo(){return ocAgOk&&ocActiva===ocHL}
function ocAgUi(){ocSwitchText()}
function ocElegir(id){ocActiva=id;ocPersist();ocUi();ocAgUi();ocRenderLista()}
function ocRenderLista(){var u=$('oc-lista');u.textContent='';
 function fila(id,txt,extras){var li=document.createElement('li'),sp=document.createElement('span'),lb=document.createElement('label'),r=document.createElement('input');
  li.className=ocActiva===id?'act':'';sp.textContent=txt;
  lb.className='usar';r.type='radio';r.name='oc-act';r.checked=ocActiva===id;r.addEventListener('change',function(){ocElegir(id)});
  lb.appendChild(r);lb.appendChild(document.createTextNode(id===ocHL?'Usar el servidor de ObraClara (predeterminado)':'Usar esta conexión'));
  li.appendChild(sp);(extras||[]).forEach(function(x){li.appendChild(x)});li.appendChild(lb);u.appendChild(li)}
 fila(ocHL,'Servidor de ObraClara: agente con archivos (si falla, respuesta de emergencia solo con texto)',[]);
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
 try{r=await fetch(url,{method:'POST',headers:headers,body:JSON.stringify(body),signal:ocAbort?ocAbort.signal:undefined})}catch(e){throw new Error('No se pudo conectar con el proveedor. Revisa tu conexión (o si el proveedor permite llamadas desde el navegador).')}
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
  try{r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:recortarMensajes(msgs,140000)}),signal:ocAbort?ocAbort.signal:undefined})}catch(e){throw new Error('No se pudo conectar con el servidor.')}
  var d=null;try{d=await r.json()}catch(e){}
  if(r.status===429)throw new Error('Muchas preguntas seguidas, espera un minuto o agrega tu propia IA en Configuración.');
  if(r.status===503||r.status===504)throw new Error('El servidor de ObraClara no pudo responder ahora (ninguna IA disponible). Inténtalo de nuevo o agrega tu propia IA en Configuración.');
  if(!r.ok){var et=d&&typeof d.error==='string'?d.error:'El servidor respondió con error '+r.status+'.';throw new Error(et.slice(0,200))}
  if(!d||typeof d.content!=='string')throw new Error('Respuesta del servidor no válida.');
  return {texto:d.content,modelo:typeof d.modelo==='string'?d.modelo:''}}
 var c=ocConnById(ocActiva);if(!c)throw new Error('La IA seleccionada ya no existe. Elige otra.');
 return {texto:await ocLlmConn(c,msgs),modelo:c.nombre}}
async function ocMcpCall(method,params){
 var r;try{r=await fetch('/mcp',{method:'POST',headers:{'content-type':'application/json','accept':'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:Date.now(),method:method,params:params||{}}),signal:ocAbort?ocAbort.signal:undefined})}
 catch(e){throw new Error('No se pudo conectar con el servidor MCP.')}
 if(r.status===429)throw new Error('Demasiadas solicitudes al servidor MCP (429). Espera un minuto.');
 if(!r.ok)throw new Error('El servidor MCP respondió con error '+r.status+'.');
 var d=parseSse(await r.text());if(!d)throw new Error('Respuesta MCP no válida.');if(d.error)throw new Error(d.error.message||'Error MCP.');return d.result}
async function ocRun(q,urls){
 ocHist.push({role:'user',content:construirContenido(q,urls||[])});
 if(ocMcp&&!ocTools){ocTools=((await ocMcpCall('tools/list')).tools)||[]}
 var sys=buildSystemPrompt(ocTools||[],ocMcp);
 for(var step=0;step<5;step++){
  if(ocParar)throw new Error('Detenido');
  var rr=await ocLlm([{role:'system',content:sys}].concat(ocHist)),out=rr.texto,mo=rr.modelo;
  if(ocActiva===ocHL&&!ocAgOk)mo=(mo?mo+' · ':'')+'modo de emergencia';
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
function ocChatEst(m){var e=$('oc-chat-est');e.textContent=m||'';e.hidden=!m}
async function ocPersistChats(){ocChats=recortarChats(ocChats);
 try{await ocAlmEscribir(serializarChats(ocChats));ocChatEst('')}
 catch(e){ocChatEst(e&&e.message==='cuota'?'No se pudo guardar el chat: el almacenamiento del navegador está lleno. Borra chats antiguos.':'Este navegador no permite guardar chats (almacenamiento bloqueado). Puedes seguir chateando, pero no se guardará.')}
 ocRenderChats()}
function ocGuardar(){var hay=false;ocMsgs.forEach(function(m){if(m.rol==='a')hay=true});if(!hay)return;
 var ahora=Date.now(),c=null;ocChats.forEach(function(x){if(x.id===ocChatId)c=x});
 if(!c){var pu='';ocMsgs.forEach(function(m){if(!pu&&m.rol==='u')pu=m.texto});
  ocChatId='c'+ahora.toString(36)+Math.random().toString(36).slice(2,6);c={id:ocChatId,titulo:tituloChat(pu),creado:ahora,actualizado:ahora,mensajes:[]};ocChats.push(c)}
 c.mensajes=ocMsgs.slice();c.actualizado=ahora;if(ocAgId)c.agenteId=ocAgId;ocPersistChats()}
async function ocCargarChats(){var t=await ocAlmLeer();ocChats=deserializarChats(t);ocRenderChats()}
function ocLimpiar(){ocPanCerrar();ocArch=[];$('oc-arch-b').hidden=true;ocAgId='';ocEvN=0;ocHist=[];ocMsgs=[];ocChatId='';ocImgs=[];ocDocs=[];ocThumbs();$('oc-log').textContent='';$('oc-vacio').hidden=false;ocShareUi();ocIdeas(false)}
function ocAbrir(id){if(ocBusy)return;var c=null;ocChats.forEach(function(x){if(x.id===id)c=x});if(!c)return;
 ocLimpiar();ocChatId=c.id;ocAgId=c.agenteId||'';ocRest=true;
 c.mensajes.forEach(function(m){
  if(m.rol==='u'){var ad=m.adj&&m.adj.length?{meta:m.adj}:null;ocLog('u',m.texto,null,ad);ocHist.push({role:'user',content:m.texto})}
  else if(m.rol==='a'){ocLog('a',m.texto,m.modelo||'',null,m.arch&&m.arch.length?{meta:m.arch}:undefined);ocHist.push({role:'assistant',content:m.texto})}
  else if(m.rol==='t'&&m.herramienta)ocTool(m.herramienta.nombre,m.herramienta.args,m.herramienta.resultado)});
 ocRest=false;ocMsgs=c.mensajes.slice();ocShareUi();ocRenderChats();ocBajar();ocSetCargar()}
function ocRenombrar(id,v){ocChats.forEach(function(x){if(x.id===id)x.titulo=tituloChat(v)});ocRen='';ocPersistChats()}
function ocBorrar(id){var c=null;ocChats.forEach(function(x){if(x.id===id)c=x});if(!c||!confirm('¿Borrar el chat «'+c.titulo+'»?'))return;
 ocAdjDel(ocIdsArch(c));ocSetBorrar(c.agenteId);ocChats=ocChats.filter(function(x){return x.id!==id});if(ocChatId===id)ocLimpiar();ocPersistChats()}
function ocIdsArch(c){var r=[];c.mensajes.forEach(function(m){(m.arch||[]).forEach(function(x){r.push(x.id)})});return r}
function ocBorrarTodos(){if(!ocChats.length||!confirm('¿Borrar todos los chats guardados en este navegador? No se puede deshacer.'))return;
 var ids=[];ocChats.forEach(function(c){ids=ids.concat(ocIdsArch(c))});ocAdjDel(ids);ocChats.forEach(function(c){ocSetBorrar(c.agenteId)});ocChats=[];ocLimpiar();ocPersistChats()}
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
  var sh=document.createElement('button');sh.type='button';sh.className='ch-b';sh.textContent='↗';sh.title='Compartir';sh.setAttribute('aria-label','Compartir chat «'+c.titulo+'»');sh.addEventListener('click',function(){ocCompartir({id:c.id,titulo:c.titulo,mensajes:c.mensajes,imgs:c.id===ocChatId?ocImgsDe():null})});
  li.appendChild(b);li.appendChild(sh);li.appendChild(rn);li.appendChild(dl);ul.appendChild(li)});
 var t=document.createElement('button');t.type='button';t.className='ch-todos';t.textContent='Borrar todos los chats';t.addEventListener('click',ocBorrarTodos);r.appendChild(t)}
var ocShChat=null;
function ocShareUi(){var h=false;ocMsgs.forEach(function(m){if(m.rol==='a')h=true});$('oc-top').hidden=!h&&!ocArch.length;$('oc-share').hidden=!h}
function ocImgsDe(){var r=[];Array.prototype.forEach.call(document.querySelectorAll('#oc-log .msg.u'),function(d){var a=[];Array.prototype.forEach.call(d.querySelectorAll('.ims img'),function(i){if(/^data:image\//.test(i.src))a.push(i.src)});r.push(a)});return r}
function ocLinks(){var l=ocRead(localStorage,'oc_compartidos');return Array.isArray(l)?l:[]}
function ocLinksGuardar(l){ocWrite(localStorage,'oc_compartidos',l.length?l:null)}
function ocCopiar(txt,b){var o=b.textContent,ok=function(){b.textContent='Copiado';setTimeout(function(){b.textContent=o},1400)};
 function plan(){var t=document.createElement('textarea');t.value=txt;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');ok()}catch(e){}t.remove()}
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,plan);else plan()}
async function ocReducirUrl(u){var im=await ocCargarImg(u),lados=[800,560,400],cal=[0.7,0.6,0.5],r=u;
 for(var k=0;k<3;k++){var e=escalarImagen(im.naturalWidth||im.width,im.naturalHeight||im.height,lados[k]),cv=document.createElement('canvas');cv.width=e.w;cv.height=e.h;
  var cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,e.w,e.h);cx.drawImage(im,0,0,e.w,e.h);r=cv.toDataURL('image/jpeg',cal[k]);if(r.length<=300*1024-1024)return r}
 return r}
function ocCompartir(c){ocShChat=c;var hay=false;(c.imgs||[]).forEach(function(a){if(a.length)hay=true});
 $('oc-sh-imgl').hidden=!hay;$('oc-sh-img').checked=false;$('oc-sh-est').textContent='';$('oc-sh-crear').disabled=false;ocShLista();
 var d=$('oc-sh');if(d.showModal)d.showModal();else d.setAttribute('open','')}
function ocShCerrar(){var d=$('oc-sh');if(d.close)d.close();else d.removeAttribute('open')}
function ocShLista(){var u=$('oc-sh-lista'),c=ocShChat,id=(c&&c.id)||'',ls=ocLinks().filter(function(x){return (x.chat||'')===id}).reverse();
 $('oc-sh-lt').hidden=!ls.length;u.textContent='';
 ls.forEach(function(x){var li=document.createElement('li'),inp=document.createElement('input');
  inp.readOnly=true;inp.value=x.url;inp.setAttribute('aria-label','Enlace público del chat');inp.addEventListener('focus',function(){inp.select()});li.appendChild(inp);
  function bt(t,fn,cl){var b=document.createElement('button');b.type='button';b.className='b'+(cl?' '+cl:'');b.textContent=t;b.addEventListener('click',function(){fn(b)});li.appendChild(b)}
  bt('Copiar',function(b){ocCopiar(x.url,b)});
  if(navigator.share)bt('Compartir…',function(){navigator.share({title:x.titulo||'Chat de ObraClara',url:x.url}).catch(function(){})});
  bt('Eliminar enlace',function(b){ocShBorrar(x,b)});u.appendChild(li)})}
async function ocShCrear(){var c=ocShChat,st=$('oc-sh-est'),b=$('oc-sh-crear');if(!c)return;b.disabled=true;st.textContent='Creando el enlace…';
 try{var inc=$('oc-sh-img').checked&&!$('oc-sh-imgl').hidden,imgs=null;
  if(inc){imgs=[];var tot=0;for(var i=0;i<c.imgs.length;i++){var a=[];for(var j=0;j<c.imgs[i].length;j++){if(tot<3){a.push(await ocReducirUrl(c.imgs[i][j]));tot++}}imgs.push(a)}}
  var ms=prepararCompartir(c.mensajes,imgs,inc),mcp=c.mensajes.some(function(m){return m.mcp===true}),r;
  try{r=await fetch('/api/compartir',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({titulo:c.titulo.split('[imagen adjunta]').join('').trim()||'Conversación',mensajes:ms,mcp:mcp})})}catch(e){throw new Error('No se pudo conectar con el servidor.')}
  var d=null;try{d=await r.json()}catch(e){}
  if(r.status===429)throw new Error('Demasiados enlaces seguidos. Espera un minuto.');
  if(!r.ok)throw new Error(d&&typeof d.error==='string'?d.error.slice(0,200):'El servidor respondió con error '+r.status+'.');
  if(!d||typeof d.id!=='string'||typeof d.token!=='string'||typeof d.url!=='string')throw new Error('Respuesta del servidor no válida.');
  var l=ocLinks();l.push({id:d.id,url:d.url,token:d.token,titulo:c.titulo,chat:c.id||'',creado:Date.now()});ocLinksGuardar(l.slice(-50));
  st.textContent='Enlace creado. Cópialo o compártelo.';ocShLista();var f=document.querySelector('#oc-sh-lista input');if(f)f.focus()}
 catch(e){st.textContent=e&&e.message?e.message:'No se pudo crear el enlace.'}
 b.disabled=false}
async function ocShBorrar(x,b){if(!confirm('¿Eliminar este enlace? Dejará de funcionar para todas las personas que lo tengan.'))return;
 var st=$('oc-sh-est');b.disabled=true;st.textContent='Eliminando…';
 try{var r=await fetch('/api/compartir/'+encodeURIComponent(x.id),{method:'DELETE',headers:{'x-token':x.token}});
  if(r.ok||r.status===404){ocLinksGuardar(ocLinks().filter(function(y){return y.id!==x.id}));st.textContent='Enlace eliminado.';ocShLista();return}
  var d=null;try{d=await r.json()}catch(e){}throw new Error(d&&typeof d.error==='string'?d.error:'No se pudo eliminar el enlace.')}
 catch(e){st.textContent=e&&e.message?e.message:'No se pudo eliminar el enlace.';b.disabled=false}}
function ocAlto(){var t=$('oc-in');t.style.height='auto';t.style.height=Math.min(t.scrollHeight,200)+'px'}
function ocThumbs(){var g=$('oc-thumbs');g.textContent='';g.hidden=!(ocImgs.length||ocDocs.length);
 ocImgs.forEach(function(u,i){var w=document.createElement('div'),im=document.createElement('img'),b=document.createElement('button');
  w.className='th';im.alt='Imagen adjunta '+(i+1);im.src=u;b.type='button';b.textContent='×';b.setAttribute('aria-label','Quitar imagen '+(i+1));
  b.addEventListener('click',function(){ocImgs.splice(i,1);ocThumbs()});w.appendChild(im);w.appendChild(b);g.appendChild(w)});
 ocDocs.forEach(function(d){g.appendChild(ocChip(d.meta,d.leyendo,function(){var i=ocDocs.indexOf(d);if(i>=0)ocDocs.splice(i,1);ocThumbs()}))})}
function ocLeer(f){return new Promise(function(ok,no){var r=new FileReader();r.onload=function(){ok(r.result)};r.onerror=function(){no(new Error('No se pudo leer el archivo.'))};r.readAsDataURL(f)})}
function ocCargarImg(url){return new Promise(function(ok,no){var im=new Image();im.onload=function(){ok(im)};im.onerror=function(){no(new Error('No se pudo abrir la imagen.'))};im.src=url})}
async function ocReducir(f){var L=limitesImagen(),src=await ocLeer(f),im=await ocCargarImg(src);
 var w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,e=escalarImagen(w,h,L.ladoMax);
 var cv=document.createElement('canvas');cv.width=e.w;cv.height=e.h;var cx=cv.getContext('2d');cx.drawImage(im,0,0,e.w,e.h);
 if(f.type==='image/png'){var pu=cv.toDataURL('image/png');if(pu.length<400000)return pu}
 cx.globalCompositeOperation='destination-over';cx.fillStyle='#fff';cx.fillRect(0,0,e.w,e.h);
 return cv.toDataURL('image/jpeg',L.calidad)}
async function ocAdjuntar(files){var msgs=[];
 if(ocAgActivo())return ocAdjuntarAg(files);
 for(var i=0;i<files.length;i++){var f=files[i];
  if(tipoAdjunto(f.name,f.type)!=='imagen'){msgs.push('«'+nombreSeguro(f.name)+'»: los archivos (PDF, Word, Excel, .zip…) solo funcionan con el agente del servidor. Aquí puedes adjuntar imágenes.');continue}
  var er=validarImagen(f.type,f.size,ocImgs.length);if(er){msgs.push(er);continue}
  try{ocImgs.push(await ocReducir(f))}catch(e){msgs.push('«'+f.name+'»: '+(e&&e.message?e.message:'no se pudo procesar.'))}
  ocThumbs()}
 ocThumbs();if(msgs.length)ocLog('n',msgs.join(' '))}
var OC_MAX_B64=24500000;
async function ocAdjuntarAg(files){var msgs=[];
 for(var i=0;i<files.length;i++){var f=files[i],tot=0;ocDocs.forEach(function(x){tot+=x.raw?x.raw.length:0});
  if((tot+f.size*1.37)>OC_MAX_B64){msgs.push('«'+nombreSeguro(f.name)+'»: se superarían los 25 MB en total.');continue}
  var d={meta:{n:nombreSeguro(f.name),t:tipoAdjunto(f.name,f.type),c:0,b:f.size},leyendo:true,raw:''};ocDocs.push(d);ocLeyendo++;ocThumbs();
  try{d.raw=await ocLeer(f);d.leyendo=false}
  catch(e){var k=ocDocs.indexOf(d);if(k>=0)ocDocs.splice(k,1);msgs.push('«'+d.meta.n+'»: no se pudo leer.')}
  ocLeyendo--;ocThumbs()}
 if(msgs.length)ocLog('n',msgs.join(' '))}
function ocBusyUi(){$('oc-stop').hidden=!ocBusy}
function ocNuevoId(){return 'oc'+Date.now().toString(36)+Math.random().toString(36).slice(2,10)}
function ocB64Bytes(b64){var bin=atob(b64),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
function ocPendIni(){ocPend++;if(ocPend===1){ocParar=false;ocParoAvisado=false;ocAbort=typeof AbortController==='function'?new AbortController():null}ocBusy=true;ocBusyUi()}
function ocPendFin(){ocPend=Math.max(0,ocPend-1);if(ocPend)return;ocBusy=false;ocAbort=null;ocEsperaFin();ocBusyUi();ocBajar();ocGuardar()}
function ocDetener(){if(!ocBusy)return;ocParar=true;if(ocAbort)ocAbort.abort()}
function ocFinTurno(e){
 if(ocParar){if(!ocParoAvisado){ocParoAvisado=true;ocLog('n','Dejé de esperar la respuesta. Desde aquí no se puede cancelar el trabajo del agente: puede seguir en el servidor.')}}
 else ocLog('e',e&&e.message?e.message:'Error inesperado.')}
function ocEsperaIni(txt){var d=document.createElement('div'),l=document.createElement('span'),dt=document.createElement('details'),sm=document.createElement('summary'),ol=document.createElement('ol');
 d.className='msg w';l.className='w-l';l.textContent=txt;sm.textContent='Ver pasos';dt.className='w-p';dt.hidden=true;dt.appendChild(sm);dt.appendChild(ol);d.appendChild(l);d.appendChild(dt);
 $('oc-vacio').hidden=true;$('oc-log').appendChild(d);ocW=d;ocBajar()}
function ocEsperaFin(){ocEvDetener();if(ocW){ocW.remove();ocW=null}}
function ocEvVer(e){if(!ocW||!e||e.tipo==='fin'||typeof e.texto!=='string'||!e.texto)return;
 ocW.firstChild.textContent='El agente está trabajando: '+e.texto;
 var dt=ocW.lastChild,li=document.createElement('li');li.textContent=e.texto;dt.lastChild.appendChild(li);dt.hidden=false;ocBajar()}
async function ocEvBase(){try{var r=await fetch('/api/agente/eventos?chat_id='+encodeURIComponent(ocAgId)+'&desde=0'),d=await r.json();if(d&&typeof d.siguiente==='number')ocEvN=d.siguiente}catch(e){}}
function ocEvIniciar(){ocEvDetener();ocEvT=setInterval(ocEvSondear,1000)}
function ocEvDetener(){if(ocEvT){clearInterval(ocEvT);ocEvT=null}}
async function ocEvSondear(){if(ocEvOcup||!ocW)return;ocEvOcup=true;
 try{var r=await fetch('/api/agente/eventos?chat_id='+encodeURIComponent(ocAgId)+'&desde='+ocEvN);
  if(r.ok){var d=await r.json();(d.eventos||[]).forEach(function(e){if(typeof e.n==='number'&&e.n>ocEvN){ocEvN=e.n;ocEvVer(e)}})}}catch(e){}
 ocEvOcup=false}
async function ocSend(q){q=(q||'').trim();
 if(ocLeyendo>0){ocLog('n','Espera a que termine de leerse el archivo adjunto.');return}
 var fs=ocDocs.filter(function(d){return d.raw}),im=ocImgs.slice(),ag=ocAgActivo();
 if(!q&&!im.length&&!fs.length)return;
 if(ocBusy&&!ag){ocLog('n','Espera a que termine la respuesta actual.');return}
 $('oc-in').value='';ocAlto();ocImgs=[];ocDocs=[];ocThumbs();
 if(ag)await ocSendAg(q,fs);else await ocSendLeg(q,im)}
async function ocSendLeg(q,im){if(!q)q='Describe la imagen y dime qué ves.';
 ocLog('u',q,im,null);ocPendIni();ocEsperaIni('Pensando…');
 try{await ocRun(q,im)}catch(e){ocFinTurno(e)}
 ocPendFin()}
async function ocEmergencia(q,fs){ocAgOk=false;ocAgUi();setTimeout(ocAgEstado,60000);ocEvDetener();
 ocLog('n','Modo de emergencia: sin archivos ni agente. Respondo solo con texto.'+(fs.length?' No se leyeron los archivos adjuntos ('+fs.map(function(d){return d.meta.n}).join(', ')+').':''));
 ocW.firstChild.textContent='Pensando…';
 ocHist=[];ocMsgs.slice(0,-1).forEach(function(m){if(m.rol==='u')ocHist.push({role:'user',content:m.texto});else if(m.rol==='a')ocHist.push({role:'assistant',content:m.texto})});
 await ocRun(q,[])}
async function ocSendAg(q,fs){if(!q)q='Revisa los archivos adjuntos y resume su contenido.';
 var primero=!ocBusy,meta=fs.map(function(d){return d.meta}),adj=fs.map(function(d){return {nombre:d.meta.n,datos:d.raw}}),con={};
 ocArch.forEach(function(a){if(a.v&&(a.datos||a.g))con[a.n]=a.v});
 if(!ocAgId)ocAgId=ocNuevoId();
 var b=ocLog('u',q,null,meta.length?{meta:meta}:null),mk=null;
 if(!primero){mk=document.createElement('span');mk.className='iny';mk.textContent='Enviando al agente…';b.appendChild(mk)}
 ocPendIni();
 if(primero){ocEsperaIni('El agente está trabajando…');await ocEvBase();ocEvIniciar()}
 try{var r=null,d=null;
  try{r=await fetch('/api/agente',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:ocAgId,mensaje:q,archivos:adj,conocidos:con,subidos:meta.map(function(m){return m.n}),mcp:ocMcp?true:undefined}),signal:ocAbort?ocAbort.signal:undefined})}catch(e){if(ocParar)throw e}
  if(!r||r.status>=500){if(!primero)throw new Error('No se pudo entregar el mensaje al agente. Inténtalo de nuevo.');await ocEmergencia(q,fs);return}
  try{d=await r.json()}catch(e){if(ocParar)throw e}
  if(r.status===202){if(fs.length){ocSetSubidos(fs);if(ocAgId)ocSetGuardar()}if(mk)mk.textContent='Entregado al agente';else ocLog('n','Tu mensaje se entregó al agente, que ya estaba trabajando en este chat.');return}
  if(mk)mk.remove();
  if(!r.ok)throw new Error(d&&typeof d.error==='string'?d.error.slice(0,200):'El servidor respondió con error '+r.status+'.');
  if(!d||typeof d.respuesta!=='string')throw new Error('Respuesta del agente no válida.');
  if(typeof d.chat_id==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(d.chat_id))ocAgId=d.chat_id;
  var ent=ocSetAplicar(d,fs);if(ocAgId)await ocSetGuardar();
  ocLog('a',d.respuesta.trim()||'(sin respuesta)','Agente del servidor',null,ent.length?{meta:ent.map(function(e){return {id:e.id,n:e.n,ti:e.ti,b:e.b,v:e.v,g:e.g}})}:undefined);
  if(d.pendiente)ocLog('n','Algunas versiones nuevas no llegaron a este navegador por su tamaño. Descárgalas con «Descargar todo (.zip)».');
  if(d.omitidos&&d.omitidos.length)ocLog('n','Algunos archivos no se enviaron por su tamaño: '+d.omitidos.join(', ')+'.')}
 catch(e){if(mk&&mk.textContent!=='Entregado al agente')mk.textContent='No se pudo entregar';ocFinTurno(e)}
 finally{ocPendFin()}}
var OC_ADJ_MAX=20*1024*1024,OC_CSP='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data: blob: https:; media-src data: blob: https:; style-src \'unsafe-inline\' https:; font-src data: https:; script-src \'unsafe-inline\' https:; connect-src \'none\'; form-action \'none\'">';
var ocPan={i:-1,cur:'',zip:null,modo:'vista',hoja:0,hojaDe:'',url:'',urls:[],disp:null,tok:0},ocArch=[],ocZipOcup=false;
function ocId(){return 'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function ocArchBuscar(n){for(var i=0;i<ocArch.length;i++)if(ocArch[i].n===n)return ocArch[i];return null}
function ocArchIdx(n){for(var i=0;i<ocArch.length;i++)if(ocArch[i].n===n)return i;return -1}
function ocArchMeta(lista){return lista.map(function(a){var o={id:a.id,n:a.n,b:a.b};if(a.ti)o.ti=a.ti;if(a.v)o.v=a.v;if(a.g)o.g=true;return o})}
function ocSetMeta(){return ocArch.map(function(a){return {id:a.id,n:a.n,ti:a.ti||'',b:a.b,v:a.v||0,o:a.o,g:!!a.g,pend:!!a.pend}})}
function ocEntrada(n,ti,b,v,o,datos){return {id:ocId(),n:n,ti:ti||'',t:mimeArchivo(n),b:b,v:v||0,o:o,g:false,sucio:!!datos,nov:'',pend:!datos,datos:datos||null}}
async function ocSetGuardar(){var ag=ocAgId;if(!ag)return;var tot=0;ocArch.forEach(function(x){if(x.g)tot+=x.b});
 for(var i=0;i<ocArch.length;i++){var a=ocArch[i];if(!a.datos||(a.g&&!a.sucio))continue;if(!a.g&&tot+a.b>OC_ADJ_MAX)continue;
  try{await ocAdjPut(a.id,{n:a.n,d:a.datos});if(!a.g)tot+=a.b;a.g=true;a.sucio=false}catch(e){}}
 try{await ocAdjPut('set:'+ag,ocSetMeta())}catch(e){}}
async function ocSetCargar(){var ag=ocAgId,r=null,lista=[];
 if(ag){try{r=await ocAdjGet('set:'+ag)}catch(e){}}
 if(Array.isArray(r))r.forEach(function(x){if(x&&typeof x.n==='string')lista.push({id:x.id,n:x.n,ti:x.ti||'',t:mimeArchivo(x.n),b:Number(x.b)||0,v:Number(x.v)||0,o:x.o==='usuario'?'usuario':'agente',g:!!x.g,sucio:false,nov:'',pend:!!x.pend,datos:null})});
 ocMsgs.forEach(function(m){(m.arch||[]).forEach(function(x){if(!x.g||lista.some(function(y){return y.n===x.n}))return;lista.push({id:x.id,n:x.n,ti:x.ti||'',t:mimeArchivo(x.n),b:x.b,v:Number(x.v)||0,o:'agente',g:true,sucio:false,nov:'',pend:false,datos:null})})});
 if(ag!==ocAgId||ocArch.length)return;ocArch=lista;ocArchUi();ocPanRef()}
function ocSetBorrar(ag){if(!ag)return;ocAdjGet('set:'+ag).then(function(r){var ids=['set:'+ag];if(Array.isArray(r))r.forEach(function(x){if(x&&x.id)ids.push(x.id)});return ocAdjDel(ids)}).catch(function(){})}
function ocArchUi(){var b=$('oc-arch-b');b.hidden=!ocArch.length;b.lastChild.textContent='Archivos ('+ocArch.length+')';b.setAttribute('aria-expanded',String(!$('oc-pan').hidden));ocShareUi()}
function ocRawBytes(raw){var i=String(raw).indexOf(',');return ocB64Bytes(i>=0?String(raw).slice(i+1):raw)}
function ocSetSubidos(fs){var raw={};fs.forEach(function(x){try{raw[x.meta.n]=ocRawBytes(x.raw)}catch(e){}});
 Object.keys(raw).forEach(function(n){var e=ocArchBuscar(n),d=raw[n];if(e){e.datos=d;e.b=d.length;e.sucio=true;e.pend=false;e.o='usuario';e.nov='actualizado';e.v=0}else{var x=ocEntrada(n,'',d.length,0,'usuario',d);x.nov='nuevo';ocArch.push(x)}});
 ocArchUi();ocPanRef()}
function ocSetAplicar(d,fs){var rec={},subidos={},prev={};
 (Array.isArray(d.archivos)?d.archivos:[]).forEach(function(f){if(!f||typeof f.datos!=='string'||typeof f.nombre!=='string')return;var bb;try{bb=ocB64Bytes(f.datos)}catch(e){return}rec[rutaSegura(f.nombre)||'archivo']={datos:bb,v:Number(f.version)||0,ti:typeof f.titulo==='string'?f.titulo.slice(0,100):''}});
 fs.forEach(function(x){try{subidos[x.meta.n]=ocRawBytes(x.raw)}catch(e){}});
 ocArch.forEach(function(a){prev[a.n]=a;a.nov=''});
 var vig=Array.isArray(d.archivos_chat)?d.archivos_chat:null,sig=[];
 if(vig){
  vig.slice(0,100).forEach(function(x){if(!x||typeof x.ruta!=='string')return;
   var n=rutaSegura(x.ruta)||x.ruta,v=Number(x.version)||0,o=x.origen==='usuario'?'usuario':'agente',e=prev[n],r=rec[n],datos=null,ti=typeof x.titulo==='string'?x.titulo.slice(0,100):'',b=Number(x.bytes)||0;
   if(r&&(!v||!r.v||r.v===v))datos=r.datos;else if(o==='usuario'&&subidos[n])datos=subidos[n];
   if(datos)b=datos.length;
   var mismo=!!e&&((v&&e.v===v)||(!e.v&&e.o==='usuario'&&o==='usuario'&&!subidos[n]));
   if(!e){e=ocEntrada(n,ti,b,v,o,datos);e.nov='nuevo'}
   else if(mismo){e.v=v;e.o=o;e.ti=ti||e.ti;if(datos&&!e.datos&&!e.g){e.datos=datos;e.sucio=true;e.pend=false}}
   else{e.v=v;e.o=o;e.ti=ti;e.b=b;e.nov='actualizado';e.datos=datos;e.sucio=!!datos;e.pend=!datos;if(!datos&&e.g){e.g=false;ocAdjDel([e.id])}}
   sig.push(e)})}
 else{
  sig=ocArch.slice();
  var nuevos=[];Object.keys(subidos).forEach(function(n){nuevos.push({n:n,datos:subidos[n],o:'usuario',ti:''})});
  Object.keys(rec).forEach(function(n){nuevos.push({n:n,datos:rec[n].datos,o:'agente',ti:rec[n].ti})});
  nuevos.forEach(function(x){var e=ocArchBuscar(x.n),k=sig.indexOf(e);
   if(e){e.datos=x.datos;e.b=x.datos.length;e.sucio=true;e.pend=false;e.o=x.o;if(x.ti)e.ti=x.ti;e.nov='actualizado'}
   else{e=ocEntrada(x.n,x.ti,x.datos.length,0,x.o,x.datos);e.nov='nuevo';sig.push(e)}})}
 prev=null;var quedan={};sig.forEach(function(a){quedan[a.id]=1});
 var borrar=[];ocArch.forEach(function(a){if(!quedan[a.id]&&a.g)borrar.push(a.id)});if(borrar.length)ocAdjDel(borrar);
 ocArch=sig;ocArchUi();ocPanRef();
 var ent=[];
 if(Array.isArray(d.adjuntos)&&d.adjuntos.length)d.adjuntos.slice(0,20).forEach(function(a){if(a&&typeof a.ruta==='string'){var e=ocArchBuscar(rutaSegura(a.ruta)||a.ruta);if(e)ent.push(e)}});
 else Object.keys(rec).forEach(function(n){var e=ocArchBuscar(n);if(e)ent.push(e)});
 return ent}
function ocArchPintar(box,lista){box.textContent='';
 lista.forEach(function(a){box.appendChild(ocTarjeta({n:a.n,ti:a.ti,b:a.b,v:a.v},function(btn){ocArchAbrir(a.n,btn)}))});ocBajar()}
function ocArchAbrir(n,btn){var i=ocArchIdx(n);if(i<0){ocLog('n','«'+n.split('/').pop()+'» ya no está en los archivos de este chat (se reemplazó o se borraron los datos del sitio).');return}ocPanAbrir(i,btn)}
async function ocArchMsg(rec,box,arch){
 try{var lista=arch&&arch.meta?arch.meta:null;
  if(!lista||!lista.length)return;
  ocArchPintar(box,lista);
  if(rec&&ocMsgs.indexOf(rec)>=0){rec.arch=ocArchMeta(lista.map(function(x){var e=ocArchBuscar(x.n);return {id:x.id||(e&&e.id)||ocId(),n:x.n,ti:x.ti,b:x.b,v:x.v,g:e?e.g:!!x.g}}));ocGuardar()}
 }catch(e){}}
async function ocArchDatos(a){if(a.datos)return a.datos;
 try{var r=await ocAdjGet(a.id);if(r&&r.d){a.datos=r.d instanceof Uint8Array?r.d:new Uint8Array(r.d);return a.datos}}catch(e){}
 return null}
function ocPanSoltar(){if(ocPan.url){URL.revokeObjectURL(ocPan.url);ocPan.url=''}(ocPan.urls||[]).forEach(function(u){URL.revokeObjectURL(u)});ocPan.urls=[]}
function ocDocxRuns(el,runs,urls){runs.forEach(function(r){if(r.img){var u=urls[r.img];if(!u)return;var im=document.createElement('img');im.src=u;im.alt='Imagen del documento';im.loading='lazy';el.appendChild(im);return}
 var w=document.createTextNode(r.x),e;if(r.u){e=document.createElement('u');e.appendChild(w);w=e}if(r.s){e=document.createElement('s');e.appendChild(w);w=e}
 if(r.i){e=document.createElement('em');e.appendChild(w);w=e}if(r.b){e=document.createElement('strong');e.appendChild(w);w=e}el.appendChild(w)})}
function ocDocxTiene(p){return p.runs.some(function(r){return r.img||/\S/.test(r.x)})}
function ocDocx(el,doc){var hoja=document.createElement('article'),pila=[],n=0,urls={};hoja.className='pv-hoja';
 Object.keys(doc.imagenes).forEach(function(ruta){var mi=mimeArchivo(ruta);if(!/^image\/(png|jpeg|gif|webp|bmp|svg\+xml)$/.test(mi))return;var u=URL.createObjectURL(new Blob([doc.imagenes[ruta]],{type:mi}));ocPan.urls.push(u);urls[ruta]=u});
 doc.bloques.forEach(function(bq){
  if(bq.t==='tabla'){pila=[];var w=document.createElement('div'),t=document.createElement('table'),tb=document.createElement('tbody');w.className='pv-dt';
   bq.filas.forEach(function(f){var tr=document.createElement('tr');f.forEach(function(c){var td=document.createElement('td');if(c.span>1)td.colSpan=c.span;
    c.ps.forEach(function(p){if(!ocDocxTiene(p))return;var d=document.createElement('p');if(p.alin)d.style.textAlign=p.alin;ocDocxRuns(d,p.runs,urls);td.appendChild(d)});tr.appendChild(td)});tb.appendChild(tr)});
   t.appendChild(tb);w.appendChild(t);hoja.appendChild(w);n++;return}
  if(!ocDocxTiene(bq))return;n++;
  if(bq.lista){var lv=bq.lista.ilvl,tag=bq.lista.orden?'OL':'UL';while(pila.length>lv+1)pila.pop();if(pila.length===lv+1&&pila[lv].tagName!==tag)pila.pop();
   while(pila.length<lv+1){var nl=document.createElement(tag),pad=pila[pila.length-1];(pad?(pad.lastElementChild||pad):hoja).appendChild(nl);pila.push(nl)}
   var li=document.createElement('li');ocDocxRuns(li,bq.runs,urls);pila[lv].appendChild(li);return}
  pila=[];var tg=bq.nivel===-1?'h1':bq.nivel>0?'h'+Math.min(6,bq.nivel+1):'p',el2=document.createElement(tg);if(bq.nivel===-2)el2.className='sub';
  if(bq.alin)el2.style.textAlign=bq.alin;ocDocxRuns(el2,bq.runs,urls);hoja.appendChild(el2)});
 el.appendChild(hoja);return n>0}
function ocPanAct(){var cur=ocPan.i>=0&&!$('oc-pan').hidden&&ocArch[ocPan.i]?ocArch[ocPan.i].n:null;
 Array.prototype.forEach.call(document.querySelectorAll('.adj-c[data-n]'),function(c){c.classList.toggle('act',c.getAttribute('data-n')===cur)})}
function ocPanAbrir(i,disp){if(!ocArch.length)return;ocPan.disp=disp||null;var p=$('oc-pan');p.hidden=false;
 p.setAttribute('aria-modal',window.matchMedia&&window.matchMedia('(max-width:860px)').matches?'true':'false');
 document.querySelector('.chat').classList.add('con-pan');ocPanVer(Math.max(0,Math.min(i,ocArch.length-1)));ocArchUi();$('oc-pan-x').focus()}
function ocPanCerrar(){var p=$('oc-pan');if(p.hidden)return;p.hidden=true;ocPan.tok++;ocPan.i=-1;ocPan.cur='';document.querySelector('.chat').classList.remove('con-pan');ocPanSoltar();$('oc-pan-b').textContent='';
 ocPanAct();ocArchUi();
 var d=ocPan.disp;ocPan.disp=null;if(d&&document.body.contains(d))d.focus()}
function ocPanRef(){if($('oc-pan').hidden)return;if(!ocArch.length){ocPanCerrar();return}
 var a=ocPan.i>=0?ocArch[ocPan.i]:null,k=ocPan.cur,idx=ocPan.cur?-1:0;
 if(k){var m=k.split('|')[0];idx=ocArchIdx(m);if(idx<0)idx=0}
 var na=ocArch[idx],nk=na.n+'|'+na.v+'|'+(na.datos||na.g?1:0)+'|'+na.b;
 if(nk===k&&a&&a===na){ocPanLista();ocPanAct()}else ocPanVer(idx)}
function ocPanMsg(txt){var b=$('oc-pan-b'),p=document.createElement('p');p.className='pv-msg';p.textContent=txt;b.textContent='';b.appendChild(p)}
async function ocArchBajar(a){var d=await ocArchDatos(a);if(d)ocDescargar(a.n.split('/').pop(),d,a.t||mimeArchivo(a.n));else ocLog('n','«'+a.n.split('/').pop()+'» no está guardado en este navegador. Usa «Descargar todo (.zip)».')}
async function ocZipBajar(){if(ocZipOcup||!ocAgId)return;ocZipOcup=true;ocPanLista();
 try{var r=await fetch('/api/agente/archivos.zip?chat_id='+encodeURIComponent(ocAgId));
  if(!r.ok){var j=null;try{j=await r.json()}catch(e){}throw new Error(j&&typeof j.error==='string'?j.error:'No se pudo preparar el .zip.')}
  ocDescargar('archivos-del-chat.zip',new Uint8Array(await r.arrayBuffer()),'application/zip')}
 catch(e){ocLog('n',e&&e.message?e.message:'No se pudo descargar el .zip.')}
 ocZipOcup=false;ocPanLista()}
function ocPanLista(){var c=$('oc-pan-lista');c.textContent='';
 var h=document.createElement('div'),t=document.createElement('strong'),z=document.createElement('button');h.className='pl-h';t.textContent='Archivos del chat ('+ocArch.length+')';
 z.type='button';z.className='b';z.id='oc-pan-zip';z.textContent=ocZipOcup?'Preparando…':'Descargar todo (.zip)';z.disabled=ocZipOcup||!ocAgId;z.addEventListener('click',ocZipBajar);
 h.appendChild(t);h.appendChild(z);c.appendChild(h);
 var ul=document.createElement('ul');ul.className='pl-l';
 ocArch.forEach(function(a,k){var li=document.createElement('li'),b=document.createElement('button'),ic=document.createElement('span'),i=document.createElement('span'),n=document.createElement('span'),s=document.createElement('span'),bd=document.createElement('span'),d=document.createElement('button'),ex=extensionArchivo(a.n),base=a.n.split('/').pop();
  li.className='pl-i'+(k===ocPan.i?' act':'');b.type='button';b.className='pl-b';b.setAttribute('aria-current',String(k===ocPan.i));
  ic.className='adj-ic';ic.setAttribute('aria-hidden','true');ic.setAttribute('data-k',ex);ic.textContent=(ex||'arch').slice(0,4).toUpperCase();
  i.className='adj-i';n.className='adj-n';n.textContent=a.ti||base;n.title=a.n;s.className='adj-s';s.textContent=[a.ti?base:'',a.b?tamanoLegible(a.b):'',a.o==='usuario'?'subido por ti':'entregado'].filter(function(x){return x}).join(' · ');
  i.appendChild(n);i.appendChild(s);bd.className='pl-bd';
  if(a.v>1){var v=document.createElement('span');v.className='bd';v.textContent='v'+a.v;v.title='Versión '+a.v;bd.appendChild(v)}
  if(a.nov){var nv=document.createElement('span');nv.className='bd bd-n';nv.textContent=a.nov;bd.appendChild(nv)}
  b.appendChild(ic);b.appendChild(i);b.appendChild(bd);b.addEventListener('click',function(){ocPanVer(k)});
  d.type='button';d.className='pl-d';d.textContent='Descargar';d.setAttribute('aria-label','Descargar '+(a.ti||base));d.addEventListener('click',function(){ocArchBajar(a)});
  li.appendChild(b);li.appendChild(d);ul.appendChild(li)});
 c.appendChild(ul)}
async function ocPanVer(i){var a=ocArch[i];if(!a)return;ocPan.i=i;ocPan.cur=a.n+'|'+a.v+'|'+(a.datos||a.g?1:0)+'|'+a.b;ocPan.zip=null;ocPan.modo='vista';var tok=++ocPan.tok;
 $('oc-pan-t').textContent=a.ti||a.n.split('/').pop();ocPanAct();$('oc-pan-sub').hidden=true;ocPanLista();
 ocPanMsg('Cargando…');var d=await ocArchDatos(a);if(tok!==ocPan.tok)return;
 if(!d){$('oc-pan-d').disabled=true;ocPanMsg(a.pend?'El contenido de esta versión no llegó al navegador (por su tamaño). Usa «Descargar todo (.zip)».':'Este archivo ya no está guardado en este navegador (se superó el límite de 20 MB por chat o se borraron los datos del sitio). Vuelve a pedírselo al asistente.');return}
 $('oc-pan-d').disabled=false;
 if(claseArchivo(a.n)==='zip')return ocPanZip(a,d,tok);
 await ocPanContenido(a.n,d,tok,null)}
function ocHtmlDoc(h){var m=OC_CSP;if(/<head[^>]*>/i.test(h))return h.replace(/<head[^>]*>/i,function(x){return x+m});var d=/^\s*<!doctype[^>]*>/i.exec(h);if(d)return d[0]+m+h.slice(d[0].length);return '<!doctype html>'+m+h}
function ocPvCodigo(b,texto,ext){var lines=String(texto).replace(/\r/g,'').split('\n'),pre=document.createElement('div'),tope=3000;pre.className='pv-code';
 lines.slice(0,tope).forEach(function(l){var d=document.createElement('div');d.className='l';
  resaltarLinea(l,ext).forEach(function(t){if(t[0]){var s=document.createElement('span');s.className='tk-'+t[0];s.textContent=t[1];d.appendChild(s)}else d.appendChild(document.createTextNode(t[1]))});pre.appendChild(d)});
 b.appendChild(pre);if(lines.length>tope){var n=document.createElement('p');n.className='pv-msg';n.textContent='Se muestran las primeras '+tope+' líneas de '+lines.length+'. Descarga el archivo para verlo completo.';b.appendChild(n)}}
async function ocZipMapa(z){if(z.mapa)return z.mapa;var m={},n=0;
 for(var i=0;i<z.ents.length&&n<40;i++){var e=z.ents[i];if(!/\.(css|js|mjs)$/i.test(e.nombre)||e.tam>1500000)continue;var d=await zipExtraer(z.datos,e,1500000);if(d){m[rutaSegura(e.nombre)]=new TextDecoder('utf-8').decode(d);n++}}
 z.mapa=m;return m}
function ocPanTabla(b,filas,trunc){var d=document.createElement('div'),t=document.createElement('table'),th=document.createElement('thead'),tb=document.createElement('tbody'),nc=0;t.className='pv-tab';
 filas.forEach(function(f){if(f.length>nc)nc=f.length});
 if(!filas.length||!nc){ocPanMsg('Esta hoja no tiene datos.');return}
 var hr=document.createElement('tr'),c0=document.createElement('th');c0.className='n';hr.appendChild(c0);
 for(var j=0;j<nc;j++){var h=document.createElement('th');h.textContent=filas[0][j]==null?'':filas[0][j];h.title=h.textContent;hr.appendChild(h)}
 th.appendChild(hr);
 for(var i=1;i<filas.length;i++){var tr=document.createElement('tr'),n=document.createElement('th');n.className='n';n.scope='row';n.textContent=String(i+1);tr.appendChild(n);
  for(var k=0;k<nc;k++){var td=document.createElement('td');td.textContent=filas[i][k]==null?'':filas[i][k];tr.appendChild(td)}tb.appendChild(tr)}
 t.appendChild(th);t.appendChild(tb);d.appendChild(t);b.textContent='';b.appendChild(d);
 var nota=document.createElement('p');nota.className='pv-nota';nota.textContent=trunc?'Se muestran las primeras 200 filas. Usa Descargar para ver el archivo completo.':filas.length+' filas';b.appendChild(nota)}
async function ocPanContenido(nombre,datos,tok,z){var b=$('oc-pan-b'),sub=$('oc-pan-sub'),k=claseArchivo(nombre),ext=extensionArchivo(nombre);
 b.textContent='';sub.textContent='';ocPanSoltar();var hay=false;
 function bt(txt,fn,cl,tab,sel){var x=document.createElement('button');x.type='button';x.textContent=txt;if(cl)x.className=cl;if(tab){x.setAttribute('role','tab');x.setAttribute('aria-selected',String(!!sel))}x.addEventListener('click',fn);sub.appendChild(x);hay=true;return x}
 if(z){bt('← Archivos',function(){ocPanZipLista(z)},'b');var r=document.createElement('span');r.className='pan-ruta';r.textContent=nombre;r.title=nombre;sub.appendChild(r)}
 if(k==='html'){bt('Vista',function(){ocPan.modo='vista';ocPanContenido(nombre,datos,++ocPan.tok,z)},'',true,ocPan.modo==='vista');bt('Código',function(){ocPan.modo='codigo';ocPanContenido(nombre,datos,++ocPan.tok,z)},'',true,ocPan.modo==='codigo')}
 var xl=null;if(ext==='xlsx'){try{xl=await leerXlsx(datos,200)}catch(e){xl={error:e&&e.message?e.message:'error'}}if(tok!==ocPan.tok)return;
  if(xl.hojas){if(ocPan.hojaDe!==nombre){ocPan.hojaDe=nombre;ocPan.hoja=0}if(ocPan.hoja>=xl.hojas.length)ocPan.hoja=0;
   if(xl.hojas.length>1)xl.hojas.forEach(function(h,hi){bt(h.nombre,function(){ocPan.hoja=hi;ocPanContenido(nombre,datos,++ocPan.tok,z)},'',true,hi===ocPan.hoja)})}}
 if(z)bt('Descargar este archivo',function(){ocDescargar(nombre.split('/').pop(),datos,mimeArchivo(nombre))},'b');
 sub.hidden=!hay;
 if(k==='imagen'){var im=document.createElement('img');im.className='pv-img';im.alt=nombre.split('/').pop();ocPan.url=URL.createObjectURL(new Blob([datos],{type:mimeArchivo(nombre)}));im.src=ocPan.url;b.appendChild(im);return}
 if(k==='pdf'){var f=document.createElement('iframe');f.title='Vista previa de '+nombre;ocPan.url=URL.createObjectURL(new Blob([datos],{type:'application/pdf'}));f.src=ocPan.url;b.appendChild(f);return}
 if(k==='docx'){try{var a=await leerDocxDoc(datos,8*1024*1024);if(tok!==ocPan.tok)return;ocPanSoltar();var dv=document.createElement('div');dv.className='pv-doc';if(!ocDocx(dv,a)){ocPanMsg('El documento no tiene texto. Usa Descargar.');return}b.appendChild(dv)}catch(e){ocPanMsg('No se pudo mostrar el documento: '+(e&&e.message?e.message:'error')+' Usa Descargar.')}return}
 if(ext==='xlsx'){if(xl&&xl.hojas){var hj=xl.hojas[ocPan.hoja];ocPanTabla(b,hj.filas,hj.truncada)}else ocPanMsg('No se pudo mostrar la hoja de cálculo: '+(xl&&xl.error||'error')+' Usa Descargar.');return}
 if((ext==='csv'||ext==='tsv')&&esTextoBytes(datos)){var cv=csvAFilas(new TextDecoder('utf-8').decode(datos.subarray(0,2000000)),200);ocPanTabla(b,cv.filas,cv.truncada);return}
 if(k==='zip'||k==='otro'&&!esTextoBytes(datos)){ocPanMsg('Este tipo de archivo no tiene vista previa. Usa Descargar para abrirlo en tu equipo.');return}
 var txt=new TextDecoder('utf-8').decode(datos.subarray(0,600000));
 if(k==='html'){
  if(ocPan.modo==='codigo'){ocPvCodigo(b,txt,'html');return}
  var base=z?nombre.split('/').slice(0,-1).join('/'):'',mapa=z?await ocZipMapa(z):{};if(tok!==ocPan.tok)return;
  var fr=document.createElement('iframe');fr.setAttribute('sandbox','allow-scripts');fr.setAttribute('referrerpolicy','no-referrer');fr.title='Vista previa de '+nombre;fr.srcdoc=ocHtmlDoc(htmlConRecursos(txt,base,mapa));b.appendChild(fr);return}
 if(k==='md'){var dm=document.createElement('div');dm.className='pv-md';ocMd(dm,txt);b.appendChild(dm);return}
 ocPvCodigo(b,txt,ext)}
function ocPanZipLista(z){var b=$('oc-pan-b'),sub=$('oc-pan-sub');ocPan.tok++;b.textContent='';sub.textContent='';sub.hidden=true;ocPanSoltar();
 var ul=document.createElement('ul');ul.className='pv-zip';
 z.ents.forEach(function(e){var li=document.createElement('li'),bt=document.createElement('button'),n=document.createElement('span'),t=document.createElement('span');bt.type='button';
  n.className='z-n';n.textContent=e.nombre;t.className='z-t';t.textContent=tamanoLegible(e.tam);bt.appendChild(n);bt.appendChild(t);
  bt.addEventListener('click',async function(){var tok=++ocPan.tok,d=await zipExtraer(z.datos,e,8*1024*1024);if(tok!==ocPan.tok)return;if(!d){ocPanMsg('No se pudo leer este archivo del .zip.');return}ocPan.modo='vista';ocPanContenido(e.nombre,d,tok,z)});
  li.appendChild(bt);ul.appendChild(li)});
 if(!z.ents.length){ocPanMsg('El .zip no tiene archivos que se puedan mostrar.');return}
 b.appendChild(ul)}
async function ocPanZip(a,d,tok){var zz=zipEntradas(d),ents=[];
 zz.entradas.forEach(function(e){if(e.dir)return;var r=rutaSegura(e.nombre);if(!r||clasificarRuta(r)==='ignorar')return;ents.push({nombre:r,metodo:e.metodo,comp:e.comp,tam:e.tam,offset:e.offset,cifrado:e.cifrado,dir:false})});
 if(tok!==ocPan.tok)return;ocPanZipLista({datos:d,ents:ents,mapa:null})}
async function ocPanDescargar(){var a=ocArch[ocPan.i];if(!a)return;var d=await ocArchDatos(a);if(d)ocDescargar(a.n.split('/').pop(),d,a.t||mimeArchivo(a.n))}
async function ocAgEstado(){try{var r=await fetch('/api/ia-estado');var j=await r.json();ocAgOk=!!(j&&j.agente)}catch(e){ocAgOk=false}ocAgSabe=true;ocAgUi()}
$('oc-adj').addEventListener('click',function(){$('oc-file').click()});
$('oc-file').addEventListener('change',function(){var fs=Array.prototype.slice.call($('oc-file').files||[]);$('oc-file').value='';ocAdjuntar(fs)});
$('oc-in').addEventListener('paste',function(e){var cd=e.clipboardData,fs=[];if(cd&&cd.files)for(var i=0;i<cd.files.length;i++)if(cd.files[i].type&&cd.files[i].type.indexOf('image/')===0)fs.push(cd.files[i]);if(fs.length){e.preventDefault();ocAdjuntar(fs)}});
var ocZona=$('oc-form').parentNode;
function ocHayArchivos(e){var d=e.dataTransfer;return !!d&&Array.prototype.indexOf.call(d.types||[],'Files')>=0}
ocZona.addEventListener('dragover',function(e){if(!ocHayArchivos(e))return;e.preventDefault();$('oc-form').firstElementChild.classList.add('arrastre')});
ocZona.addEventListener('dragleave',function(e){if(!e.relatedTarget||!ocZona.contains(e.relatedTarget))$('oc-form').firstElementChild.classList.remove('arrastre')});
ocZona.addEventListener('drop',function(e){if(!ocHayArchivos(e))return;e.preventDefault();$('oc-form').firstElementChild.classList.remove('arrastre');var d=e.dataTransfer;if(d&&d.files&&d.files.length)ocAdjuntar(Array.prototype.slice.call(d.files))});
$('oc-sw').addEventListener('click',function(){if(ocBusy)return;ocMcp=!ocMcp;ocPrefs();ocAgUi()});
$('oc-stop').addEventListener('click',ocDetener);
$('oc-pan-x').addEventListener('click',ocPanCerrar);
$('oc-arch-b').addEventListener('click',function(){if($('oc-pan').hidden)ocPanAbrir(0,$('oc-arch-b'));else ocPanCerrar()});
$('oc-pan-d').addEventListener('click',ocPanDescargar);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('oc-pan').hidden&&!document.querySelector('dialog[open]')){e.preventDefault();ocPanCerrar()}});
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
$('oc-chips').addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('button'):null;if(t)ocSend(t.getAttribute('data-q')||t.textContent)});
$('oc-barajar').addEventListener('click',function(){ocIdeas(true)});
$('oc-nueva').addEventListener('click',function(){if(ocBusy)return;ocLimpiar();ocRenderChats();$('oc-in').focus()});
var ocPf=ocRead(localStorage,'oc_prefs');if(ocPf&&typeof ocPf==='object'){ocMcp=ocPf.mcp!==false;if('ag' in ocPf||'agente' in ocPf)ocPrefs()}
$('oc-share').addEventListener('click',function(){var pu='';ocMsgs.forEach(function(m){if(!pu&&m.rol==='u')pu=m.texto});ocCompartir({id:ocChatId,titulo:tituloChat(pu),mensajes:ocMsgs.slice(),imgs:ocImgsDe()})});
$('oc-sh-x').addEventListener('click',ocShCerrar);
$('oc-sh').addEventListener('click',function(e){if(e.target===$('oc-sh'))ocShCerrar()});
$('oc-sh-crear').addEventListener('click',ocShCrear);
ocLoad();ocUi();ocSwitchText();ocAgEstado();ocIdeas(false);
ocCargarChats().then(function(){var m=/[?&]abrir=([A-Za-z0-9_-]+)/.exec(location.search);if(m){ocAbrir(m[1]);try{history.replaceState(null,'','/asistente')}catch(e){}}}).catch(function(){});
`;

/** Funciones puras + renderizador seguro compartidos por /asistente y /c/:id. */
export const demoComun = nombres + "\n" + appComun;
// Banco de sugerencias de la pantalla inicial y su selección al azar (src/lib/sugerencias.ts).
const icoSug: Record<string, string> = {
  xlsx: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/><path d="M5 11V8.5M8 11V6M11 11V4.5"/></svg>`,
  docx: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 1.8h5.2L12.5 5v9.2H4z"/><path d="M9 1.8V5h3.5M6 8h4.5M6 10.5h4.5"/></svg>`,
  pdf: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 1.8h5.2L12.5 5v9.2H4z"/><path d="M9 1.8V5h3.5M6 11.5l1.6-2 1.3 1.2 1.6-2.2"/></svg>`,
  pptx: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.8" y="2.5" width="12.4" height="8.5" rx="1.2"/><path d="M8 11v2.5M5.5 13.5h5M6.5 5.2v3.6L9.6 7z"/></svg>`,
  rapida: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 1.8 3.5 9h4L7 14.2 12.5 7h-4z"/></svg>`,
};
const sugerenciasJs = [mezclarSugerencias, elegirSugerencias].map((f) => f.toString()).join("\n") +
  "\nvar OC_SUG=" + JSON.stringify(SUGERENCIAS) + ";\nvar OC_SUG_ET=" + JSON.stringify(ETIQUETAS_SUGERENCIA) + ";\nvar OC_SUG_IC=" + JSON.stringify(icoSug) + ";\n" + String.raw`
var ocSugVistas=[];
function ocIdeas(animar){var c=$('oc-chips');if(!c)return;
 var n=window.matchMedia&&window.matchMedia('(max-width:860px)').matches?3:4;
 var el=elegirSugerencias(OC_SUG,n,Math.random,ocSugVistas);ocSugVistas=el.map(function(s){return s.texto});
 var pinta=function(){c.textContent='';el.forEach(function(s){var b=document.createElement('button');b.type='button';b.setAttribute('data-t',s.t);b.setAttribute('data-q',s.texto);
  var e=document.createElement('span');e.className='sg-e';e.innerHTML=OC_SUG_IC[s.t]||'';e.appendChild(document.createTextNode(OC_SUG_ET[s.t]||''));
  var q=document.createElement('span');q.className='sg-q';q.textContent=s.texto;b.appendChild(e);b.appendChild(q);c.appendChild(b)});c.classList.remove('sale')};
 var bb=$('oc-barajar');if(animar&&bb){bb.classList.toggle('gira')}
 if(animar&&c.children.length&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches)){c.classList.add('sale');setTimeout(pinta,170)}else pinta()}
`;

export const demoScript = demoComun + "\n" + sugerenciasJs + "\n" + app;
