// Sistema de diseño del sitio: tokens (claro y oscuro), tipografía fluida y componentes comunes.
// Las fuentes se sirven desde worker/public/fonts (activos estáticos del Worker, sin costo).

export const css = String.raw`
@font-face{font-family:"Public Sans";src:url(/fonts/public-sans.woff2) format("woff2");font-weight:400 700;font-display:swap}
@font-face{font-family:"Source Serif 4";src:url(/fonts/source-serif-4-600.woff2) format("woff2");font-weight:600;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url(/fonts/jetbrains-mono.woff2) format("woff2");font-weight:400 600;font-display:swap}

:root{
 --bg:#f6f5f1;--bg-2:#eeece6;--surface:#fff;--surface-2:#f1efea;
 --ink:#15171a;--ink-2:#3a4048;--mut:#5f666f;--line:#e0ddd5;--line-2:#cdc9bf;
 --accent:#0b6b55;--accent-2:#095a47;--accent-ink:#fff;--accent-soft:#dfeee8;
 --warn:#9a5300;--warn-soft:#f6ead6;--risk:#b42318;--risk-soft:#f8e2de;
 --code-bg:#15181b;--code-ink:#e4e1da;--code-mut:#8b939b;--code-line:#2a2f34;
 --c-key:#e7b86a;--c-str:#9fd3a8;--c-num:#e99a7c;--c-fn:#9cc7e8;
 --shadow:0 1px 2px rgba(20,22,26,.05),0 8px 24px -12px rgba(20,22,26,.12);
 --sans:"Public Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
 --serif:"Source Serif 4",ui-serif,Georgia,serif;
 --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
 --s-1:clamp(.8125rem,.79rem + .1vw,.875rem);
 --s0:clamp(1rem,.97rem + .15vw,1.0625rem);
 --s1:clamp(1.125rem,1.07rem + .3vw,1.25rem);
 --s2:clamp(1.35rem,1.2rem + .7vw,1.75rem);
 --s3:clamp(1.7rem,1.35rem + 1.6vw,2.6rem);
 --s4:clamp(2.2rem,1.5rem + 3.2vw,4.1rem);
 --gut:clamp(16px,4vw,40px);--max:1180px;--r:10px;--r-l:16px;
 --sec:clamp(64px,9vw,128px);
 --ease:cubic-bezier(.2,.7,.2,1);
 --shadow-h:0 2px 4px rgba(20,22,26,.05),0 18px 40px -18px rgba(20,22,26,.22);
 color-scheme:light;
}
:root[data-theme=dark]{
 --bg:#0e1011;--bg-2:#141719;--surface:#171a1d;--surface-2:#1d2124;
 --ink:#ecebe6;--ink-2:#c3c6c8;--mut:#959da4;--line:#262a2e;--line-2:#343a3f;
 --accent:#4fc39c;--accent-2:#6dd3b0;--accent-ink:#04261b;--accent-soft:#11302a;
 --warn:#e2a24a;--warn-soft:#2e2412;--risk:#f07a6b;--risk-soft:#33191a;
 --code-bg:#0a0c0d;--code-line:#22272b;
 --shadow:0 1px 2px rgba(0,0,0,.3),0 12px 32px -16px rgba(0,0,0,.6);
 --shadow-h:0 2px 4px rgba(0,0,0,.35),0 20px 44px -18px rgba(0,0,0,.75);
 color-scheme:dark;
}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){
 --bg:#0e1011;--bg-2:#141719;--surface:#171a1d;--surface-2:#1d2124;
 --ink:#ecebe6;--ink-2:#c3c6c8;--mut:#959da4;--line:#262a2e;--line-2:#343a3f;
 --accent:#4fc39c;--accent-2:#6dd3b0;--accent-ink:#04261b;--accent-soft:#11302a;
 --warn:#e2a24a;--warn-soft:#2e2412;--risk:#f07a6b;--risk-soft:#33191a;
 --code-bg:#0a0c0d;--code-line:#22272b;
 --shadow:0 1px 2px rgba(0,0,0,.3),0 12px 32px -16px rgba(0,0,0,.6);
 --shadow-h:0 2px 4px rgba(0,0,0,.35),0 20px 44px -18px rgba(0,0,0,.75);
 color-scheme:dark}}

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:80px}
body{margin:0;background:var(--bg);color:var(--ink);font:400 var(--s0)/1.6 var(--sans);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden}
img,svg{max-width:100%;height:auto;display:block}
a{color:inherit;text-decoration-color:color-mix(in srgb,currentColor 35%,transparent);text-underline-offset:.18em;text-decoration-thickness:1px}
a:hover{text-decoration-color:currentColor}
h1,h2,h3{font-family:var(--serif);font-weight:600;letter-spacing:-.018em;line-height:1.08;margin:0;text-wrap:balance}
h1{font-size:var(--s4)}h2{font-size:var(--s3)}h3{font-size:var(--s1);font-family:var(--sans);letter-spacing:-.01em;line-height:1.3}
p{margin:0;text-wrap:pretty}
code,kbd,pre{font-family:var(--mono);font-size:.88em}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
::selection{background:var(--accent-soft)}
.sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.skip{position:absolute;left:12px;top:-60px;z-index:100;background:var(--ink);color:var(--bg);padding:8px 14px;border-radius:8px}
.skip:focus{top:12px}

.wrap{max-width:var(--max);margin:0 auto;padding:0 var(--gut)}
.narrow{max-width:760px}
.sec{padding:var(--sec) 0}
.sec+.sec{border-top:1px solid var(--line)}
.eyebrow{font:500 var(--s-1)/1.2 var(--mono);color:var(--mut);letter-spacing:.02em;display:flex;align-items:center;gap:10px;margin-bottom:18px}
.eyebrow b{color:var(--accent);font-weight:500}
.lead{font-size:var(--s1);color:var(--ink-2);line-height:1.55;max-width:62ch}
.mut{color:var(--mut)}
.small{font-size:var(--s-1)}
.head{display:grid;gap:18px;margin-bottom:clamp(36px,5vw,64px);max-width:780px}

/* Botones */
.btn{position:relative;overflow:hidden;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:999px;font:600 15px/1 var(--sans);text-decoration:none;border:1px solid transparent;cursor:pointer;transition:background-color .2s var(--ease),border-color .2s var(--ease),color .2s var(--ease),transform .2s var(--ease),box-shadow .2s var(--ease);white-space:nowrap;-webkit-tap-highlight-color:transparent}
.btn:hover{transform:translateY(-1px)}
.btn:active{transform:translateY(0) scale(.97);transition-duration:.08s}
.btn:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:999px}
.btn:disabled,.btn[aria-disabled=true]{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
.btn-p{background:var(--ink);color:var(--bg);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.btn-p:hover{background:color-mix(in srgb,var(--ink) 86%,var(--accent));box-shadow:0 8px 20px -10px color-mix(in srgb,var(--ink) 70%,transparent)}
.btn-s{background:transparent;color:var(--ink);border-color:var(--line-2)}
.btn-s:hover{border-color:var(--ink);background:var(--surface)}
.btn svg{width:16px;height:16px;transition:transform .25s var(--ease)}
.btn:hover svg:last-child{transform:translateX(3px)}
.onda{position:absolute;border-radius:50%;background:currentColor;opacity:.18;transform:scale(0);pointer-events:none;animation:onda .6s var(--ease) forwards;z-index:-1}
@keyframes onda{to{transform:scale(1);opacity:0}}
.b-comp,.nueva,.chips button,.adj-b,.pl-d,.b-onda{position:relative;overflow:hidden}

/* Navegación */
.nav{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:saturate(1.4) blur(14px);-webkit-backdrop-filter:saturate(1.4) blur(14px);border-bottom:1px solid transparent;transition:border-color .2s}
.nav.sc,.nav.app{border-bottom-color:var(--line)}
.nav.app .wrap{max-width:none;padding:0 16px}
.nav .wrap{display:flex;align-items:center;gap:20px;height:60px}
.marca{display:flex;align-items:center;gap:10px;text-decoration:none;font:600 16px/1 var(--sans);letter-spacing:-.01em;flex:none}
.marca svg{width:26px;height:26px}
.marca span small{font-weight:400;color:var(--mut)}
.links{display:flex;align-items:center;gap:2px;margin-left:16px}
.links>a,.grupo-b{position:relative;white-space:nowrap;padding:8px 11px;border-radius:8px;text-decoration:none;font:400 15px/1.2 var(--sans);color:var(--ink-2);transition:color .2s var(--ease),background-color .2s var(--ease)}
.links>a::after,.grupo-b::after{content:"";position:absolute;left:11px;right:11px;bottom:3px;height:1.5px;border-radius:2px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .3s var(--ease)}
.links>a:hover,.grupo-b:hover,.grupo.abierto .grupo-b{color:var(--ink);background:var(--surface-2)}
.links>a:hover::after{transform:scaleX(1)}
.links>a[aria-current=page],.grupo-b[data-act]{color:var(--ink);font-weight:600}
.links>a[aria-current=page]::after,.grupo-b[data-act]::after{transform:scaleX(1)}
.grupo{position:relative}
.grupo-b{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer}
.grupo-b::after{right:26px}
.grupo-b svg{width:12px;height:12px;transition:transform .25s var(--ease)}
.grupo.abierto .grupo-b svg{transform:rotate(180deg)}
.grupo-m{position:absolute;top:calc(100% + 8px);left:-6px;min-width:220px;padding:6px;border:1px solid var(--line);border-radius:12px;background:var(--surface);box-shadow:var(--shadow-h);display:grid;gap:2px;opacity:0;visibility:hidden;transform:translateY(-6px) scale(.98);transform-origin:top left;transition:opacity .18s var(--ease),transform .22s var(--ease),visibility 0s .22s}
.grupo-m::before{content:"";position:absolute;inset:-10px 0 auto;height:10px}
.grupo.abierto .grupo-m{opacity:1;visibility:visible;transform:none;transition:opacity .18s var(--ease),transform .22s var(--ease),visibility 0s}
@media (hover:hover){.grupo:hover .grupo-m{opacity:1;visibility:visible;transform:none;transition:opacity .18s var(--ease),transform .22s var(--ease),visibility 0s}.grupo:hover .grupo-b svg{transform:rotate(180deg)}}
.grupo-m a{display:block;padding:9px 12px;border-radius:8px;text-decoration:none;font-size:14.5px;color:var(--ink-2);transition:background-color .15s,color .15s,padding-left .2s var(--ease)}
.grupo-m a:hover{background:var(--surface-2);color:var(--ink);padding-left:16px}
.grupo-m a[aria-current=page]{color:var(--ink);font-weight:600;background:var(--accent-soft)}
.nav-r{margin-left:auto;display:flex;align-items:center;gap:6px}
.ico{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:10px;border:0;background:transparent;color:var(--ink-2);cursor:pointer;text-decoration:none;transition:background-color .2s var(--ease),color .2s var(--ease),transform .15s var(--ease)}
.ico:hover{background:var(--surface-2);color:var(--ink)}
.ico:active{transform:scale(.92)}
.ico svg{width:19px;height:19px;transition:transform .45s var(--ease)}
.tema:hover svg{transform:rotate(-25deg)}
.nav .btn{min-height:36px;padding:0 14px;font-size:14px}
.menu-b{display:none}
.tema .sol{display:none}
:root[data-theme=dark] .tema .sol{display:block}:root[data-theme=dark] .tema .luna{display:none}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .tema .sol{display:block}:root:not([data-theme=light]) .tema .luna{display:none}}
.panel-m{display:none}
@media (max-width:1040px){
 .links,.nav .btn,.nav .gh{display:none}
 .menu-b{display:inline-grid}
 .panel-m{position:fixed;inset:60px 0 auto 0;max-height:calc(100dvh - 60px);overflow-y:auto;background:var(--bg);border-bottom:1px solid var(--line);padding:8px var(--gut) 20px;box-shadow:var(--shadow-h);display:block;opacity:0;visibility:hidden;transform:translateY(-8px);transition:opacity .2s var(--ease),transform .25s var(--ease),visibility 0s .25s}
 .panel-m.abierto{opacity:1;visibility:visible;transform:none;transition:opacity .2s var(--ease),transform .25s var(--ease),visibility 0s}
 .panel-m a{display:block;padding:14px 4px;border-bottom:1px solid var(--line);text-decoration:none;font-size:17px;transition:padding-left .2s var(--ease),color .2s}
 .panel-m a:hover{padding-left:10px}
 .panel-m a[aria-current=page]{font-weight:600}
 .panel-m a:last-child{border-bottom:0}
}

/* Pie */
.pie{border-top:1px solid var(--line);padding:48px 0 40px;font-size:var(--s-1);color:var(--mut);background:var(--bg-2)}
.pie .grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:32px}
.pie h4{margin:0 0 10px;font:600 13px/1.2 var(--sans);color:var(--ink);letter-spacing:.01em}
.pie ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.pie a{text-decoration:none;background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .3s var(--ease),color .2s}.pie a:hover{color:var(--ink);background-size:100% 1px}
.pie .marca{background:none}
.pie .legal{margin-top:36px;padding-top:20px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between}
@media (max-width:720px){.pie .grid{grid-template-columns:1fr}}

/* Código */
.code{background:var(--code-bg);color:var(--code-ink);border-radius:var(--r);border:1px solid var(--code-line);overflow:hidden;font:400 13.5px/1.65 var(--mono)}
.code-h{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--code-line);color:var(--code-mut);font-size:12.5px}
.code-h .copiar{margin-left:auto}
.code pre{margin:0;padding:14px 16px;overflow-x:auto;font-size:inherit;white-space:pre}
.code .k{color:var(--c-key)}.code .s{color:var(--c-str)}.code .n{color:var(--c-num)}.code .f{color:var(--c-fn)}.code .c{color:var(--code-mut)}
.copiar{font:500 12px/1 var(--sans);color:var(--code-mut);background:transparent;border:1px solid var(--code-line);border-radius:6px;padding:6px 9px;cursor:pointer}
.copiar{transition:color .15s,border-color .15s,transform .12s}
.copiar:hover{color:var(--code-ink);border-color:var(--code-mut)}
.copiar:active{transform:scale(.94)}
.inline-url{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-width:0;padding:6px 6px 6px 14px;border:1px solid var(--line-2);border-radius:999px;background:var(--surface);font:500 14px/1.2 var(--mono)}
.inline-url code{min-width:0;font-size:inherit;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.inline-url .copiar{color:var(--ink-2);border-color:var(--line);border-radius:999px;padding:7px 11px}
.inline-url .copiar:hover{color:var(--ink);border-color:var(--ink)}

/* Etiquetas y alertas */
.tag{display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border-radius:6px;font:500 12px/1.6 var(--mono);white-space:nowrap}
.tag-w{background:var(--warn-soft);color:var(--warn)}
.tag-r{background:var(--risk-soft);color:var(--risk)}
.tag-a{background:var(--accent-soft);color:var(--accent)}
.nota{border-left:2px solid var(--line-2);padding:2px 0 2px 16px;color:var(--ink-2)}

/* En sencillo */
.sencillo{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:var(--r);background:var(--accent-soft);padding:18px 22px;margin:28px 0 0;max-width:780px}
.sencillo h2{font:600 var(--s1)/1.3 var(--sans);margin:0 0 8px;color:var(--ink)}
.sencillo p{color:var(--ink);margin:0}.sencillo p+p{margin-top:10px}
.que{margin:12px auto 0;max-width:62ch;padding:10px 14px;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:0 8px 8px 0;font-size:var(--s-1);color:var(--ink);text-align:left}
details.det{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);padding:0 18px;margin:18px 0}
details.det{transition:border-color .2s var(--ease),box-shadow .25s var(--ease)}
details.det:hover{border-color:var(--line-2)}
details.det[open]{box-shadow:var(--shadow)}
details.det>summary{cursor:pointer;padding:14px 0;font-weight:600;color:var(--ink);list-style:none;display:flex;align-items:center;gap:10px}
details.det>summary::-webkit-details-marker{display:none}
details.det>summary::before{content:"";flex:none;width:7px;height:7px;border-right:1.6px solid var(--mut);border-bottom:1.6px solid var(--mut);transform:rotate(-45deg);transition:transform .25s var(--ease);margin:0 2px}
details.det[open]>summary::before{transform:rotate(45deg)}
details.det[open]>summary{border-bottom:1px solid var(--line);margin-bottom:14px}
details.det>*:last-child{margin-bottom:16px}

/* Figuras */
figure{margin:0}
figcaption{margin-top:12px;font-size:var(--s-1);color:var(--mut)}
.shot{border-radius:var(--r-l);border:1px solid var(--line);background:var(--surface);overflow:hidden;box-shadow:var(--shadow);transition:transform .35s var(--ease),box-shadow .35s var(--ease)}
.shot:hover{transform:translateY(-3px);box-shadow:var(--shadow-h)}
.shot img{width:100%}

/* Tablas de referencia (conectar, acerca) y envoltorio con desplazamiento */
.ref{width:100%;border-collapse:collapse;font-size:15px;margin-top:20px;font-variant-numeric:tabular-nums}
.ref th,.ref td{text-align:left;padding:10px 14px 10px 0;border-bottom:1px solid var(--line);vertical-align:top}
.ref thead th{font:500 12px/1.3 var(--mono);color:var(--mut);border-bottom-color:var(--line-2)}
.ref td{color:var(--ink-2)}
.ref tbody tr{transition:background-color .15s}
.ref tbody tr:hover{background:color-mix(in srgb,var(--surface-2) 70%,transparent)}
.ref.num td:not(:first-child),.ref.num th:not(:first-child){text-align:right;padding-left:14px;min-width:9ch}
.ref.num td:first-child{min-width:18ch}
.ref.num td:first-child{color:var(--ink)}
.tbw{position:relative}

/* Tarjetas y cifras: elevación al pasar el mouse */
.kpi{transition:transform .3s var(--ease),box-shadow .3s var(--ease),border-color .3s var(--ease)}
.kpi:hover{transform:translateY(-2px);box-shadow:var(--shadow-h)}

/* Pantalla de carga: solo en la primera página de la sesión, se oculta sola en ~0,45 s */
#carga{display:none}
.con-carga #carga{position:fixed;inset:0;z-index:200;display:grid;place-content:center;justify-items:center;gap:18px;background:var(--bg);pointer-events:none;animation:carga-f .3s var(--ease) .32s forwards}
#carga svg{width:44px;height:44px;animation:carga-l .5s var(--ease) both}
#carga i{display:block;width:120px;height:2px;border-radius:2px;background:var(--line);overflow:hidden;position:relative}
#carga i::after{content:"";position:absolute;inset:0;background:var(--accent);transform:scaleX(0);transform-origin:left;animation:carga-b .34s var(--ease) forwards}
@keyframes carga-f{to{opacity:0;visibility:hidden}}
@keyframes carga-l{from{opacity:0;transform:scale(.85)}}
@keyframes carga-b{to{transform:scaleX(1)}}

/* Entrada de la página y transición entre páginas */
@keyframes sube{from{opacity:0;transform:translateY(12px)}}
.js main>section:first-child>.wrap>*:not(.rv){animation:sube .6s var(--ease) both}
.js main>section:first-child>.wrap>*:nth-child(2){animation-delay:.06s}
.js main>section:first-child>.wrap>*:nth-child(3){animation-delay:.12s}
.js main>section:first-child>.wrap>*:nth-child(4){animation-delay:.18s}
.js main>section:first-child>.wrap>*:nth-child(n+5){animation-delay:.24s}
.con-carga main>section:first-child>.wrap>*:not(.rv){animation-delay:.36s}
@view-transition{navigation:auto}
::view-transition-old(root){animation:vt-sale .18s ease-in both}
::view-transition-new(root){animation:vt-entra .28s var(--ease) both}
@keyframes vt-sale{to{opacity:0}}
@keyframes vt-entra{from{opacity:0;transform:translateY(6px)}}
.nav{view-transition-name:barra}
::view-transition-group(barra){animation:none}

/* Aparición al desplazarse */
.js .rv{opacity:0;transform:translateY(14px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.js .rv.in{opacity:1;transform:none}
.js .rv.d1{transition-delay:.08s}.js .rv.d2{transition-delay:.16s}.js .rv.d3{transition-delay:.24s}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.js .rv{opacity:1;transform:none}#carga{display:none!important}::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}
`;
