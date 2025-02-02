// Error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('Uncaught Exception:', error);
});

const app = require('./app');
const { testConnection } = require('./db');
const syncDatabase = require('./syncDatabase');

const PORT = 5012;

async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to establish database connection');
    }

    // Sync database in development
    if (process.env.NODE_ENV !== 'production') {
      await syncDatabase();
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


