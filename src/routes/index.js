const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const moduleRoutes = require('./module.routes');
const dynamicRoutes = require('./dynamic.routes');
const dashboardRoutes = require('./dashboard.routes');
const notificationRoutes = require('./notification.routes');
const moduleApiRoutes = require('./moduleApi.routes');
const settingsRoutes = require('./settings.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Evvo ERP API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Mount named routes first
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/modules', moduleRoutes);
router.use('/data', dynamicRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);

// Direct module REST API — mounted LAST so named routes above take precedence.
// Enables: GET/POST/PATCH/DELETE /api/v1/{module_name}
router.use('/', moduleApiRoutes);

module.exports = router;
