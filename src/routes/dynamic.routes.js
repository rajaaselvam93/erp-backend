const express = require('express');
const router = express.Router();
const dynamicController = require('../controllers/dynamic.controller');
const { authenticateFlexible } = require('../middleware/auth.middleware');
const { auditLog } = require('../middleware/audit.middleware');

router.use(authenticateFlexible);

// Dynamic CRUD for any module
router.get('/:module', dynamicController.getRecords);
router.get('/:module/export', dynamicController.exportRecords);
router.post('/:module/bulk-delete', dynamicController.bulkDelete);
router.get('/:module/:id', dynamicController.getRecord);
router.post('/:module', auditLog('create', 'dynamic'), dynamicController.createRecord);
router.put('/:module/:id', auditLog('update', 'dynamic'), dynamicController.updateRecord);
router.delete('/:module/:id', auditLog('delete', 'dynamic'), dynamicController.deleteRecord);

module.exports = router;
