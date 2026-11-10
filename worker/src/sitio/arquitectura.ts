// Diagrama de arquitectura en SVG en línea (usa los tokens de color, así sirve en claro y oscuro).
// Dos versiones: horizontal (pantallas anchas) y vertical (teléfono).

type Caja = { x: number; y: number; w: number; h: number; t: string; l?: string[]; tipo?: "acento" | "grupo" | "normal" };

function caja(c: Caja): string {
  const cls = c.tipo === "acento" ? "ar-box ar-ac" : c.tipo === "grupo" ? "ar-grp" : "ar-box";
  const lineas = (c.l ?? []).map((s, i) => `<text x="${c.x + 16}" y="${c.y + 50 + i * 20}" class="ar-s">${s}</text>`).join("");
  return `<g><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="10" class="${cls}"/>` +
    `<text x="${c.x + 16}" y="${c.y + 27}" class="ar-t">${c.t}</text>${lineas}</g>`;
}

const flecha = (d: string, id: string, punteada = false, doble = false) =>
  `<path d="${d}" class="ar-ln${punteada ? " ar-dash" : ""}" marker-end="url(#${id})"${doble ? ` marker-start="url(#${id}s)"` : ""}/>`;
const rotulo = (x: number, y: number, t: string, anc: "start" | "middle" | "end" = "middle") =>
  `<text x="${x}" y="${y}" class="ar-lb" text-anchor="${anc}">${t}</text>`;

function defs(id: string): string {
  return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 1 9 5 0 9z" class="ar-hd"/></marker>` +
    `<marker id="${id}s" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M10 1 1 5 10 9z" class="ar-hd"/></marker></defs>`;
}

export function arquitecturaAncha(): string {
  const id = "arA";
  return `<svg class="arq arq-w" viewBox="0 0 1240 480" role="img" aria-labelledby="arA-t arA-d"><title id="arA-t">Arquitectura de ObraClara</title>
<desc id="arA-d">El CSV del MEF pasa por un ETL en Python ejecutado por GitHub Actions; se carga en Cloudflare D1 y en una base SQLite del servidor del grupo. Un Cloudflare Worker expone el servidor MCP y el sitio; los clientes MCP se conectan por Streamable HTTP. En el servidor del grupo, un conector abre un WebSocket saliente hacia el Worker para responder con gpt-headless y ejecutar las consultas en SQLite; si no está conectado, el Worker lee D1.</desc>
${defs(id)}
${caja({ x: 0, y: 40, w: 190, h: 120, t: "MEF · datos abiertos", l: ["DETALLE_INVERSIONES.csv", "≈ 248 MB", "licencia ODC-BY"] })}
${caja({ x: 240, y: 40, w: 190, h: 120, t: "ETL en Python", l: ["etl/inversiones.py", "GitHub Actions", "lunes 08:00 UTC"] })}
${caja({ x: 480, y: 40, w: 190, h: 120, t: "Cloudflare D1", l: ["base obraclara", "SQL parametrizado", "copia de respaldo"] })}
${caja({ x: 740, y: 40, w: 245, h: 200, t: "Cloudflare Worker", tipo: "acento", l: ["/mcp · 4 herramientas", "/api/chat · cola en memoria", "(Durable Object)", "límite: 60 solicitudes/min", "páginas de este sitio"] })}
${caja({ x: 1035, y: 40, w: 205, h: 200, t: "Clientes MCP", l: ["claude.ai", "Claude Code y Desktop", "MCP Inspector", "panel web del sitio", "cualquier cliente MCP"] })}
${flecha("M190 100H238", id)}${flecha("M430 100H478", id)}
${flecha("M670 100H738", id)}${rotulo(705, 88, "respaldo")}
${flecha("M987 140H1033", id, false, true)}${rotulo(1010, 128, "HTTP")}
${caja({ x: 240, y: 300, w: 745, h: 170, t: "Servidor del grupo (equipo propio, sin puertos abiertos)", tipo: "grupo" })}
${caja({ x: 260, y: 345, w: 200, h: 100, t: "SQLite local", l: ["inversiones.db", "consultas SELECT"] })}
${caja({ x: 500, y: 345, w: 200, h: 100, t: "gpt-headless", l: ["modelo por defecto", "del panel web"] })}
${caja({ x: 740, y: 345, w: 225, h: 100, t: "conector.mjs", l: ["responde preguntas", "y consultas SQL"] })}
${flecha("M335 160V343", id)}${rotulo(347, 236, "cargar_sqlite.py", "start")}
${flecha("M862 343V242", id, true, true)}${rotulo(875, 286, "WebSocket saliente", "start")}
${flecha("M738 395H702", id, false, true)}
${flecha("M852 445V462H360V447", id, true)}
</svg>`;
}

