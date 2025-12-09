CREATE TABLE IF NOT EXISTS convites_grupo (
  id SERIAL PRIMARY KEY,
  id_grupo INTEGER REFERENCES grupos(id) ON DELETE CASCADE,
  email_convidado TEXT REFERENCES usuarios(email) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(id_grupo, email_convidado)
);