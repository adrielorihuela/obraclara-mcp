CREATE TABLE IF NOT EXISTS gpt_jobs (
  id TEXT PRIMARY KEY,
  estado TEXT NOT NULL,            -- pendiente | en_curso | listo | error
  mensajes TEXT NOT NULL,
  respuesta TEXT,
  error TEXT,
  creado INTEGER NOT NULL,
  iniciado INTEGER
);
CREATE INDEX IF NOT EXISTS idx_gpt_jobs_estado ON gpt_jobs(estado, creado);
CREATE TABLE IF NOT EXISTS gpt_estado (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
