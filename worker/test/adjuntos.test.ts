import { describe, expect, it } from "vitest";
import { deflateRawSync } from "node:zlib";
import {
  buildSystemPrompt, clasificarRuta, docxATexto, esTextoBytes, extensionArchivo, leerDocx, nombreSeguro, normalizarMensaje, parseToolCall,
  recortarMensajes, rutaSegura, tipoAdjunto, zipEntradas, zipExtraer,
} from "../src/lib/agente";
import { crc32, crearZip } from "./zipfake";

const enc = new TextEncoder();
const dec = new TextDecoder();

/** ZIP de prueba armado a mano: cada archivo en método 0 (stored) o 8 (deflate). */
function zipDe(archivos: { n: string; d: Uint8Array | string; m?: 0 | 8; flags?: number }[]): Uint8Array {
  const partes: Buffer[] = [];
  const cen: Buffer[] = [];
  let off = 0;
  for (const a of archivos) {
    const nombre = Buffer.from(a.n);
    const crudo = Buffer.from(typeof a.d === "string" ? enc.encode(a.d) : a.d);
    const m = a.m ?? 0;
    const datos = m === 8 ? deflateRawSync(crudo) : crudo;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(a.flags ?? 0, 6); lh.writeUInt16LE(m, 8);
    lh.writeUInt32LE(crc32(new Uint8Array(crudo)), 14); lh.writeUInt32LE(datos.length, 18); lh.writeUInt32LE(crudo.length, 22); lh.writeUInt16LE(nombre.length, 26);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(a.flags ?? 0, 8); ch.writeUInt16LE(m, 10);
    ch.writeUInt32LE(crc32(new Uint8Array(crudo)), 16); ch.writeUInt32LE(datos.length, 20); ch.writeUInt32LE(crudo.length, 24); ch.writeUInt16LE(nombre.length, 28); ch.writeUInt32LE(off, 42);
    partes.push(lh, nombre, datos);
    cen.push(ch, nombre);
    off += 30 + nombre.length + datos.length;
  }
  const dir = Buffer.concat(cen);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0); fin.writeUInt16LE(archivos.length, 8); fin.writeUInt16LE(archivos.length, 10); fin.writeUInt32LE(dir.length, 12); fin.writeUInt32LE(off, 16);
  return new Uint8Array(Buffer.concat([...partes, dir, fin]));
}

describe("lector ZIP", () => {
  it("lee stored y deflate", async () => {
    const z = zipDe([{ n: "a.txt", d: "hola mundo", m: 0 }, { n: "b/c.js", d: "console.log(1);\n".repeat(50), m: 8 }]);
    const { entradas } = zipEntradas(z);
    expect(entradas.map((e) => e.nombre)).toEqual(["a.txt", "b/c.js"]);
    expect(dec.decode((await zipExtraer(z, entradas[0], 1e6))!)).toBe("hola mundo");
    expect(dec.decode((await zipExtraer(z, entradas[1], 1e6))!)).toBe("console.log(1);\n".repeat(50));
    expect((await zipExtraer(z, entradas[1], 20))!.length).toBe(20);
  });
  it("rechaza datos que no son zip y avisa de ZIP64", () => {
    expect(zipEntradas(enc.encode("no soy un zip")).avisos[0]).toMatch(/ZIP válido/);
    const z = zipDe([{ n: "a", d: "x" }]);
    new DataView(z.buffer, z.byteOffset).setUint16(z.length - 22 + 10, 0xffff, true);
    expect(zipEntradas(z).avisos[0]).toMatch(/ZIP64/);
  });
  it("ignora cifrados", async () => {
    const z = zipDe([{ n: "s.txt", d: "secreto", flags: 1 }]);
    const e = zipEntradas(z).entradas[0];
    expect(e.cifrado).toBe(true);
    expect(await zipExtraer(z, e, 100)).toBeNull();
  });
  it("clasificarRuta", () => {
    expect(clasificarRuta("a/node_modules/x.js")).toBe("ignorar");
    expect(clasificarRuta("a/.venv/lib/x.py")).toBe("ignorar");
    expect(clasificarRuta("yarn.lock")).toBe("listar");
    expect(clasificarRuta("img/foto.JPG")).toBe("listar");
    expect(clasificarRuta("src/Makefile")).toBe("texto");
    expect(clasificarRuta("src/app.py")).toBe("texto");
  });
});

describe("texto vs binario y tipos", () => {
  it("detecta texto UTF-8 y binario", () => {
    expect(esTextoBytes(enc.encode("Año nuevo, ¿qué tal? 日本"))).toBe(true);
    expect(esTextoBytes(new Uint8Array([72, 105, 0, 33]))).toBe(false);
    expect(esTextoBytes(new Uint8Array([0xff, 0xfe, 0xfa, 0xfb, 0xfc, 0xfd, 0xc3, 0x28, 0xa0, 0xa1]))).toBe(false);
    const grande = new Uint8Array(20000).fill(65);
    grande[15000] = 0; // el NUL fuera de los primeros 8 KB no cuenta
    expect(esTextoBytes(grande)).toBe(true);
  });
  it("tipoAdjunto, extensión y nombres", () => {
    expect(tipoAdjunto("a.zip", "")).toBe("zip");
    expect(tipoAdjunto("a.DOCX", "")).toBe("docx");
    expect(tipoAdjunto("foto", "image/png")).toBe("imagen");
    expect(tipoAdjunto("main.rs", "")).toBe("texto");
    expect(extensionArchivo("a.tar.GZ")).toBe("gz");
    expect(nombreSeguro("c:\\x\\<img src=x onerror=1>\n.txt")).not.toMatch(/[<>\n\\]/);
    expect(nombreSeguro("")).toBe("archivo");
  });
  it("rutaSegura", () => {
    expect(rutaSegura("../../etc/passwd")).toBe("etc/passwd");
    expect(rutaSegura("/abs/ruta.txt")).toBe("abs/ruta.txt");
    expect(rutaSegura("a\\b\\c.txt")).toBe("a/b/c.txt");
    expect(rutaSegura("a<b>:c?.md")).toBe("a_b__c_.md");
    expect(rutaSegura("..")).toBe("");
  });
});

