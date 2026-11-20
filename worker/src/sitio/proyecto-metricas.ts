// Sección «Métricas» de /proyecto: gráficos de barras en SVG generados desde metricas-datos.ts (a su vez generado desde metricas/resultados/*.csv).
import { esc } from "./layout";
import { METRICAS as M } from "./metricas-datos";
import { nf } from "./proyecto-diagramas";

type Barra = { v: number; t: string; cls: string };
type Fila = { e: string; b: Barra[] };

// Barras horizontales; una o dos barras por fila. El texto de cada barra va a su derecha.
function hbar(id: string, titulo: string, desc: string, filas: Fila[], max?: number): string {
  const lw = 178, bw = 150, h = 20, gap = 4, pad = 14, W = 470;
  const m = max ?? Math.max(...filas.flatMap((f) => f.b.map((x) => x.v)), 1);
  let y = 4, s = "";
  for (const f of filas) {
    const alto = f.b.length * h + (f.b.length - 1) * gap;
    s += `<text x="0" y="${y + alto / 2 + 4.5}" class="gx-t">${esc(f.e)}</text>`;
    f.b.forEach((b, i) => {
      const w = Math.max(2, (b.v / m) * bw), yy = y + i * (h + gap);
      s += `<rect x="${lw}" y="${yy}" width="${w.toFixed(1)}" height="${h}" rx="3" class="${b.cls}"/><text x="${(lw + w + 6).toFixed(1)}" y="${yy + 14.5}" class="gx-t gx-n">${esc(b.t)}</text>`;
    });
    y += alto + pad;
  }
  return `<svg class="gx gx-m2" viewBox="0 0 ${W} ${Math.round(y)}" role="img" aria-labelledby="${id}-t ${id}-d"><title id="${id}-t">${esc(titulo)}</title><desc id="${id}-d">${esc(desc)}</desc>${s}</svg>`;
}
const fig = (g: string, titulo: string, leyenda: string, que: string) =>
  `<figure class="fig rv"><h4 class="gt">${titulo}</h4>${g}${leyenda}<p class="que"><b>Qué significa:</b> ${que}</p></figure>`;
const ley = (...it: [string, string][]) => `<ul class="leyenda">${it.map(([c, t]) => `<li><i style="background:var(${c})"></i>${t}</li>`).join("")}</ul>`;
const kpi = (b: string, t: string) => `<div class="kpi"><b>${b}</b><span>${t}</span></div>`;
const p1 = (v: number) => nf(v, 1) + " %";
const NIV: Record<string, string> = { GL: "Gobiernos locales", GR: "Gobiernos regionales", GN: "Gobierno nacional" };
const COL: Record<string, string> = { avance_fisico: "Avance físico", ultimo_devengado: "Último gasto registrado", avance_ejecucion: "Avance de ejecución", habitantes: "Habitantes beneficiados", fec_ini_ejecucion: "Fecha de inicio", monto_viable: "Monto aprobado (viable)", ubigeo: "Código de ubicación", departamento: "Departamento", costo_actualizado: "Costo actualizado" };
const tit = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
const ms = (v: number) => nf(v / 1000, 1) + " s";
const quita = (t: string) => t.replace(/\s*\(.*\)/, "");

