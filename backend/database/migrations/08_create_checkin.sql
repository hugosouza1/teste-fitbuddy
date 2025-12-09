CREATE TABLE IF NOT EXISTS checkin (
  email TEXT,
  dia DATE,
  fotoURL TEXT NOT NULL,
  PRIMARY KEY (email, dia),
  FOREIGN KEY (email) REFERENCES usuarios(email) ON DELETE CASCADE
);


DROP FUNCTION IF EXISTS adicionar_pontos() CASCADE;

CREATE OR REPLACE FUNCTION adicionar_pontos()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE membros_de
  SET pontos = pontos + 10
  WHERE email = NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS tg_adicionar_pontos ON checkin;

CREATE TRIGGER tg_adicionar_pontos
AFTER INSERT ON checkin
FOR EACH ROW
EXECUTE FUNCTION adicionar_pontos();