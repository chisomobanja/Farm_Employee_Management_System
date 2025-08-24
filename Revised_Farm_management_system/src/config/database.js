const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // No SSL for local development
});

// Test connection
pool.on('connect', (client) => {
  console.log('Connected to local PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Test the connection when module loads
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    client.release();
  } catch (err) {
    console.error('Database connection test failed:', err.message);
  }
};

// Test connection after a short delay to ensure DB is ready
setTimeout(testConnection, 2000);

module.exports = pool;
