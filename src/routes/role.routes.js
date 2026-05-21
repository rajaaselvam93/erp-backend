const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { hasPermission, hasRole } = require('../middleware/rbac.middleware');

router.use(authenticate);

router.get('/permissions', roleController.getPermissions);
router.get('/', hasPermission('roles.read'), roleController.getRoles);
router.post('/', hasPermission('roles.create'), ...roleController.createRole);
router.get('/:id', hasPermission('roles.read'), roleController.getRole);
router.put('/:id', hasPermission('roles.update'), roleController.updateRole);
router.delete('/:id', hasPermission('roles.delete'), roleController.deleteRole);

module.exports = router;
