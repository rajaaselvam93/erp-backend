const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger.util');
const { defaultLimiter } = require('./middleware/rateLimiter.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const routes = require('./routes');

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: config.app.isProduction,
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        config.app.frontendUrl,
        'http://localhost:3000',
        'http://localhost:5173',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Platform'],
  })
);

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ─────────────────────────────────────────────────────────
if (config.app.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', defaultLimiter);

// ─── Swagger Documentation ────────────────────────────────────────────────────
if (config.swagger.enabled) {
  app.use(
    config.swagger.path,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Evvo ERP API Docs',
      customCss: `
        .swagger-ui .topbar { background-color: #6366f1; }
        .swagger-ui .topbar-wrapper .link { color: white; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
      },
    })
  );
  logger.info(`API docs available at ${config.swagger.path}`);
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'Evvo ERP API',
    version: '1.0.0',
    status: 'running',
    docs: config.swagger.path,
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
