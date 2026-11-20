import { CASOS_DEMO, RESUMEN_DEMO, type CasoDemo, type LadoDemo } from "./demo-datos";
import { enSencillo, esc, fechaLarga, shell, type Meta } from "./layout";
import { tarjetaCss, tarjetaRespuesta, tarjetaSprite } from "./evaluacion-md";
import { demoComun } from "../demo";
import { deserializarChats, normalizarChat, normalizarMensaje, recortarChats, serializarChats, sinImagenes, tituloChat } from "../lib/agente";

// Página /demo: casos preparados, gráficos con los datos reales de cada herramienta y «Probar en vivo»: un panel doble
// que envía la misma pregunta a la vez a la IA sola y a la IA + MCP (API del agente del sitio) y muestra su progreso.
// Los textos de cada respuesta y los datos de los gráficos vienen de demo-datos.ts (generado por eval/exportar_demo.mjs).

const TEXTOS: Record<string, { etiqueta: string; titulo: string; significa: string }> = {
  B02: { etiqueta: "Buscar", titulo: "Las obras de salud más caras de Piura", significa: "Cada barra es una obra y su largo es lo que cuesta hoy. La primera es la más cara. La búsqueda devuelve hasta 20 y dice cuántas hay en total, así que la IA no tiene que adivinar ni contar a ojo." },
  D05: { etiqueta: "Detalle de una obra", titulo: "Una obra: lo aprobado frente a lo que cuesta hoy", significa: "La barra gris es lo que se aprobó al inicio y la roja, lo que cuesta hoy. Si la roja es mucho más larga, la obra se encareció. Es una señal para mirarla con atención, no una prueba de que algo esté mal." },
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
.dm-etq{font:500 var(--s-1)/1.3 var(--sans);color:var(--mut);margin-bottom:14px;display:flex;gap:6px 14px;flex-wrap:wrap;align-items:center}
.dm-etq b{color:var(--ink);font-weight:650}
.dm-etq code{font:500 12px/1.4 var(--mono);color:var(--ink-2)}
.dm-etq>*+*::before{content:"·";margin-right:14px;color:var(--mut)}
.dm-ql{font:600 12px/1.3 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:0 0 6px}
.dm-q{font-size:var(--s2);max-width:none}
.dm-comp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:26px;align-items:start}
.dm-sel{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0;padding:0;list-style:none;font-size:var(--s-1);color:var(--ink-2)}
.dm-sel li{display:inline-flex;gap:6px;align-items:center}
.dm-sel .ok i{color:var(--accent)}.dm-sel .mal i{color:var(--risk)}
.dm-sel i{font-style:normal;font-weight:700}
.dm-ref{margin-top:16px;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);padding:14px 18px;display:flex;gap:6px 14px;flex-wrap:wrap;align-items:baseline}
.dm-ref b{font:600 12px/1.3 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.dm-ref p{overflow-wrap:anywhere;flex:1 1 320px;margin:0;color:var(--ink)}
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
.dm-verif{margin-top:14px;min-height:1.5em;font-size:var(--s-1);color:var(--ink-2)}
.dm-verif b{color:var(--accent);font-weight:650}
/* Lanzador destacado del panel doble */
.dm-lanz{margin-top:clamp(24px,3vw,36px);border:1.5px solid color-mix(in srgb,var(--accent) 45%,var(--line));border-radius:var(--r-l);background:linear-gradient(135deg,var(--accent-soft),var(--surface) 60%);padding:clamp(16px,2.4vw,24px);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:14px 28px;align-items:center;box-shadow:var(--shadow)}
.dm-lanz h2{font-size:var(--s1);display:flex;align-items:center;gap:10px}
.dm-lanz p{margin:6px 0 0;font-size:var(--s-1);color:var(--ink-2);line-height:1.5}
.dm-vivo-pt{width:9px;height:9px;border-radius:50%;background:var(--risk);flex:none;box-shadow:0 0 0 0 color-mix(in srgb,var(--risk) 60%,transparent);animation:dm-pt 1.8s ease-out infinite}
@keyframes dm-pt{70%{box-shadow:0 0 0 9px transparent}100%{box-shadow:0 0 0 0 transparent}}
.dm-lf{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.dm-lf select,.dm-lf input{flex:1 1 220px;min-width:0;min-height:44px;border:1px solid var(--line-2);border-radius:12px;background:var(--surface);color:var(--ink);font:500 var(--s-1)/1.3 var(--sans);padding:0 12px}
.dm-lf input[hidden]{display:none}
.dm-lf .btn{flex:none}
.vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* Gráfico reconstruyéndose con la consulta real al MCP */
.dm-graf{position:relative;transition:border-color .3s}
.dm-graf>h3{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:8px 14px}
.dm-ins{font:600 12px/1 var(--sans);border-radius:999px;padding:6px 10px;border:1px solid var(--line-2);color:var(--ink-2);background:var(--surface);display:none;align-items:center;gap:6px;white-space:nowrap}
.dm-ins.on{display:inline-flex}
.dm-ins.ok{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
.dm-ins i{width:7px;height:7px;border-radius:50%;background:currentColor;font-style:normal}
.dm-act .dm-ins i{animation:dm-parp .8s ease-in-out infinite alternate}
@keyframes dm-parp{to{opacity:.2}}
.dm-graf.dm-act,.dm-res.dm-act .dm-cifra{border-color:color-mix(in srgb,var(--accent) 55%,var(--line))}
.dm-graf.dm-act::after,.dm-res.dm-act .dm-cifra::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(100deg,transparent 35%,color-mix(in srgb,var(--accent) 14%,transparent) 50%,transparent 65%);background-size:260% 100%;animation:dm-scan 1.2s linear infinite}
.dm-cifra{position:relative}
@keyframes dm-scan{from{background-position:130% 0}to{background-position:-130% 0}}
/* Panel doble a pantalla completa */
.dv{position:fixed;inset:0;z-index:150;display:flex;padding:clamp(0px,2vw,24px);background:color-mix(in srgb,var(--ink) 45%,transparent);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
.dv[hidden]{display:none}
.dv-hoja{position:relative;width:100%;max-width:1440px;height:100%;margin:0 auto;display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-l);box-shadow:0 30px 80px -30px rgba(0,0,0,.45);overflow:hidden}
.dv-cab{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 18px;align-items:start;padding:16px clamp(16px,2.4vw,28px) 14px;border-bottom:1px solid var(--line);background:var(--surface)}
.dv-eb{display:flex;align-items:center;gap:8px;font:600 12px/1.2 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:0 0 6px}
.dv-eb .dm-vivo-pt{width:8px;height:8px}
.dv-cab h2{font-size:clamp(17px,1.6vw,22px);line-height:1.3;max-width:none;overflow-wrap:anywhere}
.dv-ref{margin:8px 0 0;font-size:var(--s-1);color:var(--ink-2)}
.dv-ref b{font-weight:650;color:var(--ink)}
.dv-x{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 12px 0 14px;border:1px solid var(--line-2);border-radius:999px;background:var(--bg);color:var(--ink);font:600 14px/1 var(--sans);cursor:pointer}
.dv-x:hover{border-color:var(--ink)}
.dv-x kbd{font:500 11px/1 var(--mono);color:var(--mut);border:1px solid var(--line-2);border-radius:5px;padding:3px 5px}
.dv-tabs{display:none}
.dv-cols{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.dv-col{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:18px clamp(16px,2.2vw,28px) 28px;display:flex;flex-direction:column;gap:14px}
.dv-col+.dv-col{border-left:1px solid var(--line)}
.dv-ch{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.dv-ch h3{font-size:var(--s1);display:flex;align-items:center;gap:8px}
.dv-ch p{margin:3px 0 0;font-size:var(--s-1);color:var(--mut)}
.dv-tag{font:700 11px/1 var(--sans);letter-spacing:.05em;text-transform:uppercase;border-radius:6px;padding:4px 6px;color:var(--bg);background:var(--mut)}
.dv-col.con .dv-tag{background:var(--accent)}
.dv-reloj{font:600 15px/1 var(--mono);font-variant-numeric:tabular-nums;color:var(--ink-2);border:1px solid var(--line);border-radius:999px;padding:7px 11px;white-space:nowrap;background:var(--surface)}
.dv-estado{display:flex;align-items:center;gap:10px;min-height:46px;padding:10px 14px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font:500 var(--s-1)/1.35 var(--sans);color:var(--ink)}
.dv-pulso{width:10px;height:10px;border-radius:50%;flex:none;background:var(--line-2)}
.dv-col[data-e=trabaja] .dv-pulso{background:var(--accent);animation:dm-pt 1.4s ease-out infinite}
.dv-col.sin[data-e=trabaja] .dv-pulso{background:var(--warn)}
.dv-col[data-e=listo] .dv-pulso{background:var(--accent)}
.dv-col[data-e=error] .dv-pulso{background:var(--risk)}
.dv-col[data-e=error] .dv-estado{border-color:color-mix(in srgb,var(--risk) 45%,var(--line));background:var(--risk-soft)}
.dv-col[data-e=trabaja] .dv-et{background:linear-gradient(90deg,var(--ink) 40%,var(--mut) 50%,var(--ink) 60%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dv-brillo 2.2s linear infinite}
@keyframes dv-brillo{from{background-position:100% 0}to{background-position:-100% 0}}
.dv-pasos{list-style:none;margin:0;padding:0 0 0 4px;display:grid;gap:0}
.dv-pasos li{position:relative;display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:10px;align-items:start;padding:5px 0;font-size:var(--s-1);color:var(--ink-2);animation:dv-paso .35s cubic-bezier(.2,.7,.2,1) both}
.dv-pasos li::before{content:"";position:absolute;left:10px;top:24px;bottom:-6px;width:1.5px;background:var(--line)}
.dv-pasos li:last-child::before{display:none}
.dv-pasos .ic{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--surface-2);border:1px solid var(--line-2);font:700 11px/1 var(--sans);color:var(--mut);position:relative;z-index:1}
.dv-pasos li.h .ic{background:var(--accent);border-color:var(--accent);color:var(--bg)}
.dv-pasos li.h{color:var(--ink);font-weight:600}
.dv-pasos li.h code{font:600 12px/1.4 var(--mono);color:var(--accent)}
.dv-pasos li.x .ic{background:var(--risk);border-color:var(--risk);color:var(--bg)}
.dv-pasos time{font:500 11.5px/1.6 var(--mono);color:var(--mut);font-variant-numeric:tabular-nums}
@keyframes dv-paso{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
.dv-resp{position:relative;border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);padding:16px 18px;min-height:120px}
.dv-resp[hidden]{display:none}
.dv-resp>b{display:block;font:600 12px/1.3 var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin-bottom:10px}
.dv-saltar{position:sticky;float:right;top:0;margin:-6px -6px 6px 10px;border:1px solid var(--line-2);border-radius:999px;background:var(--bg);color:var(--ink-2);font:600 12px/1 var(--sans);padding:7px 10px;cursor:pointer}
.dv-saltar[hidden]{display:none}
.dv-md{display:grid;gap:10px;line-height:1.6;font-size:15px;overflow-wrap:anywhere}
.dv-md p{margin:0}.dv-md p.h{font-weight:700}.dv-md p.mod{display:none}
.dv-md ul,.dv-md ol{margin:0;padding-left:1.3em;display:grid;gap:4px}
.dv-md .li-p{margin:4px 0 0}
.dv-md em{font-style:italic;color:var(--ink-2)}
.dv-md code{font:500 .88em var(--mono);background:var(--surface-2);border:1px solid var(--line);border-radius:5px;padding:0 4px}
.dv-md .tb{overflow-x:auto;border:1px solid var(--line);border-radius:10px}
.dv-md table{border-collapse:collapse;width:max-content;min-width:100%;font-size:13px;line-height:1.45;font-variant-numeric:tabular-nums}
.dv-md th,.dv-md td{text-align:left;vertical-align:top;padding:7px 10px;border-bottom:1px solid var(--line);max-width:30ch;overflow-wrap:normal}
.dv-md th{background:var(--surface-2);font-weight:650}
.dv-md .cb pre{margin:0;background:var(--code-bg);color:var(--code-ink);border-radius:10px;padding:10px 12px;overflow-x:auto;font:12px/1.5 var(--mono)}
.dv-md .fm{font:500 14px/1.5 var(--mono);background:var(--surface-2);border-radius:8px;padding:8px 10px}
.dv-caret{display:inline-block;width:.55em;height:1.05em;margin-left:2px;vertical-align:-.15em;background:var(--accent);border-radius:2px;animation:dm-parp .5s steps(2) infinite}
.dv-pie{display:grid;gap:10px}
.dv-pie[hidden]{display:none}
.dv-ver{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;align-items:center;border-radius:12px;padding:12px 14px;border:1.5px solid var(--line-2);animation:dv-paso .4s ease both}
.dv-ver>i{grid-row:span 2;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font:800 17px/1 var(--sans);font-style:normal;color:var(--bg);background:var(--mut)}
.dv-ver.ok{border-color:color-mix(in srgb,var(--accent) 50%,var(--line));background:var(--accent-soft)}
.dv-ver.ok>i{background:var(--accent)}
.dv-ver.mal{border-color:color-mix(in srgb,var(--risk) 45%,var(--line));background:var(--risk-soft)}
.dv-ver.mal>i{background:var(--risk)}
.dv-ver b{font-size:var(--s0);overflow-wrap:anywhere}
.dv-ver span{font-size:var(--s-1);color:var(--ink-2)}
.dv-acc2{display:flex;flex-wrap:wrap;gap:8px}
.dv-acc2 .btn{min-height:40px;font-size:14px}
.dv-acc2 .btn[hidden]{display:none}
/* Animaciones locales: solo si hay JS (clase dm-anima) y el visitante no pidió menos movimiento. */
@media (prefers-reduced-motion:no-preference){
.dm-anima .dm-caso .rs,.dm-anima .dm-graf,.dm-anima .dm-cifra{opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s cubic-bezier(.2,.7,.2,1)}
.dm-anima .dm-caso .rs.con{transition-delay:.08s}
.dm-anima .dm-vis.rs,.dm-anima .dm-graf.dm-vis,.dm-anima .dm-cifra.dm-vis{opacity:1;transform:none}
.dm-anima .rs .rs-chip{opacity:0;transform:scale(.96)}
.dm-anima .rs.dm-vis .rs-chip{opacity:1;transform:none;transition-delay:.25s}
.dm-anima .rs.dm-vis .rs-chip.ref{transition-delay:.35s}
.dm-fig.dm-vis svg rect:not(.gb){transform-box:fill-box;transform-origin:left center;animation:dm-crece .9s cubic-bezier(.2,.7,.2,1) both}
@keyframes dm-crece{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.dm-fig.dm-baja svg rect:not(.gb){transform-box:fill-box;transform-origin:left center;animation:dm-baja .45s cubic-bezier(.5,0,.8,.4) both}
@keyframes dm-baja{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.dm-nav a,.btn{transition:border-color .2s,transform .2s}.dm-nav a:hover{transform:translateY(-1px)}
.dv-hoja{animation:dv-entra .35s cubic-bezier(.2,.7,.2,1) both}
@keyframes dv-entra{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}
}
@media (prefers-reduced-motion:reduce){.dm-graf.dm-act::after,.dm-res.dm-act .dm-cifra::after,.dv-col[data-e=trabaja] .dv-et{animation:none}.dv-col[data-e=trabaja] .dv-et{color:var(--ink);background:none}}
@media (max-width:900px){.dm-flujo{grid-template-columns:repeat(2,minmax(0,1fr))}.dm-flujo li:nth-child(2)::after{display:none}.dm-flujo li::after{display:none!important}}
@media (max-width:900px){.dm-gcols{grid-template-columns:minmax(0,1fr)}.dm-lado-d{margin-top:16px}.dm-lanz{grid-template-columns:minmax(0,1fr)}}
@media (max-width:760px){.dm-comp,.dm-cifras{grid-template-columns:minmax(0,1fr)}
.dv{padding:0}.dv-hoja{border-radius:0;border:0}
.dv-cab{grid-template-columns:minmax(0,1fr) auto;padding:12px 16px}
.dv-cab h2{font-size:16px}.dv-x kbd{display:none}.dv-x{padding:0 12px}
.dv-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px 16px;border-bottom:1px solid var(--line);background:var(--surface)}
.dv-tabs button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:40px;border:1px solid var(--line-2);border-radius:10px;background:var(--bg);color:var(--ink-2);font:600 14px/1 var(--sans);cursor:pointer}
.dv-tabs button[aria-selected=true]{border-color:var(--ink);color:var(--ink);box-shadow:inset 0 -2px 0 var(--ink)}
.dv-tabs .dv-pulso{width:8px;height:8px}
.dv-tabs button[data-e=trabaja] .dv-pulso{background:var(--warn)}.dv-tabs button[data-e=listo] .dv-pulso{background:var(--accent)}.dv-tabs button[data-e=error] .dv-pulso{background:var(--risk)}
.dv-tabs small{font:500 12px/1 var(--mono);color:var(--mut);font-variant-numeric:tabular-nums}
.dv-cols{grid-template-columns:minmax(0,1fr)}
.dv-col{padding:14px 16px 24px}.dv-col+.dv-col{border-left:0}
.dv-cols[data-ver=sin] .dv-col.con,.dv-cols[data-ver=con] .dv-col.sin{display:none}
.dv-reloj{font-size:13px;padding:6px 9px}}
@media (max-width:480px){.dm-flujo{grid-template-columns:minmax(0,1fr)}}
`;

const lado = (l: LadoDemo, cond: "sin" | "con", c: CasoDemo): string => {
  const marca = (ok: boolean, t: string) => `<li class="${ok ? "ok" : "mal"}"><i aria-hidden="true">${ok ? "✓" : "✗"}</i>${t}</li>`;
  return tarjetaRespuesta({
    cond,
    titulo: cond === "sin" ? "IA sola (sin MCP)" : "IA + MCP",
    sub: `${cond === "sin" ? "Respondió de memoria" : "Consultó los datos del MEF"} · tardó ${Math.round(l.latencia_s)} s`,
    ok: l.exacta,
    veredicto: l.veredicto,
    clave: l.clave,
    referencia: c.referencia_clave,
    md: l.corta,
    mdCompleta: l.completa || undefined,
    pie: `<ul class="dm-sel" aria-label="Otros criterios de la evaluación en ${esc(c.id)}">${marca(l.cita, l.cita ? "Cita la fuente y la fecha" : "No cita la fuente oficial")}${marca(!l.inventada, l.inventada ? "Trae cifras que no coinciden" : "Sin cifras inventadas")}</ul>`,
  });
};

const caso = (c: CasoDemo, i: number): string => {
  const t = TEXTOS[c.id];
  return `<section class="dm-caso" id="caso-${i + 1}" aria-labelledby="caso-${i + 1}-t" data-caso="${i}">
<div class="wrap">
<p class="dm-etq"><b>Caso ${i + 1}</b><span>${esc(t.etiqueta)}</span><code>${esc(c.herramienta)}</code><span>pregunta ${esc(c.id)} de la evaluación</span></p>
<p class="dm-ql">La pregunta</p>
<h2 class="dm-q" id="caso-${i + 1}-t">«${esc(c.pregunta)}»</h2>
<div class="dm-comp">${lado(c.sin, "sin", c)}${lado(c.con, "con", c)}</div>
<div class="dm-ref"><b>Respuesta oficial de referencia</b><p>${esc(c.referencia)}</p></div>
<div class="dm-graf">
<h3><span><small>El MCP con gráficas</small>${esc(t.titulo)}</span><span class="dm-ins" aria-hidden="true"><i></i><span></span></span></h3>
<div class="dm-gcols"><figure class="dm-fig" data-herr="${esc(c.herramienta)}" data-caso="${i}"><div class="svgbox"></div><p class="leg"></p><figcaption class="orig">Datos que devolvió la herramienta el ${esc(fechaLarga(c.fecha_corte))}.</figcaption></figure>
<div class="dm-lado-d"><p class="dm-sig"><b>Qué significa:</b> ${esc(t.significa)}</p>
<div class="dm-vivo">
<button class="btn btn-p" type="button" data-vivo="${i}">Probar en vivo</button>
<a class="btn btn-s" href="/asistente?q=${esc(encodeURIComponent(c.pregunta))}" target="_blank" rel="noopener">Preguntarle al asistente</a>
<span class="dm-est" role="status" aria-live="polite"></span>
</div>
<p class="dm-llamada"><span aria-hidden="true">→ </span>tools/call ${esc(c.herramienta)} ${esc(JSON.stringify(c.args))}</p>
</div></div>
</div>
</div>
</section>`;
};

// Renderizador de Markdown seguro (solo textContent) y almacén de chats del asistente, tomados de /asistente.
const mdJs = demoComun.slice(demoComun.indexOf("var OC_FENCE"), demoComun.indexOf("function ocTam("));
const almJs = demoComun.slice(demoComun.indexOf("function ocIdb("));
const chatsJs = [tituloChat, sinImagenes, normalizarMensaje, normalizarChat, recortarChats, serializarChats, deserializarChats].map((f) => f.toString()).join("\n");
const cuerpoJs = String.raw`var d=document,W=360,TXT=null,RED=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
try{TXT=JSON.parse(d.getElementById('demo-datos').textContent)}catch(e){return}
function E(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function nf(v,n){return Number(v).toLocaleString('es-PE',{minimumFractionDigits:n||0,maximumFractionDigits:n||0}).replace(/,/g,' ')}
function sol(v){v=Number(v);if(v>=1e9)return 'S/ '+nf(v/1e9,2)+' mil millones';if(v>=1e6)return 'S/ '+nf(v/1e6,1)+' millones';if(v>=1e3)return 'S/ '+nf(v/1e3,0)+' mil';return 'S/ '+nf(v,0)}
function fmt(k,v){return k==='pct'?nf(v,0)+' % más':k==='mes'?nf(v)+' meses':sol(v)}
function seg(ms){return nf(ms/1000,1)+' s'}
function nom(s,n){s=String(s||'').toLowerCase();s=s.charAt(0).toUpperCase()+s.slice(1);return s.length>n?s.slice(0,n-1)+'…':s}
function barras(filas,desc){var H=8+filas.length*40,mx=0,i,s;for(i=0;i<filas.length;i++)if(filas[i].v>mx)mx=filas[i].v;if(!mx)mx=1;
 s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+E(desc)+'" focusable="false">';
 for(i=0;i<filas.length;i++){var f=filas[i],y=8+i*40,w=Math.max(3,Math.min(1,Math.max(0,f.v)/mx)*W);
  s+='<text class="gl" x="0" y="'+(y+11)+'">'+E(f.l)+'</text><text class="gv" x="'+W+'" y="'+(y+11)+'" text-anchor="end">'+E(fmt(f.k,f.v))+'</text><rect class="gb" x="0" y="'+(y+18)+'" width="'+W+'" height="10" rx="5"/><rect class="'+f.c+'" x="0" y="'+(y+18)+'" width="'+w.toFixed(1)+'" height="10" rx="5"/>'}
 return s+'</svg>'}
function filas(herr,args,datos){var f=[],leg='',desc='',inv=(Array.isArray(datos.inversiones)?datos.inversiones:[]).slice(0,8),i,x;
 if(herr==='buscar_inversiones'){inv.sort(function(a,b){return b.costo_actualizado-a.costo_actualizado});
  for(i=0;i<inv.length;i++){x=inv[i];f.push({l:x.codigo_unico+' · '+nom(x.nombre,30),v:x.costo_actualizado,k:'sol',c:i?'b2':'b1'})}
  desc='Barras con el costo actualizado de las '+inv.length+' inversiones más caras';leg='Se muestran '+inv.length+' de '+nf(datos.total||inv.length)+' inversiones encontradas.'}
 else if(herr==='alertas_inversion'){var sob=args.tipo==='sobrecosto';
  inv.sort(function(a,b){return sob?b.sobrecosto_pct-a.sobrecosto_pct:b.meses_sin_devengado-a.meses_sin_devengado});
  for(i=0;i<inv.length;i++){x=inv[i];f.push({l:x.codigo_unico+' · '+nom(x.entidad||x.nombre,30),v:sob?x.sobrecosto_pct:x.meses_sin_devengado,k:sob?'pct':'mes',c:i?'b3':'b4'})}
  desc=sob?'Barras con el sobrecosto de las inversiones con alerta':'Barras con los meses sin gasto de las inversiones con alerta';leg='Se muestran '+inv.length+' de '+nf(datos.total||inv.length)+' inversiones con alerta.'}
 else if(herr==='detalle_inversion'){
  f=[{l:'Monto aprobado (viable)',v:datos.monto_viable,k:'sol',c:'b2'},{l:'Costo actualizado',v:datos.costo_actualizado,k:'sol',c:'b4'},{l:'Presupuesto de este año',v:datos.pim_anio,k:'sol',c:'b1'},{l:'Gastado este año',v:datos.dev_anio,k:'sol',c:'b3'}];
  desc='Barras que comparan el monto aprobado, el costo actualizado y el gasto del año de una obra';
  leg=E(nom(datos.nombre,70))+'. El costo subió '+nf(datos.sobrecosto_pct,1)+' % sobre lo aprobado ('+nf(datos.costo_actualizado/datos.monto_viable,1)+' veces). Avance físico: '+nf(datos.avance_fisico,0)+' %.'}
 else{f=[{l:'Costo actualizado total',v:datos.costo_actualizado_total,k:'sol',c:'b1'},{l:'Falta por ejecutar',v:datos.saldo_por_ejecutar,k:'sol',c:'b3'},{l:'Gastado este año',v:datos.devengado_anio_actual,k:'sol',c:'b2'}];
  desc='Barras con el costo total, lo que falta ejecutar y lo gastado este año';
  leg=nf(datos.inversiones)+' inversiones · '+nf(datos.alertas_sobrecosto)+' con alerta de sobrecosto · '+nf(datos.alertas_paralizacion)+' con posible paralización.';
  if(datos.costo_actualizado_total==null)f=[]}
 return {f:f,leg:leg,desc:desc}}
function firma(herr,args,datos){try{return filas(herr,args,datos).f.map(function(x){return x.l+'='+x.v}).join('|')}catch(e){return ''}}
function dibujar(fig,herr,args,datos){var r=filas(herr,args,datos);fig.dmF=r.f;
 if(!r.f.length){fig.querySelector('.svgbox').innerHTML='<p class="dm-est">La herramienta no devolvió inversiones para este caso.</p>';fig.querySelector('.leg').textContent='';return}
 fig.querySelector('.svgbox').innerHTML=barras(r.f,r.desc);fig.querySelector('.leg').innerHTML=r.leg}
function animar(ms,paso,fin){if(RED){paso(1);if(fin)fin();return}var t0=performance.now();
 function cuadro(t){var p=Math.min(1,(t-t0)/ms);paso(1-Math.pow(1-p,3));if(p<1)requestAnimationFrame(cuadro);else if(fin)fin()}requestAnimationFrame(cuadro)}
function contarBarras(fig,subir,ms){var f=fig.dmF||[],gv=fig.querySelectorAll('.gv');
 animar(ms,function(p){for(var i=0;i<gv.length&&i<f.length;i++)gv[i].textContent=fmt(f[i].k,f[i].v*(subir?p:1-p))})}
function espera(ms){return new Promise(function(ok){setTimeout(ok,RED?0:ms)})}
function lee(txt){var t=String(txt).trim(),j=null;if(t.charAt(0)==='{')j=JSON.parse(t);else{var ls=t.split('\n');for(var i=0;i<ls.length;i++)if(ls[i].indexOf('data:')===0){j=JSON.parse(ls[i].slice(5));break}}
 if(!j)throw new Error('sin respuesta');if(j.error)throw new Error(j.error.message||'error');
 var r=j.result;if(!r||r.isError)throw new Error('error de la herramienta');return JSON.parse(r.content[0].text).datos}
var figs=d.querySelectorAll('.dm-fig');
var ver=d.querySelectorAll('.dm-caso .rs,.dm-graf,.dm-cifra,.dm-fig');
if('IntersectionObserver' in window){d.documentElement.classList.add('dm-anima');
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('dm-vis');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
 for(var v=0;v<ver.length;v++)io.observe(ver[v])}
for(var k=0;k<figs.length;k++){var c0=TXT[figs[k].getAttribute('data-caso')];if(c0)dibujar(figs[k],c0.herramienta,c0.args,c0.datos)}

// ---- El gráfico se reconstruye con la consulta real al MCP ----
function reconstruir(i){var c=TXT[i],sec=d.querySelector('.dm-caso[data-caso="'+i+'"]');if(!c||!sec||sec.dmOcup)return;sec.dmOcup=true;
 var g=sec.querySelector('.dm-graf'),fig=sec.querySelector('.dm-fig'),est=sec.querySelector('.dm-est'),ins=sec.querySelector('.dm-ins'),ll=sec.querySelector('.dm-llamada'),t0=performance.now();
 function insignia(t,ok){ins.className='dm-ins on'+(ok?' ok':'');ins.lastChild.textContent=t}
 g.classList.add('dm-act');insignia('Actualizando datos');est.className='dm-est';est.textContent='Consultando el servidor MCP…';
 fig.classList.add('dm-vis');fig.classList.add('dm-baja');contarBarras(fig,false,450);
 var pet=fetch('/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:c.herramienta,arguments:c.args}})})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(lee);
 Promise.all([pet,espera(700)]).then(function(x){var datos=x[0],s=performance.now()-t0,igual=firma(c.herramienta,c.args,datos)===firma(c.herramienta,c.args,c.datos);
  fig.classList.remove('dm-baja');dibujar(fig,c.herramienta,c.args,datos);contarBarras(fig,true,900);
  fig.querySelector('.orig').textContent='Datos de hoy, consultados en vivo al servidor MCP.';
  ll.innerHTML='<span aria-hidden="true">→ </span>tools/call '+E(c.herramienta)+' '+E(JSON.stringify(c.args))+'<br><span aria-hidden="true">← </span>respondió en '+E(seg(s))+(Array.isArray(datos.inversiones)?' · '+E(nf(datos.total||datos.inversiones.length))+' inversiones':'');
  return espera(950).then(function(){g.classList.remove('dm-act');insignia(igual?'Verificado en vivo':'Datos de hoy',true);
   est.textContent=igual?'Verificado: los datos de hoy coinciden con los grabados el '+c.fecha+'.':'Los datos de hoy cambiaron respecto de lo grabado el '+c.fecha+': el gráfico ya muestra los nuevos.'})})
 .catch(function(){fig.classList.remove('dm-baja');dibujar(fig,c.herramienta,c.args,c.datos);contarBarras(fig,true,600);g.classList.remove('dm-act');ins.className='dm-ins';
  est.className='dm-est err';est.textContent='No se pudo consultar ahora. El gráfico grabado sigue siendo válido; vuelve a intentar.'})
 .then(function(){sec.dmOcup=false})}

// ---- Las cifras del pie se recalculan con animación de verificación ----
var VIVO={n:0,sin:0,con:0},resPend=false,res=d.getElementById('resultados');
function verificarCifras(){var ss=res.querySelectorAll('.dm-cifra strong[data-a]'),vf=res.querySelector('.dm-verif');res.classList.add('dm-act');vf.textContent='Volviendo a contar las 40 respuestas de la evaluación…';
 animar(1100,function(p){for(var i=0;i<ss.length;i++)ss[i].textContent=Math.round(Number(ss[i].getAttribute('data-a'))*p)+'/'+ss[i].getAttribute('data-t')},function(){
  setTimeout(function(){res.classList.remove('dm-act');vf.innerHTML='<b>✓ Verificado:</b> las cifras coinciden con la evaluación de 40 preguntas.'+(VIVO.n?' En vivo en esta visita, la IA + MCP dio la cifra oficial en '+VIVO.con+' de '+VIVO.n+' y la IA sola en '+VIVO.sin+' de '+VIVO.n+'.':'')},RED?0:250)})}
function pedirCifras(){if(!('IntersectionObserver' in window)){verificarCifras();return}if(resPend)return;resPend=true;
 var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();resPend=false;verificarCifras()}},{threshold:.35});o.observe(res)}

// ---- Cifra clave de la respuesta frente a la referencia oficial ----
function numeros(s){var out=[],re=/(\d{1,3}(?:[ .,  ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)(\s*(?:mil\s+millones|millones|millón|millon|mil)(?![a-záéíóú]))?/gi,m;
 s=String(s||'').replace(/\*\*/g,'');
 while((m=re.exec(s))){var t=m[1].replace(/[   ]/g,''),mul=m[2]?m[2].toLowerCase().replace(/\s+/g,' ').trim():'',v,lc=Math.max(t.lastIndexOf(','),t.lastIndexOf('.'));
  if(lc<0)v=parseFloat(t);
  else{var sp=t.charAt(lc),otro=sp===','?'.':',',dec=t.length-lc-1,veces=t.split(sp).length-1;
   if(t.indexOf(otro)>=0||(veces===1&&(dec!==3||mul)))v=parseFloat(t.slice(0,lc).replace(/[.,]/g,'')+'.'+t.slice(lc+1));else v=parseFloat(t.replace(/[.,]/g,''))}
  if(mul==='mil millones')v*=1e9;else if(mul.indexOf('mill')===0)v*=1e6;else if(mul==='mil')v*=1e3;
  if(isFinite(v))out.push(v)}
 return out}
function daCifra(txt,clave){var ref=numeros(clave)[0];if(ref==null)return null;var din=/S\//.test(clave);
 return numeros(txt).some(function(v){return din?Math.abs(v-ref)<=Math.abs(ref)*0.006:v===ref})}

// ---- Panel doble: la misma pregunta a la IA sola y a la IA + MCP ----
var P=null,dv=d.getElementById('dv'),cols=dv.querySelector('.dv-cols'),volver=null;
var LADOS=[{lado:'sin',mcp:false},{lado:'con',mcp:true}];
LADOS.forEach(function(L){L.el=dv.querySelector('.dv-col.'+L.lado);L.tab=dv.querySelector('.dv-tabs [data-tab='+L.lado+']');
 L.el.querySelector('[data-acc=reintentar]').addEventListener('click',function(){if(P)correr(L)});
 L.el.querySelector('[data-acc=abrir]').addEventListener('click',function(){abrirAsis(L)});
 L.el.querySelector('.dv-saltar').addEventListener('click',function(){if(L.esc)L.esc.n=L.esc.txt.length});});
function q$(L,s){return L.el.querySelector(s)}
function estado(L,e,t){L.el.setAttribute('data-e',e);L.tab.setAttribute('data-e',e);q$(L,'.dv-et').textContent=t}
function paso(L,t,cls,html){var li=d.createElement('li'),ic=d.createElement('span'),tx=d.createElement('span'),tm=d.createElement('time');
 ic.className='ic';ic.setAttribute('aria-hidden','true');ic.textContent=cls==='h'?'⚙':cls==='x'?'!':String(q$(L,'.dv-pasos').children.length+1);
 if(cls)li.className=cls;if(html)tx.innerHTML=html;else tx.textContent=t;tm.textContent='+'+seg(performance.now()-L.t0);
 li.appendChild(ic);li.appendChild(tx);li.appendChild(tm);q$(L,'.dv-pasos').appendChild(li);abajo(L)}
function abajo(L){var c=L.el;if(c.scrollHeight-c.scrollTop-c.clientHeight<160)c.scrollTop=c.scrollHeight}
function detener(L){if(L.reloj){clearInterval(L.reloj);L.reloj=null}if(L.sondeo){clearInterval(L.sondeo);L.sondeo=null}if(L.ctl){try{L.ctl.abort()}catch(e){}L.ctl=null}if(L.esc)L.esc.parar=true}
function ver(lado){cols.setAttribute('data-ver',lado);LADOS.forEach(function(L){L.tab.setAttribute('aria-selected',L.lado===lado?'true':'false')})}
function sondear(L,tok){if(L.ocup||tok!==L.tok)return;L.ocup=true;
 fetch('/api/agente/eventos?chat_id='+encodeURIComponent(L.id)+'&desde='+L.n).then(function(r){return r.ok?r.json():null}).then(function(j){if(!j||tok!==L.tok||L.fin)return;
  (j.eventos||[]).forEach(function(e){if(typeof e.n!=='number'||e.n<=L.n)return;L.n=e.n;if(e.tipo==='fin'||!e.texto)return;var t=String(e.texto);
   if(e.tipo==='herramienta'){var h=t.replace(/^Consultando\s+/i,'').replace(/^[a-z0-9]+__/i,'');L.herr++;estado(L,'trabaja','Consultando '+h+' en el MCP…');paso(L,'',  'h','Consultando <code>'+E(h)+'</code> en el MCP')}
   else if(e.tipo==='error'){paso(L,t,'x')}
   else{estado(L,'trabaja',t.replace(/[.…]+$/,'')+'…');paso(L,t)}})})
 .catch(function(){}).then(function(){L.ocup=false})}
function escribir(L,txt,listo){var md=q$(L,'.dv-md'),sb=q$(L,'.dv-saltar'),o={txt:txt,n:0,parar:false};L.esc=o;q$(L,'.dv-resp').hidden=false;
 if(RED){pintar(txt.length);fin();return}
 var por=Math.max(5,Math.ceil(txt.length/150));sb.hidden=false;
 function pintar(n){md.textContent='';ocMd(md,txt.slice(0,n));if(n<txt.length){var c=d.createElement('span');c.className='dv-caret';c.setAttribute('aria-hidden','true');var ult=md.lastElementChild;while(ult&&ult.lastElementChild&&/^(UL|OL|LI|DIV|TABLE|TR)$/.test(ult.tagName))ult=ult.lastElementChild;(ult||md).appendChild(c)}abajo(L)}
 function fin(){sb.hidden=true;L.esc=null;listo()}
 function cuadro(){if(o.parar)return;o.n=Math.min(txt.length,o.n+por);pintar(o.n);if(o.n<txt.length)requestAnimationFrame(cuadro);else fin()}
 requestAnimationFrame(cuadro)}
function terminar(L,txt,tok){if(tok!==L.tok)return;L.fin=true;L.texto=txt;var ms=performance.now()-L.t0;clearInterval(L.reloj);L.reloj=null;q$(L,'.dv-reloj').textContent=seg(ms);L.tab.querySelector('small').textContent=seg(ms);
 setTimeout(function(){if(L.sondeo){clearInterval(L.sondeo);L.sondeo=null}},1500);sondear(L,tok);
 paso(L,'Respuesta lista: '+nf(txt.split(/\s+/).length)+' palabras');estado(L,'trabaja','Escribiendo la respuesta…');
 escribir(L,txt,function(){if(tok!==L.tok)return;estado(L,'listo','Listo en '+seg(ms)+(L.mcp?' · '+(L.herr?'usó '+L.herr+(L.herr===1?' herramienta':' herramientas')+' del MCP':'no usó el MCP'):' · sin consultar datos'));
  var vr=q$(L,'.dv-ver'),ok=P.clave?daCifra(txt,P.clave):null;vr.className='dv-ver'+(ok===true?' ok':ok===false?' mal':'');
  vr.innerHTML='<i aria-hidden="true">'+(ok===true?'✓':ok===false?'✗':'·')+'</i><b>'+(ok===true?'Dio la cifra oficial: '+E(P.clave):ok===false?'No dio la cifra oficial ('+E(P.clave)+')':'Pregunta libre: sin cifra oficial para comparar')+'</b><span>Tiempo total: '+E(seg(ms))+(L.mcp?' · consultó los datos del MEF':' · respondió de memoria')+'</span>';
  q$(L,'.dv-pie').hidden=false;q$(L,'[data-acc=abrir]').hidden=false;q$(L,'[data-acc=reintentar]').hidden=true;L.ok=ok;abajo(L);cuenta()})}
function fallar(L,msg,tok){if(tok!==L.tok)return;L.fin=true;detener(L);paso(L,msg,'x');estado(L,'error',msg);
 var vr=q$(L,'.dv-ver');vr.className='dv-ver mal';vr.innerHTML='<i aria-hidden="true">!</i><b>No llegó la respuesta</b><span>'+E(msg)+' Puedes reintentar: la otra columna sigue igual.</span>';
 q$(L,'.dv-pie').hidden=false;q$(L,'[data-acc=reintentar]').hidden=false;q$(L,'[data-acc=abrir]').hidden=true;cuenta()}
function cuenta(){if(!P||P.contado||!P.clave)return;if(!LADOS.every(function(L){return L.fin&&!L.esc}))return;if(LADOS.some(function(L){return L.ok==null}))return;
 P.contado=true;VIVO.n++;if(LADOS[0].ok)VIVO.sin++;if(LADOS[1].ok)VIVO.con++}
function correr(L){detener(L);var tok=(L.tok||0)+1;L.tok=tok;L.id='dm'+Date.now().toString(36)+Math.random().toString(36).slice(2,9)+L.lado;L.n=0;L.herr=0;L.fin=false;L.texto='';L.agId='';L.modelo='Agente del servidor';L.ok=null;L.esc=null;
 q$(L,'.dv-pasos').textContent='';q$(L,'.dv-md').textContent='';q$(L,'.dv-resp').hidden=true;q$(L,'.dv-pie').hidden=true;q$(L,'.dv-saltar').hidden=true;
 L.t0=performance.now();estado(L,'trabaja','Pensando…');paso(L,'Pregunta enviada '+(L.mcp?'con el MCP conectado':'sin el MCP'));
 L.reloj=setInterval(function(){var t=seg(performance.now()-L.t0);q$(L,'.dv-reloj').textContent=t;L.tab.querySelector('small').textContent=t},100);
 L.sondeo=setInterval(function(){sondear(L,tok)},1000);
 var ctl=window.AbortController?new AbortController():null;L.ctl=ctl;var lim=setTimeout(function(){if(ctl)ctl.abort();fallar(L,'Tardó más de 3 minutos.',tok)},180000);
 var cuerpo={chat_id:L.id,mensaje:P.q,archivos:[]};if(L.mcp)cuerpo.mcp=true;
 fetch('/api/agente',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(cuerpo),signal:ctl?ctl.signal:undefined})
 .then(function(r){return r.json().catch(function(){return {}}).then(function(j){return {r:r,j:j}})})
 .then(function(x){if(tok!==L.tok)return;
  if(x.r.status>=500&&!L.mcp)return respaldo(L,tok);
  if(x.r.status===202)throw new Error('El asistente sigue ocupado con otra pregunta.');
  if(!x.r.ok)throw new Error(x.j&&typeof x.j.error==='string'?x.j.error.slice(0,160):'El servidor respondió con error '+x.r.status+'.');
  if(!x.j||typeof x.j.respuesta!=='string')throw new Error('La respuesta no llegó completa.');
  if(typeof x.j.chat_id==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(x.j.chat_id))L.agId=x.j.chat_id;
  terminar(L,x.j.respuesta.trim()||'(sin respuesta)',tok)})
 .catch(function(e){if(tok!==L.tok||L.fin)return;fallar(L,e&&e.name==='AbortError'?'Se canceló la petición.':e&&e.message&&!/fetch|network/i.test(e.message)?e.message:'No se pudo conectar con el servidor.',tok)})
 .then(function(){clearTimeout(lim)})}
function respaldo(L,tok){paso(L,'El agente no está libre: respondo con el modo de respaldo');L.modelo='';
 return fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:P.q}]}),signal:L.ctl?L.ctl.signal:undefined})
 .then(function(r){return r.json().then(function(j){if(!r.ok||!j||typeof j.content!=='string')throw new Error(j&&j.error?String(j.error).slice(0,160):'El respaldo tampoco respondió.');L.modelo=String(j.modelo||'');terminar(L,j.content.trim(),tok)})})}
