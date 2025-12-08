require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./pool');

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function seed() {
  const users = [
    { name: 'João Silva', email: 'joao@example.com', password: '123456' },
    { name: 'Maria Souza', email: 'maria@example.com', password: 'abcdef' },
  ];

  try {
    await pool.query('BEGIN');
    
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        [user.name, user.email, hashedPassword]
      );
      console.log(`Usuário ${user.name} inserido com sucesso.`);
    }

    await pool.query('COMMIT');
    console.log('Todos os usuários foram inseridos com sucesso!');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erro ao inserir usuários:', err);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('Conexão com o banco de dados encerrada.');
  }
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
}
