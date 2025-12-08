CREATE TABLE IF NOT EXISTS preferencias (
  email TEXT REFERENCES usuarios(email) ON DELETE CASCADE,
  gosto_musical TEXT,
  objetivo TEXT,
  experiencia TEXT DEFAULT 'Iniciante',
  PRIMARY KEY (email)
);

CREATE TABLE IF NOT EXISTS horarios (
  email TEXT NOT NULL REFERENCES usuarios(email) ON DELETE CASCADE,
  horario TIME NOT NULL,
  PRIMARY KEY (email, horario)
);