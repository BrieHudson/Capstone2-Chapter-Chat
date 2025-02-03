require('dotenv').config(); // Load environment variables

const commonConfig = {
  dialect: 'postgres',
  dialectOptions: process.env.DATABASE_URL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    ...commonConfig,
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    ...commonConfig,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    ...commonConfig,
  },
};







