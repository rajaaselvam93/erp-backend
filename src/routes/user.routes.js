const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/rbac.middleware');
const { auditLog } = require('../middleware/audit.middleware');

router.use(authenticate);

// Profile
router.get('/profile', userController.updateProfile[0] ? userController.updateProfile : (req, res) => res.json(req.user));
router.put('/profile', ...userController.updateProfile);
router.post('/profile/avatar', userController.uploadAvatar);
router.put('/profile/preferences', userController.updatePreferences);

// User management (admin)
router.get('/', hasPermission('users.read'), userController.getUsers);
router.post('/', hasPermission('users.create'), auditLog('create', 'users'), ...userController.createUser);
router.get('/:id', hasPermission('users.read'), userController.getUser);
router.put('/:id', hasPermission('users.update'), auditLog('update', 'users'), ...userController.updateUser);
router.delete('/:id', hasPermission('users.delete'), auditLog('delete', 'users'), userController.deleteUser);

module.exports = router;
