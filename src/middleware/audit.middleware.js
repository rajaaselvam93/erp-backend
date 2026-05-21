const { AuditLog } = require('../models');
const logger = require('../utils/logger.util');

const auditLog = (action, module, getDescription = null) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      if (req.user && res.statusCode < 400) {
        try {
          const description =
            getDescription
              ? getDescription(req, body)
              : `${action} on ${module}`;

          await AuditLog.create({
            userId: req.user.id,
            companyId: req.companyId,
            action,
            module,
            resourceId: req.params.id || body?.data?.id || null,
            resourceType: module,
            description,
            oldValues: req._oldValues || null,
            newValues: req.method !== 'GET' ? (body?.data || null) : null,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'],
            status: res.statusCode < 400 ? 'success' : 'failed',
          });
        } catch (err) {
          logger.error('Audit log creation failed:', err);
        }
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = { auditLog };
