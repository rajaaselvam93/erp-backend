const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger.util');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  pool: config.db.pool,
  logging: config.db.logging ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true, // Soft deletes
  },
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true,
  },
  timezone: '+00:00',
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`Database connected: ${config.db.host}:${config.db.port}/${config.db.name}`);
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
