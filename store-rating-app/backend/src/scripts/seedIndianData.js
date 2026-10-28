const { initDB } = require('../database/db');
const { initSchema, seedDefaultData } = require('../database/schema');

async function run() {
  try {
    initDB();
    await initSchema();
    await seedDefaultData(true);
    console.log('Database successfully migrated and seeded with Indian data!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
