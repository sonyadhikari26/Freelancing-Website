require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'talentlink',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Create all tables manually
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
    console.log('Users table created');

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
    console.log('Gigs table created');

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
    console.log('Conversations table created');

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
    console.log('Orders table created');

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
    console.log('Messages table created');

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
    console.log('Reviews table created');

    console.log('All tables created successfully!');

  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
