// Página /evaluacion («Benchmarks»): qué se midió, resultados en tarjetas y gráficos, comparación entre modelos y la tabla de
// las 40 preguntas con filtro y búsqueda. Los datos vienen de evaluacion-datos.ts y evaluacion-tabla.ts (generados por eval/exportar_sitio.mjs).
import { EVAL } from "./evaluacion-datos";
import { MODELOS, PREGUNTAS, type Lado } from "./evaluacion-tabla";
import { barrasAgrupadas, diagramasCss, graficoGlobal, graficoLatencia, graficosPorTipo, nf } from "./proyecto-diagramas";
import { REPO, enSencillo, esc, shell, type Meta } from "./layout";
import { tarjetaCss, tarjetaRespuesta, tarjetaSprite } from "./evaluacion-md";

const TIPOS: [string, string][] = [["busqueda", "Búsqueda"], ["detalle", "Detalle"], ["alertas", "Alertas"], ["resumen", "Resumen"]];
const leyenda = `<ul class="leyenda"><li><i style="background:var(--mut)"></i>Sin la conexión (MCP)</li><li><i style="background:var(--accent)"></i>Con la conexión (MCP)</li></ul>`;
const pc = (v: number | null) => (v == null ? "sin datos" : `${v} %`);
const kpi = (b: string, t: string, cls = "") => `<div class="kpi ev-k ${cls}"><b>${b}</b><span>${t}</span></div>`;

const css = String.raw`
.ev-h{padding:clamp(40px,6vw,88px) 0 clamp(16px,3vw,32px)}.ev-h .lead{margin-top:20px}
.ev-s{padding:clamp(28px,4vw,56px) 0;border-top:1px solid var(--line)}.ev-s>h2{margin-bottom:14px}.ev-s p+p{margin-top:12px}
.ev-s .lead{max-width:70ch}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:22px 0}
.kpi{border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);padding:18px 20px}
.kpi>b{display:block;font:600 clamp(2rem,1.4rem + 2.4vw,3.2rem)/1.05 var(--serif);color:var(--ink);font-variant-numeric:tabular-nums}
.kpi span{display:block;margin-top:6px;font-size:var(--s-1);color:var(--mut)}
.kpi.con{background:var(--accent-soft);border-color:transparent}.kpi.con>b{color:var(--accent)}
.kpi span b{font-weight:600;color:var(--ink)}
.figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:24px;margin:20px 0}
.figs figure{margin:0;min-width:0}.figs figcaption{margin-top:8px;font-size:var(--s-1);color:var(--mut);text-align:center}
.tbw{overflow-x:auto;margin:16px 0;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}
.tb{width:100%;border-collapse:collapse;font-size:var(--s-1);min-width:480px}
.tb th,.tb td{padding:10px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.tb thead th{background:var(--surface-2);font:500 12px/1.3 var(--mono);color:var(--mut);white-space:nowrap}
.tb tbody th{font-weight:600}.tb tr:last-child>*{border-bottom:0}.tb .num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.ev-ctl{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin:18px 0 8px}
.ev-ctl input[type=search]{flex:1 1 220px;min-width:0;padding:10px 14px;border:1px solid var(--line-2);border-radius:var(--r);background:var(--surface);color:var(--ink);font:inherit}
.ev-f{display:flex;flex-wrap:wrap;gap:8px}
.ev-f button{border:1px solid var(--line-2);background:var(--surface);color:var(--ink);padding:8px 14px;border-radius:999px;font:500 var(--s-1)/1 var(--sans);cursor:pointer}
.ev-f button[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.ev-n{font-size:var(--s-1);color:var(--mut);margin:0 0 12px}
.ev-hd,.qr{display:grid;grid-template-columns:70px minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);gap:8px 16px;align-items:start}
.ev-hd{padding:0 16px 8px;font:500 12px/1.3 var(--mono);color:var(--mut)}
.qr{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);padding:14px 16px;margin-bottom:10px;min-width:0}
.qr[hidden]{display:none}
.qr .id{font:600 14px/1.4 var(--mono);color:var(--ink)}.qr .id .tag{margin-top:6px;display:flex;width:max-content}
.qr .qp{font-weight:600;color:var(--ink);overflow-wrap:anywhere}
.qr .qref{font-size:var(--s-1);color:var(--ink-2);margin-top:6px;overflow-wrap:anywhere}
.qr .qref b{color:var(--mut);font-weight:500}
.qr .m{display:flex;flex-wrap:wrap;gap:4px}.qr .m .lb{display:none;width:100%;font:600 12px/1.4 var(--sans);color:var(--mut);margin-bottom:2px}
.mk{display:inline-flex;gap:4px;align-items:center;padding:2px 7px;border-radius:6px;font:500 12px/1.6 var(--mono);white-space:nowrap}
.mk{border:1px solid var(--line)}.mk.ok{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 45%,transparent)}.mk.no{color:var(--mut)}.mk.mal{color:var(--risk);border-color:color-mix(in srgb,var(--risk) 45%,transparent)}
.qr details{grid-column:1/-1;border-top:1px solid var(--line);padding-top:8px}
.qr summary{cursor:pointer;font-weight:600;font-size:var(--s-1);color:var(--accent);width:max-content;max-width:100%}
.qr .par{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px;align-items:start}
.qr .rs{padding:14px;gap:12px}
.qr details[open]>summary{margin-bottom:2px}
@media (prefers-reduced-motion:no-preference){
.qr details[open] .rs{animation:ev-entra .45s cubic-bezier(.2,.7,.2,1) both}.qr details[open] .rs.con{animation-delay:.07s}
.qr details[open] .rs-chip{animation:ev-chip .4s .2s ease both}
.qr{transition:border-color .2s,box-shadow .2s}.qr:hover{border-color:var(--line-2)}
@keyframes ev-entra{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ev-chip{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}
}
.ev-vacio{padding:24px;text-align:center;color:var(--mut);border:1px dashed var(--line-2);border-radius:var(--r)}
@media (max-width:860px){.ev-hd{display:none}.qr{grid-template-columns:minmax(0,1fr)}.qr .m .lb{display:block}.qr .par{grid-template-columns:minmax(0,1fr)}.qr .id .tag{display:inline-flex;margin:0 0 0 8px}.qr .id{display:flex;align-items:center}}
`;