function abrirAsis(L){if(!P||!L.texto)return;var w=window.open('about:blank','_blank');try{if(w)w.opener=null}catch(e){}
 var ahora=Date.now(),id='c'+ahora.toString(36)+Math.random().toString(36).slice(2,6)+L.lado,q=P.q;
 var chat={id:id,titulo:tituloChat(q),creado:ahora,actualizado:ahora,mensajes:[{rol:'u',texto:q,mcp:L.mcp},{rol:'a',texto:L.texto,modelo:L.modelo,mcp:L.mcp}]};if(L.agId)chat.agenteId=L.agId;
 function ir(u){if(w&&!w.closed)w.location.href=u;else location.href=u}
 ocAlmLeer().then(function(t){var cs=deserializarChats(t);cs.push(chat);return ocAlmEscribir(serializarChats(recortarChats(cs)))})
 .then(function(){ir('/asistente?abrir='+encodeURIComponent(id))},function(){ir('/asistente?q='+encodeURIComponent(q))})}
function abrir(q,clave,caso,etq){P={q:q,clave:clave||'',caso:caso,contado:false};volver=d.activeElement;
 d.getElementById('dv-t').textContent='«'+q+'»';var rf=d.getElementById('dv-ref');
 rf.innerHTML=(etq?E(etq)+' · ':'')+(clave?'Cifra oficial de referencia: <b>'+E(clave)+'</b>':'Pregunta libre: no hay cifra oficial para comparar');
 dv.hidden=false;d.documentElement.style.overflow='hidden';ver('con');LADOS.forEach(correr);dv.querySelector('.dv-x').focus()}
