const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const NEON_DEFAULT_URL =
  'postgresql://neondb_owner:npg_z60bGAkQOmEM@ep-wispy-sea-a1aaj02c-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const targetDbUrl = process.env.DATABASE_URL || (process.env.VERCEL ? NEON_DEFAULT_URL : undefined);
const isPostgres =
  (process.env.DB_TYPE || '').toLowerCase() === 'postgres' ||
  !!process.env.DATABASE_URL ||
  !!process.env.VERCEL;

let dbInstance = null;

/**
 * Initialize Database Connection
 * Supports PostgreSQL (Neon Cloud) seamlessly on cloud/Vercel,
 * and SQLite for zero-setup local development.
 */
function initDB() {
  if (dbInstance) return dbInstance;

  if (isPostgres && targetDbUrl) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: targetDbUrl,
      ssl: { rejectUnauthorized: false },
    });
    dbInstance = {
      type: 'postgres',
      pool,
      async query(sqlText, params = []) {
        let paramIndex = 1;
        const pgSql = sqlText.replace(/\?/g, () => `$${paramIndex++}`);
        const result = await pool.query(pgSql, params);
        return result.rows;
      },
      async execute(sqlText, params = []) {
        let paramIndex = 1;
        let pgSql = sqlText.replace(/\?/g, () => `$${paramIndex++}`);
        if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
          pgSql = pgSql.trim().replace(/;$/, '') + ' RETURNING id;';
        }
        const result = await pool.query(pgSql, params);
        return {
          rowCount: result.rowCount,
          insertId: result.rows?.[0]?.id || null,
        };
      },
    };
    console.log('Connected to PostgreSQL Database (Neon Cloud).');
  } else {
    // SQLite built-in using node:sqlite (Zero dependencies, pure, safe)
    const { DatabaseSync } = require('node:sqlite');
    const dataDir = path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'store_rating.db');
    const sqlite = new DatabaseSync(dbPath);

    // Enable WAL mode and foreign keys for performance and data integrity
    sqlite.exec('PRAGMA journal_mode = WAL;');
    sqlite.exec('PRAGMA foreign_keys = ON;');

    dbInstance = {
      type: 'sqlite',
      async query(sqlText, params = []) {
        const stmt = sqlite.prepare(sqlText);
        return stmt.all(...params);
      },
      async execute(sqlText, params = []) {
        const stmt = sqlite.prepare(sqlText);
        const info = stmt.run(...params);
        return {
          rowCount: info.changes,
          insertId: Number(info.lastInsertRowid),
        };
      },
    };
    console.log(`Connected to SQLite Database at: ${dbPath}`);
  }

  return dbInstance;
}

/**
 * Execute raw multi-statement SQL script (used for table creation)
 */
async function execScript(script) {
  const db = initDB();
  if (db.type === 'sqlite') {
    const { DatabaseSync } = require('node:sqlite');
    const dataDir = path.join(__dirname, '..', '..', 'data');
    const dbPath = path.join(dataDir, 'store_rating.db');
    const sqlite = new DatabaseSync(dbPath);
    sqlite.exec(script);
  } else {
    await db.pool.query(script);
  }
}

/**
 * Helper to run a SELECT query with parameters
 */
async function query(sqlText, params = []) {
  const db = initDB();
  return db.query(sqlText, params);
}

/**
 * Helper to run INSERT, UPDATE, DELETE queries with parameters
 */
async function execute(sqlText, params = []) {
  const db = initDB();
  return db.execute(sqlText, params);
}

module.exports = {
  initDB,
  query,
  execute,
  execScript,
};
