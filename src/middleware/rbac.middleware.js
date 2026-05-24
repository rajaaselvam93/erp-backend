const response = require('../utils/response.util');
const { Permission } = require('../models');
const logger = require('../utils/logger.util');

/**
 * Check if user has required permission
 * @param {string} permissionSlug - e.g. 'users.create', 'invoices.delete'
 */
const hasPermission = (permissionSlug) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return response.unauthorized(res);
      }

      // Super admins bypass all permission checks
      if (req.user.role?.slug === 'super-admin' || req.user.role?.slug === 'admin') {
        return next();
      }

      // Check role permissions (use pre-loaded permissions when available,
      // fall back to DB query if the include didn't hydrate them).
      const role = req.user.role;
      if (role) {
        const preLoaded = req.user.role.permissions;
        if (preLoaded && Array.isArray(preLoaded) && preLoaded.length > 0) {
          if (preLoaded.some((p) => p.slug === permissionSlug)) return next();
          // Pre-loaded but slug not found — still fall through to user-level check below.
        } else {
          // Either not pre-loaded or empty — query DB directly.
          const permissions = await role.getPermissions({ where: { slug: permissionSlug } });
          if (permissions.length > 0) return next();
        }
      }

      // Check user-level permissions
      const userPermissions = req.user.permissions || [];
      if (userPermissions.includes(permissionSlug) || userPermissions.includes('*')) {
        return next();
      }

      logger.warn(`Permission denied: ${req.user.email} -> ${permissionSlug}`);
      return response.forbidden(res, `Permission required: ${permissionSlug}`);
    } catch (err) {
      logger.error('RBAC middleware error:', err);
      return response.error(res, 'Permission check failed');
    }
  };
};

/**
 * Check if user has any of the given permissions
 */
const hasAnyPermission = (...permissionSlugs) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return response.unauthorized(res);

      if (req.user.role?.slug === 'super-admin' || req.user.role?.slug === 'admin') {
        return next();
      }

      const role = req.user.role;
      if (role) {
        const preLoaded = req.user.role.permissions;
        if (preLoaded && Array.isArray(preLoaded) && preLoaded.length > 0) {
          if (preLoaded.some((p) => permissionSlugs.includes(p.slug))) return next();
        } else {
          const permissions = await role.getPermissions({ where: { slug: permissionSlugs } });
          if (permissions.length > 0) return next();
        }
      }

      const userPermissions = req.user.permissions || [];
      const hasOne = permissionSlugs.some(
        (p) => userPermissions.includes(p) || userPermissions.includes('*')
      );
      if (hasOne) return next();

      return response.forbidden(res, 'Insufficient permissions');
    } catch (err) {
      logger.error('RBAC hasAnyPermission error:', err);
      return response.error(res);
    }
  };
};

/**
 * Check if user has a specific role
 */
const hasRole = (...roleSlugs) => {
  return (req, res, next) => {
    if (!req.user) return response.unauthorized(res);

    const userRole = req.user.role?.slug;
    if (roleSlugs.includes(userRole) || userRole === 'super-admin') {
      return next();
    }

    return response.forbidden(res, `Role required: ${roleSlugs.join(' or ')}`);
  };
};

/**
 * Check if user belongs to the same company as the resource
 */
const sameCompany = (req, res, next) => {
  const resourceCompanyId = req.params.companyId || req.body.companyId;
  if (resourceCompanyId && resourceCompanyId !== req.companyId) {
    if (req.user?.role?.slug !== 'super-admin') {
      return response.forbidden(res, 'Access to this company resource is not allowed');
    }
  }
  next();
};

module.exports = { hasPermission, hasAnyPermission, hasRole, sameCompany };
