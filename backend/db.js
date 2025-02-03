const { Sequelize } = require('sequelize');
const config = require('./config/sequelize.config.js')[process.env.NODE_ENV || 'development'];

console.log('Initializing database connection...');

const sequelize = new Sequelize(process.env.DATABASE_URL, config);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    process.exit();
  }
};

testConnection();

module.exports = { sequelize, testConnection };





