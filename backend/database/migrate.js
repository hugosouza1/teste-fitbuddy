// backend/database/migrate.js
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      run_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);
}

async function alreadyRun(name) {
  const res = await pool.query('SELECT 1 FROM migrations WHERE name = $1', [name]);
  return res.rowCount > 0;
}

async function markAsRun(name) {
  await pool.query('INSERT INTO migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
}

async function run() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  try {
    await ensureMigrationsTable();
    for (const file of files) {
      const name = file;
      if (await alreadyRun(name)) {
        console.log(`-> skipping ${name}`);
        continue;
      }
      console.log(`-> running ${name}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await markAsRun(name);
        await pool.query('COMMIT');
        console.log(`-> applied ${name}`);
      } catch (err) {
        await pool.query('ROLLBACK');
        console.error(`Failed to apply ${name}:`, err);
        process.exit(1);
      }
    }
    console.log('All migrations applied');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
