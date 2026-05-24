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

// Business module routes
const hrmsRoutes = require('./hrms.routes');
const crmRoutes = require('./crm.routes');
const procurementRoutes = require('./procurement.routes');
const inventoryRoutes = require('./inventory.routes');
const salesRoutes = require('./sales.routes');
const financeRoutes = require('./finance.routes');
const projectsRoutes = require('./projects.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Evvo ERP API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Core routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/modules', moduleRoutes);
router.use('/data', dynamicRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);

// Business module routes — /api/v1/hrms, /api/v1/crm, etc.
router.use('/hrms', hrmsRoutes);
router.use('/crm', crmRoutes);
router.use('/procurement', procurementRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/finance', financeRoutes);
router.use('/projects', projectsRoutes);

// Direct module REST API — mounted LAST so named routes above take precedence.
router.use('/', moduleApiRoutes);

module.exports = router;
