import { demoCss, demoHtml, demoScript } from "./demo";
import { acerca, conectar, noEncontrada } from "./sitio/conectar";
import { datos } from "./sitio/datos";
import { inicio } from "./sitio/inicio";
import { shell, type Meta } from "./sitio/layout";

export function asistente(m: Meta): string {
  return shell({
    titulo: "Asistente · ObraClara Perú",
    descripcion: "Pregunta sobre inversión pública del Perú con y sin MCP, con gpt-headless o con tu propia IA.",
    ruta: "/asistente",
    cuerpo: demoHtml,
    m,
    cssExtra: demoCss,
    scriptExtra: demoScript,
    app: true,
  });
}

const PAGINAS: Record<string, (m: Meta) => string> = {
  "/": inicio,
  "/asistente": asistente,
  "/datos": datos,
  "/conectar": conectar,
  "/acerca": acerca,
};

/** HTML de una página del sitio, o null si la ruta no es una página. */
export function paginaSitio(ruta: string, m: Meta): string | null {
  const r = ruta.length > 1 ? ruta.replace(/\/+$/, "") : ruta;
  const f = PAGINAS[r];
  return f ? f(m) : null;
}

/** Página de inicio (se mantiene por compatibilidad). */
export const pagina = inicio;

export { noEncontrada };
