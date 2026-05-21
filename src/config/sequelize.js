require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'evvo_erp',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    seederStorage: 'sequelize',
    migrationStorage: 'sequelize',
    dialectOptions: {
      charset: 'utf8mb4',
    },
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: `${process.env.DB_NAME || 'evvo_erp'}_test`,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    seederStorage: 'sequelize',
    migrationStorage: 'sequelize',
    dialectOptions: {
      charset: 'utf8mb4',
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
};
