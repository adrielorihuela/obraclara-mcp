import { describe, expect, it } from "vitest";
import { alertas, buscar, codigoNivel, detalle, normalizar, resumen } from "../src/lib/queries";
import { dbEnMemoria, fila } from "./d1fake";

const db = dbEnMemoria([
  fila({ codigo_unico: "1", nombre: "MEJORAMIENTO DEL HOSPITAL DE CUSCO", entidad: "GOBIERNO REGIONAL CUSCO", nivel: "GR", costo_actualizado: 9000000, monto_viable: 5000000, sobrecosto_pct: 80, alerta_sobrecosto: 1, saldo_ejecutar: 4000000 }),
  fila({ codigo_unico: "2", nombre: "CREACIÓN DE POSTA MÉDICA", entidad: "MUNICIPALIDAD DISTRITAL DE SAN JERÓNIMO", costo_actualizado: 300000, avance_fisico: 55, ultimo_devengado: "202601", meses_sin_devengado: 10, alerta_paralizacion: 1 }),
  fila({ codigo_unico: "3", nombre: "MEJORAMIENTO DE COLEGIO", entidad: "MUNICIPALIDAD PROVINCIAL DE PIURA", funcion: "EDUCACIÓN", departamento: "PIURA", provincia: "PIURA", distrito: "PIURA", costo_actualizado: 2000000 }),
]);

describe("normalización", () => {
  it("quita tildes y pasa a mayúsculas", () => expect(normalizar("Educación")).toBe("EDUCACION"));
  it("reconoce niveles", () => { expect(codigoNivel("regional")).toBe("GR"); expect(codigoNivel("xyz")).toBeUndefined(); });
});

describe("buscar", () => {
  it("busca por texto sin importar tildes", async () => {
    const r = await buscar(db, { texto: "creacion posta medica" });
    expect(r.total).toBe(1); expect(r.inversiones[0]).toMatchObject({ codigo_unico: "2" });
  });
  it("ignora palabras de enlace en entidad: 'Gobierno Regional de Cusco' encuentra 'GOBIERNO REGIONAL CUSCO'", async () => {
    expect((await buscar(db, { entidad: "Gobierno Regional de Cusco" })).total).toBe(1);
    expect((await resumen(db, { entidad: "Gobierno Regional del Cusco" }))?.inversiones).toBe(1);
  });
  it("filtra por función con tildes opcionales", async () => expect((await buscar(db, { funcion: "educacion" })).total).toBe(1));
  it("la función es coincidencia exacta, no subcadena", async () => {
    const d2 = dbEnMemoria([fila({ codigo_unico: "a", nombre: "X", entidad: "E", funcion: "SALUD" }), fila({ codigo_unico: "b", nombre: "Y", entidad: "E", funcion: "SALUD Y SANEAMIENTO" })]);
    expect((await buscar(d2, { funcion: "salud" })).total).toBe(1);
  });
  it("filtra por departamento y nivel, ordena por costo", async () => {
    const r = await buscar(db, { departamento: "cusco" });
    expect(r.inversiones.map((x) => (x as { codigo_unico: string }).codigo_unico)).toEqual(["1", "2"]);
    expect((await buscar(db, { nivel: "regional" })).total).toBe(1);
  });
  it("rechaza un nivel desconocido", async () => { await expect(buscar(db, { nivel: "galáctico" })).rejects.toThrow(/Nivel no reconocido/); });
  it("devuelve vacío sin inventar", async () => expect((await buscar(db, { texto: "inexistente" })).total).toBe(0));
});

describe("detalle", () => {
  it("devuelve la ficha por código único", async () => expect(await detalle(db, "1")).toMatchObject({ entidad: "GOBIERNO REGIONAL CUSCO", sobrecosto_pct: 80 }));
  it("devuelve null si no existe", async () => expect(await detalle(db, "999")).toBeNull());
});

describe("alertas", () => {
  it("sobrecosto", async () => { const r = await alertas(db, "sobrecosto", {}); expect(r.total).toBe(1); expect(r.inversiones[0]).toMatchObject({ codigo_unico: "1" }); });
  it("paralización con filtro", async () => { expect((await alertas(db, "paralizacion", { departamento: "Cusco" })).total).toBe(1); expect((await alertas(db, "paralizacion", { departamento: "Piura" })).total).toBe(0); });
});

describe("resumen", () => {
  it("agrega cantidad, costo y alertas", async () => {
    expect(await resumen(db, { departamento: "cusco" })).toMatchObject({ inversiones: 2, costo_actualizado_total: 9300000, alertas_sobrecosto: 1, alertas_paralizacion: 1 });
  });
});