describe("documentos", () => {
  it("docx a texto: párrafos y entidades", () => {
    const xml = '<w:document><w:body><w:p><w:r><w:t>Hola</w:t></w:r><w:r><w:t xml:space="preserve"> &amp; adiós</w:t></w:r></w:p><w:p><w:pPr><w:tabs><w:tab w:val="left"/></w:tabs></w:pPr><w:r><w:t>2 &lt; 3</w:t></w:r></w:p></w:body></w:document>';
    expect(docxATexto(xml)).toBe("Hola & adiós\n2 < 3");
  });
  it("leerDocx lee el texto de un .docx y rechaza lo que no lo es", async () => {
    const doc = crearZip([{ ruta: "word/document.xml", datos: "<w:document><w:body><w:p><w:r><w:t>Informe &lt;1&gt;</w:t></w:r></w:p><w:p><w:r><w:t>Fin ñandú</w:t></w:r></w:p></w:body></w:document>" }]);
    expect((await leerDocx("i.docx", doc)).texto).toBe("Informe <1>\nFin ñandú");
    await expect(leerDocx("a.docx", crearZip([{ ruta: "x.txt", datos: "x" }]))).rejects.toThrow(/docx/);
  });
});

describe("recorte para proveedores con límite", () => {
  const sys = { role: "system", content: "S" };
  it("quita los mensajes más antiguos y conserva system y el último", () => {
    const m = [sys, { role: "user", content: "a".repeat(100) }, { role: "assistant", content: "b".repeat(100) }, { role: "user", content: "c".repeat(50) }];
    const r = recortarMensajes(m, 80);
    expect(r.map((x) => x.role)).toEqual(["system", "user"]);
    expect(r[1].content).toBe("c".repeat(50));
    expect(m).toHaveLength(4);
  });
  it("acorta el adjunto del último mensaje (texto o arreglo con imagen)", () => {
    const r = recortarMensajes([sys, { role: "user", content: "pregunta\n\n" + "z".repeat(5000) }], 1000);
    expect((r[1].content as string).length).toBeLessThan(1100);
    expect(r[1].content as string).toContain("[recortado]");
    const p = recortarMensajes([{ role: "user", content: [{ type: "text", text: "t".repeat(5000) }, { type: "image_url", image_url: { url: "data:x" } }] }], 1000);
    expect((p[0].content as any[])[1].type).toBe("image_url");
    expect((p[0].content as any[])[0].text.length).toBeLessThan(1100);
  });
  it("no toca lo que cabe", () => {
    const m = [sys, { role: "user", content: "hola" }];
    expect(recortarMensajes(m, 1000)).toEqual(m);
  });
});

describe("chats con adjuntos", () => {
  it("normalizarMensaje conserva los datos del chip (nombre, tipo, tamaño) y no guarda texto de archivos", () => {
    const m = normalizarMensaje({ rol: "u", texto: "q", adj: [{ n: "a.zip", t: "zip", c: 0, b: 10 }], ctx: "[Adjunto: a.zip]" })!;
    expect(m.adj).toEqual([{ n: "a.zip", t: "zip", c: 0, b: 10 }]);
    expect(JSON.stringify(m)).not.toContain("Adjunto: a.zip");
  });
});

describe("el prompt del modo simple no promete archivos", () => {
  it("con y sin MCP", () => {
    expect(buildSystemPrompt([], false)).not.toContain("```archivo:");
    expect(buildSystemPrompt([], true)).not.toContain("```archivo:");
    expect(buildSystemPrompt([], true)).toContain("No puedes crear ni leer archivos");
  });
  it("la respuesta JSON se sigue leyendo", () => {
    expect(parseToolCall('{"respuesta":"Listo\\nfin"}')).toEqual({ tipo: "respuesta", texto: "Listo\nfin" });
  });
});

describe("zip de prueba", () => {
  it("crc32 conocido y crearZip se lee de vuelta", async () => {
    expect(crc32(enc.encode("123456789"))).toBe(0xcbf43926);
    const z = crearZip([{ ruta: "a.txt", datos: "hola ñ" }, { ruta: "d/b.bin", datos: new Uint8Array([0, 1, 2, 255]) }]);
    const { entradas } = zipEntradas(z);
    expect(entradas.map((e) => e.nombre)).toEqual(["a.txt", "d/b.bin"]);
    expect(dec.decode((await zipExtraer(z, entradas[0], 100))!)).toBe("hola ñ");
  });
});
