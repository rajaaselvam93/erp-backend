const crypto = require('crypto');
const { Setting } = require('../models');
const response = require('../utils/response.util');

/**
 * GET /api/v1/settings/api-token
 * Returns the current permanent API token for the company.
 */
const getApiToken = async (req, res, next) => {
  try {
    const setting = await Setting.findOne({
      where: { companyId: req.companyId, key: 'api_token' },
    });
    return response.success(res, { token: setting?.value || null });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/settings/api-token/generate
 * Generates (or regenerates) the permanent API token for the company.
 * Only admin / super-admin may call this endpoint.
 */
const generateApiToken = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');

    const existing = await Setting.findOne({
      where: { companyId: req.companyId, key: 'api_token' },
    });

    if (existing) {
      await existing.update({ value: token });
    } else {
      await Setting.create({
        companyId: req.companyId,
        key: 'api_token',
        value: token,
        type: 'encrypted',
        group: 'api',
        label: 'API Access Token',
        description: 'Permanent token for accessing all module REST APIs',
        isSystem: true,
        isPublic: false,
      });
    }

    return response.success(res, { token }, 'API token generated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getApiToken, generateApiToken };
