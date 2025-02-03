module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/*.test.js'],
    verbose: true,
    coverageDirectory: 'coverage',
    clearMocks: true,
    verbose: true,
    setupFiles: ['dotenv/config'],
    testPathIgnorePatterns: ['/node_modules/'],
    testTimeout: 10000
  };