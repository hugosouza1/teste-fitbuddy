CREATE TABLE IF NOT EXISTS usuarios (
  email TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  data_nascimento DATE DEFAULT NULL,
  foto TEXT DEFAULT NULL,
  descricao TEXT DEFAULT NULL,
  notificado TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credenciais (
  email TEXT PRIMARY KEY REFERENCES usuarios(email) ON DELETE CASCADE,
  password TEXT NOT NULL
);
