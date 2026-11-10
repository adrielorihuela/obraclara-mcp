import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { alertas, buscar, detalle, meta, resumen, type Db, type Filtros } from "./lib/queries";

export const INSTRUCCIONES = `ObraClara Perú consulta las inversiones públicas activas del Ministerio de Economía y Finanzas (MEF, Banco de Inversiones).
Reglas para responder:
1. Cita siempre la fuente y la fecha_descarga que devuelve cada herramienta.
2. Si una herramienta devuelve cero resultados o un error, dilo; no supongas ni completes cifras.
3. Los montos están en soles (S/). No hagas cálculos propios: usa los campos que entrega el servidor.
4. Las alertas (sobrecosto, posible paralización) son indicios técnicos para orientar la revisión. No prueban irregularidades ni corrupción.
5. La alerta de posible paralización es una aproximación de la Ley 31589: usa el avance físico y el último mes con gasto devengado.`;

const filtros = {
  entidad: z.string().optional().describe("Nombre o parte del nombre de la entidad, por ejemplo 'Municipalidad Provincial de Piura'"),
  departamento: z.string().optional().describe("Departamento, por ejemplo 'Cusco'"),
  funcion: z.string().optional().describe("Función o sector, por ejemplo 'Salud', 'Educación', 'Saneamiento', 'Transporte'"),
  nivel: z.string().optional().describe("Nivel de gobierno: local, regional o nacional"),
};
const limite = z.number().int().min(1).max(20).optional().describe("Cantidad máxima de resultados (por defecto y máximo 20)");

export function ok(datos: unknown, m: Record<string, string>, aviso?: string) {
  const salida: Record<string, unknown> = {
    datos,
    fuente: m.fuente ?? "Ministerio de Economía y Finanzas (MEF)",
    url: m.url ?? "https://www.datosabiertos.gob.pe",
    fecha_descarga: m.fecha_descarga,
  };
  if (aviso) salida.aviso = aviso;
  return { content: [{ type: "text" as const, text: JSON.stringify(salida) }] };
}

export function fallo(mensaje: string) {
  return { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: mensaje }) }] };
}

const AVISO_ALERTAS =
  "Las alertas son indicios técnicos, no prueban irregularidades. La posible paralización usa el avance físico y el último mes con gasto devengado, como aproximación de la Ley 31589.";

export function crearServidor(db: Db): McpServer {
  const server = new McpServer({ name: "obraclara-peru", version: "0.1.0" }, { instructions: INSTRUCCIONES });

  server.registerTool(
    "buscar_inversiones",
    {
      description:
        "Busca inversiones públicas activas del MEF por texto libre (nombre de la obra, distrito, provincia) y filtros opcionales. Devuelve hasta 20, ordenadas por costo actualizado.",
      inputSchema: z.object({ texto: z.string().optional().describe("Palabras del nombre de la inversión o del lugar"), ...filtros, limite }),
    },
    async (a) => {
      try {
        const { limite: l, ...f } = a;
        return ok(await buscar(db, f as Filtros, l), await meta(db));
      } catch (e) { return fallo((e as Error).message); }
    },
  );

  server.registerTool(
    "detalle_inversion",
    {
      description: "Devuelve la ficha completa de una inversión a partir de su código único: montos, avance físico y de ejecución, último devengado, fechas, ubicación y alertas.",
      inputSchema: z.object({ codigo_unico: z.string().describe("Código único de la inversión, por ejemplo '2716769'") }),
    },
    async ({ codigo_unico }) => {
      try {
        const r = await detalle(db, codigo_unico);
        const m = await meta(db);
        return r ? ok(r, m, AVISO_ALERTAS) : ok(null, m, `No existe una inversión activa con código único ${codigo_unico}.`);
      } catch (e) { return fallo((e as Error).message); }
    },
  );

  server.registerTool(
    "alertas_inversion",
    {
      description:
        "Lista inversiones con alerta. 'sobrecosto': (costo actualizado - monto viable) / monto viable >= 50 %. 'paralizacion': avance físico entre 40 % y 99 % y 6 meses o más sin gasto devengado. Son indicios, no prueba de irregularidades.",
      inputSchema: z.object({ tipo: z.enum(["sobrecosto", "paralizacion"]), ...filtros, limite }),
    },
    async (a) => {
      try {
        const { tipo, limite: l, ...f } = a;
        return ok(await alertas(db, tipo, f as Filtros, l), await meta(db), AVISO_ALERTAS);
      } catch (e) { return fallo((e as Error).message); }
    },
  );

  server.registerTool(
    "resumen_inversiones",
    {
      description: "Resume un conjunto de inversiones: cantidad, costo actualizado total, devengado del año, saldo por ejecutar y cantidad de alertas de cada tipo. Filtra por entidad, departamento, función o nivel.",
      inputSchema: z.object({ ...filtros }),
    },
    async (a) => {
      try { return ok(await resumen(db, a as Filtros), await meta(db), AVISO_ALERTAS); }
      catch (e) { return fallo((e as Error).message); }
    },
  );

  return server;
}