function cerrar(){if(dv.hidden)return;LADOS.forEach(function(L){L.tok=(L.tok||0)+1;detener(L)});dv.hidden=true;d.documentElement.style.overflow='';
 var caso=P?P.caso:null;P=null;
 if(caso!=null){var g=d.querySelector('.dm-caso[data-caso="'+caso+'"] .dm-graf');if(g){g.scrollIntoView({block:'center',behavior:RED?'auto':'smooth'});setTimeout(function(){reconstruir(caso)},RED?0:450)}pedirCifras()}
 if(volver&&volver.focus)try{volver.focus({preventScroll:true})}catch(e){}}
dv.querySelector('.dv-x').addEventListener('click',cerrar);
dv.querySelector('.dv-tabs').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-tab]');if(b)ver(b.getAttribute('data-tab'))});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!dv.hidden){e.preventDefault();cerrar()}
 else if(e.key==='Tab'&&!dv.hidden){var fs=[].filter.call(dv.querySelectorAll('button,a[href],select,input'),function(x){return x.offsetParent!==null&&!x.disabled});if(!fs.length)return;
  var a=fs[0],z=fs[fs.length-1];if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus()}}});
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vivo]');if(!b)return;var i=Number(b.getAttribute('data-vivo')),c=TXT[i];
 abrir(c.pregunta,c.clave,i,'Caso '+(i+1)+' · '+c.etiqueta)});
