import { describe, expect, it } from "vitest";
import { createMcpHandler } from "agents/mcp/server";
import { crearServidor } from "../src/server";
import { dbEnMemoria, fila } from "./d1fake";

const db = dbEnMemoria([fila({ codigo_unico: "7", nombre: "OBRA DE PRUEBA", entidad: "MUNICIPALIDAD X", alerta_sobrecosto: 1, sobrecosto_pct: 60 })]);
const handler = createMcpHandler(() => crearServidor(db));

async function rpc(method: string, params: unknown = {}, id = 1) {
  const res = await handler.fetch(new Request("https://t/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  }));
  const t = await res.text();
  const linea = t.startsWith("event:") ? t.split("\n").find((l) => l.startsWith("data:"))!.slice(5) : t;
  return JSON.parse(linea);
}

describe("servidor MCP", () => {
  it("lista exactamente las 4 herramientas", async () => {
    const r = await rpc("tools/list");
    expect(r.result.tools.map((t: { name: string }) => t.name).sort()).toEqual(["alertas_inversion", "buscar_inversiones", "detalle_inversion", "resumen_inversiones"]);
  });
  it("cada respuesta trae datos, fuente, url y fecha", async () => {
    const r = await rpc("tools/call", { name: "detalle_inversion", arguments: { codigo_unico: "7" } });
    const cuerpo = JSON.parse(r.result.content[0].text);
    expect(cuerpo).toMatchObject({ datos: { codigo_unico: "7" }, fuente: "MEF", url: "https://x", fecha_descarga: "2026-11-10" });
    expect(cuerpo.aviso).toMatch(/indicios/);
  });
  it("informa cuando no hay resultados", async () => {
    const r = await rpc("tools/call", { name: "detalle_inversion", arguments: { codigo_unico: "0" } });
    expect(JSON.parse(r.result.content[0].text)).toMatchObject({ datos: null });
  });
});