export function arquitecturaVertical(): string {
  const id = "arV";
  const w = 300, x = 10;
  return `<svg class="arq arq-v" viewBox="0 0 360 1010" role="img" aria-labelledby="arV-t"><title id="arV-t">Arquitectura de ObraClara: del CSV del MEF a tu asistente</title>
${defs(id)}
${caja({ x, y: 0, w, h: 92, t: "MEF · datos abiertos", l: ["DETALLE_INVERSIONES.csv · ≈ 248 MB", ] })}
${flecha("M160 92V126", id)}
${caja({ x, y: 128, w, h: 92, t: "ETL en Python", l: ["GitHub Actions, lunes 08:00 UTC"] })}
${flecha("M160 220V254", id)}
${caja({ x, y: 256, w, h: 92, t: "Cloudflare D1", l: ["copia de respaldo de la base"] })}
${flecha("M160 348V382", id)}
${caja({ x, y: 384, w, h: 150, t: "Cloudflare Worker", tipo: "acento", l: ["/mcp · 4 herramientas", "/api/chat · cola en memoria", "límite: 60 solicitudes/min", "páginas de este sitio"] })}
${flecha("M160 536V568", id, false, true)}
${caja({ x, y: 570, w, h: 112, t: "Clientes MCP", l: ["claude.ai · Claude Code", "Claude Desktop · MCP Inspector", "panel web · otros clientes"] })}
${caja({ x: 0, y: 730, w: 320, h: 276, t: "Servidor del grupo", tipo: "grupo" })}
${caja({ x: 20, y: 770, w: 280, h: 64, t: "conector.mjs", l: ["WebSocket saliente al Worker"] })}
${caja({ x: 20, y: 848, w: 280, h: 64, t: "gpt-headless", l: ["modelo por defecto del panel"] })}
${caja({ x: 20, y: 926, w: 280, h: 64, t: "SQLite local", l: ["consultas sin gastar D1"] })}
${flecha("M335 800H345V460H312", id, true)}${rotulo(352, 640, "WebSocket", "middle").replace("<text", '<text transform="rotate(90 352 640)"')}
</svg>`;
}

export const arquitecturaCss = String.raw`
.arq{width:100%;font-family:var(--sans)}
.arq-v{display:none;max-width:420px;margin:0 auto}
@media (max-width:760px){.arq-w{display:none}.arq-v{display:block}}
.ar-box{fill:var(--surface);stroke:var(--line-2);stroke-width:1}
.ar-ac{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.4}
.ar-grp{fill:none;stroke:var(--line-2);stroke-dasharray:4 5;stroke-width:1.2}
.ar-t{fill:var(--ink);font-size:15px;font-weight:600}
.ar-s{fill:var(--mut);font-size:12.5px;font-family:var(--mono)}
.ar-lb{fill:var(--mut);font-size:12px;font-family:var(--mono)}
.ar-ln{fill:none;stroke:var(--ink-2);stroke-width:1.3}
.ar-dash{stroke-dasharray:5 5}
.ar-hd{fill:var(--ink-2)}
.js .arq .ar-ln{stroke-dashoffset:0}
`;
