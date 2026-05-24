const authService = require('../services/auth.service');
const response = require('../utils/response.util');
const Joi = require('joi');
const { validate } = require('../middleware/validate.middleware');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and number' }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const login = [
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        platform: req.headers['x-platform'],
      };
      const result = await authService.login(email, password, deviceInfo, req.ip);
      return response.success(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },
];

const refresh = [
  validate(refreshSchema),
  async (req, res, next) => {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);
      return response.success(res, tokens, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  },
];

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.userId, req.body.refreshToken);
    return response.success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const { User, Role, Company, Permission } = require('../models');
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        },
        { model: Company, as: 'company' },
      ],
    });
    return response.success(res, user, 'Profile fetched');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = [
  validate(forgotSchema),
  async (req, res, next) => {
    try {
      await authService.forgotPassword(req.body.email);
      return response.success(res, null, 'If the email exists, a reset link has been sent');
    } catch (err) {
      next(err);
    }
  },
];

const resetPassword = [
  validate(resetSchema),
  async (req, res, next) => {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      return response.success(res, null, 'Password reset successfully');
    } catch (err) {
      next(err);
    }
  },
];

const changePassword = [
  validate(changePasswordSchema),
  async (req, res, next) => {
    try {
      await authService.changePassword(req.userId, req.body.currentPassword, req.body.newPassword);
      return response.success(res, null, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { login, refresh, logout, me, forgotPassword, resetPassword, changePassword };
