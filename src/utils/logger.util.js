const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config');

const { combine, timestamp, errors, json, colorize, printf, splat } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  if (Object.keys(meta).length) {
    log += ` ${JSON.stringify(meta)}`;
  }
  return log;
});

const transports = [
  new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      splat(),
      logFormat
    ),
  }),
];

if (config.app.isProduction) {
  transports.push(
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );
}

const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(timestamp(), errors({ stack: true })),
  transports,
  exitOnError: false,
});

module.exports = logger;
