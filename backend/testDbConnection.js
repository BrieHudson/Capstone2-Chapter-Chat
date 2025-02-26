const { sequelize, testConnection } = require('./db');

async function runTests() {
  try {
    console.log('Starting database tests...');

    // Test basic connection
    console.log('\n1. Testing connection...');
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to establish database connection');
    }

    // Test query execution
    console.log('\n2. Testing query execution...');
    const [results] = await sequelize.query('SELECT current_database(), current_user, version()');
    console.log('Database info:', results[0]);

    // Test models
    console.log('\n3. Testing models...');
    const models = Object.keys(sequelize.models);
    console.log('Available models:', models);

    // Test a simple query on each model
    console.log('\n4. Testing model queries...');
    for (const modelName of models) {
      const count = await sequelize.models[modelName].count();
      console.log(`${modelName} has ${count} records`);
    }

    console.log('\n✅ All tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Database test failed:', {
      name: error.name,
      message: error.message,
      original: error.original?.message
    });
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
