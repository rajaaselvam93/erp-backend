const express = require('express');
const router = express.Router();
const dynamicController = require('../controllers/dynamic.controller');
const { authenticateFlexible } = require('../middleware/auth.middleware');
const { auditLog } = require('../middleware/audit.middleware');
const { hasPermission } = require('../middleware/rbac.middleware');

router.use(authenticateFlexible);

/**
 * Dynamic permission guard: checks `{moduleSlug}.{action}` permission.
 * API-token requests bypass the check (they carry admin-level authority).
 */
const requireModulePerm = (action) => async (req, res, next) => {
  if (req.isApiToken) return next(); // permanent API tokens are admin-scoped
  const slug = req.params.module;
  return hasPermission(`${slug}.${action}`)(req, res, next);
};

// Dynamic CRUD for any module
router.get('/:module/export', requireModulePerm('export'), dynamicController.exportRecords);
router.post('/:module/bulk-delete', requireModulePerm('delete'), dynamicController.bulkDelete);
router.get('/:module/:id', requireModulePerm('read'), dynamicController.getRecord);
router.post('/:module', requireModulePerm('create'), auditLog('create', 'dynamic'), dynamicController.createRecord);
router.put('/:module/:id', requireModulePerm('update'), auditLog('update', 'dynamic'), dynamicController.updateRecord);
router.delete('/:module/:id', requireModulePerm('delete'), auditLog('delete', 'dynamic'), dynamicController.deleteRecord);
// List must be last among /:module routes to avoid shadowing the sub-routes above
router.get('/:module', requireModulePerm('read'), dynamicController.getRecords);

module.exports = router;