const marca = (v: boolean, nombre: string, malo = false) => `<span class="mk ${malo ? (v ? "mal" : "ok") : v ? "ok" : "no"}" title="${nombre}: ${v ? "sí" : "no"}">${nombre} ${v ? "✓" : "✗"}</span>`;
const marcas = (l: Lado) => marca(l.e, "Exacta") + marca(l.s, "Estricta") + marca(l.c, "Cita") + marca(l.i, "Inventada", true);

function filas(): string {
  return PREGUNTAS.map((q) => {
    const tipo = TIPOS.find((t) => t[0] === q.tipo)?.[1] ?? q.tipo;
    const buscar = `${q.id} ${q.p} ${q.r} ${tipo}`.toLowerCase();
    const lado = (l: Lado, cond: "sin" | "con") => tarjetaRespuesta({
      cond,
      titulo: cond === "sin" ? "IA sola (sin MCP)" : "IA + MCP",
      sub: cond === "sin" ? "Respondió de memoria" : `Herramienta usada: ${l.h?.join(", ") || "ninguna"}`,
      ok: l.e,
      veredicto: l.e ? "Correcta" : l.i ? "Incorrecta: dio cifras que no coinciden" : "Incorrecta: no dio la cifra oficial",
      clave: l.k,
      referencia: q.rk,
      md: l.t,
    }, "h4");
    return `<article class="qr" data-id="${q.id}" data-tipo="${q.tipo}" data-q="${esc(buscar)}">
<div class="id">${q.id}<span class="tag tag-a">${tipo}</span></div>
<div><div class="qp">${esc(q.p)}</div><div class="qref"><b>Referencia:</b> ${esc(q.r)}</div></div>
<div class="m"><span class="lb">Sin MCP</span>${marcas(q.sin)}</div>
<div class="m"><span class="lb">Con MCP</span>${marcas(q.con)}</div>
<details><summary>Ver respuesta</summary><div class="par">${lado(q.sin, "sin")}${lado(q.con, "con")}</div></details>
</article>`;
  }).join("");
}

