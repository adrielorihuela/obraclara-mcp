-- Chats compartidos mediante un enlace público de solo lectura (/c/:id).
-- 1 escritura por enlace; las visitas no escriben nada.
CREATE TABLE IF NOT EXISTS compartidos (
  id TEXT PRIMARY KEY,
  creado TEXT,
  titulo TEXT,
  datos TEXT,
  token_hash TEXT
);
