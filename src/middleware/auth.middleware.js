const { verifyToken } = require('../utils/jwt.util');
const response = require('../utils/response.util');
const { User, Role, Setting } = require('../models');
const logger = require('../utils/logger.util');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized(res, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const { Permission } = require('../models');
    const user = await User.findOne({
      where: { id: decoded.id, status: 'active' },
      include: [
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        },
      ],
    });

    if (!user) {
      return response.unauthorized(res, 'User not found or inactive');
    }

    req.user = user;
    req.userId = user.id;
    req.companyId = user.companyId;
    req.roleId = user.roleId;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return response.unauthorized(res, 'Access token expired');
    }
    if (err.name === 'JsonWebTokenError') {
      return response.unauthorized(res, 'Invalid access token');
    }
    logger.error('Auth middleware error:', err);
    return response.error(res, 'Authentication failed');
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);
    if (user) {
      req.user = user;
      req.userId = user.id;
      req.companyId = user.companyId;
    }
    next();
  } catch {
    next();
  }
};

/**
 * Authenticate using a permanent API token stored in the settings table.
 * The token is a 64-char hex string (crypto.randomBytes(32).toString('hex')).
 * Accepted via:
 *   X-API-Token: <token>
 *   Authorization: Bearer <token>  (when token is 64-char hex, not a JWT)
 */
const authenticateApiToken = async (req, res, next) => {
  try {
    const token =
      req.headers['x-api-token'] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) return response.unauthorized(res, 'API token required');

    const setting = await Setting.findOne({ where: { key: 'api_token', value: token } });
    if (!setting) return response.unauthorized(res, 'Invalid API token');

    req.companyId = setting.companyId;
    req.isApiToken = true;

    // Provide a user context (first active user of the company) so downstream
    // code that reads req.userId / req.user does not blow up.
    const user = await User.findOne({
      where: { companyId: setting.companyId, status: 'active' },
      include: [{ model: Role, as: 'role' }],
      order: [['created_at', 'ASC']],
    });
    if (user) {
      req.user = user;
      req.userId = user.id;
      req.roleId = user.roleId;
    }

    next();
  } catch (err) {
    logger.error('API token auth error:', err);
    return response.error(res, 'Authentication failed');
  }
};

/**
 * Flexible authenticator: accepts both a regular JWT Bearer token (frontend
 * sessions) and a permanent API token (external integrations).
 *
 * Detection order:
 *  1. X-API-Token header present → API token auth
 *  2. Bearer token is 64-char lowercase hex → API token auth
 *  3. Anything else → standard JWT auth
 */
const authenticateFlexible = async (req, res, next) => {
  if (req.headers['x-api-token']) {
    return authenticateApiToken(req, res, next);
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // 64-char hex = our permanent API token format
    if (/^[a-f0-9]{64}$/.test(token)) {
      return authenticateApiToken(req, res, next);
    }
  }

  return authenticate(req, res, next);
};

module.exports = { authenticate, optionalAuth, authenticateApiToken, authenticateFlexible };
