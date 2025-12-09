CREATE TABLE IF NOT EXISTS checkin (
  email TEXT,
  dia DATE,
  fotoURL TEXT NOT NULL,
  PRIMARY KEY (email, dia),
  FOREIGN KEY (email) REFERENCES usuarios(email) ON DELETE CASCADE
);