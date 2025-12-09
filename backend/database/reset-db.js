require('dotenv').config({
  path: process.env.NODE_ENV === '../../.env'
});
const { pool } = require('./pool');

async function resetDatabase({ keepMigrations = false } = {}) {
  try {
    // Busca todas as tabelas do schema público
    const res = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const tables = res.rows.map(r => r.tablename).filter(Boolean);

    if (tables.length === 0) {
      console.log('Nenhuma tabela encontrada no schema public.');
      return;
    }

    console.log('Tabelas encontradas:', tables);

    const toDrop = tables.filter(t => !(keepMigrations && t === 'migrations'));

    if (toDrop.length === 0) {
      console.log('Nenhuma tabela para dropar após filtro.');
      return;
    }

    const dropSql = toDrop.map(t => `"public"."${t}"`).join(', ');
    console.log('Executando DROP TABLE CASCADE para:', toDrop);
    await pool.query(`DROP TABLE IF EXISTS ${dropSql} CASCADE;`);

    console.log('Database reset concluído. Tabelas removidas:', toDrop);
  } catch (err) {
    console.error('Erro ao resetar banco:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  resetDatabase({ keepMigrations: false });
}

module.exports = resetDatabase;