// backend/database/pool.js
require('dotenv').config('../../.env');
const { Pool } = require('pg');

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_MAX,
  DB_IDLE_TIMEOUT_MS,
  DB_CONN_TIMEOUT_MS,
  DB_SSL,                     
  DB_SSL_REJECT_UNAUTHORIZED, 
  NODE_ENV
} = process.env;

const isSSL = DB_SSL === 'true' || NODE_ENV === 'production';

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  max: DB_MAX ? Number(DB_MAX) : 10,
  idleTimeoutMillis: DB_IDLE_TIMEOUT_MS ? Number(DB_IDLE_TIMEOUT_MS) : 30000,
  connectionTimeoutMillis: DB_CONN_TIMEOUT_MS ? Number(DB_CONN_TIMEOUT_MS) : 10000,
  ssl: isSSL
    ? {
        // rejeitar certificado não assinado por CA pública por padrão em produção.
        // você pode ajustar pelo .env: DB_SSL_REJECT_UNAUTHORIZED=false
        rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      }
    : false
});

// log de erros não tratados do pool (importante em produção)
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle pg client', err);
  // não finalizar o processo automaticamente — permita que o app trate conforme necessário
});

// Helper: obter client para transações
async function getClient() {
  const client = await pool.connect();
  // opcional: emitir aviso se o client ficar preso
  const timeout = setTimeout(() => {
    console.warn('A client has been checked out for more than 5 seconds!');
  }, 5000);

  const release = client.release;
  client.release = (...args) => {
    clearTimeout(timeout);
    client.release = release;
    return release.apply(client, args);
  };

  return client;
}

// Graceful shutdown (útil em dev e deploy)
async function closePool() {
  try {
    await pool.end();
    console.log('Postgres pool has ended');
  } catch (err) {
    console.error('Error while closing pg pool', err);
  }
}

// opcional: fechar o pool ao receber sinais do sistema
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await closePool();
    process.exit(0);
  });
}

module.exports = {
  pool,
  getClient,
  closePool,
};
