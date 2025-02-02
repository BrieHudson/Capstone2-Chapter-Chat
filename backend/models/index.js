const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.resolve(__dirname, '../config/sequelize.config.js'))[env];
const db = {};

console.log('Starting database initialization...');

let sequelize;
if (config.use_env_variable) {
  console.log('Using environment variable for database connection');
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  console.log('Using direct configuration for database connection');
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    logging: console.log // Enable SQL query logging
  });
}

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Unable to connect to database:', err));

// Import models
console.log('Reading model files...');
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && 
           (file !== basename) && 
           (file.slice(-3) === '.js') && 
           (file !== 'index.js');
  });

console.log('Model files found:', modelFiles);

modelFiles.forEach(file => {
  console.log(`Importing model from ${file}...`);
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
  console.log(`Imported ${model.name} model`);
});

// Define relationships
console.log('Setting up model associations...');
Object.keys(db).forEach(modelName => {
  console.log(`Setting up associations for ${modelName}...`);
  if (db[modelName].associate) {
    try {
      db[modelName].associate(db);
      console.log(`Successfully set up associations for ${modelName}`);
    } catch (error) {
      console.error(`Error setting up associations for ${modelName}:`, error);
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('Database initialization completed');

module.exports = db;


