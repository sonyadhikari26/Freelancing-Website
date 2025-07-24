const sequelize = require('./database.js');

async function checkUsers() {
  try {
    const result = await sequelize.query('SELECT id, username, email, "isEmailVerified" FROM users;');
    console.log('Existing users:');
    console.table(result[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
