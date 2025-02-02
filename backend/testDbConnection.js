const { sequelize, testConnection } = require('./db');

async function runTests() {
  try {
    // Test basic connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to establish database connection');
    }

    // Test query execution
    const [results] = await sequelize.query('SELECT NOW()');
    console.log('Database query successful:', results[0]);

    // Test model connection if needed
    const db = require('./models');
    await db.sequelize.authenticate();
    console.log('Models initialized successfully');

  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runTests;
