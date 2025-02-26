const { sequelize } = require('./db');
const db = require('./models');

async function syncDatabase() {
  try {
    console.log('Starting database sync...');
    console.log('Environment:', process.env.NODE_ENV);
    
    await sequelize.authenticate({
      retry: {
        max: 5,
        timeout: 60000
      }
    });
    console.log('Database connection verified.');

    console.log('Available models:', Object.keys(db).filter(key => 
      key !== 'sequelize' && key !== 'Sequelize'
    ));

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized successfully.');
    }

    return true;
  } catch (error) {
    console.error('Database sync error:', {
      message: error.message,
      name: error.name,
      code: error.original?.code,
      detail: error.original?.detail,
      ssl: error.parent?.code === 'SELF_SIGNED_CERT_IN_CHAIN' ? 'SSL Error' : 'N/A'
    });
    throw error;
  }
}

module.exports = syncDatabase;
