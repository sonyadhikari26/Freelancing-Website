const sequelize = require('./database.js');

async function runMigration() {
  try {
    console.log('🔄 Running email verification fields migration...');
    
    // Add the new columns
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN DEFAULT FALSE NOT NULL;
    `);
    
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(255);
    `);
    
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP WITH TIME ZONE;
    `);
    
    console.log('✅ Email verification fields migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();
