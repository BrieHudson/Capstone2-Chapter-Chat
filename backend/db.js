const { Sequelize } = require('sequelize');
const config = require('./config/sequelize.config.js')[process.env.NODE_ENV || 'development'];

console.log('Initializing database connection...');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: console.log, // Enable logging during debugging
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Export both the sequelize instance and a connection test function
module.exports = {
  sequelize,
  testConnection: async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      return true;
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      return false;
    }
  }
};