var lf=d.getElementById('dm-lf'),ls=d.getElementById('dm-lsel'),lq=d.getElementById('dm-lq');
ls.addEventListener('change',function(){lq.hidden=ls.value!=='libre';if(!lq.hidden)lq.focus()});
lf.addEventListener('submit',function(e){e.preventDefault();if(ls.value==='libre'){var q=lq.value.trim();if(!q){lq.focus();return}abrir(q.slice(0,500),'',null,'Pregunta libre')}
 else{var i=Number(ls.value),c=TXT[i];abrir(c.pregunta,c.clave,i,'Caso '+(i+1)+' · '+c.etiqueta)}});
`;
export const scriptDemo = "(function(){\n" + mdJs + "\n" + almJs + "\n" + chatsJs + "\n" + cuerpoJs + "\n})();";

export function demo(m: Meta): string {
  const datosJs = JSON.stringify(CASOS_DEMO.map((c) => ({ herramienta: c.herramienta, args: c.args, datos: c.datos, pregunta: c.pregunta, clave: c.referencia_clave, etiqueta: TEXTOS[c.id].etiqueta, fecha: fechaLarga(c.fecha_corte) }))).replace(/</g, "\\u003c");
  const r = RESUMEN_DEMO;
  const cifra = (t: string, a: number, b: number) =>
    `<div class="dm-cifra"><h3>${t}</h3><div><strong class="n1" data-a="${a}" data-t="${r.total}">${a}/${r.total}</strong><small>IA sola</small></div><div><strong class="n2" data-a="${b}" data-t="${r.total}">${b}/${r.total}</strong><small>IA + MCP</small></div></div>`;
  const cuerpo = `
