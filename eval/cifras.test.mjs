// Pruebas de cifras.mjs. Uso: node --test eval/
import test from 'node:test';
import assert from 'node:assert/strict';
import { cifrasRelevantes, cifrasNoSustentadas, valoresDeTexto, tolerancia, percentil } from './cifras.mjs';

const PREGUNTA_D04 = '¿Cuánto ha subido el costo de la obra 2226075 respecto a lo aprobado?';
// Fuente de D04 con MCP: la ficha que devolvió detalle_inversion
const FICHA = '{"datos":{"codigo_unico":"2226075","monto_viable":7033676,"costo_actualizado":47715860.89,"pim_anio":19586895,"avance_fisico":86,"sobrecosto_pct":578.39,"habitantes":4295}}';
const REF = 'El costo actualizado de la obra 2226075 es 578.39 % mayor que el monto viable (S/ 7,033,676.00 a S/ 47,715,860.89).';
const FUENTE = [...valoresDeTexto(FICHA, 'json'), ...valoresDeTexto(REF, 'es')];
const RESP_D04 = 'La obra 2226075 ha incrementado su costo en S/ 40,279,184.89 respecto al monto aprobado.\n- Monto aprobado (viable): S/ 7,033,676.00.\n- Costo actualizado: S/ 47,715,860.89.\n- Incremento: S/ 40,682,184.89.\n- Sobrecosto porcentual: 578.39 %.\nEl costo actual es 6.78 veces lo aprobado. Avance físico: 86 %. Fecha de descarga: 10/11/2026.';

test('D04: detecta la cifra errónea 40,279,184.89 aunque otra cifra coincida', () => {
  assert.deepEqual(cifrasNoSustentadas(RESP_D04, PREGUNTA_D04, FUENTE), ['40,279,184.89']);
});

test('D04: la diferencia 40,682,184.89 se acepta como derivada de dos cifras de la fuente', () => {
  const ok = RESP_D04.replace('40,279,184.89', '40,682,184.89');
  assert.deepEqual(cifrasNoSustentadas(ok, PREGUNTA_D04, FUENTE), []);
});

test('ignora años, códigos únicos, fechas, números de la pregunta y conteos pequeños', () => {
  const rel = cifrasRelevantes('La obra 2226075 en 2026 tiene 12 personas, 6.78 veces; descargada el 10/11/2026; 4295 habitantes.', PREGUNTA_D04);
  assert.deepEqual(rel.map((x) => x.raw), ['4295']);
});

test('los porcentajes pequeños cuentan; el marcado interno <Link ref="turn975701…"> no', () => {
  assert.deepEqual(cifrasRelevantes('Avance de 86 % <Link ref="turn975701search0">', 'x').map((x) => x.raw), ['86 %']);
});

test('una cifra a 1 % de la correcta, pero escrita con precisión, no se sustenta; «millones» redondeado sí', () => {
  assert.equal(cifrasNoSustentadas('Costo de S/ 47,200,000.55', 'x', FUENTE).length, 1);
  assert.deepEqual(cifrasNoSustentadas('Costo de S/ 47.7 millones', 'x', FUENTE), []);
});

test('tolerancia: nunca más de 1 % ni menos de 0,05 %', () => {
  assert.equal(tolerancia('S/ 40,682,184.89'), 0.0005);
  assert.equal(tolerancia('4 mil millones'), 0.01);
});

test('percentil por rango más cercano', () => {
  assert.equal(percentil([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.5), 5);
  assert.equal(percentil([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.9), 9);
  assert.equal(percentil([null], 0.5), null);
});
