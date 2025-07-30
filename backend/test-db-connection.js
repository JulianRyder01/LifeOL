const { Client } = require('pg');

// Load environment variables
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'lifeol',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'lifeol',
  });

  try {
    await client.connect();
    console.log('Successfully connected to the database');
    
    // Test a simple query
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0].now);
    
    await client.end();
    console.log('Connection test completed');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();