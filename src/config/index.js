require('dotenv').config();

const config = {
  app: {
    name: process.env.APP_NAME || 'Evvo ERP',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5000,
    url: process.env.APP_URL || 'http://localhost:5000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'evvo_erp',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'default_encryption_key_32chars!!',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@evvoerp.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Evvo ERP',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0,
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,csv').split(','),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  multiTenant: {
    enabled: process.env.ENABLE_MULTI_TENANT === 'true',
    default: process.env.DEFAULT_TENANT || 'default',
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    path: process.env.SWAGGER_PATH || '/api/docs',
  },
};

module.exports = config;
