/**
 * Direct module REST API routes.
 * Mounted LAST in routes/index.js so named routes (/auth, /users, /modules, etc.)
 * take precedence.  Any unmatched slug falls through to this dynamic handler.
 *
 * GET    /api/v1/{module_name}        → Fetch all records
 * POST   /api/v1/{module_name}        → Create a new record
 * PATCH  /api/v1/{module_name}        → Update a record  (id in request body)
 * DELETE /api/v1/{module_name}        → Delete records   (ids array in request body)
 */
const express = require('express');
const router = express.Router();
const dynamicController = require('../controllers/dynamic.controller');
const { authenticateFlexible } = require('../middleware/auth.middleware');
const { auditLog } = require('../middleware/audit.middleware');

router.use(authenticateFlexible);

router.get('/:module', dynamicController.getRecords);
router.post('/:module', auditLog('create', 'dynamic'), dynamicController.createRecord);
router.patch('/:module', auditLog('update', 'dynamic'), dynamicController.patchRecord);
router.delete('/:module', dynamicController.bulkDelete);

module.exports = router;
