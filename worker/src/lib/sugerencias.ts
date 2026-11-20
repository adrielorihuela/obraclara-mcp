// Banco de sugerencias de la pantalla inicial del chat (/asistente).
// Cada una se puede responder con las cuatro herramientas del MCP (buscar, detalle, alertas y resumen; filtros por texto,
// entidad, departamento, función y nivel; datos del MEF al 10/11/2026). Las que piden archivos los crea el agente del servidor.
// La página muestra unas pocas al azar (al menos una de archivo y una rápida) y un botón para barajar.
// SINCRONÍA: elegirSugerencias se incrusta en el navegador con Function.prototype.toString(); no usar flechas con nombre anidadas.

export type TipoSugerencia = "xlsx" | "docx" | "pdf" | "pptx" | "rapida";
export interface Sugerencia { t: TipoSugerencia; texto: string }

/** Etiqueta corta que acompaña a cada sugerencia según lo que entrega. */
export const ETIQUETAS_SUGERENCIA: Record<TipoSugerencia, string> = {
  xlsx: "Excel + gráfico",
  docx: "Informe Word",
  pdf: "PDF con gráficos",
  pptx: "Presentación",
  rapida: "Pregunta rápida",
};

export const SUGERENCIAS: Sugerencia[] = [
  // Excel con gráfico
  { t: "xlsx", texto: "Hazme un Excel con las 10 obras de salud en Cusco con posible paralización y más meses sin gasto, con un gráfico de barras" },
  { t: "xlsx", texto: "Un Excel con las obras de educación de Puno con alerta de sobrecosto: costo viable, costo actualizado y un gráfico comparativo" },
  { t: "xlsx", texto: "Compara en un Excel el costo total y el saldo por ejecutar de los gobiernos regionales de Piura, La Libertad, Lambayeque y Cajamarca, con gráfico" },
  { t: "xlsx", texto: "Excel con las 15 obras de saneamiento más costosas de Loreto, su avance físico y un gráfico de barras del avance" },
  { t: "xlsx", texto: "Arma un Excel con el resumen de inversiones por nivel de gobierno (local, regional y nacional) en Arequipa y un gráfico circular del costo" },
  { t: "xlsx", texto: "Hazme una hoja de cálculo con las obras de transporte paralizadas en Áncash y un gráfico de meses sin gasto por obra" },
  { t: "xlsx", texto: "Un Excel que compare cuántas alertas de sobrecosto y de paralización tienen Ayacucho, Huancavelica y Apurímac, con gráfico de columnas" },
  { t: "xlsx", texto: "Excel con las inversiones de la Municipalidad Provincial de Piura: costo, devengado del año y avance, más un gráfico" },
  { t: "xlsx", texto: "Hazme un Excel con el saldo por ejecutar en salud, educación y saneamiento en Junín y un gráfico de barras apiladas" },
  { t: "xlsx", texto: "Tabla en Excel de las 10 obras de agricultura con mayor sobrecosto en Cajamarca, con el porcentaje y un gráfico" },
  { t: "xlsx", texto: "Un Excel con las obras de orden público y seguridad con posible paralización en Lima y un gráfico de su avance físico" },
  { t: "xlsx", texto: "Compara en Excel el devengado de este año y el saldo por ejecutar de los gobiernos regionales de Cusco, Puno y Arequipa, con gráfico" },
  // Informes Word
  { t: "docx", texto: "Prepara un informe en Word con tablas y gráficos de las alertas de sobrecosto en Piura" },
  { t: "docx", texto: "Informe en Word sobre las obras de salud con posible paralización en Cusco: tabla, gráfico y recomendaciones para revisar" },
  { t: "docx", texto: "Hazme un Word que explique en lenguaje sencillo las inversiones del Gobierno Regional de Loreto, con una tabla y un gráfico" },
  { t: "docx", texto: "Un informe Word comparando las alertas de Lambayeque y La Libertad, con tablas y un gráfico por tipo de alerta" },
  { t: "docx", texto: "Redacta un informe en Word de las obras de educación con posible paralización en Puno: tabla de las que llevan más meses sin gasto y un gráfico" },
  { t: "docx", texto: "Informe en Word sobre el saneamiento en Ucayali: cuántas obras hay, cuánto falta por gastar y las que tienen alertas, con gráfico" },
  { t: "docx", texto: "Hazme un Word con la ficha de la inversión 2716769 y un gráfico de su avance físico frente al financiero" },
  { t: "docx", texto: "Un informe en Word de las obras de transporte del nivel nacional en Junín con tabla, gráfico y una conclusión breve" },
  { t: "docx", texto: "Prepara un Word sobre las municipalidades de Arequipa con alertas de sobrecosto: tabla por obra y gráfico" },
  { t: "docx", texto: "Informe en Word del estado de las obras de la Municipalidad Metropolitana de Lima, con tablas y gráficos" },
  // PDF con gráficos
  { t: "pdf", texto: "Un PDF con gráficos comparando el costo y el saldo por ejecutar de los gobiernos regionales del sur (Arequipa, Cusco, Puno, Moquegua y Tacna)" },
  { t: "pdf", texto: "Hazme un PDF de dos páginas con las obras de salud con posible paralización en el Perú: tabla de las 10 con más meses sin gasto y un gráfico" },
  { t: "pdf", texto: "PDF sobre las alertas de sobrecosto en Piura: cuántas hay, tabla de las 10 obras con mayor sobrecosto y un gráfico" },
  { t: "pdf", texto: "Un PDF que compare la inversión en educación de Loreto, Ucayali y Madre de Dios, con gráficos de costo y saldo" },
  { t: "pdf", texto: "Prepara un PDF sobre las obras de saneamiento con posible paralización en Cajamarca, con tabla y gráfico de meses sin gasto" },
  { t: "pdf", texto: "PDF con el resumen de inversiones de Ayacucho por nivel de gobierno, con gráfico de barras y una tabla" },
  { t: "pdf", texto: "Un PDF para un vecino de Huánuco: qué obras de transporte hay, cuánto cuestan y cuáles tienen alertas, con gráficos" },
  { t: "pdf", texto: "Hazme un PDF con gráficos del costo y el avance de las 10 obras más grandes del Gobierno Regional de Áncash" },
  { t: "pdf", texto: "PDF comparando las alertas de paralización en Lima, Callao e Ica, con un gráfico y una tabla de ejemplos" },
  { t: "pdf", texto: "Un PDF con las obras de cultura y deporte con sobrecosto en Cusco, con tabla y gráfico del porcentaje" },
  // Presentaciones
  { t: "pptx", texto: "Una presentación de 5 diapositivas sobre las obras paralizadas en Lima con gráficos" },
  { t: "pptx", texto: "Hazme un PowerPoint de 6 diapositivas sobre las alertas de sobrecosto en Piura, con tablas y gráficos" },
  { t: "pptx", texto: "Presentación de 5 diapositivas comparando la inversión de los gobiernos regionales de Cusco, Puno y Arequipa, con gráficos" },
  { t: "pptx", texto: "Un PowerPoint para una reunión vecinal sobre las obras de salud en Loreto: cuántas hay, cuánto falta y cuáles tienen alertas" },
  { t: "pptx", texto: "Presentación de 4 diapositivas sobre las obras de educación con posible paralización en Cajamarca, con un gráfico" },
  { t: "pptx", texto: "Hazme diapositivas (PowerPoint) del saneamiento en La Libertad: resumen, gráfico del saldo y las obras con alerta" },
  { t: "pptx", texto: "Un PowerPoint de 5 diapositivas sobre la inversión pública en Junín en salud, educación, transporte y saneamiento, con gráficos" },
  // Preguntas rápidas
  { t: "rapida", texto: "¿Qué obras de salud en Cusco llevan 6 meses o más sin gasto?" },
  { t: "rapida", texto: "Resume las inversiones de la Municipalidad Provincial de Piura" },
  { t: "rapida", texto: "¿Cuál es el avance de la inversión 2716769?" },
  { t: "rapida", texto: "¿Cuántas obras con alerta de sobrecosto hay en Arequipa?" },
  { t: "rapida", texto: "¿Cuánto falta por ejecutar en las obras del Gobierno Regional de Puno?" },
  { t: "rapida", texto: "¿Qué obras de educación están paralizadas en Ayacucho?" },
  { t: "rapida", texto: "¿Cuáles son las 5 obras de transporte más costosas de Loreto?" },
  { t: "rapida", texto: "¿Cuántas obras tiene el nivel nacional en Tacna y cuánto cuestan en total?" },
  { t: "rapida", texto: "¿Hay obras de saneamiento con sobrecosto en Lambayeque?" },
  { t: "rapida", texto: "¿Cuánto se ha gastado este año en obras de salud en Lima?" },
];

