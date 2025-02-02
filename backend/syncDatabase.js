const { sequelize } = require('./db');
const db = require('./models');

async function syncDatabase() {
  try {
    console.log('Starting database sync...');
    await sequelize.authenticate();
    console.log('Database connection verified.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  syncDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = syncDatabase;
