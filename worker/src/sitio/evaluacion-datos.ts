// GENERADO por eval/exportar_sitio.mjs a partir de eval/resultados/. No editar a mano: vuelve a ejecutar `node eval/exportar_sitio.mjs`.
export const EVAL = {
 "fecha": "2026-11-18",
 "preguntas": 40,
 "global": [
  {
   "condicion": "sin_mcp",
   "exactitud": 8,
   "citacion": 10,
   "inventada": 53,
   "revisar": 20,
   "latTotal": 22.1,
   "latSinReintentos": 11.1,
   "llamadas": 0,
   "reintentos": 2,
   "ejecutadas": "40/40",
   "estricta": 5,
   "noSustentadas": 55
  },
  {
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0,
   "revisar": 0,
   "latTotal": 99.9,
   "latSinReintentos": 20.2,
   "llamadas": 1,
   "reintentos": 16,
   "ejecutadas": "40/40",
   "estricta": 98,
   "noSustentadas": 3
  }
 ],
 "porTipo": [
  {
   "tipo": "busqueda",
   "condicion": "sin_mcp",
   "exactitud": 0,
   "citacion": 0,
   "inventada": 80,
   "estricta": 0,
   "noSustentadas": 60
  },
  {
   "tipo": "busqueda",
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0,
   "estricta": 100,
   "noSustentadas": 0
  },
  {
   "tipo": "detalle",
   "condicion": "sin_mcp",
   "exactitud": 20,
   "citacion": 30,
   "inventada": 20,
   "estricta": 20,
   "noSustentadas": 40
  },
  {
   "tipo": "detalle",
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0,
   "estricta": 90,
   "noSustentadas": 10
  },
  {
   "tipo": "alertas",
   "condicion": "sin_mcp",
   "exactitud": 0,
   "citacion": 0,
   "inventada": 70,
   "estricta": 0,
   "noSustentadas": 50
  },
  {
   "tipo": "alertas",
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0,
   "estricta": 100,
   "noSustentadas": 0
  },
  {
   "tipo": "resumen",
   "condicion": "sin_mcp",
   "exactitud": 10,
   "citacion": 10,
   "inventada": 40,
   "estricta": 0,
   "noSustentadas": 70
  },
  {
   "tipo": "resumen",
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0,
   "estricta": 100,
   "noSustentadas": 0
  }
 ],
 "latencia": [
  {
   "condicion": "sin_mcp",
   "media": 22.1,
   "mediana": 12.9,
   "p90": 17.9,
   "max": 199.8,
   "medianaSinReintentos": 11,
   "p90SinReintentos": 13.9
  },
  {
   "condicion": "con_mcp",
   "media": 99.9,
   "mediana": 21,
   "p90": 214.2,
   "max": 401.3,
   "medianaSinReintentos": 14.8,
   "p90SinReintentos": 20
  }
 ],
 "cambios": [
  {
   "id": "R10",
   "condicion": "sin_mcp",
   "cifras": [
    "1,9 billones",
    "1 900 000 millones",
    "499 569",
    "255 579",
    "73,5 %",
    "1,4 billones",
    "255 473",
    "1 375 481 millones",
    "6610",
    "585879"
   ]
  },
  {
   "id": "D04",
   "condicion": "con_mcp",
   "cifras": [
    "40,279,184.89"
   ]
  }
 ],
 "herramientaEsperada": {
  "usada": 37,
  "total": 40
 },
 "comoSePuntuo": [
  "Exacta: si el valor oficial es numérico, se extraen los números de la respuesta (formatos «1 234,56», «1,234.56», «1.234,56», «S/ 2,5 millones», «mil millones»; los separadores ambiguos se leen de las dos formas) sin contar años ni números que ya estaban en la pregunta, y basta que uno quede a ±1 % del valor oficial. Texto: aparece la entidad esperada. Sin datos (B10, D10, A10): la respuesta dice que no hay resultados.",
  "Cita: menciona MEF / Ministerio de Economía y Finanzas / datosabiertos.gob.pe / el dataset y la fecha de corte 2026-11-10 o la fecha de descarga.",
  "Inventada: da cifras (en preguntas en soles, cifras ≥ 1000) y ninguna coincide con la referencia; o afirma resultados en una pregunta sin datos; o nombra otra entidad.",
  "Exacta estricta: exacta según la regla anterior y ninguna cifra relevante de la respuesta queda sin sustento. Cifra relevante: porcentaje o cantidad/monto ≥ 1000; se ignoran años, fechas, códigos únicos, números de la pregunta y conteos pequeños. Una cifra está sustentada si aparece en la fuente, o es la suma, diferencia o cociente (también en %) de dos cifras de la fuente que la propia respuesta cita, o coincide con la referencia. Fuente con MCP: el texto de los resultados de las herramientas de esa respuesta (`fuentes_con_mcp.json`, reproducido con `reconstruir_fuentes.mjs` porque `raw_con_mcp.jsonl` solo guardaba el largo del resultado; coincide en las 40). Fuente sin MCP: no hay herramientas, así que se usan la referencia y su nota y, en detalle, los campos de la fila de la base para el código de la pregunta. La tolerancia depende de la precisión con que se escribe la cifra (hasta 1 %: «40,7 millones» admite 0,12 %; «40,682,184.89», solo redondeo de 0,05 %); con ±1 % fijo, una cifra errónea como 40,279,184.89 pasaría por cercana a 40,682,184.89.",
  "Cifras no sustentadas: porcentaje de respuestas con al menos una cifra relevante sin sustento según la definición anterior. No es lo mismo que «inventada»: «inventada» exige que ninguna cifra coincida con la referencia; «no sustentada» basta con una cifra suelta sin respaldo, aunque otra sea correcta. Sin MCP incluye cifras reales de otras fuentes (web, Contraloría) que simplemente no están en los datos del MEF al corte.",
  "Revisar: casos dudosos para revisión manual (columna `revisar` de `resultados.csv` con el motivo)."
 ],
 "advertencias": [
  "El proveedor de IA es un servicio de uso gratuito con límite de uso; no se controla qué modelo responde y puede cambiar entre preguntas. En «sin MCP» el modelo puede usar búsqueda web.",
  "Con MCP se usa un protocolo de herramientas en texto (JSON en la respuesta), no llamadas nativas; resultados de más de 15000 caracteres se recortan.",
  "Puntuación automática con reglas simples: puede contar como exacta una coincidencia casual o perder respuestas correctas con otro formato. Los casos «revisar» deben verificarlos a mano dos integrantes del grupo.",
  "La latencia total incluye los reintentos: el proveedor a veces tarda hasta 3 min en responder y el ejecutor reintenta una vez; «sin reintentos» suma solo los intentos exitosos (medida desde B08; antes no se registraba).",
  "«Inventada» es una cota superior: sin MCP el chat suele citar otras fuentes reales (Contraloría, notas de prensa, otras fechas) cuyas cifras no coinciden con el MEF al 2026-11-10; la regla las cuenta como inventadas aunque no sean fabricadas. Conviene revisarlas a mano.",
  "Cuando el modelo usa búsqueda web, algunas respuestas sin MCP llegan con marcado interno (<Cite>, imágenes) o empiezan a mitad de texto. Afecta sobre todo a «cita» sin MCP.",
  "Abstenciones («no he podido verificar…») no cuentan como exactas ni como inventadas (se marcan «revisar»).",
  "«Exacta estricta» sigue siendo automática y aproximada: no entiende el contexto de cada cifra (una cifra correcta con otro significado cuenta como sustentada; una derivación válida que la respuesta no explicita puede contarse como no sustentada) y no mide si la conclusión es correcta. La «Exacta» original sigue publicada para comparar y sobrestima el acierto porque basta con que una cifra coincida.",
  "Una sola corrida por condición: no mide la variabilidad entre corridas.",
  "Datos de referencia con corte 2026-11-10; el chat sin herramientas puede tener datos de otra fecha."
 ],
 "ejemplos": [
  {
   "id": "B01",
   "tipo": "busqueda",
   "pregunta": "¿Cuántos proyectos de transporte tiene el Gobierno Regional en Cusco?",
   "referencia": "Hay 74 inversiones de transporte del nivel regional en el departamento de Cusco.",
   "sin": {
    "texto": "Según información oficial del Gobierno Regional del Cusco, publicada el 9 de octubre de 2025 por la Gerencia Regional de Transportes y Comunicaciones, la región cuenta con una cartera de 56 inversiones e intervenciones en transporte, distribuidas de la siguiente manera: […]",
    "exacta": false,
    "cita": false,
    "inventada": true,
    "herramientas": []
   },
   "con": {
    "texto": "El Gobierno Regional de Cusco tiene 74 proyectos de inversión pública en la función Transporte registrados en el MEF. La búsqueda muestra los 20 proyectos de mayor costo actualizado, de un total de 74. […]",
    "exacta": true,
    "cita": true,
    "inventada": false,
    "herramientas": [
     "buscar_inversiones"
    ]
   }
  },
  {
   "id": "A01",
   "tipo": "alertas",
   "pregunta": "¿Cuántas obras de Ayacucho podrían estar paralizadas?",
   "referencia": "Hay 815 inversiones en Ayacucho con alerta de paralización (avance físico entre 40 % y 99 % y 6 meses o más sin devengado).",
   "sin": {
    "texto": "Según la Contraloría General de la República del Perú, en Ayacucho se registraban 150 obras públicas paralizadas al 30 de junio de 2026. […]",
    "exacta": false,
    "cita": false,
    "inventada": true,
    "herramientas": []
   },
   "con": {
    "texto": "Según la información del Ministerio de Economía y Finanzas (MEF), en Ayacucho se identifican 815 inversiones públicas con posibles indicios de paralización. La herramienta muestra las 20 primeras, ordenadas según su costo actualizado. […]",
    "exacta": true,
    "cita": true,
    "inventada": false,
    "herramientas": [
     "alertas_inversion"
    ]
   }
  },
  {
   "id": "R01",
   "tipo": "resumen",
   "pregunta": "¿Cuánto suman en total las inversiones públicas registradas en Moquegua?",
   "referencia": "El costo actualizado total de las inversiones en Moquegua es S/ 20,049,064,306.37.",
   "sin": {
    "texto": "La distribución por nivel de gobierno es: - Gobierno Nacional: S/ 5 263 902 369. - Gobierno Regional: S/ 3 820 703 864. - Gobiernos locales: S/ 6 188 361 566. […]",
    "exacta": false,
    "cita": false,
    "inventada": true,
    "herramientas": []
   },
   "con": {
    "texto": "Según el Ministerio de Economía y Finanzas (MEF), las inversiones públicas registradas en el departamento de Moquegua suman un costo actualizado total de S/ 20,049,064,306.37 (aproximadamente S/ 20,049 millones o S/ 20.05 mil millones). Este monto corresponde a 1,767 inversiones públicas registradas. […]",
    "exacta": true,
    "cita": true,
    "inventada": false,
    "herramientas": [
     "resumen_inversiones"
    ]
   }
  }
 ]
} as const;