/** Mezcla `a` en su lugar (Fisher-Yates) con `azar` en [0, 1) y la devuelve. */
export function mezclarSugerencias<T>(a: T[], azar: () => number): T[] {
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(azar() * (i + 1)); if (j > i) j = i; var x = a[i]; a[i] = a[j]; a[j] = x; }
  return a;
}

/**
 * Elige `n` sugerencias al azar del banco: al menos una que pida un archivo y una rápida, tipos variados y,
 * si se puede, distintas de las que se acaban de mostrar (`evitar`, por texto). `azar` devuelve [0, 1).
 */
export function elegirSugerencias(banco: Sugerencia[], n: number, azar?: () => number, evitar?: string[]): Sugerencia[] {
  var r = typeof azar === "function" ? azar : Math.random;
  var fuera = Array.isArray(evitar) ? evitar : [];
  var lista = (Array.isArray(banco) ? banco : []).filter(function (s) { return !!s && typeof s.texto === "string" && !!s.texto; });
  var orden = mezclarSugerencias(lista.filter(function (s) { return fuera.indexOf(s.texto) < 0; }), r)
    .concat(mezclarSugerencias(lista.filter(function (s) { return fuera.indexOf(s.texto) >= 0; }), r));
  var total = Math.max(0, Math.min(Math.floor(n) || 0, lista.length));
  var elegidas: Sugerencia[] = [];
  // Pasadas: 0 = una de archivo, 1 = una rápida, 2 = de un tipo aún no mostrado, 3 = cualquiera.
  for (var paso = 0; paso < 4 && elegidas.length < total; paso++) {
    var tipos = elegidas.map(function (s) { return s.t; });
    for (var i = 0; i < orden.length && elegidas.length < total; i++) {
      var s = orden[i];
      if (elegidas.indexOf(s) >= 0) continue;
      var ok = paso === 0 ? s.t !== "rapida" : paso === 1 ? s.t === "rapida" : paso === 2 ? tipos.indexOf(s.t) < 0 : true;
      if (!ok) continue;
      elegidas.push(s);
      if (paso < 2) break;
      tipos.push(s.t);
    }
  }
  return mezclarSugerencias(elegidas, r);
}
