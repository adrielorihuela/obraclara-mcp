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
   "ejecutadas": "40/40"
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
   "ejecutadas": "40/40"
  }
 ],
 "porTipo": [
  {
   "tipo": "busqueda",
   "condicion": "sin_mcp",
   "exactitud": 0,
   "citacion": 0,
   "inventada": 80
  },
  {
   "tipo": "busqueda",
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0
  },
  {
   "tipo": "detalle",
   "condicion": "sin_mcp",
   "exactitud": 20,
   "citacion": 30,
   "inventada": 20
  },
  {
   "tipo": "detalle",
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0
  },
  {
   "tipo": "alertas",
   "condicion": "sin_mcp",
   "exactitud": 0,
   "citacion": 0,
   "inventada": 70
  },
  {
   "tipo": "alertas",
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0
  },
  {
   "tipo": "resumen",
   "condicion": "sin_mcp",
   "exactitud": 10,
   "citacion": 10,
   "inventada": 40
  },
  {
   "tipo": "resumen",
   "condicion": "con_mcp",
   "exactitud": 100,
   "citacion": 100,
   "inventada": 0
  }
 ],
 "latencia": [
  {
   "condicion": "sin_mcp",
   "media": 22.1
  },
  {
   "condicion": "con_mcp",
   "media": 99.9
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
