import { describe, expect, it } from "vitest";
import { deflateRawSync } from "node:zlib";
import {
  Adjunto, buildSystemPrompt, clasificarRuta, componerAdjuntos, crc32, crearDocx, crearZip, docxATexto, esTextoBytes, extensionArchivo, extraerArchivos,
  leerDocx, leerProyectoZip, limitesAdjuntos, mdALineasPdf, metaAdjuntos, nombreSeguro, normalizarMensaje, parseToolCall, recortarMensajes, rutaSegura,
  sinContexto, textoAdjunto, textoLatin1, textoPdf, textoPdfPagina, tipoAdjunto, validarDocumento, zipEntradas, zipExtraer,
} from "../src/lib/agente";

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
    const a = await leerProyectoZip("p.zip", z);
    expect(a.avisos!.join(" ")).toMatch(/cifrado/);
  });
  it("proyecto: árbol, basura ignorada, binarios y lock solo listados", async () => {
    const z = zipDe([
      { n: "proy/", d: "" },
      { n: "proy/src/index.js", d: "const a = 1;", m: 8 },
      { n: "proy/README.md", d: "# Hola ñandú" },
      { n: "proy/node_modules/x/index.js", d: "basura" },
      { n: "proy/.git/config", d: "basura" },
      { n: "__MACOSX/._a", d: "basura" },
      { n: "proy/dist/app.js", d: "basura" },
      { n: "proy/.DS_Store", d: "x" },
      { n: "proy/package-lock.json", d: "{}" },
      { n: "proy/logo.png", d: new Uint8Array([137, 80, 78, 71, 0, 1, 2]) },
      { n: "proy/datos.bin2", d: new Uint8Array([1, 0, 2, 3]) },
    ]);
    const a = await leerProyectoZip("proy.zip", z);
    expect(a.arbol).toEqual(["proy/src/index.js", "proy/README.md", "proy/package-lock.json", "proy/logo.png", "proy/datos.bin2"]);
    expect(a.ignorados).toBe(5);
    expect(a.archivos!.map((f) => f.ruta)).toEqual(["proy/src/index.js", "proy/README.md"]);
    const t = textoAdjunto(a, 60000);
    expect(t.startsWith("[Adjunto: proy.zip — proyecto, 5 archivos]\nÁrbol:\nproy/src/index.js")).toBe(true);
    expect(t).toContain("--- proy/src/index.js ---\nconst a = 1;");
    expect(t).toContain("Hola ñandú");
    expect(t).not.toContain("basura");
    expect(t).not.toContain("--- proy/logo.png");
  });
  it("trunca archivos a 20 000 caracteres y respeta el total", async () => {
    const z = zipDe([{ n: "a.txt", d: "x".repeat(30000), m: 8 }, { n: "b.txt", d: "y".repeat(30000), m: 8 }, { n: "c.txt", d: "z".repeat(30000), m: 8 }, { n: "d.txt", d: "w", m: 8 }]);
    const a = await leerProyectoZip("g.zip", z);
    expect(a.archivos![0].texto!.endsWith("… [recortado]")).toBe(true);
    expect(a.archivos![0].texto!.length).toBeLessThan(20020);
    const t = textoAdjunto(a, limitesAdjuntos().maxCharsTotal);
    expect(t.length).toBeLessThanOrEqual(60000);
    expect(t).toMatch(/No incluidos:.*omitido por tamaño/);
  });
  it("máximo 400 entradas", async () => {
    const z = zipDe(Array.from({ length: 450 }, (_, i) => ({ n: "f" + i + ".txt", d: "x" })));
    const a = await leerProyectoZip("m.zip", z);
    expect(a.arbol).toHaveLength(400);
    expect(a.avisos!.join(" ")).toMatch(/50 más/);
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
  it("tipoAdjunto, extensión, validación y nombres", () => {
    expect(tipoAdjunto("a.zip", "")).toBe("zip");
    expect(tipoAdjunto("a.DOCX", "")).toBe("docx");
    expect(tipoAdjunto("foto", "image/png")).toBe("imagen");
    expect(tipoAdjunto("main.rs", "")).toBe("texto");
    expect(extensionArchivo("a.tar.GZ")).toBe("gz");
    expect(validarDocumento("a.txt", 15 * 1024 * 1024 + 1, 0)).toMatch(/15 MB/);
    expect(validarDocumento("a.txt", 10, 5)).toMatch(/Máximo 5/);
    expect(validarDocumento("a.txt", 10, 4)).toBe("");
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
  it("PDF: texto por página", () => {
    expect(textoPdfPagina([{ str: "Hola", hasEOL: false }, { str: "mundo", hasEOL: true }, { str: "otra" }])).toBe("Hola mundo\notra");
    expect(textoPdf(["uno", "dos"])).toBe("--- Página 1 ---\nuno\n\n--- Página 2 ---\ndos");
  });
  it("componer: total por mensaje y adjuntos omitidos", () => {
    const g: Adjunto = { nombre: "g.txt", tipo: "texto", texto: "x".repeat(70000) };
    const h: Adjunto = { nombre: "h.txt", tipo: "texto", texto: "y".repeat(100) };
    const r = componerAdjuntos([g, h]);
    expect(r.omitidos).toEqual(["h.txt"]);
    expect(r.texto).toContain("[Adjuntos omitidos por tamaño: h.txt]");
    expect(r.texto.length).toBeLessThan(60200);
    expect(metaAdjuntos([h])).toEqual([{ n: "h.txt", t: "texto", c: textoAdjunto(h, Infinity).length }]);
    expect(componerAdjuntos([]).texto).toBe("");
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
  it("normalizarMensaje conserva adj y ctx; sinContexto quita ctx", () => {
    const m = normalizarMensaje({ rol: "u", texto: "q", adj: [{ n: "a.zip", t: "zip", c: 10 }], ctx: "[Adjunto: a.zip]" })!;
    expect(m.adj).toEqual([{ n: "a.zip", t: "zip", c: 10 }]);
    expect(m.ctx).toBe("[Adjunto: a.zip]");
    const s = sinContexto([{ id: "1", mensajes: [m] }]);
    expect(s[0].mensajes[0].ctx).toBeUndefined();
    expect(s[0].mensajes[0].adj).toHaveLength(1);
    expect(m.ctx).toBe("[Adjunto: a.zip]");
  });
});

describe("archivos que devuelve el asistente", () => {
  it("extrae bloques archivo: con rutas saneadas y duplicados numerados", () => {
    const t = [
      "Aquí tienes:", "```archivo:informe.md", "# Título", "", "texto", "```", "y más",
      "```archivo:../src/app.py", "print('hola')", "```", "```archivo:informe.md", "otro", "```", "```python", "no es archivo", "```",
    ].join("\n");
    expect(extraerArchivos(t)).toEqual([
      { ruta: "informe.md", contenido: "# Título\n\ntexto" },
      { ruta: "src/app.py", contenido: "print('hola')" },
      { ruta: "informe (2).md", contenido: "otro" },
    ]);
  });
  it("cuatro acentos permiten bloques anidados; sin cierre toma hasta el final", () => {
    expect(extraerArchivos("````archivo:r.md\n```js\nx\n```\n````")).toEqual([{ ruta: "r.md", contenido: "```js\nx\n```" }]);
    expect(extraerArchivos("```archivo: a.txt\nabierto")).toEqual([{ ruta: "a.txt", contenido: "abierto" }]);
    expect(extraerArchivos("sin bloques")).toEqual([]);
  });
  it("el prompt lo explica (con y sin MCP) y la respuesta JSON conserva el bloque", () => {
    expect(buildSystemPrompt([], false)).toContain("```archivo:");
    expect(buildSystemPrompt([], true)).toContain("```archivo:");
    const r = parseToolCall('{"respuesta":"Listo\\n```archivo:a.md\\n# Hola\\n```"}');
    expect(r).toEqual({ tipo: "respuesta", texto: "Listo\n```archivo:a.md\n# Hola\n```" });
    expect(extraerArchivos((r as any).texto)).toEqual([{ ruta: "a.md", contenido: "# Hola" }]);
  });
  it("rescata {\"respuesta\":...} con saltos de línea y comillas sin escapar", () => {
    const r = parseToolCall('{"respuesta":"Listo\n```archivo:a.py\nprint("hola")\n```"}');
    expect(r).toEqual({ tipo: "respuesta", texto: 'Listo\n```archivo:a.py\nprint("hola")\n```' });
  });
});

describe("escritor ZIP y .docx", () => {
  it("crc32 conocido", () => {
    expect(crc32(enc.encode("123456789"))).toBe(0xcbf43926);
  });
  it("crearZip se lee de vuelta con el lector y con node:zlib/ordenes estándar", async () => {
    const z = crearZip([{ ruta: "a.txt", datos: "hola ñ" }, { ruta: "d/b.bin", datos: new Uint8Array([0, 1, 2, 255]) }]);
    const { entradas } = zipEntradas(z);
    expect(entradas.map((e) => e.nombre)).toEqual(["a.txt", "d/b.bin"]);
    expect(dec.decode((await zipExtraer(z, entradas[0], 100))!)).toBe("hola ñ");
    expect(Array.from((await zipExtraer(z, entradas[1], 100))!)).toEqual([0, 1, 2, 255]);
    const a = await leerProyectoZip("x.zip", z);
    expect(a.arbol).toEqual(["a.txt", "d/b.bin"]);
  });
  it("crearDocx: se abre con el lector y document.xml contiene el texto", async () => {
    const md = "# Informe <1>\n\nTexto con **negrita** & `código`.\n\n- uno\n- dos\n\n```js\nif (a < b) { x(); }\n```\nFin ñandú";
    const d = crearDocx(md);
    const { entradas } = zipEntradas(d);
    expect(entradas.map((e) => e.nombre)).toEqual(["[Content_Types].xml", "_rels/.rels", "word/document.xml"]);
    const xml = dec.decode((await zipExtraer(d, entradas[2], 1e6))!);
    expect(xml).toContain("Informe &lt;1&gt;");
    expect(xml).toContain("if (a &lt; b)");
    expect(xml).toContain("<w:b/>");
    expect(xml).toContain("Courier New");
    const a = await leerDocx("i.docx", d);
    expect(a.texto).toContain("Informe <1>");
    expect(a.texto).toContain("Texto con negrita & código.");
    expect(a.texto).toContain("• uno");
    expect(a.texto).toContain("if (a < b) { x(); }");
    expect(a.texto).toContain("Fin ñandú");
  });
  it("leerDocx rechaza lo que no es docx", async () => {
    await expect(leerDocx("a.docx", crearZip([{ ruta: "x.txt", datos: "x" }]))).rejects.toThrow(/docx/);
  });
});

describe("PDF: preparación de texto", () => {
  it("conserva ñ y tildes, cambia tipografía especial", () => {
    expect(textoLatin1("¿Qué año? ¡Sí! Ñandú áéíóú ü")).toBe("¿Qué año? ¡Sí! Ñandú áéíóú ü");
    expect(textoLatin1("“hola” — a…")).toBe('"hola" - a...');
    expect(textoLatin1("日本")).toBe("??");
  });
  it("líneas: títulos grandes, listas con sangría, código monoespaciado", () => {
    const l = mdALineasPdf("# Título\n\nTexto **fuerte**\n- item\n```\ncode\n```");
    expect(l[0]).toMatchObject({ t: "Título", neg: true, tam: 20 });
    expect(l[1]).toMatchObject({ t: "Texto fuerte", tam: 11 });
    expect(l[2]).toMatchObject({ t: "- item", sangria: 12 });
    expect(l[3]).toMatchObject({ t: "code", mono: true });
  });
});