function modelosHtml(): string {
  const n = EVAL.preguntas;
  const ok = (p: number) => Math.round((p * n) / 100);
  const varios = MODELOS.length > 1;
  const tab = `<div class="tbw"><table class="tb"><thead><tr><th scope="col">Modelo</th><th scope="col">Condición</th><th scope="col">Exactas</th><th scope="col">Estrictas</th><th scope="col">Citan</th><th scope="col">Inventadas</th><th scope="col">Recall</th><th scope="col">Precisión</th><th scope="col">Respondidas</th><th scope="col">Mediana</th></tr></thead><tbody>${MODELOS.map((m) => (["sin", "con"] as const).map((c) => {
    const x = m[c];
    return `<tr><th scope="row">${c === "sin" ? esc(m.nombre) : ""}</th><td>${c === "sin" ? "Sin MCP" : "Con MCP"}</td><td class="num">${ok(x.exactitud)} / ${n}</td><td class="num">${ok(x.estricta)} / ${n}</td><td class="num">${ok(x.citacion)} / ${n}</td><td class="num">${ok(x.inventada)} / ${n}</td><td class="num">${x.recall} %</td><td class="num">${pc(x.precision)}</td><td class="num">${x.ejecutadas} / ${n}</td><td class="num">${nf(x.mediana, 1)} s</td></tr>`;
  }).join("")).join("")}</tbody></table></div>`;
  const grafico = (clave: "exactitud" | "estricta" | "recall", id: string, nom: string) => `<figure>${barrasAgrupadas(id, `${nom} por modelo, sin y con la conexión`,
    `Barras por modelo. ${nom}: ` + MODELOS.map((m) => `${m.nombre}, ${m.sin[clave]} % sin la conexión y ${m.con[clave]} % con ella`).join("; ") + ".",
    MODELOS.map((m) => ({ etiqueta: m.id === "principal" ? "IA servidor" : m.nombre.replace(/\s*\(.*\)/, "").slice(0, 16), sin: m.sin[clave], con: m.con[clave] })), [Math.max(320, 150 + MODELOS.length * 130), 260], 30)}<figcaption>${nom} (porcentaje de las ${n} preguntas)</figcaption></figure>`;
  return `<section class="ev-s" id="modelos"><h2>El MCP mejora a todos los modelos, no solo a uno</h2>
${varios
    ? `<p>El profesor pidió comparar la IA sola con la IA más la herramienta en <b>varios modelos</b>, para comprobar que la mejora no depende de un modelo en particular. Se hicieron las mismas ${n} preguntas, sin y con MCP, a cada modelo. «Respondidas» indica cuántas preguntas alcanzó a contestar antes de que el proveedor pusiera su límite de uso; las que faltan cuentan como no acertadas.</p>
<p>Resultado: con MCP las respuestas exactas suben en ${MODELOS.filter((m) => m.con.exactitud > m.sin.exactitud).length} de ${MODELOS.length} modelos (${MODELOS.map((m) => `${esc(m.nombre)}: de ${ok(m.sin.exactitud)} a ${ok(m.con.exactitud)} de ${n}`).join("; ")}). El tamaño de la mejora depende del modelo: un modelo que contesta sin llamar a la herramienta se beneficia menos. El <b>recall</b> de obras es bajo en los modelos que solo dan el total sin nombrar las obras (ver la sección de recall).</p>
<div class="figs">${grafico("exactitud", "gM1", "Respuestas exactas")}${grafico("estricta", "gM2", "Respuestas exactas con criterio estricto")}${grafico("recall", "gM3", "Recall de obras")}</div>${leyenda}`
    : `<p>Aquí se compara cada modelo, sin y con MCP, para comprobar que la mejora no depende de un modelo en particular. Por ahora solo está la corrida principal (la IA del servidor del grupo); las corridas de otros modelos se añaden cuando terminan.</p>`}
${tab}
${MODELOS.filter((m) => m.nota).map((m) => `<p class="small mut"><b>${esc(m.nombre)}:</b> ${esc(m.nota)}</p>`).join("")}
<p class="small mut">Resultados por modelo en <a href="${REPO}/tree/main/eval/resultados/modelos"><code>eval/resultados/modelos/</code></a>. Una sola corrida por modelo, con puntuación automática.</p></section>`;
}

const script = String.raw`(function(){
var q=document.getElementById('ev-buscar'),bs=[].slice.call(document.querySelectorAll('.ev-f button')),rs=[].slice.call(document.querySelectorAll('.qr')),n=document.getElementById('ev-cuenta'),v=document.getElementById('ev-vacio'),t='';
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function f(){var s=norm(q.value.trim()),c=0;rs.forEach(function(r){var o=(!t||r.getAttribute('data-tipo')===t)&&(!s||norm(r.getAttribute('data-q')).indexOf(s)>-1);r.hidden=!o;if(o)c++});n.textContent='Mostrando '+c+' de '+rs.length+' preguntas';v.hidden=c>0}
bs.forEach(function(b){b.addEventListener('click',function(){t=b.getAttribute('data-t');bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});f()})});
q.addEventListener('input',f);f();
})();`;

