const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const { sequelize, Sequelize } = require('../db');  
const db = {};

console.log('Starting model initialization...');

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
  const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

// Define relationships
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    try {
      db[modelName].associate(db);
    } catch (error) {
      console.error(`Error setting up associations for ${modelName}:`, error);
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;


