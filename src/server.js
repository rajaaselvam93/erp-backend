require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');
const { initSocket } = require('./config/socket');
const config = require('./config');
const logger = require('./utils/logger.util');

const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed');
    const { sequelize } = require('./config/database');
    await sequelize.close();
    logger.info('Database connection closed');
    process.exit(0);
  });

  // Force close after 30s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  if (config.app.isProduction) {
    gracefulShutdown('UnhandledRejection');
  }
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('UncaughtException');
});

const start = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    server.listen(config.app.port, () => {
      logger.info(`
╔══════════════════════════════════════════════════╗
║           Evvo ERP Server Started!               ║
╠══════════════════════════════════════════════════╣
║  Environment : ${config.app.env.padEnd(33)}║
║  Port        : ${String(config.app.port).padEnd(33)}║
║  API URL     : ${`${config.app.url}/api/v1`.padEnd(33)}║
║  API Docs    : ${`${config.app.url}${config.swagger.path}`.padEnd(33)}║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

module.exports = { server, io };
