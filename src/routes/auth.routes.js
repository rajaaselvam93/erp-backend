const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     security: []
 */
router.post('/login', authLimiter, ...authController.login);
router.post('/refresh', ...authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/forgot-password', authLimiter, ...authController.forgotPassword);
router.post('/reset-password', authLimiter, ...authController.resetPassword);
router.post('/change-password', authenticate, ...authController.changePassword);

module.exports = router;
