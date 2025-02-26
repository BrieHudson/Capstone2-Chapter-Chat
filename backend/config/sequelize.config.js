require('dotenv').config();

const commonConfig = {
  dialect: 'postgres',
  dialectModule: require('pg'),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ca: null,
      key: null,
      cert: null,
    }
  },
  pool: {
    max: 10,
    min: 2,
    idle: 20000,
    acquire: 60000
  }
};

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    ...commonConfig,
  },
  test: {
    url: process.env.DATABASE_URL,
    ...commonConfig,
  },
  production: {
    url: process.env.DATABASE_URL,
    ...commonConfig,
  }
};