export function evaluacion(m: Meta): string {
  const g = (c: string) => EVAL.global.find((x) => x.condicion === c)!;
  const sin = g("sin_mcp"), con = g("con_mcp");
  const n = EVAL.preguntas, ok = (p: number) => Math.round((p * n) / 100);
  const rc = (x: typeof sin) => x.recall, pr = (x: typeof sin) => pc(x.precision);
  const cuerpo = `
<section class="ev-h"><div class="wrap">
<p class="eyebrow">Benchmarks</p>
<h1 style="max-width:20ch">¿Sirve de algo conectar la IA a los datos oficiales?</h1>
<p class="lead">Le hicimos las mismas ${n} preguntas sobre obras públicas a una IA sola y a la misma IA conectada a ObraClara por MCP. Aquí están los resultados, las ${n} preguntas y las respuestas completas.</p>
${enSencillo("El proyecto es el MCP: el «enchufe» que deja a un asistente de IA consultar el registro oficial de obras del MEF en lugar de responder de memoria. Para saber si sirve, hicimos un examen de 40 preguntas, cada una con su respuesta verificada en el archivo del MEF, y se lo dimos al asistente dos veces: sin el enchufe y con el enchufe.",
  "Es como comparar a un estudiante que responde de memoria con el mismo estudiante con el libro oficial abierto. Abajo puedes ver cada pregunta y cada respuesta, sin filtros ni maquillaje.")}
<div class="kpis">${kpi(`${ok(sin.exactitud)} de ${n}`, `acertó <b>sin MCP</b> (${sin.exactitud} %)`)}${kpi(`${ok(con.exactitud)} de ${n}`, `acertó <b>con MCP</b> (${con.exactitud} %)`, "con")}${kpi(`${ok(sin.inventada)} de ${n}`, `respuestas con cifras que no coinciden, sin MCP`)}${kpi(`${ok(con.citacion)} de ${n}`, `respuestas con fuente y fecha, con MCP (sin MCP: ${ok(sin.citacion)})`, "con")}</div>
<p class="small mut">Con la regla estricta (ninguna cifra sin respaldo): ${ok(sin.estricta)} de ${n} sin MCP y ${ok(con.estricta)} de ${n} con MCP. Mediana de tiempo por respuesta: ${nf(EVAL.latencia[0].mediana, 1)} s sin MCP y ${nf(EVAL.latencia[1].mediana, 1)} s con MCP. Datos al corte del 10 de noviembre de 2026; una sola corrida, puntuación automática.</p>

<div class="kpis">${kpi(`${rc(con)} %`, `de las obras que debía encontrar, las encontró <b>con MCP</b> (sin MCP: ${rc(sin)} %)`, "con")}${kpi(`${pr(con)}`, `de las obras que nombró con MCP eran correctas (sin MCP: ${pr(sin)})`, "con")}</div>
<p class="small mut">Recall y precisión se miden en las ${con.conReferencia} preguntas que piden contar o listar obras; ver «Qué se midió».</p>
</div></section>
<div class="wrap">
<section class="ev-s"><h2>Qué se midió</h2>
<ul class="l"><li><b>Exacta:</b> la respuesta contiene la cifra o entidad correcta del registro oficial (±1 %).</li>
<li><b>Estricta:</b> es exacta y ninguna otra cifra de la respuesta queda sin respaldo en la fuente.</li>
<li><b>Cita:</b> dice de dónde salió el dato (MEF) y la fecha de corte.</li>
<li><b>Inventada:</b> da cifras que no coinciden con la referencia (es un máximo: incluye cifras reales de otras fuentes).</li>
<li><b>Recall:</b> de las obras que la respuesta debía encontrar, qué porcentaje encontró (aciertos entre obras esperadas). Es la métrica que el profesor destacó.</li>
<li><b>Precisión:</b> de las obras que nombró, qué porcentaje es correcto (aciertos entre obras nombradas).</li>
<li><b>Tiempo:</b> cuánto tarda en responder; consultar el registro toma más que responder de memoria.</li></ul>
<p class="small mut">Reglas completas y limitaciones en <a href="/proyecto#evaluacion">El proyecto, sección Evaluación</a>.</p></section>
<section class="ev-s" id="graficos"><h2>Resultados en gráficos</h2>
<div class="figs"><figure>${graficoGlobal()}<figcaption>Todas las métricas, en porcentaje de las ${n} preguntas</figcaption></figure><figure>${graficoLatencia()}<figcaption>Tiempo medio por pregunta (con y sin reintentos)</figcaption></figure></div>${leyenda}
<h3 style="margin-top:28px">Por tipo de pregunta</h3><p class="small mut">Hay 10 preguntas de cada tipo.</p>
<div class="figs">${graficosPorTipo().replace(/<p class="que">.*?<\/p>/g, "")}</div>${leyenda}</section>
<section class="ev-s" id="recall"><h2>Recall y precisión: ¿encontró las obras?</h2>
<p>En las ${con.conReferencia} preguntas que piden <b>contar o listar obras</b>, medimos cuántas de las obras que debía encontrar apareció en la respuesta (<b>recall</b>) y cuántas de las que nombró eran correctas (<b>precisión</b>). La lista esperada son los códigos que devuelve la herramienta con los filtros correctos (máximo 20 por consulta). Una respuesta que solo da el total y no nombra obras tiene recall 0, porque no «encontró» ninguna.</p>
<div class="figs"><figure>${barrasAgrupadas("gR", "Recall, precisión y F1, sin y con la conexión (MCP)", `Barras agrupadas sobre ${con.conReferencia} preguntas de conteo o lista. Recall: ${sin.recall} % sin la conexión y ${con.recall} % con ella. Precisión: ${pc(sin.precision)} y ${pc(con.precision)}. F1: ${sin.f1} % y ${con.f1} %.`, [{ etiqueta: "Recall", sin: sin.recall, con: con.recall }, { etiqueta: "Precisión", sin: sin.precision ?? 0, con: con.precision ?? 0 }, { etiqueta: "F1", sin: sin.f1, con: con.f1 }], [400, 260], 36)}<figcaption>Porcentaje medio entre las ${con.conReferencia} preguntas de conteo o lista</figcaption></figure></div>${leyenda}
<p class="small mut">Precisión: solo cuenta las respuestas que nombran al menos una obra. F1 = 2 · precisión · recall / (precisión + recall).</p></section>
${modelosHtml()}
<section class="ev-s" id="preguntas"><h2>Las ${n} preguntas, una por una</h2>
<p>Filtra por tipo, busca una palabra (una región, un código, «Cusco») y abre «Ver respuesta» para comparar lo que contestó la IA sola con lo que contestó con MCP. ✓ y ✗ indican si se cumplió cada criterio; en «Inventada», ✓ es lo malo.</p>
<div class="ev-ctl"><input id="ev-buscar" type="search" placeholder="Buscar en preguntas y referencias" aria-label="Buscar en las preguntas">
<div class="ev-f" role="group" aria-label="Filtrar por tipo"><button type="button" data-t="" aria-pressed="true">Todas</button>${TIPOS.map(([k, t]) => `<button type="button" data-t="${k}" aria-pressed="false">${t}</button>`).join("")}</div></div>
<p class="ev-n" id="ev-cuenta" aria-live="polite">Mostrando ${n} de ${n} preguntas</p>
<div class="ev-hd" aria-hidden="true"><span>Código</span><span>Pregunta y referencia</span><span>Sin MCP</span><span>Con MCP</span></div>
${tarjetaSprite}<div id="ev-lista">${filas()}</div>
<div class="ev-vacio" id="ev-vacio" hidden>Ninguna pregunta coincide con el filtro.</div>
<p class="small mut" style="margin-top:14px">Respuestas recortadas y sin el marcado interno del proveedor; las completas están en <a href="${REPO}/tree/main/eval/resultados"><code>eval/resultados/</code></a>. Las respuestas de un asistente cambian entre intentos.</p></section>
</div>`;
  return shell({
    titulo: "Benchmarks · ObraClara Perú",
    descripcion: `Resultado de ${n} preguntas a una IA sola y con el MCP de ObraClara: aciertos, citas, cifras inventadas, tiempos, comparación entre modelos y todas las respuestas.`,
    ruta: "/evaluacion",
    cuerpo,
    m,
    cssExtra: diagramasCss + tarjetaCss + css,
    scriptExtra: script,
  });
}
