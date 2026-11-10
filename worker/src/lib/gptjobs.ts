export interface Mensaje { role: string; content: string }
export const MAX_PENDIENTES = 5;

export function validarMensajes(m: unknown): m is Mensaje[] {
  return Array.isArray(m) && m.length > 0 && m.length <= 24 &&
    m.every((x) => x && ["system", "user", "assistant"].includes(x.role) && typeof x.content === "string") &&
    m.reduce((n: number, x: Mensaje) => n + x.content.length, 0) <= 24000;
}
