const { execScript, query, execute } = require('./db');
const bcrypt = require('bcryptjs');

/**
 * Creates required tables if they don't already exist.
 */
async function initSchema() {
  const isPostgres =
    (process.env.DB_TYPE || '').toLowerCase() === 'postgres' ||
    !!process.env.DATABASE_URL ||
    !!process.env.VERCEL;

  const schemaSQL = isPostgres
    ? `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK(role IN ('ADMIN', 'USER', 'STORE_OWNER')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      );
    `
    : `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        address TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('ADMIN', 'USER', 'STORE_OWNER')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        owner_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
      );
    `;

  await execScript(schemaSQL);
}

/**
 * Seeds default data if database is empty or contains old non-Indian test data.
 * Includes:
 * 1 System Administrator (Indian name, Bengaluru address)
 * 3 Store Owners (Indian names, Mumbai / Chennai / Jaipur addresses)
 * 4 Normal Users (Indian names, Bengaluru / Pune / Kolkata / Delhi addresses)
 * 6 Authentic Indian Stores & distributed sample ratings
 */
async function seedDefaultData(forceReset = false) {
  const existingUsers = await query('SELECT COUNT(*) as count FROM users');
  const userCount = Number(existingUsers[0]?.count || 0);

  // Check if legacy non-Indian demo data exists
  const oldSeedExists = await query("SELECT id FROM users WHERE email = 'admin@storerating.com'");

  if (userCount > 0 && !forceReset && oldSeedExists.length === 0) {
    return; // Already populated with Indian dataset
  }

  console.log('Seeding authentic Indian demo dataset...');

  // Clear existing records if upgrading from legacy data or forceReset
  if (userCount > 0) {
    await execute('DELETE FROM ratings');
    await execute('DELETE FROM stores');
    await execute('DELETE FROM users');
  }

  // Passwords meet challenge requirements: 8-16 chars, 1 uppercase, 1 special char
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const ownerPassword = await bcrypt.hash('Owner@1234', 10);
  const userPassword = await bcrypt.hash('User@1234', 10);

  // 1. System Administrator (Name length: 30 chars, between 20-60)
  await execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Rajeshwar Prasad Sharma Admin',
      'admin.rajesh@storerating.in',
      adminPassword,
      'Flat 502, Orchid Heights, MG Road, Indiranagar, Bengaluru, Karnataka - 560038',
      'ADMIN',
    ]
  );

  // 2. Store Owner 1 (Name length: 29 chars)
  const owner1 = await execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Vikramaditya Narayan Malhotra',
      'owner.vikram@kiranamart.in',
      ownerPassword,
      'Shop 12-14, Linking Road, Bandra West, Mumbai, Maharashtra - 400050',
      'STORE_OWNER',
    ]
  );

  // 3. Store Owner 2 (Name length: 30 chars)
  const owner2 = await execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Suresh Chandra Chandrasekharan',
      'owner.suresh@bharatgadgets.in',
      ownerPassword,
      'No. 45, Anna Salai Commercial Complex, T. Nagar, Chennai, Tamil Nadu - 600017',
      'STORE_OWNER',
    ]
  );

  // 4. Store Owner 3 (Name length: 26 chars)
  const owner3 = await execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Devendra Kumar Shrivastava',
      'owner.devendra@jaipurspices.in',
      ownerPassword,
      'Plot 88, Johari Bazaar, Pink City, Jaipur, Rajasthan - 302003',
      'STORE_OWNER',
    ]
  );

  // 5. Normal User 1 (Name length: 28 chars)
  const user1 = await execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Ananya Rameshwaram Venkatesh',
      'ananya.venkatesh@gmail.com',
      userPassword,
      'Flat 304, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103',
      'USER',
    ]
  );

  // 6. Normal User 2 (Name length: 31 chars)
  const user2 = await execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Priyanka Harishchandra Deshmukh',
      'priyanka.deshmukh@yahoo.co.in',
      userPassword,
      'B-14, Shanti Niketan Society, FC Road, Shivajinagar, Pune, Maharashtra - 411005',
      'USER',
    ]
  );

  // 7. Normal User 3 (Name length: 28 chars)
  const user3 = await execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Amitabh Dharmendra Mukherjee',
      'amitabh.mukherjee@rediffmail.com',
      userPassword,
      'Block C, Salt Lake City, Sector 2, Kolkata, West Bengal - 700091',
      'USER',
    ]
  );

  // 8. Normal User 4 (Name length: 27 chars)
  const user4 = await execute(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Siddharth Bhupendra Kashyap',
      'siddharth.kashyap@outlook.in',
      userPassword,
      'H-12, South Extension Part 2, Ring Road, New Delhi, Delhi - 110049',
      'USER',
    ]
  );

  // 9. Indian Stores
  const store1 = await execute(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Apna Kirana Mart & Organic Bazaar',
      'contact@kiranamart.in',
      'Shop 12-14, Linking Road, Bandra West, Mumbai, Maharashtra - 400050',
      owner1.insertId,
    ]
  );

  const store2 = await execute(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Bharat Electronics & Gadgets Hub',
      'sales@bharatgadgets.in',
      'No. 45, Anna Salai Commercial Complex, T. Nagar, Chennai, Tamil Nadu - 600017',
      owner2.insertId,
    ]
  );

  const store3 = await execute(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Royal Jaipur Sweets & Spices',
      'orders@jaipurspices.in',
      'Plot 88, Johari Bazaar, Pink City, Jaipur, Rajasthan - 302003',
      owner3.insertId,
    ]
  );

  const store4 = await execute(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Bengal Sweets & Bakery Corner',
      'info@bengalsweets.co.in',
      'Shop 4, Park Street Crossing, Kolkata, West Bengal - 700016',
      null,
    ]
  );

  const store5 = await execute(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Dilli Khana Khazana & Sweets',
      'namaste@dillikhazana.in',
      '22, Connaught Circus, Inner Circle, New Delhi, Delhi - 110001',
      null,
    ]
  );

  const store6 = await execute(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Mysore Handloom & Silk Palace',
      'care@mysoresilkpalace.in',
      'Sayyaji Rao Road, Near Devaraja Market, Mysuru, Karnataka - 570001',
      null,
    ]
  );

  // 10. Sample Distributed Ratings
  // User 1 (Ananya) rates Stores 1, 2, 3
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user1.insertId, store1.insertId, 5]);
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user1.insertId, store2.insertId, 4]);
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user1.insertId, store3.insertId, 5]);

  // User 2 (Priyanka) rates Stores 1, 3, 4
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user2.insertId, store1.insertId, 4]);
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user2.insertId, store3.insertId, 4]);
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user2.insertId, store4.insertId, 5]);

  // User 3 (Amitabh) rates Stores 2, 4, 5
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user3.insertId, store2.insertId, 5]);
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user3.insertId, store4.insertId, 5]);
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user3.insertId, store5.insertId, 4]);

  // User 4 (Siddharth) rates Stores 1, 5, 6
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user4.insertId, store1.insertId, 5]);
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user4.insertId, store5.insertId, 5]);
  await execute('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [user4.insertId, store6.insertId, 4]);

  console.log('Indian demo dataset seeded successfully!');
}

module.exports = {
  initSchema,
  seedDefaultData,
};
