const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/module.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { hasPermission, hasRole } = require('../middleware/rbac.middleware');

router.use(authenticate);

// Module management
router.get('/menu', moduleController.getMenuTree);
router.get('/slug/:slug', moduleController.getModuleBySlug);
router.get('/', moduleController.getModules);
router.post('/', hasRole('admin', 'super-admin'), ...moduleController.createModule);
router.get('/:id', moduleController.getModule);
router.put('/:id', hasRole('admin', 'super-admin'), moduleController.updateModule);
router.delete('/:id', hasRole('admin', 'super-admin'), moduleController.deleteModule);

// Field management
router.post('/:id/fields', hasRole('admin', 'super-admin'), ...moduleController.addField);
router.put('/:id/fields/reorder', hasRole('admin', 'super-admin'), moduleController.reorderFields);
router.put('/:id/fields/:fieldId', hasRole('admin', 'super-admin'), moduleController.updateField);
router.delete('/:id/fields/:fieldId', hasRole('admin', 'super-admin'), moduleController.deleteField);

module.exports = router;
