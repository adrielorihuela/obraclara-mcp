// GENERADO por eval/exportar_demo.mjs desde eval/resultados. No editar a mano.
export interface LadoDemo { corta: string; completa: string; clave: string; veredicto: string; exacta: boolean; cita: boolean; inventada: boolean; latencia_s: number }
export interface CasoDemo { id: string; tipo: string; herramienta: string; pregunta: string; referencia: string; referencia_clave: string; args: Record<string, unknown>; datos: Record<string, unknown>; fecha_corte: string; sin: LadoDemo; con: LadoDemo }
export const CASOS_DEMO: CasoDemo[] = [
 {
  "id": "B02",
  "tipo": "busqueda",
  "herramienta": "buscar_inversiones",
  "pregunta": "¿Cuál es la obra de salud más cara en Piura?",
  "referencia": "La de mayor costo actualizado es el código 2507146, «Creación de los servicios de salud especializados, Hospital de alta complejidad» en Veintiséis de Octubre (Ministerio de Salud), con S/ 955,063,507.44.",
  "referencia_clave": "S/ 955 063 507,44",
  "args": {
   "departamento": "Piura",
   "funcion": "Salud",
   "limite": 20
  },
  "datos": {
   "total": 211,
   "mostrados": 20,
   "inversiones": [
    {
     "codigo_unico": "2507146",
     "nombre": "CREACION DE LOS SERVICIOS DE SALUD ESPECIALIZADOS, HOSPITAL  DE ALTA COMPLEJIDAD EN EL  DISTRITO DE VEINTISEIS DE OCTUBRE - PROVINCIA DE PIURA - DEPARTAMENTO DE PIURA",
     "entidad": "MINISTERIO DE SALUD",
     "nivel": "GN",
     "costo_actualizado": 955063507.44,
     "monto_viable": 926136650,
     "sobrecosto_pct": 3.12,
     "meses_sin_devengado": 0,
     "avance_fisico": null
    },
    {
     "codigo_unico": "2483109",
     "nombre": "RECUPERACION DE LOS SERVICIOS DE SALUD DEL HOSPITAL DE APOYO II-2 SULLANA, DISTRITO DE SULLANA, PROVINCIA DE SULLANA ¿ REGION PIURA.",
     "entidad": "AUTORIDAD PARA LA RECONSTRUCCIÓN CON CAMBIOS - ARCC",
     "nivel": "GN",
     "costo_actualizado": 811250335.71,
     "monto_viable": 34391028.44,
     "sobrecosto_pct": 2258.9,
     "meses_sin_devengado": 0,
     "avance_fisico": null
    },
    {
     "codigo_unico": "2260218",
     "nombre": "CREACIÓN DE LOS SERVICIOS ESPECIALIZADOS DE SALUD DEL HOSPITAL ESPECIALIZADO EN LA RED ASISTENCIAL PIURA DE ESSALUD, DISTRITO DE VEINTISÉIS DE OCTUBRE, PROVINCIA DE PIURA, DEPARTAMENTO DE PIURA",
     "entidad": "FONAFE",
     "nivel": "GN",
     "costo_actualizado": 708414347.8,
     "monto_viable": 594243857,
     "sobrecosto_pct": 19.21,
     "meses_sin_devengado": null,
     "avance_fisico": null
    },
    {
     "codigo_unico": "2259669",
     "nombre": "MEJORAMIENTO DE LOS SERVICIOS DE SALUD DEL HOSPITAL II TALARA DE ESSALUD EN EL DISTRITO DE PARIÑAS, PROVINCIA DE TALARA, DEPARTAMENTO DE PIURA",
     "entidad": "FONAFE",
     "nivel": "GN",
     "costo_actualizado": 546937740.62,
     "monto_viable": 290213315,
     "sobrecosto_pct": 88.46,
     "meses_sin_devengado": null,
     "avance_fisico": null
    },
    {
     "codigo_unico": "2321591",
     "nombre": "MEJORAMIENTO DE LOS SERVICIOS DE SALUD EN EL ESTABLECIMIENTO DE SALUD -HOSPITAL DE APOYO CHULUCANAS DISTRITO DE CHULUCANAS, PROVINCIA DE MORROPÓN, DEPARTAMENTO DE PIURA",
     "entidad": "MINISTERIO DE SALUD",
     "nivel": "GN",
     "costo_actualizado": 394872153.62,
     "monto_viable": 103449297.95,
     "sobrecosto_pct": 281.71,
     "meses_sin_devengado": 1,
     "avance_fisico": null
    },
    {
     "codigo_unico": "2558585",
     "nombre": "RECONSTRUCCIÓN DEL CENTRO DE SALUD TALARA II DEL DISTRITO DE PARIÑAS, PROVINCIA DE TALARA, REGIÓN PIURA",
     "entidad": "AUTORIDAD PARA LA RECONSTRUCCIÓN CON CAMBIOS - ARCC",
     "nivel": "GN",
     "costo_actualizado": 251897654.04,
     "monto_viable": 140239275.16,
     "sobrecosto_pct": 79.62,
     "meses_sin_devengado": 0,
     "avance_fisico": null
    },
    {
     "codigo_unico": "2558582",
     "nombre": "RECONSTRUCCIÓN DEL CENTRO DE SALUD SECHURA I-4 DEL DISTRITO DE SECHURA, PROVINCIA DE SECHURA, REGIÓN PIURA",
     "entidad": "AUTORIDAD PARA LA RECONSTRUCCIÓN CON CAMBIOS - ARCC",
     "nivel": "GN",
     "costo_actualizado": 228298220.62,
     "monto_viable": 133485186.54,
     "sobrecosto_pct": 71.03,
     "meses_sin_devengado": 0,
     "avance_fisico": null
    },
    {
     "codigo_unico": "2727505",
     "nombre": "MEJORAMIENTO Y AMPLIACION DEL SERVICIO DE ATENCIÓN DE SALUD BÁSICOS EN CENTRO DE SALUD TAMBOGRANDE   DISTRITO DE TAMBO GRANDE DE LA PROVINCIA DE PIURA DEL DEPARTAMENTO DE PIURA",
     "entidad": "GOBIERNO REGIONAL PIURA",
     "nivel": "GR",
     "costo_actualizado": 197550721.09,
     "monto_viable": 198541392.3,
     "sobrecosto_pct": -0.5,
     "meses_sin_devengado": 2,
     "avance_fisico": null
    }
   ]
  },
  "fecha_corte": "2026-11-10",
  "sin": {
   "corta": "La obra de salud más cara de la región Piura es el **Hospital de Alta Complejidad de Piura**, ubicado en el distrito de Veintiséis de Octubre.\n\n## Datos principales de la obra\n\n- **Nombre:** Hospital de Alta Complejidad de Piura.\n- **Ubicación:** distrito de Veintiséis de Octubre, provincia y departamento de Piura.\n- **Inversión contractual:** S/ 3,201,976,925 (más de S/ 3,201…",
   "completa": "La obra de salud más cara de la región Piura es el **Hospital de Alta Complejidad de Piura**, ubicado en el distrito de Veintiséis de Octubre.\n\n## Datos principales de la obra\n\n- **Nombre:** Hospital de Alta Complejidad de Piura.\n- **Ubicación:** distrito de Veintiséis de Octubre, provincia y departamento de Piura.\n- **Inversión contractual:** S/ 3,201,976,925 (más de S/ 3,201 millones).\n- **Entidad responsable:** Ministerio de Salud, mediante el Programa Nacional de Inversiones en Salud (PRONIS).\n- **Modalidad:** Gobierno a Gobierno con el Reino Unido.\n- **Empresa contratista:** Sinohydro Corporation Limited.\n- **Beneficiarios:** más de 3 millones de personas.\n- **Plazo contractual:** 35.5 meses.\n\nEl contrato para el diseño, construcción e implementación fue firmado el **4 de octubre de 2025**, según informó oficialmente el Ministerio de Salud.\n\n## Comparación con otras grandes obras de salud en Piura\n\n| Obra | Inversión |\n|---|---:|\n| Hospital de Alta Complejidad de Piura (MINSA) | **S/ 3,201.9 millones** |\n| Hospital Especializado de EsSalud en Piura | S/ 850.5 millones |\n| Hospital de Apoyo II-2 de Sullana | Más de S/ 786 millones |\n\nFuentes oficiales: MINSA, EsSalud y ANIN.\n\n## Una precisión importante\n\nEn junio de 2026, la Contraloría advirtió diferencias entre el costo registrado de la inversión del Hospital de Alta Complejidad (S/ 968.4 millones) y el contrato principal de ejecución (más de S/ 3,201 millones). Por ello, es importante distinguir el monto contractual del costo registrado en el Banco de Inversiones.\n\n**Conclusión:** La obra de salud de mayor monto contractual identificada en Piura es el Hospital de Alta Complejidad, con una inversión de aproximadamente **S/ 3,202 millones**.\n\n**Fuentes oficiales para consulta:**\n- PRONIS – Ministerio de Salud: firma del contrato del Hospital de Alta Complejidad de Piura.\n- Contraloría: informe sobre el presupuesto del Hospital de Alta Complejidad.\n- ANIN: inauguración del Hospital de Sullana.",
   "clave": "S/ 3 201,9 millones",
   "veredicto": "Incorrecta: inventó cifras",
   "exacta": false,
   "cita": false,
   "inventada": true,
   "latencia_s": 13.3
  },
  "con": {
   "corta": "La obra de salud más cara de Piura es la **Creación de los Servicios de Salud Especializados – Hospital de Alta Complejidad**, ubicada en el distrito Veintiséis de Octubre, provincia de Piura.\n\n- **Código único:** 2507146\n- **Entidad responsable:** Ministerio de Salud (MINSA).\n- **Costo actualizado:** S/ 955,063,507.44 (aproximadamente S/ 955.1 millones)…",
   "completa": "La obra de salud más cara de Piura es la **Creación de los Servicios de Salud Especializados – Hospital de Alta Complejidad**, ubicada en el distrito Veintiséis de Octubre, provincia de Piura.\n\n- **Código único:** 2507146\n- **Entidad responsable:** Ministerio de Salud (MINSA).\n- **Costo actualizado:** S/ 955,063,507.44 (aproximadamente S/ 955.1 millones).\n- **Monto viable inicial:** S/ 926,136,650.00.\n- **Variación del costo:** +3.12 %.\n- **Avance de ejecución registrado:** 0 %.\n\nEs la inversión de salud con mayor costo actualizado entre las 20 inversiones mostradas de Piura. La búsqueda identificó 211 inversiones en total.\n\n**Fuente:** Ministerio de Economía y Finanzas (MEF), Información de inversiones públicas 2001-2026.\n**Fecha de descarga:** 10 de noviembre de 2026.\n**Datos:**",
   "clave": "S/ 955 063 507,44",
   "veredicto": "Correcta",
   "exacta": true,
   "cita": true,
   "inventada": false,
   "latencia_s": 207.1
  }
 },
 {
  "id": "D05",
  "tipo": "detalle",
  "herramienta": "detalle_inversion",
  "pregunta": "¿Cuánto falta ejecutar en la carretera San Marcos–Cajabamba–Sausacocha (código 2110581)?",
  "referencia": "El saldo por ejecutar de la inversión 2110581 (MINISTERIO DE TRANSPORTES Y COMUNICACIONES - MTC) es S/ 162,507,128.65.",
  "referencia_clave": "S/ 162 507 128,65",
  "args": {
   "codigo_unico": "2110581"
  },
  "datos": {
   "codigo_unico": "2110581",
   "nombre": "MEJORAMIENTO DE LA CARRETERA SAN MARCOS -CAJABAMBA-SAUSACOCHA",
   "entidad": "MINISTERIO DE TRANSPORTES Y COMUNICACIONES - MTC",
   "nivel": "GN",
   "sector": "TRANSPORTES Y COMUNICACIONES",
   "funcion": "TRANSPORTE",
   "departamento": "CAJAMARCA",
   "provincia": "CAJABAMBA",
   "distrito": "CAJABAMBA",
   "ubigeo": "060201",
   "monto_viable": 213976319,
   "costo_actualizado": 569528787.01,
   "pim_anio": 2974745,
   "dev_anio": 2607528.67,
   "saldo_ejecutar": 162507128.65,
   "monto_laudo": 1981692.27,
   "avance_fisico": 42.45,
   "avance_ejecucion": 45.92,
   "ultimo_devengado": "202610",
   "fec_ini_ejecucion": "2011-02-21",
   "fec_fin_ejecucion": "2028-10-13",
   "situacion": "VIABLE",
   "habitantes": 94981,
   "sobrecosto_pct": 166.16,
   "meses_sin_devengado": 1,
   "alerta_sobrecosto": 1,
   "alerta_paralizacion": 0
  },
  "fecha_corte": "2026-11-10",
  "sin": {
   "corta": "### ¿Cuánto falta ejecutar?\n\nLa exposición del presupuesto 2026 presentada por el MTC ante el Congreso registra los siguientes valores:\n\n| Concepto | Importe |\n|---|---:|\n| Presupuesto modificado (PIM) | S/ 3,562,294 |\n| Ejecución registrada | S/ 314,498 |\n| Saldo presupuestal por ejecutar | **S/ 3,247,796** |\n| Avance presupuestal | 8.83 % |\n| Porcentaje pendiente | **91.17 %** |",
   "completa": "### ¿Cuánto falta ejecutar?\n\nLa exposición del presupuesto 2026 presentada por el MTC ante el Congreso registra los siguientes valores:\n\n| Concepto | Importe |\n|---|---:|\n| Presupuesto modificado (PIM) | S/ 3,562,294 |\n| Ejecución registrada | S/ 314,498 |\n| Saldo presupuestal por ejecutar | **S/ 3,247,796** |\n| Avance presupuestal | 8.83 % |\n| Porcentaje pendiente | **91.17 %** |\n\n**Importante:** estos importes corresponden a la programación presupuestal mostrada en la exposición del proyecto de presupuesto 2026, no a una consulta actualizada del devengado al 10 de noviembre de 2026.\n\n### Situación del proyecto\n\nEl 16 de marzo de 2026, el MTC informó que contaba con recursos para financiar el adelanto directo del 40 % de los estudios técnicos de siete subtramos de la Longitudinal de la Sierra Norte, incluido San Marcos–Cajabamba.\n\n### Conclusión\n\nCon la información presupuestal citada, el saldo por ejecutar era de **S/ 3.25 millones respecto del PIM de S/ 3.56 millones**.\n\nNo obstante, esa cifra no representa el costo pendiente de construir toda la carretera. Para determinar cuánto falta de inversión total de la obra (cuyo costo referencial es S/ 568 millones), se necesita el costo actualizado y la ejecución acumulada de inversión.\n\n**Fuente oficial para consulta:**\n- Ministerio de Transportes y Comunicaciones (MTC).\n- Ministerio de Economía y Finanzas (MEF) — Consulta Amigable de ejecución presupuestal.",
   "clave": "S/ 3 247 796",
   "veredicto": "Incorrecta: inventó cifras",
   "exacta": false,
   "cita": true,
   "inventada": true,
   "latencia_s": 14.9
  },
  "con": {
   "corta": "Según el MEF, a la carretera San Marcos–Cajabamba–Sausacocha (código único 2110581) le falta ejecutar **S/ 162,507,128.65** (aproximadamente S/ 162.51 millones).\n\nDatos adicionales:\n- Costo actualizado: S/ 569,528,787.01.\n- Avance de ejecución financiera: 45.92 %.\n- Avance físico: 42.45 %.\n- Devengado del año: S/ 2,607,528.67.\n- Fecha prevista de culminación: 13 de octubre de 2028.",
   "completa": "Según el MEF, a la carretera San Marcos–Cajabamba–Sausacocha (código único 2110581) le falta ejecutar **S/ 162,507,128.65** (aproximadamente S/ 162.51 millones).\n\nDatos adicionales:\n- Costo actualizado: S/ 569,528,787.01.\n- Avance de ejecución financiera: 45.92 %.\n- Avance físico: 42.45 %.\n- Devengado del año: S/ 2,607,528.67.\n- Fecha prevista de culminación: 13 de octubre de 2028.\n\n**Alerta importante:** La inversión registra un sobrecosto de 166.16 % respecto al monto viable inicial (S/ 213,976,319). Esto constituye una alerta técnica, no una prueba de irregularidad. No registra alerta de paralización.\n\nFuente: Ministerio de Economía y Finanzas (MEF), Información de inversiones públicas 2001-2026. Fecha de descarga: 10/11/2026.",
   "clave": "S/ 162 507 128,65",
   "veredicto": "Correcta",
   "exacta": true,
   "cita": true,
   "inventada": false,
   "latencia_s": 18.7
  }
 },
 {
  "id": "A07",
  "tipo": "alertas",
  "herramienta": "alertas_inversion",
  "pregunta": "En Tacna, ¿cuál es la obra con alerta de paralización que lleva más tiempo sin gastar?",
  "referencia": "Es el código 2060020, construcción de complejo deportivo en la Asociación de Vivienda Cuatro Pozos (Viñani), Coronel Gregorio Albarracín (Municipalidad Distrital de Coronel Gregorio Albarracín): 167 meses sin devengado (último en diciembre de 2012) con 68 % de avance físico.",
  "referencia_clave": "167 meses",
  "args": {
   "tipo": "paralizacion",
   "departamento": "Tacna",
   "limite": 20
  },
  "datos": {
   "total": 209,
   "mostrados": 20,
   "inversiones": [
    {
     "codigo_unico": "2060020",
     "nombre": "CONSTRUCCION DE COMPLEJO DEPORTIVO EN ASOCIACIÓN DE VIVIENDA CUATRO POZOS (VIÑANI), DISTRITO DE CORONEL GREGORIO ALBARRACIN LANCHIPA - TACNA - TACNA",
     "entidad": "MUNICIPALIDAD DISTRITAL DE CORONEL GREGORIO ALBARRACIN",
     "nivel": "GL",
     "costo_actualizado": 1219012.41,
     "monto_viable": 1126797,
     "sobrecosto_pct": 8.18,
     "meses_sin_devengado": 167,
     "avance_fisico": 68
    },
    {
     "codigo_unico": "2083576",
     "nombre": "MEJORAMIENTO DE LA INFRAESTRUCTURA VIAL Y PEATONAL  EN LA AV. CELESTINO VARGAS ENTRE LIMITE DE TACNA Y CALANA , DISTRITO DE POCOLLAY - TACNA - TACNA",
     "entidad": "MUNICIPALIDAD DISTRITAL DE POCOLLAY",
     "nivel": "GL",
     "costo_actualizado": 6767083.39,
     "monto_viable": 9652925,
     "sobrecosto_pct": -29.9,
     "meses_sin_devengado": 91,
     "avance_fisico": 99.23
    },
    {
     "codigo_unico": "2453693",
     "nombre": "CREACION DEL CENTRO INTEGRAL DEL ADULTO MAYOR EN EL ANEXO DE HIGUERANI DEL DISTRITO DE PACHIA - PROVINCIA DE TACNA - DEPARTAMENTO DE TACNA",
     "entidad": "MUNICIPALIDAD DISTRITAL DE PACHIA-TACNA",
     "nivel": "GL",
     "costo_actualizado": 72877.22,
     "monto_viable": 70113.79,
     "sobrecosto_pct": 3.94,
     "meses_sin_devengado": 85,
     "avance_fisico": 89.98
    },
    {
     "codigo_unico": "2234484",
     "nombre": "MEJORAMIENTO DE LOS  SERVICIOS DE ATENCIÓN AL USUARIO DE LA DRTPE, TACNA - TACNA - TACNA",
     "entidad": "GOBIERNO REGIONAL TACNA",
     "nivel": "GR",
     "costo_actualizado": 4937422.69,
     "monto_viable": 4266721,
     "sobrecosto_pct": 15.72,
     "meses_sin_devengado": 83,
     "avance_fisico": 96.76
    },
    {
     "codigo_unico": "2451713",
     "nombre": "CONSTRUCCION DE AMBIENTE DE SERVICIOS GENERALES EN EL(LA) MUNICIPALIDAD PROVINCIAL DE TARATA EN LA LOCALIDAD TARATA, DISTRITO DE TARATA, PROVINCIA TARATA, DEPARTAMENTO TACNA",
     "entidad": "MUNICIPALIDAD PROVINCIAL DE TARATA",
     "nivel": "GL",
     "costo_actualizado": 229770.54,
     "monto_viable": 120532.84,
     "sobrecosto_pct": 90.63,
     "meses_sin_devengado": 82,
     "avance_fisico": 91.9
    },
    {
     "codigo_unico": "2235643",
     "nombre": "INSTALACION DE LOS SERVICIOS TURISTICOS PARA EL DISFRUTE DEL PAISAJE EN LAS LOMAS DE TACAHUAY, DISTRITO DE ITE - JORGE BASADRE - TACNA",
     "entidad": "MUNICIPALIDAD DISTRITAL DE ITE",
     "nivel": "GL",
     "costo_actualizado": 6317407.03,
     "monto_viable": 5511939,
     "sobrecosto_pct": 14.61,
     "meses_sin_devengado": 78,
     "avance_fisico": 44.36
    },
    {
     "codigo_unico": "2159303",
     "nombre": "CREACION DEL SERVICIO DE ATENCION DE INCENDIOS Y EMERGENCIAS MENORES DE LA COMPAÑIA DE BOMBEROS EN EL, DISTRITO DE ITE - JORGE BASADRE - TACNA",
     "entidad": "MUNICIPALIDAD DISTRITAL DE ITE",
     "nivel": "GL",
     "costo_actualizado": 5141832,
     "monto_viable": 5020340,
     "sobrecosto_pct": 2.42,
     "meses_sin_devengado": 78,
     "avance_fisico": 62.05
    },
    {
     "codigo_unico": "2352167",
     "nombre": "MEJORAMIENTO DEL SERVICIO DE EQUIPO MECANICO EN LA MUNICIPALIDAD DISTRITAL DE PACHIA, DISTRITO DE PACHIA - TACNA - TACNA",
     "entidad": "MUNICIPALIDAD DISTRITAL DE PACHIA-TACNA",
     "nivel": "GL",
     "costo_actualizado": 380897.12,
     "monto_viable": 371091.47,
     "sobrecosto_pct": 2.64,
     "meses_sin_devengado": 78,
     "avance_fisico": 71.7
    }
   ]
  },
  "fecha_corte": "2026-11-10",
  "sin": {
   "corta": "Los datos que permiten identificarla son:\n\n- **CUI:** 2383907.\n- **Entidad responsable:** Electrosur S. A.\n- **Inicio de ejecución:** 16 de mayo de 2019.\n- **Último periodo de avance registrado:** octubre de 2020.\n- **Costo actualizado:** S/ 18 162 988.\n- **Causa de paralización:** incumplimiento contractual.",
   "completa": "Los datos que permiten identificarla son:\n\n- **CUI:** 2383907.\n- **Entidad responsable:** Electrosur S. A.\n- **Inicio de ejecución:** 16 de mayo de 2019.\n- **Último periodo de avance registrado:** octubre de 2020.\n- **Costo actualizado:** S/ 18 162 988.\n- **Causa de paralización:** incumplimiento contractual.\n\nEl informe de rendición de cuentas de Electrosur confirma que la obra figura como paralizada y que su último periodo de avance fue octubre de 2020.\n\n**Fuentes oficiales para verificar:**\n1. Contraloría – Informe de obras públicas paralizadas a diciembre de 2024 (tabla 23, Tacna).\n2. Electrosur – Informe de rendición de cuentas 2022.\n3. Contraloría – Reporte de obras paralizadas al segundo trimestre de 2022.\n\n**Conclusión:** La obra con mayor antigüedad de paralización identificada en estos registros es la línea de transmisión Los Héroes–Zofratacna–SE Yarada, con último avance reportado en octubre de 2020. Esta identificación se basa en los registros oficiales consultados, no en una confirmación en tiempo real de que no haya habido desembolsos posteriores.",
   "clave": "23 meses",
   "veredicto": "Incorrecta: inventó cifras",
   "exacta": false,
   "cita": false,
   "inventada": true,
   "latencia_s": 14
  },
  "con": {
   "corta": "La obra con mayor tiempo sin registrar gasto devengado en Tacna es **CONSTRUCCIÓN DE COMPLEJO DEPORTIVO EN ASOCIACIÓN DE VIVIENDA CUATRO POZOS (VIÑANI)**, ubicada en el distrito de Coronel Gregorio Albarracín Lanchipa, provincia y departamento de Tacna.",
   "completa": "La obra con mayor tiempo sin registrar gasto devengado en Tacna es **CONSTRUCCIÓN DE COMPLEJO DEPORTIVO EN ASOCIACIÓN DE VIVIENDA CUATRO POZOS (VIÑANI)**, ubicada en el distrito de Coronel Gregorio Albarracín Lanchipa, provincia y departamento de Tacna.\n\n- **Código único:** 2060020.\n- **Entidad responsable:** Municipalidad Distrital de Coronel Gregorio Albarracín.\n- **Tiempo sin gasto devengado:** 167 meses (aproximadamente 13 años y 11 meses).\n- **Último devengado registrado:** diciembre de 2012.\n- **Avance físico:** 68 %.\n- **Avance de ejecución:** 70.09 %.\n- **Costo actualizado:** S/ 1,219,012.41.\n- **Monto viable:** S/ 1,126,797.00.\n\nEs el caso más antiguo entre las 20 inversiones mostradas con alerta de paralización en Tacna. La base registra 209 inversiones con esta alerta en el departamento.\n\n**Advertencia:** La alerta es un indicio técnico basado en el avance físico y la ausencia prolongada de gasto devengado; no constituye prueba de irregularidades ni confirma por sí sola una paralización efectiva.\n\n**Fuente:** Ministerio de Economía y Finanzas (MEF), Información de inversiones públicas 2001-2026. Fecha de descarga: 10 de noviembre de 2026. Datos abiertos:",
   "clave": "167 meses",
   "veredicto": "Correcta",
   "exacta": true,
   "cita": true,
   "inventada": false,
   "latencia_s": 208.5
  }
 },
 {
  "id": "R03",
  "tipo": "resumen",
  "herramienta": "resumen_inversiones",
  "pregunta": "¿Cuánto falta ejecutar en los proyectos de salud del Gobierno Regional del Callao?",
  "referencia": "El saldo por ejecutar de las inversiones de salud del nivel regional en Callao es S/ 853,775,582.98.",
  "referencia_clave": "S/ 853 775 582,98",
  "args": {
   "entidad": "Gobierno Regional del Callao",
   "funcion": "Salud"
  },
  "datos": {
   "inversiones": 88,
   "costo_actualizado_total": 1055849887.53,
   "devengado_anio_actual": 12077826.77,
   "saldo_por_ejecutar": 853775582.98,
   "alertas_sobrecosto": 18,
   "alertas_paralizacion": 6
  },
  "fecha_corte": "2026-11-10",
  "sin": {
   "corta": "## Ejecución de proyectos de salud del Gobierno Regional del Callao\n\nPara determinar cuánto falta ejecutar, se debe comparar el presupuesto institucional modificado (PIM) con el gasto devengado. Es decir:\n\n**Pendiente de ejecución = PIM − Devengado.**",
   "completa": "## Ejecución de proyectos de salud del Gobierno Regional del Callao\n\nPara determinar cuánto falta ejecutar, se debe comparar el presupuesto institucional modificado (PIM) con el gasto devengado. Es decir:\n\n**Pendiente de ejecución = PIM − Devengado.**\n\nSegún la información presupuestal del MEF correspondiente a 2026, es importante distinguir los proyectos de inversión del presupuesto destinado a actividades y servicios de salud.\n\n### Datos identificados\n\nPara la Unidad Ejecutora Dirección de Salud I Callao (UE 1316), el reporte más reciente localizado, con corte al 17 de noviembre de 2026, señala:\n\n- Presupuesto total (PIM): S/ 267,3 millones.\n- Ejecución de proyectos: 61,4%.\n- Presupuesto asignado a proyectos: aproximadamente S/ 12,4 millones.\n- Saldo pendiente de ejecutar en proyectos: aproximadamente **S/ 4,8 millones**. citeturn807252search1turn682496search3\n\n**Importante:** esta cifra corresponde a la Dirección de Salud I Callao, no necesariamente al conjunto de todos los hospitales y unidades ejecutoras del Gobierno Regional.\n\n### Fuentes oficiales\n\n- urlMEF – Consulta Amigable: seguimiento de ejecución presupuestalturn807252search0.\n- urlGobierno Regional del Callao – Portal de Transparenciaturn807252search3.\n\nPara darte el monto consolidado correcto, habría que sumar también los proyectos de salud del Hospital Daniel A. Carrión, el Hospital San José y las demás unidades ejecutoras del pliego regional.",
   "clave": "S/ 4,8 millones",
   "veredicto": "Incorrecta: inventó cifras",
   "exacta": false,
   "cita": false,
   "inventada": true,
   "latencia_s": 10.8
  },
  "con": {
   "corta": "Según el Ministerio de Economía y Finanzas (MEF), los 88 proyectos de inversión en salud del Gobierno Regional del Callao tienen un saldo pendiente de ejecutar de S/ 853,775,582.98 (aproximadamente S/ 853.78 millones). El costo actualizado total asciende a S/ 1,055,849,887.53 y el devengado del año actual es de S/ 12,077,826.77. Además, se identifican 18 inversiones con…",
   "completa": "Según el Ministerio de Economía y Finanzas (MEF), los 88 proyectos de inversión en salud del Gobierno Regional del Callao tienen un saldo pendiente de ejecutar de S/ 853,775,582.98 (aproximadamente S/ 853.78 millones). El costo actualizado total asciende a S/ 1,055,849,887.53 y el devengado del año actual es de S/ 12,077,826.77. Además, se identifican 18 inversiones con alertas de sobrecosto y 6 con alertas de posible paralización. Estas alertas son indicios técnicos y no prueban irregularidades. Fuente: Ministerio de Economía y Finanzas (MEF), Información de inversiones públicas 2001-2026. Fecha de descarga: 10/11/2026.",
   "clave": "S/ 853 775 582,98",
   "veredicto": "Correcta",
   "exacta": true,
   "cita": true,
   "inventada": false,
   "latencia_s": 16.7
  }
 }
];
export const RESUMEN_DEMO = {"total":40,"sin":{"exactas":3,"citas":4,"inventadas":21},"con":{"exactas":40,"citas":40,"inventadas":0}};
