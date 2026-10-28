const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();
let dbInstance = null;

/**
 * Initialize Database Connection
 * Supports SQLite (built into Node.js 22+) by default for zero-setup ease of use,
 * and seamlessly supports PostgreSQL when configured.
 */
function initDB() {
  if (dbInstance) return dbInstance;

  if (DB_TYPE === 'postgres' && process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    const isCloudSSL = process.env.DATABASE_URL.includes('sslmode=') || process.env.DATABASE_URL.includes('neon.tech');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isCloudSSL ? { rejectUnauthorized: false } : undefined,
    });
    dbInstance = {
      type: 'postgres',
      pool,
      async query(sqlText, params = []) {
        // Convert '?' placeholders to '$1, $2, ...' for PostgreSQL
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
