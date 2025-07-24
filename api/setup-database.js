#!/usr/bin/env node

/**
 * TalentLink Database Setup Script (Node.js Version)
 * This script sets up the PostgreSQL database and tables for the TalentLink project
 * Works on Windows, macOS, and Linux
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`)
};

class DatabaseSetup {
  constructor() {
    this.config = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'talentlink',
      DB_USER: 'postgres',
      DB_PASSWORD: 'admin'
    };
  }

  // Load configuration from .env file
  async loadConfig() {
    log.info('Loading database configuration...');
    
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');
      
      envLines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          this.config[key.trim()] = value.trim().replace(/"/g, '');
        }
      });
      
      log.success('Configuration loaded from .env file');
    } else {
      log.warning('.env file not found, creating with default values...');
      await this.createEnvFile();
    }

    console.log('\nDatabase Configuration:');
    console.log(`  Host: ${this.config.DB_HOST}`);
    console.log(`  Port: ${this.config.DB_PORT}`);
    console.log(`  Database: ${this.config.DB_NAME}`);
    console.log(`  User: ${this.config.DB_USER}`);
    console.log('');
  }

  // Create .env file with default configuration
  async createEnvFile() {
    const envContent = `# PostgreSQL Database Configuration
DATABASE_URL="postgresql://${this.config.DB_USER}:${this.config.DB_PASSWORD}@${this.config.DB_HOST}:${this.config.DB_PORT}/${this.config.DB_NAME}"
DB_HOST=${this.config.DB_HOST}
DB_PORT=${this.config.DB_PORT}
DB_NAME=${this.config.DB_NAME}
DB_USER=${this.config.DB_USER}
DB_PASSWORD=${this.config.DB_PASSWORD}

# Stripe Secret Key (Add your own key)
STRIPE=your_stripe_secret_key_here

# JWT Secret Key
JWT_KEY=a4yF7eO7J4CQkKMgbojpjoJ16ahHZn3A

# Development Environment
NODE_ENV=development

# Server Configuration
PORT=8800
CORS_ORIGIN=http://localhost:5173
`;

    fs.writeFileSync('.env', envContent);
    log.success('.env file created with default configuration');
  }

  // Check if PostgreSQL is installed
  async checkPostgreSQL() {
    log.info('Checking PostgreSQL installation...');
    
    try {
      await execAsync('psql --version');
      log.success('PostgreSQL is installed');
      return true;
    } catch (error) {
      log.error('PostgreSQL is not installed or not in PATH!');
      console.log('\nPlease install PostgreSQL:');
      console.log('  macOS: brew install postgresql');
      console.log('  Ubuntu: sudo apt-get install postgresql postgresql-contrib');
      console.log('  Windows: Download from https://www.postgresql.org/download/windows/');
      console.log('  Or use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=admin postgres');
      return false;
    }
  }

  // Test database connection
  async testConnection() {
    log.info('Testing database connection...');
    
    const { Sequelize } = require('sequelize');
    
    const sequelize = new Sequelize(
      'postgres', // Connect to default postgres database first
      this.config.DB_USER,
      this.config.DB_PASSWORD,
      {
        host: this.config.DB_HOST,
        port: this.config.DB_PORT,
        dialect: 'postgres',
        logging: false,
      }
    );

    try {
      await sequelize.authenticate();
      log.success('Successfully connected to PostgreSQL server');
      await sequelize.close();
      return true;
    } catch (error) {
      log.error('Cannot connect to PostgreSQL server');
      console.log('\nConnection error:', error.message);
      console.log('\nPlease check:');
      console.log('  1. PostgreSQL is running');
      console.log('  2. Username and password are correct');
      console.log('  3. PostgreSQL is configured to accept connections');
      console.log('\nFor default PostgreSQL installation, try:');
      console.log(`  createuser -s ${this.config.DB_USER}`);
      console.log(`  psql -c "ALTER USER ${this.config.DB_USER} PASSWORD '${this.config.DB_PASSWORD}';"`);
      return false;
    }
  }

  // Create database if it doesn't exist
  async createDatabase() {
    log.info(`Creating database '${this.config.DB_NAME}'...`);
    
    const { Sequelize } = require('sequelize');
    
    const sequelize = new Sequelize(
      'postgres', // Connect to default postgres database
      this.config.DB_USER,
      this.config.DB_PASSWORD,
      {
        host: this.config.DB_HOST,
        port: this.config.DB_PORT,
        dialect: 'postgres',
        logging: false,
      }
    );

    try {
      await sequelize.authenticate();
      
      // Check if database exists
      const [results] = await sequelize.query(
        `SELECT 1 FROM pg_database WHERE datname='${this.config.DB_NAME}'`
      );
      
      if (results.length > 0) {
        log.warning(`Database '${this.config.DB_NAME}' already exists`);
      } else {
        // Create the database
        await sequelize.query(`CREATE DATABASE "${this.config.DB_NAME}"`);
        log.success(`Database '${this.config.DB_NAME}' created successfully`);
      }
      
      await sequelize.close();
      return true;
    } catch (error) {
      log.error(`Failed to create database: ${error.message}`);
      await sequelize.close();
      return false;
    }
  }

  // Install npm dependencies
  async installDependencies() {
    log.info('Installing npm dependencies...');
    
    if (!fs.existsSync('package.json')) {
      log.error('package.json not found!');
      return false;
    }

    try {
      const { stdout } = await execAsync('npm install');
      log.success('Dependencies installed successfully');
      return true;
    } catch (error) {
      log.error('Failed to install dependencies');
      console.log(error.message);
      return false;
    }
  }

  // Set up database tables
  async setupTables() {
    log.info('Setting up database tables...');
    
    const { Sequelize } = require('sequelize');
    
    const sequelize = new Sequelize(
      this.config.DB_NAME,
      this.config.DB_USER,
      this.config.DB_PASSWORD,
      {
        host: this.config.DB_HOST,
        port: this.config.DB_PORT,
        dialect: 'postgres',
        logging: false,
      }
    );

    try {
      await sequelize.authenticate();

      // Create Users table
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

      // Create Gigs table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS gigs (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

      // Create Conversations table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id VARCHAR(255) PRIMARY KEY,
          "sellerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
          "buyerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
          "readBySeller" BOOLEAN DEFAULT false,
          "readByBuyer" BOOLEAN DEFAULT false,
          "lastMessage" TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Orders table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(255) PRIMARY KEY,
          "gigId" INTEGER REFERENCES gigs(id) ON DELETE CASCADE,
          img VARCHAR(255),
          title VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          "sellerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
          "buyerId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
          "isCompleted" BOOLEAN DEFAULT false,
          payment_intent VARCHAR(255) UNIQUE,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Messages table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          "conversationId" VARCHAR(255) REFERENCES conversations(id) ON DELETE CASCADE,
          "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
          "desc" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Reviews table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          "gigId" INTEGER REFERENCES gigs(id) ON DELETE CASCADE,
          "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
          star INTEGER NOT NULL CHECK (star >= 1 AND star <= 5),
          "desc" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      log.success('All database tables created successfully');
      await sequelize.close();
      return true;
    } catch (error) {
      log.error(`Failed to create tables: ${error.message}`);
      await sequelize.close();
      return false;
    }
  }

  // Test the setup
  async testSetup() {
    log.info('Testing the setup...');
    
    const { Sequelize } = require('sequelize');
    
    const sequelize = new Sequelize(
      this.config.DB_NAME,
      this.config.DB_USER,
      this.config.DB_PASSWORD,
      {
        host: this.config.DB_HOST,
        port: this.config.DB_PORT,
        dialect: 'postgres',
        logging: false,
      }
    );

    try {
      await sequelize.authenticate();
      
      // Check if all tables exist
      const tables = ['users', 'gigs', 'conversations', 'orders', 'messages', 'reviews'];
      
      for (const table of tables) {
        const [result] = await sequelize.query(`SELECT to_regclass('public.${table}')`);
        if (!result[0].to_regclass) {
          throw new Error(`Table ${table} does not exist`);
        }
      }
      
      log.success('All database tables are accessible');
      await sequelize.close();
      return true;
    } catch (error) {
      log.error(`Setup test failed: ${error.message}`);
      await sequelize.close();
      return false;
    }
  }

  // Main setup process
  async run() {
    console.log('======================================');
    console.log('   TalentLink Database Setup Script   ');
    console.log('======================================\n');

    try {
      await this.loadConfig();
      
      if (!(await this.checkPostgreSQL())) {
        process.exit(1);
      }

      if (!(await this.testConnection())) {
        process.exit(1);
      }

      if (!(await this.createDatabase())) {
        process.exit(1);
      }

      if (!(await this.installDependencies())) {
        process.exit(1);
      }

      if (!(await this.setupTables())) {
        process.exit(1);
      }

      if (!(await this.testSetup())) {
        process.exit(1);
      }

      console.log('\n======================================');
      log.success('Database setup completed successfully!');
      console.log('======================================\n');
      
      console.log('You can now start the application with:');
      console.log('  npm start\n');
      
      console.log('Database Information:');
      console.log(`  Host: ${this.config.DB_HOST}:${this.config.DB_PORT}`);
      console.log(`  Database: ${this.config.DB_NAME}`);
      console.log('  Tables: users, gigs, orders, conversations, messages, reviews\n');

    } catch (error) {
      log.error(`Setup failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  const setup = new DatabaseSetup();
  setup.run();
}

module.exports = DatabaseSetup;
