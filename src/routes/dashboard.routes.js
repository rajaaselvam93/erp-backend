const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getRecentActivity);
router.get('/activity-chart', dashboardController.getActivityChart);
router.get('/user-growth', dashboardController.getUserGrowth);
router.get('/module-usage', dashboardController.getModuleUsage);
router.get('/widget', dashboardController.getWidgetData);

module.exports = router;
