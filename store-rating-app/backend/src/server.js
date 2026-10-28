const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./database/db');
const { initSchema, seedDefaultData } = require('./database/schema');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Base Middleware
app.use(cors());
app.use(express.json());

let dbInitialized = false;
let dbInitPromise = null;

async function ensureDbInit() {
  if (dbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      initDB();
      await initSchema();
      await seedDefaultData();
      dbInitialized = true;
    })().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

// Middleware to ensure DB is initialized BEFORE any route is executed
app.use(async (req, res, next) => {
  try {
    await ensureDbInit();
    next();
  } catch (err) {
    console.error('Database initialization error:', err);
    res.status(500).json({
      message: 'Database initialization failed.',
      error: err.message || String(err),
    });
  }
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Store Rating System API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/owner', require('./routes/owner'));

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Start local HTTP server when executed directly (node src/server.js)
if (require.main === module) {
  ensureDbInit()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`===============================================`);
        console.log(` Store Rating System Backend Server Running   `);
        console.log(` Port: ${PORT}                                `);
        console.log(` Health: http://localhost:${PORT}/api/health   `);
        console.log(`===============================================`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

module.exports = app;
