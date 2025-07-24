#!/usr/bin/env node

/**
 * Simple TalentLink Setup - College Project
 * One command to set up everything!
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎓 TalentLink College Project Setup\n');

// Simple logging
const log = (msg) => console.log(`✓ ${msg}`);
const warn = (msg) => console.log(`⚠ ${msg}`);
const error = (msg) => console.log(`✗ ${msg}`);

async function quickSetup() {
  try {
    // 1. Create simple .env file
    if (!fs.existsSync('.env')) {
      const envContent = `DB_HOST=localhost
DB_PORT=5432
DB_NAME=talentlink
DB_USER=postgres
DB_PASSWORD=admin
JWT_KEY=college_project_secret_key
PORT=8800
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
`;
      fs.writeFileSync('.env', envContent);
      log('Created .env configuration');
    } else {
      log('Using existing .env configuration');
    }

    // 2. Install dependencies
    log('Installing dependencies...');
    await new Promise((resolve, reject) => {
      exec('npm install', (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve();
      });
    });
    log('Dependencies installed');

    // 3. Simple database setup
    log('Setting up database...');
    const { Sequelize } = require('sequelize');
    
    // Load config
    require('dotenv').config();
    
    // Connect to postgres (default) first
    let sequelize = new Sequelize('postgres', 'postgres', 'admin', {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: false
    });

    try {
      await sequelize.authenticate();
      
      // Create database if not exists
      const [results] = await sequelize.query("SELECT 1 FROM pg_database WHERE datname='talentlink'");
      if (results.length === 0) {
        await sequelize.query('CREATE DATABASE talentlink');
        log('Database created');
      } else {
        log('Database already exists');
      }
      
      await sequelize.close();
      
      // Connect to talentlink database
      sequelize = new Sequelize('talentlink', 'postgres', 'admin', {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: false
      });

      // Create basic tables
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          img VARCHAR(255),
          country VARCHAR(255) NOT NULL,
          phone VARCHAR(255),
          "desc" TEXT,
          "isSeller" BOOLEAN DEFAULT false,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS gigs (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER REFERENCES users(id),
          title VARCHAR(255) NOT NULL,
          "desc" TEXT NOT NULL,
          "totalStars" INTEGER DEFAULT 0,
          "starNumber" INTEGER DEFAULT 0,
          cat VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          cover VARCHAR(255) NOT NULL,
          images TEXT,
          "shortTitle" VARCHAR(255) NOT NULL,
          "shortDesc" VARCHAR(255) NOT NULL,
          "deliveryTime" INTEGER NOT NULL,
          "revisionNumber" INTEGER NOT NULL,
          features TEXT,
          sales INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      log('Database tables created');
      await sequelize.close();

    } catch (dbError) {
      warn('Database setup failed - you may need to install PostgreSQL');
      warn('Install: brew install postgresql (macOS) or sudo apt-get install postgresql (Linux)');
    }

    // 4. Done!
    console.log('\n🎉 Setup Complete!\n');
    console.log('To start your project:');
    console.log('1. Backend: npm start');
    console.log('2. Frontend: cd ../client && npm install && npm run dev');
    console.log('\nURLs:');
    console.log('- Frontend: http://localhost:5173');
    console.log('- Backend: http://localhost:8800');
    
  } catch (error) {
    error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

quickSetup();