export function metricasHtml(): string {
  const PG = M.paginas;
  const vac = hbar("mV", "Porcentaje de datos vacíos en las columnas clave", `Barras horizontales: ${M.vacios.map((v) => `${COL[v.columna]} ${p1(v.pct)}`).join("; ")}.`,
    M.vacios.map((v) => ({ e: COL[v.columna], b: [{ v: v.pct, t: p1(v.pct), cls: v.pct > 20 ? "gx-b3" : "gx-b4" }] })), 100);
  const niv = hbar("mN", "Inversiones por nivel de gobierno", `Inversiones: ${M.porNivel.map((v) => `${NIV[v.nivel]} ${nf(v.inversiones)} (${p1(v.pct)})`).join("; ")}.`,
    M.porNivel.map((v) => ({ e: NIV[v.nivel], b: [{ v: v.inversiones, t: `${nf(v.inversiones)} · ${p1(v.pct)}`, cls: "gx-b4" }] })), M.porNivel[0].inversiones * 1.25);
  const dep = hbar("mD", "Los 10 departamentos con más inversiones", `Barras: ${M.topDepartamentos.map((v) => `${tit(v.departamento)} ${nf(v.inversiones)}`).join("; ")}.`,
    M.topDepartamentos.map((v) => ({ e: tit(v.departamento), b: [{ v: v.inversiones, t: `${nf(v.inversiones)} · ${p1(v.pct)}`, cls: "gx-b4" }] })), M.topDepartamentos[0].inversiones * 1.3);
  const aniv = hbar("mAN", "Porcentaje de inversiones con alerta, por nivel de gobierno", `Por nivel: ${M.alertasPorNivel.map((v) => `${NIV[v.nivel]} ${p1(v.pctSobrecosto)} con sobrecosto y ${p1(v.pctParalizacion)} con posible paralización`).join("; ")}.`,
    M.alertasPorNivel.map((v) => ({ e: NIV[v.nivel], b: [{ v: v.pctSobrecosto, t: p1(v.pctSobrecosto), cls: "gx-b3" }, { v: v.pctParalizacion, t: p1(v.pctParalizacion), cls: "gx-b2" }] })), 40);
  const adep = hbar("mAD", "Alertas en los 10 departamentos con más alertas de sobrecosto", `Cantidad de inversiones con alerta: ${M.alertasTopDepartamentos.map((v) => `${tit(v.departamento)} ${nf(v.sobrecosto)} de sobrecosto y ${nf(v.paralizacion)} de posible paralización`).join("; ")}.`,
    M.alertasTopDepartamentos.map((v) => ({ e: tit(v.departamento), b: [{ v: v.sobrecosto, t: nf(v.sobrecosto), cls: "gx-b3" }, { v: v.paralizacion, t: nf(v.paralizacion), cls: "gx-b2" }] })));
  const hs = hbar("mHS", "Cuánto se pasó del monto aprobado cada inversión", `Número de inversiones por tramo de sobrecosto: ${M.histSobrecosto.map((v) => `${v.tramo} ${nf(v.inversiones)}`).join("; ")}.`,
    M.histSobrecosto.map((v) => ({ e: quita(v.tramo).replace("< 0 %", "Menos que lo aprobado").replace("sin dato", "Sin dato"), b: [{ v: v.inversiones, t: `${nf(v.inversiones)} · ${p1(v.pct)}`, cls: v.tramo.includes("alerta") ? "gx-b3" : "gx-b1" }] })));
  const hm = hbar("mHM", "Cuántos meses llevan sin registrar gasto", `Número de inversiones por tramo de meses sin gasto: ${M.histMeses.map((v) => `${v.tramo} ${nf(v.inversiones)}`).join("; ")}.`,
    M.histMeses.map((v) => ({ e: quita(v.tramo).replace("sin dato", "Sin gasto registrado"), b: [{ v: v.inversiones, t: `${nf(v.inversiones)} · ${p1(v.pct)}`, cls: v.tramo.includes("alerta") ? "gx-b2" : "gx-b1" }] })));
  const rend = M.rendimiento;
  const rm = hbar("mR", "Cuánto tarda el servidor en responder, por herramienta", `Tiempo mediano y tiempo del 90 % de las llamadas: ${rend.map((r) => `${r.prueba} ${ms(r.p50)} y ${ms(r.p90)}`).join("; ")}.`,
    rend.map((r) => ({ e: `${r.prueba} (n = ${r.llamadas})`, b: [{ v: r.p50, t: ms(r.p50), cls: "gx-con" }, { v: r.p90, t: ms(r.p90), cls: "gx-sin" }] })));
  const AE = M.asistenteExt, aeT = AE[0], aeCat = AE.slice(1);
  const NOMCAT: Record<string, string> = { busqueda: "Búsqueda", detalle: "Detalle de una obra", alertas: "Alertas", resumen: "Resumen por entidad o región" };
  const asi = hbar("mA", "Cuánto tarda el asistente del sitio en responder, por tipo de pregunta", `Tiempo mediano y tiempo del 90 % de las preguntas: ${aeCat.map((a) => `${NOMCAT[a.grupo]} ${nf(a.p50, 1)} s y ${nf(a.p90, 1)} s`).join("; ")}.`,
    aeCat.map((a) => ({ e: `${NOMCAT[a.grupo]} (n = ${a.preguntas})`, b: [{ v: a.p50, t: `mediana ${nf(a.p50, 1)} s`, cls: "gx-con" }, { v: a.p90, t: `P90 ${nf(a.p90, 1)} s`, cls: "gx-sin" }] })));
  const modelosTxt = Object.entries(M.asistenteModelos).map(([k, v]) => `${v} con ${k}`).join(", ");
  const llamadasHerr = rend.filter((r) => r.prueba.includes("_")).reduce((t, r) => t + r.llamadas, 0);
  const ex = M.exactitud;
  const todasOk = rend.every((r) => r.exito === 100);
  const al = M.alertasTotales.find((a) => a.alerta === "ambas")!;
  return `
<p><b>En sencillo:</b> medimos cuatro cosas: si los datos están completos, cuántas obras tienen alertas, si el servidor responde rápido y sin fallar, y si lo que responde coincide con la base de datos. Todos los números salen de archivos con los resultados (carpeta <code>metricas/</code> del repositorio) y se volvieron a calcular con el corte del ${esc("10 de noviembre de 2026")}.</p>
<h3>1. Calidad de los datos</h3>
<div class="kpis rv">${kpi(nf(M.filas), "inversiones en la base, ya sin repetidos")}${kpi(M.vacios.filter((v) => v.pct < 1).length + " de " + M.vacios.length, "columnas clave con menos de 1 % de vacíos")}</div>
${fig(vac, "Datos vacíos en las columnas clave", "", `casi todos los datos de identificación y ubicación están completos, pero el avance físico falta en ${p1(M.vacios[0].pct)} de las obras. Por eso la alerta de paralización solo puede evaluar las obras que sí informan su avance.`)}
<div class="figs">${fig(niv, "Obras por nivel de gobierno", "", `${p1(M.porNivel[0].pct)} de las obras registradas las ejecutan las municipalidades; el resto, los gobiernos regionales y el nacional.`)}${fig(dep, "Los 10 departamentos con más obras", "", `Lima, Áncash y Cusco concentran la mayor cantidad de obras registradas; no significa que tengan más problemas, solo que tienen más obras.`)}</div>
<h3>2. Alertas</h3>
<div class="kpis rv">${M.alertasTotales.map((a) => kpi(nf(a.inversiones), { sobrecosto: "con alerta de sobrecosto (" + p1(a.pct) + ")", posible_paralizacion: "con posible paralización (" + p1(a.pct) + ")", ambas: "con las dos alertas (" + p1(a.pct) + ")", ninguna: "sin ninguna alerta (" + p1(a.pct) + ")" }[a.alerta] ?? a.alerta)).join("")}</div>
${fig(aniv, "Obras con alerta, por nivel de gobierno", ley(["--warn", "Sobrecosto"], ["--risk", "Posible paralización"]), `en los gobiernos regionales y el nacional hay más sobrecosto proporcional (${p1(M.alertasPorNivel[1].pctSobrecosto)} y ${p1(M.alertasPorNivel[2].pctSobrecosto)}) que en los locales (${p1(M.alertasPorNivel[0].pctSobrecosto)}); la posible paralización es más frecuente en los locales (${p1(M.alertasPorNivel[0].pctParalizacion)}). Son señales para revisar, no pruebas.`)}
${fig(adep, "Obras con alerta, por departamento", ley(["--warn", "Sobrecosto"], ["--risk", "Posible paralización"]), "los departamentos con más obras tienen más alertas en cifras absolutas; para comparar, conviene mirar el porcentaje (en la página <a href=\"/datos\">Datos</a>) y no solo la cantidad.")}
<div class="figs">${fig(hs, "Cuánto se pasó del monto aprobado", ley(["--warn", "Con alerta (50 % o más)"], ["--mut", "Sin alerta"]), `la mayoría de las obras (${p1(M.histSobrecosto[0].pct + M.histSobrecosto[1].pct)}) cuesta igual o menos de lo aprobado o hasta un 10 % más; ${p1(M.histSobrecosto.filter((x) => x.tramo.includes("alerta")).reduce((s, x) => s + x.pct, 0))} supera el 50 % y dispara la alerta.`)}${fig(hm, "Meses sin registrar gasto", ley(["--risk", "Tramo de la alerta (si el avance es de 40 % a 99 %)"], ["--mut", "Otros tramos"]), `muchas obras llevan años sin registrar gasto, pero la alerta solo se activa si además la obra va entre 40 % y 99 % de avance. Una obra terminada también deja de gastar: por eso es solo una señal.`)}</div>
<p class="small mut">Entre ambas alertas hay ${nf(al.inversiones)} inversiones que cumplen las dos a la vez (${p1(al.pct)}).</p>
<h3>3. Rendimiento del servidor MCP</h3>
<p>Se llamó 30 veces a cada una de las 4 herramientas (<b>n = ${llamadasHerr} llamadas</b>) y 10 veces a la lista de herramientas y al estado del servicio (n = ${rend.reduce((s, r) => s + r.llamadas, 0)} en total), una tras otra, desde Lima, contra el servidor público. Resultado: ${todasOk ? "<b>100 % de éxito</b>, sin ningún error" : "hubo errores: " + rend.reduce((s, r) => s + r.errores, 0)}.</p>
${fig(rm, "Tiempo de respuesta por herramienta", ley(["--accent", "Mediana: la mitad de las respuestas tardó menos"], ["--mut", "P90: el 90 % tardó menos"]), `la mitad de las consultas se responde en ${ms(Math.min(...rend.filter((r) => r.prueba.includes("_")).map((r) => r.p50)))} a ${ms(Math.max(...rend.filter((r) => r.prueba.includes("_")).map((r) => r.p50)))} y el 90 % en menos de ${ms(Math.max(...rend.filter((r) => r.prueba.includes("_")).map((r) => r.p90)))}. El tiempo incluye el viaje por internet desde Lima (cada llamada abre una conexión nueva).`)}
<h3>4. ¿Las herramientas dicen lo mismo que la base de datos?</h3>
<p>Se compararon las respuestas del servidor contra consultas directas a la base de datos, campo por campo.</p>
<div class="kpis rv">${kpi(`${ex.detalle.coinciden} de ${ex.detalle.casos}`, "fichas de obras idénticas a la base")}${kpi(`${ex.detalle.camposIguales} de ${ex.detalle.campos}`, "campos de esas fichas, iguales")}${kpi(`${ex.resumen.coinciden} de ${ex.resumen.casos}`, "resúmenes por filtro idénticos")}${kpi(`${ex.alertas.coinciden} de ${ex.alertas.casos}`, "listas de alertas con el mismo total")}</div>
${que2("en la muestra probada el servidor no cambió ninguna cifra: lo que muestra es igual a lo que hay en la base, en los 30 casos de detalle, los 10 resúmenes y las 14 consultas de alertas. Es una muestra, no una prueba de todas las obras.")}
<h3>5. Pruebas de software</h3>
<div class="kpis rv">${kpi(`${M.pruebas.pasan} de ${M.pruebas.total}`, `pruebas automáticas que pasan, en ${M.pruebas.archivos} archivos`)}${kpi(p1(M.pruebas.coberturaLineas), "de las líneas de código se ejecutan al probar")}${kpi(p1(M.pruebas.coberturaLogica), "en la lógica del servidor (sin las páginas)")}</div>
${que2(`una prueba automática es un pequeño programa que verifica que otro funciona; las ${M.pruebas.pasan} pasan. «Cobertura» es qué parte del código se ejecutó durante las pruebas: ${p1(M.pruebas.coberturaLineas)} de las líneas.`)}
<h3>6. Asistente del sitio, de punta a punta</h3>
<p>Se le hicieron <b>${aeT.preguntas} preguntas variadas</b> (${aeCat.map((a) => `${a.preguntas} de ${NOMCAT[a.grupo].toLowerCase()}`).join(", ")}) del banco de 40, de una en una y con pausa, usando el asistente completo con las herramientas conectadas. Respondió quien indica el servicio: ${modelosTxt}. Se comprobó cada respuesta contra el dato oficial del MEF, con la misma regla de la evaluación.</p>
<div class="kpis rv">${kpi(`${aeT.preguntas}`, "preguntas (n)")}${kpi(`${nf(aeT.p50, 1)} s`, "mediana: la mitad respondió en menos")}${kpi(`${nf(aeT.p90, 1)} s`, "P90: el 90 % respondió en menos")}${kpi(`${aeT.correctas} de ${aeT.preguntas}`, "respuestas correctas")}</div>
${fig(asi, "Tiempo de respuesta del asistente", ley(["--accent", "Mediana"], ["--mut", "P90"]), `el asistente tarda de ${nf(aeT.min, 1)} a ${nf(aeT.max, 1)} s por pregunta (${nf(aeT.errores)} con error). Es mucho más que el servidor porque la IA lee la pregunta, llama a las herramientas y redacta la respuesta. Funciona sobre un servicio compartido que puede hacer cola. La primera prueba usó solo 5 y 2 preguntas; esta la amplía a ${aeT.preguntas}.`)}
${que2(`en esta prueba el asistente acertó ${aeT.correctas} de ${aeT.preguntas} (${p1(aeT.pctCorrectas)}). Una primera medición del mismo día dio solo 4 de 24: la IA respondía sin consultar el registro (de memoria o con otras fuentes). Se corrigió en el servidor de IA: si las herramientas están conectadas y la pregunta pide datos de obras, no se acepta una respuesta que no las haya consultado. Las fallas que quedan son respuestas sin el dato, fuera de tema o con una cifra distinta de la oficial; la evaluación de 40 preguntas con la conexión (40 de 40) sigue siendo la medida de la conexión.`)}
<h3>7. Qué cambió en el asistente el 20/11</h3>
<p><b>En sencillo:</b> después de la exposición, el asistente se cayó en vivo. Ahora: si se corta la conexión muestra «Reconectando…» y solo pasa al modo de emergencia si dura más de unos 15 segundos; las respuestas cortadas se pueden recuperar o reintentar, y los mensajes que no se atendieron se pueden reenviar; mientras trabaja muestra sus pasos y al terminar los pliega en «Proceso · N pasos · X s · modelo». La memoria ya no es global: se guarda en el navegador de cada persona, se borra con los datos del navegador o con «Borrar toda» en «Acerca del asistente». Y, tras un intento de engaño que logró cambiar la memoria compartida, se añadieron reglas fijas contra engaños: una batería de 6 intentos quedó bloqueada en los 6.</p>
<h3>8. ¿Cuánto tardan en abrir las páginas?</h3>
<p><b>En sencillo:</b> se descargó 20 veces cada página pública (<b>n = ${PG.reduce((s, r) => s + r.n, 0)} descargas</b>, ${PG.length} páginas), una tras otra, desde Lima, el 20/11/2026. Se mide solo la descarga de la página, no el tiempo que tarda el navegador en dibujarla.</p>
<div class="tbw rv"><table class="ref num" style="white-space:nowrap"><thead><tr><th>Página</th><th>Descargas (n)</th><th>Éxito</th><th>Mediana</th><th>P90</th><th>Tamaño (KB)</th></tr></thead><tbody>${PG.map((r) => `<tr><td><code>${r.pagina}</code></td><td>${r.n}</td><td>${p1((r.exitosas / r.n) * 100)}</td><td>${ms(r.mediana_ms)}</td><td>${ms(r.p90_ms)}</td><td>${nf(r.bytes_medio / 1024, 0)}</td></tr>`).join("")}</tbody></table></div>
${que2(`las ${PG.reduce((s, r) => s + r.exitosas, 0)} descargas funcionaron. La mitad de las veces cada página llegó en ${nf(Math.min(...PG.map((r) => r.mediana_ms)) / 1000, 1)} a ${nf(Math.max(...PG.map((r) => r.mediana_ms)) / 1000, 1)} s; el 90 % llegó en menos de ${nf(Math.max(...PG.map((r) => r.p90_ms)) / 1000, 1)} s («P90»). Las páginas más pesadas (Evaluación, Proyecto) tardan un poco más. Los tiempos incluyen el viaje de red desde Lima.`)}
<p class="small mut">Cómo se generan: <code>node metricas/exportar_sitio.mjs</code> escribe <code>worker/src/sitio/metricas-datos.ts</code> a partir de <code>metricas/resultados/</code>. Detalle de cada medición en <a href="https://github.com/adrielorihuela/obraclara-mcp/blob/main/metricas/LEEME.md">metricas/LEEME.md</a>.</p>`;
}
function que2(t: string) { return `<p class="que"><b>Qué significa:</b> ${t}</p>`; }

export const metricasCss = String.raw`
.gx-m2{max-width:520px}
.gt{margin:0 0 10px;font:600 var(--s0)/1.35 var(--sans);color:var(--ink);text-align:center}
`;
