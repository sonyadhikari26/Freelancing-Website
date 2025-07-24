require('dotenv').config();
const { Sequelize } = require('sequelize');

// Connect to the default postgres database first
const sequelize = new Sequelize(
  'postgres', // Connect to default postgres db
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function createDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');
    
    // Create the talentlink database
    await sequelize.query('CREATE DATABASE talentlink;');
    console.log('Database "talentlink" created successfully');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Database "talentlink" already exists');
    } else {
      console.error('Error creating database:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

createDatabase();
