const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function initDatabase() {
  console.log('Initializing database...');

  // First, connect to default postgres database to create our database
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_ADMIN_USERNAME || 'postgres',
    password: process.env.DB_ADMIN_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default database
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL server');

    // Create database if it doesn't exist
    try {
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME || 'lifeol'}`);
      console.log(`Database ${process.env.DB_NAME || 'lifeol'} created successfully`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`Database ${process.env.DB_NAME || 'lifeol'} already exists`);
      } else {
        throw err;
      }
    }

    await adminClient.end();
    
    // Now connect to our database and initialize schema
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USERNAME || 'lifeol',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'lifeol',
    });

    await client.connect();
    console.log(`Connected to ${process.env.DB_NAME || 'lifeol'} database`);

    // Enable uuid extension
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('UUID extension enabled');
    } catch (err) {
      console.log('Could not enable UUID extension, but continuing anyway...');
    }

    // Read and execute the reset-db.sql file
    const sql = fs.readFileSync(path.join(__dirname, 'reset-db.sql'), 'utf8');
    await client.query(sql);
    console.log('Database schema initialized successfully');

    await client.end();
    console.log('Database initialization completed');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initDatabase();