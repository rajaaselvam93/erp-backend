const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { hasRole } = require('../middleware/rbac.middleware');

// All settings endpoints require a valid session + admin role
router.use(authenticate);
router.use(hasRole('admin', 'super-admin'));

router.get('/api-token', settingsController.getApiToken);
router.post('/api-token/generate', settingsController.generateApiToken);

module.exports = router;
