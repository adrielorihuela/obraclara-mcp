import { demoCss, demoHtml, demoScript } from "./demo";

export function pagina(m: Record<string, string>): string {
  const fecha = m.fecha_descarga ?? "sin datos";
  const total = Number(m.total_inversiones ?? 0).toLocaleString("es-PE");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ObraClara Perú</title>
<style>
:root{--bg:#fff;--fg:#1a1d21;--mut:#5b636e;--ac:#0b5fff;--card:#f4f6f9;--bd:#dde2e8}
@media (prefers-color-scheme:dark){:root{--bg:#14171a;--fg:#e8ebef;--mut:#9aa4af;--ac:#6ea2ff;--card:#1c2025;--bd:#2c3239}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
main{max-width:860px;margin:0 auto;padding:24px 16px}
h1{margin:.2em 0}h2{margin-top:1.6em}code{background:var(--card);padding:2px 6px;border-radius:4px;word-break:break-all}
.card{background:var(--card);border:1px solid var(--bd);border-radius:8px;padding:12px 16px;margin:12px 0}
input,select,button{font:inherit;padding:8px;border:1px solid var(--bd);border-radius:6px;background:var(--bg);color:var(--fg)}
button{background:var(--ac);color:#fff;border-color:var(--ac);cursor:pointer}
table{border-collapse:collapse;width:100%;font-size:14px}th,td{border-bottom:1px solid var(--bd);padding:6px;text-align:left;vertical-align:top}
.tabla{overflow-x:auto}.mut{color:var(--mut)}
${demoCss}
</style></head><body><main>
<h1>ObraClara Perú</h1>
<p>Asistente de inteligencia artificial para consultar y analizar datos de inversión pública mediante MCP.</p>
<div class="card"><b>${total}</b> inversiones activas del Banco de Inversiones del MEF · datos descargados el <b>${fecha}</b>.<br>
<span class="mut">Las alertas son indicios técnicos para orientar la revisión. No prueban irregularidades ni corrupción.</span></div>

${demoHtml}

<h2>Conéctalo a tu asistente</h2>
<p>Servidor MCP público, sin inicio de sesión. Dirección:</p>
<p><code>https://obraclara.adrielorihuela.net/mcp</code></p>
<ul><li><b>claude.ai:</b> Configuración, Conectores, Agregar conector personalizado, pega la dirección.</li>
<li><b>Claude Code:</b> <code>claude mcp add --transport http obraclara https://obraclara.adrielorihuela.net/mcp</code></li></ul>
<p>Preguntas de ejemplo: «¿Qué obras de salud del Cusco llevan seis meses o más sin gasto?», «Resume las inversiones de la Municipalidad Provincial de Piura», «¿Cuál es el avance de la inversión con código único 2716769?».</p>

<h2>Prueba rápida (sin IA)</h2>
<form id="f"><input id="q" placeholder="Texto, por ejemplo: hospital Piura" size="30">
<select id="t"><option value="buscar">Buscar</option><option value="sobrecosto">Alertas de sobrecosto</option><option value="paralizacion">Alertas de posible paralización</option></select>
<button>Consultar</button></form>
<div id="r" class="tabla"></div>

<h2>Fuente</h2>
<p>Ministerio de Economía y Finanzas, <a href="${m.url ?? "https://www.datosabiertos.gob.pe"}">Información de inversiones públicas 2001-2026</a>, licencia Open Data Commons Attribution. Código abierto: <a href="https://github.com/adrielorihuela/obraclara-mcp">github.com/adrielorihuela/obraclara-mcp</a>.</p>
</main>
<script>${demoScript}</script>
<script>
const f=document.getElementById('f'),r=document.getElementById('r');
const s=n=>n==null?'':Number(n).toLocaleString('es-PE',{maximumFractionDigits:2});
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
f.addEventListener('submit',async e=>{e.preventDefault();r.textContent='Consultando…';
 const t=document.getElementById('t').value,q=document.getElementById('q').value;
 const u=t==='buscar'?'/api/buscar?texto='+encodeURIComponent(q):'/api/alertas?tipo='+t+'&texto='+encodeURIComponent(q);
 try{const d=await (await fetch(u)).json();
  if(d.error){r.textContent=d.error;return}
  const h=['Código','Inversión','Entidad','Costo actualizado (S/)','Avance físico %','Sobrecosto %','Meses sin devengado'];
  r.innerHTML='<p>'+esc(d.datos.total)+' resultados, se muestran '+esc(d.datos.mostrados)+'. Fuente: '+esc(d.fuente)+', '+esc(d.fecha_descarga)+'.</p><table><tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr>'+
  d.datos.inversiones.map(i=>'<tr><td>'+esc(i.codigo_unico)+'</td><td>'+esc(i.nombre)+'</td><td>'+esc(i.entidad)+'</td><td>'+s(i.costo_actualizado)+'</td><td>'+s(i.avance_fisico)+'</td><td>'+s(i.sobrecosto_pct)+'</td><td>'+s(i.meses_sin_devengado)+'</td></tr>').join('')+'</table>';
 }catch(x){r.textContent='Error al consultar'}});
</script></body></html>`;
}
