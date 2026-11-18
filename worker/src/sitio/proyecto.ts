// Página /proyecto: toda la información del proyecto (problema, método, datos, alertas, arquitectura, evaluación,
// pruebas, referencias) para consultarla y mostrarla en la exposición. El mismo contenido está en docs/PROYECTO.md.
import { arquitecturaAncha, arquitecturaCss, arquitecturaVertical } from "./arquitectura";
import { EVAL } from "./evaluacion-datos";
import { cicloCrispDm, diagramasCss, flujoConsulta, flujoEtl, graficoCosto, graficoGlobal, graficoLatencia, graficoNiveles, graficosPorTipo, nf } from "./proyecto-diagramas";
import { REPO, MCP_URL, esc, shell, type Meta } from "./layout";

const tabla = (cab: string[], filas: string[][], cls = "") =>
  `<div class="tbw"><table class="tb ${cls}"><thead><tr>${cab.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${filas.map((f) => `<tr>${f.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
const leyenda = (...it: [string, string][]) => `<ul class="leyenda">${it.map(([c, t]) => `<li><i style="background:var(${c})"></i>${t}</li>`).join("")}</ul>`;
const si = (b: boolean) => (b ? "sí" : "no");

const SECCIONES: [string, string][] = [
  ["problema", "Problema y contexto"], ["objetivo", "Objetivo y alcance"], ["ods", "ODS 16"], ["metodologia", "Metodología CRISP-DM"],
  ["datos", "Datos y ETL"], ["alertas", "Criterios de alerta"], ["arquitectura", "Arquitectura"], ["herramientas", "Las 4 herramientas"],
  ["tecnologias", "Tecnologías"], ["evaluacion", "Evaluación"], ["pruebas", "Pruebas"], ["limitaciones", "Limitaciones y trabajo futuro"],
  ["ia", "Uso de IA"], ["referencias", "Referencias"], ["enlaces", "Enlaces"],
];

const COLUMNAS: [string, string][] = [
  ["Identificación (2)", "CODIGO_UNICO, NOMBRE_INVERSION"],
  ["Responsable y ubicación (9)", "ENTIDAD, NIVEL, SECTOR, FUNCION, DEPARTAMENTO, PROVINCIA, DISTRITO, UBIGEO, NUM_HABITANTES_BENEF"],
  ["Montos (6)", "MONTO_VIABLE, COSTO_ACTUALIZADO, PIM_ANIO_ACTUAL, DEV_ANIO_ACTUAL, SALDO_EJECUTAR, MONTO_LAUDO"],
  ["Estado (6)", "AVANCE_FISICO, AVANCE_EJECUCION, ULTIMO_DEVENGADO, FEC_INI_EJECUCION, FEC_FIN_EJECUCION, SITUACION"],
];

const HERRAMIENTAS = [
  { n: "buscar_inversiones", d: "Busca inversiones por texto libre y filtros. Devuelve hasta 20, de mayor a menor costo actualizado.",
    p: [["texto", "texto", "no", "palabras del nombre de la obra o del lugar"], ["entidad", "texto", "no", "nombre o parte del nombre (todas las palabras deben aparecer)"], ["departamento", "texto", "no", "por ejemplo Cusco"], ["funcion", "texto", "no", "función exacta, sin importar tildes"], ["nivel", "texto", "no", "local, regional o nacional"], ["limite", "entero 1 a 20", "no", "máximo de resultados"]],
    s: "<code>{ total, mostrados, inversiones[] }</code>", e: `<code>{"funcion":"Transporte","departamento":"Cusco","nivel":"regional"}</code>`, r: "total = 74 inversiones; se muestran las 20 de mayor costo." },
  { n: "detalle_inversion", d: "Ficha completa de una inversión por su código único: montos, avances, último devengado, fechas, ubicación y alertas.",
    p: [["codigo_unico", "texto", "sí", "código único de la inversión"]],
    s: "ficha completa o <code>null</code> con un aviso si no existe", e: `<code>{"codigo_unico":"2507146"}</code>`, r: "Hospital de Alta Complejidad (Piura): costo actualizado S/ 955 063 507,44; monto viable S/ 926 136 650,00." },
  { n: "alertas_inversion", d: "Lista inversiones con alerta de sobrecosto o de posible paralización. Son indicios, no prueba de irregularidades.",
    p: [["tipo", "sobrecosto | paralizacion", "sí", "tipo de alerta"], ["entidad, departamento, funcion, nivel", "texto", "no", "mismos filtros que la búsqueda"], ["limite", "entero 1 a 20", "no", "máximo de resultados"]],
    s: "<code>{ total, mostrados, inversiones[] }</code>, ordenada por sobrecosto o por meses sin devengado", e: `<code>{"tipo":"paralizacion","departamento":"Ayacucho"}</code>`, r: "total = 815 inversiones con posible paralización; se muestran 20." },
  { n: "resumen_inversiones", d: "Resume un conjunto de inversiones: cantidad, costo, devengado del año, saldo y alertas de cada tipo.",
    p: [["entidad, departamento, funcion, nivel", "texto", "no", "filtros opcionales"]],
    s: "<code>{ inversiones, costo_actualizado_total, devengado_anio_actual, saldo_por_ejecutar, alertas_sobrecosto, alertas_paralizacion }</code>", e: `<code>{"departamento":"Moquegua"}</code>`, r: "1 767 inversiones; costo S/ 20 049 064 306,37; 514 alertas de sobrecosto y 252 de posible paralización." },
];

const TECNOLOGIAS: [string, string][] = [
  ["TypeScript y Zod", "Código del Worker y validación de los parámetros de cada herramienta."],
  ["Cloudflare Workers", "Ejecuta el servidor MCP, la API y este sitio; límite de 60 solicitudes por minuto por cliente."],
  ["Cloudflare D1", "Base SQL de respaldo con las inversiones (consultas parametrizadas)."],
  ["Durable Objects", "Cola en memoria y puente WebSocket con el conector del grupo (clase <code>ColaIA</code>)."],
  ["MCP SDK y Agents SDK", "<code>@modelcontextprotocol/server</code> define las herramientas; <code>createMcpHandler</code> las expone en <code>/mcp</code>."],
  ["Streamable HTTP", "Transporte del protocolo MCP; sin login ni instalación para los clientes."],
  ["Python 3.12", "ETL determinista (<code>etl/inversiones.py</code>) y carga a SQLite (<code>etl/cargar_sqlite.py</code>)."],
  ["SQLite", "Base local de unos 141 MB que sirve las consultas pesadas sin gastar cuota de D1."],
  ["Vitest", "Pruebas automáticas del Worker y del sitio."],
  ["GitHub Actions", "<code>deploy.yml</code> (tipos, pruebas y despliegue) y <code>etl.yml</code> (carga manual a D1)."],
  ["IA del servidor", "API de IA privada del grupo, compatible con OpenAI, que responde el chat del panel. Respaldo de emergencia: Workers AI y, después, Groq."],
];

const REFERENCIAS: string[] = [
  `Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., Neelakantan, A., Shyam, P., Sastry, G., Askell, A., Agarwal, S., Herbert-Voss, A., Krueger, G., Henighan, T., Child, R., Ramesh, A., Ziegler, D. M., Wu, J., Winter, C., . . . Amodei, D. (2020). Language models are few-shot learners. En <i>Advances in Neural Information Processing Systems</i> (Vol. 33). <a href="https://arxiv.org/abs/2005.14165">https://arxiv.org/abs/2005.14165</a>`,
  `Congreso de la República. (2022). <i>Ley N.° 31589</i>.`,
  `Es, S., James, J., Espinosa Anke, L., &amp; Schockaert, S. (2024). RAGAs: Automated evaluation of retrieval augmented generation. En <i>Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics: System Demonstrations</i> (pp. 150–158). <a href="https://doi.org/10.18653/v1/2024.eacl-demo.16">https://doi.org/10.18653/v1/2024.eacl-demo.16</a>`,
  `Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., Dai, Y., Sun, J., Wang, M., &amp; Wang, H. (2023). <i>Retrieval-augmented generation for large language models: A survey</i>. arXiv. <a href="https://arxiv.org/abs/2312.10997">https://arxiv.org/abs/2312.10997</a>`,
  `Hou, X., Zhao, Y., Wang, S., &amp; Wang, H. (2025). <i>Model Context Protocol (MCP): Landscape, security threats, and future research directions</i>. arXiv. <a href="https://arxiv.org/abs/2503.23278">https://arxiv.org/abs/2503.23278</a>`,
  `Janssen, M., Charalabidis, Y., &amp; Zuiderwijk, A. (2012). Benefits, adoption barriers and myths of open data and open government. <i>Information Systems Management, 29</i>(4), 258–268. <a href="https://doi.org/10.1080/10580530.2012.716740">https://doi.org/10.1080/10580530.2012.716740</a>`,
  `Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y. J., Madotto, A., &amp; Fung, P. (2023). Survey of hallucination in natural language generation. <i>ACM Computing Surveys, 55</i>(12), 1–38. <a href="https://doi.org/10.1145/3571730">https://doi.org/10.1145/3571730</a>`,
  `Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.-t., Rocktäschel, T., Riedel, S., &amp; Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. En <i>Advances in Neural Information Processing Systems</i> (Vol. 33). <a href="https://arxiv.org/abs/2005.11401">https://arxiv.org/abs/2005.11401</a>`,
  `Li, J., Hui, B., Qu, G., Yang, J., Li, B., Li, B., Wang, B., Qin, B., Cao, R., Geng, R., Huo, N., Zhou, X., Ma, C., Li, G., Chang, K. C. C., Huang, F., Cheng, R., &amp; Li, Y. (2023). Can LLM already serve as a database interface? A BIg bench for large-scale database grounded text-to-SQLs. En <i>Advances in Neural Information Processing Systems</i> (Vol. 36). <a href="https://arxiv.org/abs/2305.03111">https://arxiv.org/abs/2305.03111</a>`,
  `Ministerio de Economía y Finanzas. (2026a). <i>Nota Informativa N.° 02</i> [Obras paralizadas, julio de 2026].`,
  `Ministerio de Economía y Finanzas. (2026b). <i>Información de inversiones públicas 2001–2026</i> [Conjunto de datos]. Plataforma Nacional de Datos Abiertos. <a href="https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-inversiones-p%C3%BAblicas-2001%E2%80%932026-mef">https://www.datosabiertos.gob.pe</a>`,
  `Model Context Protocol. (2025). <i>Specification (versión 2025-06-18)</i>. <a href="https://modelcontextprotocol.io/specification/2025-06-18">https://modelcontextprotocol.io/specification/2025-06-18</a>`,
  `Naciones Unidas. (s. f.). <i>Objetivo 16: Paz, justicia e instituciones sólidas</i>. <a href="https://sdgs.un.org/es/goals/goal16">https://sdgs.un.org/es/goals/goal16</a>`,
  `Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., Cancedda, N., &amp; Scialom, T. (2023). Toolformer: Language models can teach themselves to use tools. En <i>Advances in Neural Information Processing Systems</i> (Vol. 36). <a href="https://arxiv.org/abs/2302.04761">https://arxiv.org/abs/2302.04761</a>`,
  `Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., &amp; Polosukhin, I. (2017). Attention is all you need. En <i>Advances in Neural Information Processing Systems</i> (Vol. 30). <a href="https://arxiv.org/abs/1706.03762">https://arxiv.org/abs/1706.03762</a>`,
  `Wang, L., Ma, C., Feng, X., Zhang, Z., Yang, H., Zhang, J., Chen, Z., Tang, J., Chen, X., Lin, Y., Zhao, W. X., Wei, Z., &amp; Wen, J. (2024). A survey on large language model based autonomous agents. <i>Frontiers of Computer Science, 18</i>(6). <a href="https://doi.org/10.1007/s11704-024-40231-1">https://doi.org/10.1007/s11704-024-40231-1</a>`,
  `Wirtz, B. W., Weyerer, J. C., Becker, M., &amp; Müller, W. M. (2022). Open government data: A systematic literature review of empirical research. <i>Electronic Markets, 32</i>(4), 2381–2404. <a href="https://doi.org/10.1007/s12525-022-00582-8">https://doi.org/10.1007/s12525-022-00582-8</a>`,
  `Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., &amp; Cao, Y. (2023). ReAct: Synergizing reasoning and acting in language models. En <i>International Conference on Learning Representations (ICLR 2023)</i>. <a href="https://arxiv.org/abs/2210.03629">https://arxiv.org/abs/2210.03629</a>`,
  `Yu, T., Zhang, R., Yang, K., Yasunaga, M., Wang, D., Li, Z., Ma, J., Li, I., Yao, Q., Roman, S., Zhang, Z., &amp; Radev, D. (2018). Spider: A large-scale human-labeled dataset for complex and cross-domain semantic parsing and text-to-SQL task. En <i>Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing</i> (pp. 3911–3921). <a href="https://doi.org/10.18653/v1/D18-1425">https://doi.org/10.18653/v1/D18-1425</a>`,
];

const PRUEBAS: [string, number, string][] = [
  ["adjuntos", 27, "lectura de ZIP, texto frente a binario, documentos"],
  ["agente", 32, "análisis de llamadas JSON a herramientas, flujo SSE y protocolo del chat"],
  ["queries", 14, "normalización, <code>buscar</code>, <code>detalle</code>, <code>alertas</code> y <code>resumen</code> sobre una D1 simulada"],
  ["cadena", 13, "cadena de proveedores de IA y validación con imágenes"],
  ["agenteapi", 4, "validación de la API del modo agente"],
  ["remotedb", 4, "la consulta usa el conector y cae a D1 si no responde"],
  ["mcp", 3, "lista exactamente las 4 herramientas; cada respuesta trae datos, fuente, URL y fecha; se informa cuando no hay resultados"],
  ["gptjobs", 2, "validación de mensajes"],
  ["sitio", 5, "<code>/proyecto</code> responde con todas las secciones, tablas y gráficos, y el sitio no expone datos internos"],
];
const TOTAL_PRUEBAS = PRUEBAS.reduce((s, p) => s + p[1], 0);

const css = String.raw`
.pry-h{padding:clamp(40px,6vw,88px) 0 clamp(24px,4vw,48px)}
.pry-h .lead{margin-top:20px}
.pry{display:grid;grid-template-columns:230px minmax(0,1fr);gap:clamp(24px,4vw,64px);align-items:start;padding-bottom:var(--sec)}
.toc{position:sticky;top:76px;font-size:var(--s-1)}
.toc p{font:500 12px/1.2 var(--mono);color:var(--mut);margin:0 0 10px;letter-spacing:.04em;text-transform:uppercase}
.toc ol{margin:0;padding:0;list-style:none;display:grid;gap:2px;counter-reset:t}
.toc a{display:block;padding:6px 10px;border-radius:8px;text-decoration:none;color:var(--ink-2);counter-increment:t}
.toc a::before{content:counter(t) ". ";color:var(--mut);font-family:var(--mono)}
.toc a:hover{background:var(--surface-2);color:var(--ink)}
@media (max-width:1000px){.pry{grid-template-columns:minmax(0,1fr)}.toc{position:static;border:1px solid var(--line);border-radius:var(--r);padding:14px;background:var(--surface)}.toc ol{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}}
.ps{padding:clamp(36px,5vw,64px) 0;border-top:1px solid var(--line)}
.ps:first-child{border-top:0;padding-top:0}
.ps>h2{font-size:var(--s2);margin-bottom:18px;scroll-margin-top:80px}
.ps>h2 small{font:500 12px/1 var(--mono);color:var(--accent);margin-right:10px;vertical-align:middle}
.ps h3{margin:30px 0 10px}
.ps p,.ps li{color:var(--ink-2)}
.ps p+p{margin-top:12px}
.ps ul.l{margin:12px 0;padding-left:20px;display:grid;gap:6px}
.ps code{background:var(--surface-2);padding:1px 5px;border-radius:5px;font-size:.86em}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:20px 0}
.kpi{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);padding:14px 16px}
.kpi b{display:block;font:600 var(--s2)/1.15 var(--serif);color:var(--ink);font-variant-numeric:tabular-nums}
.kpi span{font-size:var(--s-1);color:var(--mut)}
.figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:28px;margin:24px 0;align-items:start}
.fig{margin:24px 0}.fig figcaption{text-align:center;max-width:62ch;margin-inline:auto}
.tbw{overflow-x:auto;margin:16px 0;border:1px solid var(--line);border-radius:var(--r);background:var(--surface)}
.tb{width:100%;border-collapse:collapse;font-size:var(--s-1);min-width:480px}
.tb th,.tb td{padding:10px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.tb thead th{background:var(--surface-2);font:500 12px/1.3 var(--mono);color:var(--mut);white-space:nowrap}
.tb tbody th{font-weight:600;color:var(--ink)}
.tb tr:last-child>*{border-bottom:0}
.tb.nw td{white-space:nowrap}.tb .num{text-align:right;font-variant-numeric:tabular-nums}
.fx{font:500 14px/1.7 var(--mono);padding:12px 14px;background:var(--surface-2);border-radius:8px;margin:12px 0;overflow-x:auto;color:var(--ink)}
.herr{display:grid;gap:18px;margin-top:18px}
.hc{border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);padding:20px;min-width:0}
.hc h3{margin:0 0 6px;font:600 var(--s1)/1.3 var(--mono)}
.hc .tbw{margin:12px 0;border-radius:8px}
.hc dl{margin:0;display:grid;grid-template-columns:90px minmax(0,1fr);gap:6px 12px;font-size:var(--s-1)}
.hc dt{color:var(--mut);font-family:var(--mono)}.hc dd{margin:0;color:var(--ink-2);min-width:0;overflow-wrap:anywhere}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
.ej{border:1px solid var(--line);border-radius:var(--r-l);background:var(--surface);padding:18px;margin:16px 0}
.ej>h4{margin:0 0 4px;font:600 var(--s0)/1.4 var(--sans);color:var(--ink)}
.ej .ref{font-size:var(--s-1);color:var(--mut);margin-bottom:14px}
.ej .par{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
@media (max-width:760px){.ej .par{grid-template-columns:minmax(0,1fr)}}
.ej .lado{border-radius:var(--r);padding:12px 14px;background:var(--surface-2);min-width:0}
.ej .lado.con{background:var(--accent-soft)}
.ej .lado h5{margin:0 0 8px;font:600 13px/1.3 var(--sans);display:flex;flex-wrap:wrap;gap:6px;align-items:center;color:var(--ink)}
.ej .lado p{font-size:var(--s-1);color:var(--ink);overflow-wrap:anywhere}
.refs{margin:0;padding:0;list-style:none;display:grid;gap:12px;font-size:var(--s-1)}
.refs li{padding-left:2.2em;text-indent:-2.2em;color:var(--ink-2);overflow-wrap:anywhere}
.enl{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:16px}
.enl a{display:block;border:1px solid var(--line);border-radius:var(--r);padding:14px 16px;text-decoration:none;background:var(--surface)}
.enl a:hover{border-color:var(--ink)}.enl b{display:block;color:var(--ink)}.enl span{font-size:var(--s-1);color:var(--mut);overflow-wrap:anywhere}
`;

export function proyecto(m: Meta): string {
  const g = (c: string) => EVAL.global.find((x) => x.condicion === c)!;
  const sin = g("sin_mcp"), con = g("con_mcp");
  const toc = SECCIONES.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("");
  const n = (i: number) => `<small>${String(i + 1).padStart(2, "0")}</small>`;
  const sec = (i: number, cuerpo: string) => `<section class="ps" id="${SECCIONES[i][0]}"><h2>${n(i)}${SECCIONES[i][1]}</h2>${cuerpo}</section>`;

  const problema = sec(0, `
<p>Las obras paralizadas son un problema persistente de la inversión pública peruana: un dinero ya asignado que no se convierte en servicios para la población. Según la Nota Informativa N.° 02 del MEF (julio de 2026), con datos a marzo de 2026, hay <b>684 inversiones vinculadas a obras paralizadas</b> (MEF, 2026a).</p>
<div class="kpis rv"><div class="kpi"><b>684</b><span>inversiones vinculadas a obras paralizadas</span></div><div class="kpi"><b>S/ 21 141 M</b><span>costo actualizado</span></div><div class="kpi"><b>S/ 13 100 M</b><span>devengado</span></div><div class="kpi"><b>S/ 8 041 M</b><span>saldo por ejecutar</span></div></div>
<div class="figs"><figure class="rv">${graficoNiveles()}<figcaption>Los gobiernos locales concentran 511 de las 684 inversiones (75 %); el gobierno nacional tiene 93 y los regionales 80.</figcaption></figure>
<figure class="rv">${graficoCosto()}<figcaption>El gobierno nacional concentra S/ 4 364 millones del saldo (54,3 %), con solo 93 inversiones.</figcaption></figure></div>
<p>Las dos causas principales registradas son la <b>falta de recursos financieros</b> (109 inversiones, 15,9 %) y el <b>incumplimiento de contrato</b> (106 inversiones, 15,5 %) (MEF, 2026a).</p>
<h3>Los datos son abiertos, pero difíciles de usar</h3>
<p>La información para fiscalizar estas inversiones es pública: el MEF publica el archivo «DETALLE_INVERSIONES» en la Plataforma Nacional de Datos Abiertos (MEF, 2026b). Pero Janssen et al. (2012) advierten que publicar datos no basta para que sean útiles: sus beneficios solo aparecen cuando los usuarios pueden interpretarlos, y hay barreras técnicas y de uso, como campos que no se explican o formatos difíciles de procesar. Wirtz et al. (2022) ofrecen un marco para analizar esos obstáculos. En la práctica, un ciudadano, un periodista o un regidor que quiere saber cómo va una obra debe descargar un archivo de cientos de megabytes, entender términos como PIM, devengado o código único de inversiones (CUI) y filtrar a mano decenas de miles de filas.</p>
<p>ObraClara Perú propone que un asistente de IA haga esa consulta, pero solo con datos oficiales, citando la fuente y sin inventar cifras.</p>`);

  const objetivo = sec(1, `
<p><b>Objetivo general.</b> Facilitar el acceso a la información oficial de inversión pública del Perú mediante un servidor MCP público que permita a un asistente de IA buscar obras, ver su detalle, detectar alertas y resumir por entidad o región, con respuestas que citan la fuente y la fecha de los datos.</p>
<h3>Alcance</h3>
<ul class="l"><li><b>Una sola fuente oficial:</b> el archivo <code>DETALLE_INVERSIONES.csv</code> del MEF (datos abiertos, licencia ODC-BY).</li>
<li><b>Cuatro herramientas:</b> buscar inversiones, detalle de una obra, alertas y resumen por entidad o región.</li>
<li><b>Alertas = indicios, no prueba.</b> Orientan la revisión; no demuestran irregularidades ni corrupción y deben verificarse en la fuente oficial.</li>
<li><b>El modelo de lenguaje no calcula.</b> Todos los indicadores se calculan en el ETL con código determinista; el modelo solo consulta y redacta.</li></ul>`);

  const ods = sec(2, `
<p>El proyecto se articula con el Objetivo de Desarrollo Sostenible 16 (paz, justicia e instituciones sólidas) (Naciones Unidas, s. f.).</p>
${tabla(["Meta", "Texto", "Relación con el proyecto"], [
    ["16.6", "Crear a todos los niveles instituciones eficaces y transparentes que rindan cuentas.", "<span class=\"tag tag-a\">directa</span> Convierte datos complejos de ejecución de obras en respuestas claras."],
    ["16.10", "Garantizar el acceso público a la información.", "<span class=\"tag tag-a\">directa</span> Abre los datos del MEF a cualquier persona, en lenguaje natural y sin login."],
    ["16.5", "Reducir considerablemente la corrupción y el soborno en todas sus formas.", "<span class=\"tag tag-w\">indirecta</span> Facilita la vigilancia ciudadana, pero las alertas no prueban irregularidades."],
  ])}`);

  const fases: [string, string][] = [
    ["1. Comprensión del negocio", "Obras paralizadas, quiénes consultan (ciudadanos, periodistas, regidores) y vínculo con el ODS 16."],
    ["2. Comprensión de los datos", "Estructura (68 columnas), tamaño (150 641 filas, 247 MB), licencia ODC-BY y calidad (67 códigos repetidos, montos y avances vacíos)."],
    ["3. Preparación de los datos", "ETL en Python: limpieza, 23 columnas, indicadores y alertas, columnas de búsqueda y carga a SQLite y D1."],
    ["4. Modelado", "Diseño de las 4 herramientas MCP, sus parámetros y el formato de respuesta (datos, fuente, URL, fecha y aviso)."],
    ["5. Evaluación", "40 preguntas con respuesta verificada, hechas al mismo modelo sin y con MCP."],
    ["6. Despliegue", "Cloudflare Workers y D1, pruebas automáticas, documentación y este sitio."],
  ];
  const metodologia = sec(3, `
<p>El trabajo siguió CRISP-DM, un proceso iterativo de seis fases: cada hallazgo (por ejemplo, un error en la búsqueda por entidad) devolvió el trabajo a una fase anterior.</p>
<figure class="fig rv">${cicloCrispDm()}<figcaption>Las seis fases de CRISP-DM; la evaluación (resaltada) devolvió cambios a la preparación y al modelado.</figcaption></figure>
${tabla(["Fase", "En este proyecto"], fases)}`);

  const datos = sec(4, `
<p>Descarga del <b>10 de noviembre de 2026</b> (archivo modificado el 8 de noviembre). Fuente: MEF, <i>Información de inversiones públicas 2001–2026</i>, licencia Open Data Commons Attribution (ODC-BY).</p>
<div class="kpis rv"><div class="kpi"><b>150 641</b><span>filas en el CSV</span></div><div class="kpi"><b>68</b><span>columnas</span></div><div class="kpi"><b>247 MB</b><span>tamaño del archivo</span></div><div class="kpi"><b>67</b><span>códigos repetidos</span></div><div class="kpi"><b>150 574</b><span>inversiones tras la limpieza</span></div><div class="kpi"><b>23</b><span>columnas conservadas</span></div><div class="kpi"><b>≈ 141 MB</b><span>base SQLite</span></div></div>
<figure class="fig rv">${flujoEtl()}<figcaption>ETL: el CSV del MEF se limpia en Python y se carga en SQLite local y, como respaldo, en D1.</figcaption></figure>
<h3>Qué hace <code>etl/inversiones.py</code></h3>
<ul class="l"><li><b>Limpieza:</b> quita espacios; si un código único se repite, conserva la primera fila (67 repetidos, 150 641 − 67 = 150 574); convierte montos y avances a número (vacío o no numérico pasa a <code>NULL</code>); recorta las fechas a AAAA-MM-DD.</li>
<li><b>Indicadores:</b> <code>sobrecosto_pct</code>, <code>meses_sin_devengado</code>, <code>alerta_sobrecosto</code> y <code>alerta_paralizacion</code>.</li>
<li><b>Búsqueda:</b> <code>busqueda</code>, <code>entidad_n</code>, <code>funcion_n</code> y <code>departamento_n</code>, sin tildes y en mayúsculas.</li>
<li><b>Carga:</b> <code>etl/cargar_sqlite.py</code> crea la SQLite local y reemplaza la anterior de forma atómica; a D1 se carga a mano con el flujo <code>etl.yml</code>.</li></ul>
<h3>Las 23 columnas conservadas, en cuatro bloques</h3>
${tabla(["Bloque", "Columnas del CSV"], COLUMNAS.map(([a, b]) => [a, `<code>${b.replace(/, /g, "</code> <code>")}</code>`]))}`);

  const alertas = sec(5, `
<p>Cada criterio es una regla simple y reproducible, calculada en el ETL con la fecha de descarga como referencia.</p>
<div class="figs"><div class="rv"><h3><span class="tag tag-w">sobrecosto</span></h3>
<p class="fx">(COSTO_ACTUALIZADO − MONTO_VIABLE) / MONTO_VIABLE ≥ 0,50<br>con MONTO_VIABLE &gt; 0</p>
<p>Compara el costo vigente con el monto con que se declaró viable la inversión. Un aumento puede tener causas legítimas, como un expediente técnico con mayor alcance.</p></div>
<div class="rv"><h3><span class="tag tag-r">posible paralización</span></h3>
<p class="fx">40 % ≤ AVANCE_FISICO &lt; 100 %<br>y meses desde ULTIMO_DEVENGADO ≥ 6</p>
<p>Aproxima la definición de obra paralizada con dos campos del archivo: el avance físico y el último mes con gasto devengado.</p></div></div>
<h3>Base legal y por qué es una aproximación</h3>
<p>La Ley N.° 31589 considera paralizada una obra por contrata con avance físico de 40 % o más y seis meses o más sin ejecución física, o cuyo contrato fue resuelto o declarado nulo; para obras por administración directa, el avance mínimo es de 50 % (Congreso de la República, 2022). El archivo del MEF no permite replicar esa definición, así que la alerta es solo una aproximación:</p>
<ul class="l"><li>La ley habla de <b>ejecución física</b>; el archivo solo trae el <b>último mes con gasto devengado</b>, que es financiero.</li>
<li>Se aplica el umbral de 40 % a todas las inversiones, sin distinguir si la ejecución es por contrata o por administración directa (50 %).</li>
<li>No se sabe si el contrato fue resuelto o declarado nulo, ni si la entidad declaró la paralización.</li>
<li>El archivo incluye todas las inversiones activas, no solo obras.</li></ul>
<h3>Cifras al corte del 10 de noviembre de 2026</h3>
<div class="kpis rv"><div class="kpi"><b>16 502</b><span>con posible paralización (11,0 % de 150 574)</span></div><div class="kpi"><b>26 387</b><span>con sobrecosto ≥ 50 % (17,5 %)</span></div><div class="kpi"><b>684</b><span>obras paralizadas del inventario oficial</span></div></div>
<p>Las cifras de 16 502 y 26 387 salen de la API pública de este sitio (<code>/api/alertas</code>) y de <code>/salud</code>. No son comparables con las 684 inversiones del inventario del MEF, que es unas 24 veces menor, por cinco razones:</p>
<ul class="l"><li><b>Universo distinto:</b> el inventario cuenta obras paralizadas en el sentido de la ley; ObraClara revisa las 150 574 inversiones activas, incluidas las que no son obras.</li>
<li><b>Indicador distinto:</b> el inventario se basa en la situación de la obra; ObraClara usa avance físico y último devengado como indicio.</li>
<li><b>Sin modalidad ni declaración:</b> no se distingue contrata de administración directa ni contratos resueltos.</li>
<li><b>Fechas distintas:</b> el inventario es a marzo de 2026 y ObraClara, al 10 de noviembre de 2026.</li>
<li><b>Meses sin gasto por otros motivos:</b> una inversión puede no registrar devengado por razones administrativas sin estar paralizada.</li></ul>
<p class="nota">Por eso las alertas sirven para priorizar qué revisar, no para estimar cuántas obras están paralizadas.</p>`);

  const arquitectura = sec(6, `
<p>El Worker de Cloudflare expone el servidor MCP en <code>/mcp</code> y el sitio. Los datos viven en una SQLite local del servidor del grupo, a la que el Worker llega por un WebSocket saliente del conector (el equipo no abre puertos), y en D1 como respaldo.</p>
<figure class="fig rv">${arquitecturaAncha()}${arquitecturaVertical()}<figcaption>Arquitectura completa: del CSV del MEF al asistente.</figcaption></figure>
<h3>Qué pasa cuando alguien pregunta</h3>
<figure class="fig rv">${flujoConsulta()}${leyenda(["--accent", "etapas del servidor ObraClara (código determinista)"], ["--line-2", "etapas del modelo de lenguaje (LLM)"])}<figcaption>Las siete etapas de una consulta. En el ciclo ReAct (Yao et al., 2023) el modelo razona, usa una herramienta, lee el resultado y decide si necesita otra.</figcaption></figure>
<p>Con MCP el modelo no recuerda cifras: las pide al servidor. Esto sigue la idea de generación aumentada por recuperación (Lewis et al., 2020; Gao et al., 2023) y de modelos que aprenden a usar herramientas (Schick et al., 2023). Hou et al. (2025) revisan el protocolo y sus riesgos de seguridad.</p>`);

  const herramientas = sec(7, `
<p>Definidas en <code>worker/src/server.ts</code>; las consultas están en <code>worker/src/lib/queries.ts</code> (SQL parametrizado). Toda respuesta es un JSON con <code>datos</code>, <code>fuente</code>, <code>url</code>, <code>fecha_descarga</code> y, en alertas, detalle y resumen, un <code>aviso</code>. Los errores devuelven <code>isError: true</code>.</p>
<div class="herr">${HERRAMIENTAS.map((h) => `<article class="hc rv"><h3>${h.n}</h3><p>${h.d}</p>
${tabla(["Parámetro", "Tipo", "¿Obligatorio?", "Descripción"], h.p.map((p) => [`<code>${p[0]}</code>`, p[1], p[2], p[3]]))}
<dl><dt>Salida</dt><dd>${h.s}</dd><dt>Ejemplo</dt><dd>${h.e}</dd><dt>Resultado</dt><dd>${h.r}</dd></dl></article>`).join("")}</div>
<p class="small mut">Los ejemplos son consultas reales de la evaluación, con corte al 10 de noviembre de 2026.</p>`);

  const tecnologias = sec(8, `<p>Cada pieza se eligió para que el servicio funcione en el plan gratuito de Cloudflare y sea reproducible.</p>${tabla(["Tecnología", "Para qué se usa"], TECNOLOGIAS)}`);

  const ejemplos = EVAL.ejemplos.map((e) => {
    const lado = (l: { texto: string; exacta: boolean; cita: boolean; inventada: boolean; herramientas: readonly string[] }, etiqueta: string, cls: string) =>
      `<div class="lado ${cls}"><h5>${etiqueta}<span class="tag ${l.exacta ? "tag-a" : "tag-r"}">exacta: ${si(l.exacta)}</span><span class="tag ${l.cita ? "tag-a" : "tag-w"}">cita: ${si(l.cita)}</span><span class="tag ${l.inventada ? "tag-r" : "tag-a"}">inventada: ${si(l.inventada)}</span></h5><p>«${esc(l.texto)}»</p>${l.herramientas.length ? `<p class="small mut" style="margin-top:8px">Herramienta: <code>${esc(l.herramientas.join(", "))}</code></p>` : ""}</div>`;
    return `<article class="ej rv"><h4>${esc(e.id)} · ${esc(e.pregunta)}</h4><p class="ref">Referencia verificada en el CSV del MEF: ${esc(e.referencia)}</p><div class="par">${lado(e.sin, "Sin MCP", "sin")}${lado(e.con, "Con MCP", "con")}</div></article>`;
  }).join("");

  const evaluacion = sec(9, `
<h3>Método</h3>
<ul class="l"><li><b>${EVAL.preguntas} preguntas</b>, 10 de cada tipo (búsqueda, detalle, alertas y resumen), en <code>eval/preguntas.csv</code>.</li>
<li><b>Referencias verificadas antes de correr</b> la evaluación, contra el CSV del MEF (<code>verificar_referencias.py</code> y <code>verificar_csv_pandas.py</code>).</li>
<li><b>Las mismas preguntas, dos condiciones:</b> sin MCP (el modelo responde solo) y con MCP (llama a las herramientas del servidor público, hasta 5 pasos). Modelo: IA del servidor del grupo. Una sola corrida (R02, R03 y R07–R10 se repitieron o completaron el 18 de noviembre de 2026; el resto se ejecutó el 10 de noviembre).</li></ul>
${tabla(["Métrica", "Fórmula", "Regla"], [
    ["Exactitud", "preguntas exactas / 40 × 100", "valor numérico a ±1 % del oficial (basta que un número de la respuesta coincida); en texto, aparece la entidad esperada; sin datos, la respuesta dice que no hay resultados"],
    ["Citación", "respuestas que citan / 40 × 100", "menciona el MEF o el dataset y la fecha de corte (10/11/2026) o de descarga"],
    ["Inventada", "respuestas inventadas / 40 × 100", "da cifras que no coinciden con la referencia, afirma resultados donde no hay datos o nombra otra entidad"],
  ])}
<h3>Resultados</h3>
<div class="figs"><figure class="rv">${graficoGlobal()}${leyenda(["--mut", "Sin MCP"], ["--accent", "Con MCP"])}<figcaption>Porcentaje sobre las ${EVAL.preguntas} preguntas.</figcaption></figure>
<figure class="rv">${graficoLatencia()}${leyenda(["--mut", "Sin MCP"], ["--accent", "Con MCP"])}<figcaption>Latencia media por pregunta; con MCP el proveedor a veces tardó hasta 3 minutos y se reintentó una vez.</figcaption></figure></div>
${tabla(["Condición", "Exacta", "Cita", "Inventada", "Revisar", "Latencia total", "Sin reintentos", "Llamadas", "Ejecutadas"], [
    ["Sin MCP", `${sin.exactitud} %`, `${sin.citacion} %`, `${sin.inventada} %`, String(sin.revisar), `${nf(sin.latTotal, 1)} s`, `${nf(sin.latSinReintentos, 1)} s`, nf(sin.llamadas, 1), sin.ejecutadas],
    ["Con MCP", `${con.exactitud} %`, `${con.citacion} %`, `${con.inventada} %`, String(con.revisar), `${nf(con.latTotal, 1)} s`, `${nf(con.latSinReintentos, 1)} s`, nf(con.llamadas, 1), con.ejecutadas],
  ], "nw")}
<p>Con MCP, la herramienta esperada se usó en ${EVAL.herramientaEsperada.usada} de ${EVAL.herramientaEsperada.total} preguntas. Con MCP el modelo tardó más (${nf(con.latSinReintentos, 1)} s frente a ${nf(sin.latSinReintentos, 1)} s sin reintentos), porque consulta al servidor antes de responder.</p>
<h3>Por tipo de pregunta</h3>
<div class="figs">${graficosPorTipo()}</div>
${leyenda(["--mut", "Sin MCP"], ["--accent", "Con MCP"])}
<h3>Tres ejemplos reales</h3>
<p class="small mut">Respuestas de <code>eval/resultados/raw_*.jsonl</code>, recortadas y sin el marcado interno del proveedor.</p>
${ejemplos}
<h3>Limitaciones de la evaluación</h3>
<ul class="l">${EVAL.advertencias.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
<p class="small mut">Para regenerar los datos de esta sección: <code>node eval/exportar_sitio.mjs</code> (escribe <code>worker/src/sitio/evaluacion-datos.ts</code> a partir de <code>eval/resultados/</code>).</p>`);

  const pruebas = sec(10, `
<p><b>${TOTAL_PRUEBAS} pruebas automáticas en ${PRUEBAS.length} archivos</b> (Vitest), todas pasan. GitHub Actions las ejecuta, junto con la verificación de tipos (<code>tsc --noEmit</code>), antes de cada despliegue; el empaquetado de prueba (<code>wrangler deploy --dry-run</code>) se corre a mano.</p>
${tabla(["Archivo", "Pruebas", "Qué cubre"], PRUEBAS.map(([a, b, c]) => [`<code>${a}</code>`, String(b), c]))}
<pre class="fx">cd worker &amp;&amp; npm ci
npx vitest run
npx tsc --noEmit
npx wrangler deploy --dry-run</pre>
<p>También se probó a mano contra el servidor público con MCP Inspector (transporte Streamable HTTP).</p>`);

  const limitaciones = sec(11, `
<ul class="l"><li>Los datos corresponden a la fecha de descarga que informa cada respuesta; pueden no reflejar el estado más reciente en el MEF.</li>
<li>Las alertas son aproximaciones con reglas simples y no prueban irregularidades.</li>
<li>La recarga de D1 vacía brevemente la tabla; durante unos minutos las consultas a D1 pueden devolver pocos resultados.</li>
<li>La IA del servidor corre en un equipo del grupo: es compartida, tiene límite de uso y puede estar apagada (entonces responde un respaldo).</li>
<li>La evaluación es de una sola corrida, con puntuación automática y un modelo que puede cambiar entre preguntas.</li>
<li>Con MCP se usa un protocolo de herramientas en texto (JSON en la respuesta), no llamadas nativas.</li></ul>
<h3>Trabajo futuro</h3>
<ul class="l"><li>Repetir la evaluación varias veces y revisar a mano los casos marcados «revisar», con dos integrantes.</li>
<li>Acercar la alerta de paralización a la ley: distinguir contrata de administración directa y usar el avance físico más reciente, si el MEF lo publica.</li>
<li>Incorporar otras fuentes oficiales para contrastar las cifras del MEF.</li>
<li>Usar llamadas nativas a herramientas en los clientes que las soporten y acortar el tiempo en que D1 queda vacía durante la recarga.</li></ul>`);

  const ia = sec(12, `
<p><b>El código</b> se desarrolló con ayuda de IA generativa y fue <b>revisado y probado por el grupo</b> (pruebas automáticas, verificación de tipos y evaluación contra datos oficiales). <b>La redacción del informe, el workflow, los gráficos del informe y el póster</b> los hace el grupo sin IA. En el chat del panel, el modelo solo redacta: todas las cifras y alertas salen de las herramientas y del ETL.</p>`);

  const referencias = sec(13, `<ol class="refs" style="list-style:none">${REFERENCIAS.map((r) => `<li>${r}</li>`).join("")}</ol>`);

  const enlaces = sec(14, `<div class="enl">
<a href="${REPO}"><b>Repositorio</b><span>github.com/adrielorihuela/obraclara-mcp</span></a>
<a href="${REPO}/blob/main/docs/PROYECTO.md"><b>Esta página en GitHub</b><span>docs/PROYECTO.md</span></a>
<a href="/mcp"><b>Servidor MCP</b><span>${MCP_URL}</span></a>
<a href="/conectar"><b>Conectar</b><span>a Claude y otros clientes MCP</span></a>
<a href="/asistente"><b>Asistente</b><span>probar con y sin MCP</span></a>
<a href="/datos"><b>Datos y alertas</b><span>búsqueda directa y criterios</span></a></div>`);

  const cuerpo = `
<section class="pry-h"><div class="wrap">
<p class="eyebrow">El proyecto</p>
<h1 style="max-width:18ch">Del dato abierto a una respuesta con fuente.</h1>
<p class="lead">Todo sobre ObraClara Perú en una página: el problema, la metodología, los datos, las alertas, la arquitectura, la evaluación y las referencias. Proyecto del Grupo 1 de Inteligencia Artificial Aplicada, Universidad de Lima, 2026-2.</p>
</div></section>
<div class="wrap pry">
<nav class="toc" aria-label="Contenido de la página"><p>Contenido</p><ol>${toc}</ol></nav>
<div>${problema}${objetivo}${ods}${metodologia}${datos}${alertas}${arquitectura}${herramientas}${tecnologias}${evaluacion}${pruebas}${limitaciones}${ia}${referencias}${enlaces}</div>
</div>`;
  return shell({
    titulo: "El proyecto · ObraClara Perú",
    descripcion: "Problema, metodología CRISP-DM, datos y ETL, alertas, arquitectura, herramientas MCP, evaluación sin y con MCP, pruebas y referencias de ObraClara Perú.",
    ruta: "/proyecto",
    cuerpo,
    m,
    cssExtra: css + arquitecturaCss + diagramasCss,
  });
}
