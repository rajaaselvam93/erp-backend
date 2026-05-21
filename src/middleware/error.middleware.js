const logger = require('../utils/logger.util');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
    errors = err.errors.map((e) => ({ field: e.path, message: `${e.path} must be unique` }));
  }

  // Sequelize foreign key error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference - related record not found';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File size too large';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} - ${statusCode}: ${message}`, {
      stack: err.stack,
      body: req.body,
      user: req.user?.email,
    });
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.app.isDevelopment && statusCode >= 500 && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
};

module.exports = { errorHandler, notFoundHandler };
