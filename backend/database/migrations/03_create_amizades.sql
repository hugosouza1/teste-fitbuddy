CREATE TABLE IF NOT EXISTS amigos (
  id SERIAL PRIMARY KEY,
  usuario1_email TEXT REFERENCES usuarios(email) ON DELETE CASCADE,
  usuario2_email TEXT REFERENCES usuarios(email) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(usuario1_email, usuario2_email)
);