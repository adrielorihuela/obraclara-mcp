DROP TABLE IF EXISTS inversiones;
DROP TABLE IF EXISTS meta;

CREATE TABLE meta (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);

CREATE TABLE inversiones (
  codigo_unico TEXT PRIMARY KEY,
  nombre TEXT, entidad TEXT, nivel TEXT, sector TEXT, funcion TEXT,
  departamento TEXT, provincia TEXT, distrito TEXT, ubigeo TEXT,
  monto_viable REAL, costo_actualizado REAL, pim_anio REAL, dev_anio REAL, saldo_ejecutar REAL, monto_laudo REAL,
  avance_fisico REAL, avance_ejecucion REAL, ultimo_devengado TEXT,
  fec_ini_ejecucion TEXT, fec_fin_ejecucion TEXT, situacion TEXT, habitantes INTEGER,
  sobrecosto_pct REAL, meses_sin_devengado INTEGER,
  alerta_sobrecosto INTEGER NOT NULL DEFAULT 0, alerta_paralizacion INTEGER NOT NULL DEFAULT 0,
  busqueda TEXT, entidad_n TEXT, funcion_n TEXT, departamento_n TEXT
);
CREATE INDEX idx_inv_entidad ON inversiones(entidad_n);
CREATE INDEX idx_inv_depto ON inversiones(departamento_n);
CREATE INDEX idx_inv_funcion ON inversiones(funcion_n);
CREATE INDEX idx_inv_nivel ON inversiones(nivel);
CREATE INDEX idx_inv_a_sob ON inversiones(alerta_sobrecosto, sobrecosto_pct);
CREATE INDEX idx_inv_a_par ON inversiones(alerta_paralizacion, costo_actualizado);