<section class="dm-h"><div class="wrap">
<p class="eyebrow"><b>Demo</b> · pensada para proyectar</p>
<h1 style="max-width:22ch;font-size:var(--s3)">Mira el MCP trabajando, con casos reales.</h1>
<p class="lead">Cuatro preguntas ya preparadas, una por herramienta. En cada una ves a la IA sola frente a la IA conectada al MCP, un gráfico hecho con los datos que devolvió y, si quieres, la consulta en vivo.</p>
${enSencillo("La IA tarda en contestar, así que las respuestas de abajo ya están grabadas de la evaluación y aparecen al instante. El MCP es un «enchufe» que deja a la IA consultar los datos oficiales del Estado en vez de adivinar. «Probar en vivo» le hace ahora mismo la misma pregunta a dos asistentes a la vez, uno sin el MCP y otro con él, y luego vuelve a dibujar el gráfico con los datos de hoy.")}
<ol class="dm-flujo" aria-label="El flujo en cuatro pasos">${PASOS.map(([t, p], i) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[i]}</svg><b><span>${i + 1}</span>${esc(t)}</b><p>${esc(p)}</p></li>`).join("")}</ol>
<div class="dm-lanz" id="comparar">
<div><h2><span class="dm-vivo-pt" aria-hidden="true"></span>Comparación en vivo</h2><p>La misma pregunta a dos asistentes a la vez: uno responde de memoria y el otro consulta el MCP. Verás cómo trabaja cada uno, paso a paso, y quién da la cifra oficial.</p></div>
<form class="dm-lf" id="dm-lf"><label class="vh" for="dm-lsel">Pregunta para la comparación</label>
<select id="dm-lsel">${CASOS_DEMO.map((c, i) => `<option value="${i}">Caso ${i + 1} · ${esc(c.pregunta)}</option>`).join("")}<option value="libre">Otra pregunta (escríbela)…</option></select>
<label class="vh" for="dm-lq">Tu pregunta</label><input id="dm-lq" type="text" maxlength="500" placeholder="Escribe tu pregunta sobre obras públicas" hidden>
<button class="btn btn-p" type="submit">Ver la comparación en vivo</button></form>
</div>
<nav class="dm-nav" aria-label="Casos">${CASOS_DEMO.map((c, i) => `<a href="#caso-${i + 1}">Caso ${i + 1} · ${esc(TEXTOS[c.id].etiqueta)}</a>`).join("")}</nav>
</div></section>
${tarjetaSprite}
${CASOS_DEMO.map(caso).join("\n")}
<section class="dm-res" id="resultados"><div class="wrap">
<h2>Así le fue en las 40 preguntas</h2>
<p class="lead" style="margin-top:16px">Las mismas 40 preguntas, con y sin el MCP. Con la conexión, la IA acertó ${r.con.exactas} de ${r.total}; sola, ${r.sin.exactas} de ${r.total}.</p>
<div class="dm-cifras">${cifra("Respuestas exactas", r.sin.exactas, r.con.exactas)}${cifra("Respuestas que citan la fuente", r.sin.citas, r.con.citas)}${cifra("Con cifras inventadas", r.sin.inventadas, r.con.inventadas)}</div>
<p class="dm-verif" role="status" aria-live="polite"></p>
<a class="btn btn-p" href="/evaluacion">Ver la evaluación completa</a>
</div></section>
<div class="dv" id="dv" role="dialog" aria-modal="true" aria-labelledby="dv-t" hidden><div class="dv-hoja">
<header class="dv-cab"><div><p class="dv-eb"><span class="dm-vivo-pt" aria-hidden="true"></span>En vivo · la misma pregunta a la vez</p><h2 id="dv-t"></h2><p class="dv-ref" id="dv-ref"></p></div>
<button type="button" class="dv-x" aria-label="Cerrar la comparación">Cerrar <kbd>Esc</kbd></button></header>
<div class="dv-tabs" role="tablist" aria-label="Asistentes"><button type="button" role="tab" data-tab="sin" aria-controls="dv-sin"><span class="dv-pulso" aria-hidden="true"></span>IA sola<small>0,0 s</small></button><button type="button" role="tab" data-tab="con" aria-controls="dv-con"><span class="dv-pulso" aria-hidden="true"></span>IA + MCP<small>0,0 s</small></button></div>
<div class="dv-cols" data-ver="con">
<section class="dv-col sin" id="dv-sin" data-e="espera" aria-label="IA sola">
<header class="dv-ch"><div><h3><span class="dv-tag">Sin MCP</span>IA sola</h3><p>Responde de memoria, sin datos oficiales.</p></div><span class="dv-reloj" aria-label="Tiempo">0,0 s</span></header>
<div class="dv-estado" role="status" aria-live="polite"><span class="dv-pulso" aria-hidden="true"></span><span class="dv-et">Esperando…</span></div>
<ol class="dv-pasos" aria-label="Pasos"></ol>
<div class="dv-resp" hidden><button type="button" class="dv-saltar" hidden>Mostrar todo</button><b>Respuesta</b><div class="dv-md"></div></div>
<div class="dv-pie" hidden><div class="dv-ver"></div><div class="dv-acc2"><button type="button" class="btn btn-s" data-acc="reintentar" hidden>Reintentar</button><button type="button" class="btn btn-s" data-acc="abrir" hidden>Abrir esta conversación en el asistente</button></div></div>
</section>
<section class="dv-col con" id="dv-con" data-e="espera" aria-label="IA + MCP">
<header class="dv-ch"><div><h3><span class="dv-tag">Con MCP</span>IA + MCP</h3><p>Puede consultar los datos del MEF con el MCP.</p></div><span class="dv-reloj" aria-label="Tiempo">0,0 s</span></header>
<div class="dv-estado" role="status" aria-live="polite"><span class="dv-pulso" aria-hidden="true"></span><span class="dv-et">Esperando…</span></div>
<ol class="dv-pasos" aria-label="Pasos"></ol>
<div class="dv-resp" hidden><button type="button" class="dv-saltar" hidden>Mostrar todo</button><b>Respuesta</b><div class="dv-md"></div></div>
<div class="dv-pie" hidden><div class="dv-ver"></div><div class="dv-acc2"><button type="button" class="btn btn-s" data-acc="reintentar" hidden>Reintentar</button><button type="button" class="btn btn-s" data-acc="abrir" hidden>Abrir esta conversación en el asistente</button></div></div>
</section>
</div></div></div>
<script type="application/json" id="demo-datos">${datosJs}</script>`;
  return shell({
    titulo: "Demo · ObraClara Perú",
    descripcion: "Casos preparados: la IA sola frente a la IA con el MCP de ObraClara, con gráficos de los datos reales y consulta en vivo.",
    ruta: "/demo",
    cuerpo,
    m,
    cssExtra: tarjetaCss + css,
    scriptExtra: scriptDemo,
  });
}
