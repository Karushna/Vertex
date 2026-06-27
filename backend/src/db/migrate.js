require('dotenv').config();
const pool = require('./index');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS income (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      description VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Migration complete');
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
