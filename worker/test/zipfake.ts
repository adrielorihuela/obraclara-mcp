// ZIP sin compresión para armar archivos de prueba (el sitio ya no genera zips: los entrega la API del agente).
import { rutaSegura } from "../src/lib/agente";

export function crc32(b: Uint8Array): number {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < b.length; i++) crc = t[(crc ^ b[i]) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** ZIP sin compresión (stored, nombres UTF-8) con los archivos dados. */
export function crearZip(archivos: { ruta: string; datos: Uint8Array | string }[]): Uint8Array {
  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];
  const centrales: Uint8Array[] = [];
  let off = 0;
  archivos.forEach((a) => {
    const nombre = enc.encode(rutaSegura(a.ruta) || "archivo");
    const d = typeof a.datos === "string" ? enc.encode(a.datos) : a.datos;
    const crc = crc32(d);
    const lh = new Uint8Array(30 + nombre.length);
    const v = new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
    v.setUint16(10, 0, true); v.setUint16(12, 0x21, true); v.setUint32(14, crc, true); v.setUint32(18, d.length, true);
    v.setUint32(22, d.length, true); v.setUint16(26, nombre.length, true); v.setUint16(28, 0, true);
    lh.set(nombre, 30);
    const ch = new Uint8Array(46 + nombre.length);
    const c = new DataView(ch.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true);
    c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, nombre.length, true);
    c.setUint32(42, off, true);
    ch.set(nombre, 46);
    partes.push(lh, d);
    centrales.push(ch);
    off += lh.length + d.length;
  });
  let tamDir = 0;
  centrales.forEach((x) => { tamDir += x.length; });
  const fin = new Uint8Array(22);
  const f = new DataView(fin.buffer);
  f.setUint32(0, 0x06054b50, true); f.setUint16(8, archivos.length, true); f.setUint16(10, archivos.length, true);
  f.setUint32(12, tamDir, true); f.setUint32(16, off, true);
  const todo = partes.concat(centrales, [fin]);
  let total = 0;
  todo.forEach((x) => { total += x.length; });
  const out = new Uint8Array(total);
  let p = 0;
  todo.forEach((x) => { out.set(x, p); p += x.length; });
  return out;
}

