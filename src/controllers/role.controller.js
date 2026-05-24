const { Role, Permission } = require('../models');
const response = require('../utils/response.util');
const Joi = require('joi');
const { validate } = require('../middleware/validate.middleware');
const { buildPaginationOptions } = require('../utils/dynamicQuery.util');

const roleSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().max(500).allow('', null),
  level: Joi.number().integer().min(1).max(100).default(10),
  isActive: Joi.boolean().default(true),
  permissionIds: Joi.array().items(Joi.string().uuid()).default([]),
});

const getRoles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const opts = buildPaginationOptions(page, limit);

    const where = { companyId: req.companyId };
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Role.findAndCountAll({
      where,
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      order: [['level', 'DESC']],
      limit: opts.limit,
      offset: opts.offset,
    });

    return response.paginated(res, rows, count, opts.page, opts.limit);
  } catch (err) {
    next(err);
  }
};

const getRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id, {
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    });
    if (!role) return response.notFound(res);
    return response.success(res, role);
  } catch (err) {
    next(err);
  }
};

const createRole = [
  validate(roleSchema),
  async (req, res, next) => {
    try {
      const { permissionIds, ...roleData } = req.body;

      const existing = await Role.findOne({ where: { slug: roleData.slug, companyId: req.companyId } });
      if (existing) return response.conflict(res, 'Role with this slug already exists');

      const role = await Role.create({ ...roleData, companyId: req.companyId });

      if (permissionIds?.length > 0) {
        const perms = await Permission.findAll({ where: { id: permissionIds } });
        await role.setPermissions(perms);
      }

      const fullRole = await Role.findByPk(role.id, {
        include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
      });

      return response.created(res, fullRole, 'Role created successfully');
    } catch (err) {
      next(err);
    }
  },
];

const updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return response.notFound(res);
    if (role.isSystem) return response.forbidden(res, 'Cannot modify system roles');

    const { permissionIds, ...roleData } = req.body;
    await role.update(roleData);

    if (permissionIds !== undefined) {
      const perms = await Permission.findAll({ where: { id: permissionIds } });
      await role.setPermissions(perms);
    }

    const updated = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    });

    return response.success(res, updated, 'Role updated');
  } catch (err) {
    next(err);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return response.notFound(res);
    if (role.isSystem) return response.forbidden(res, 'Cannot delete system roles');

    const { User } = require('../models');
    const usersWithRole = await User.count({ where: { roleId: role.id } });
    if (usersWithRole > 0) {
      return response.badRequest(res, `Cannot delete role assigned to ${usersWithRole} user(s)`);
    }

    await role.destroy();
    return response.success(res, null, 'Role deleted');
  } catch (err) {
    next(err);
  }
};

const getPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.findAll({
      order: [['module', 'ASC'], ['action', 'ASC']],
    });

    // Group by module
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) acc[perm.module] = [];
      acc[perm.module].push(perm);
      return acc;
    }, {});

    return response.success(res, grouped);
  } catch (err) {
    next(err);
  }
};

const getAllRoles = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    // Return roles belonging to the company OR system-level roles (companyId IS NULL)
    const where = {
      isActive: true,
      [Op.or]: [
        ...(req.companyId ? [{ companyId: req.companyId }] : []),
        { companyId: null },
      ],
    };
    const roles = await Role.findAll({
      where,
      attributes: ['id', 'name', 'slug', 'level', 'isSystem'],
      order: [['level', 'DESC'], ['name', 'ASC']],
    });
    return response.success(res, roles);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoles, getRole, createRole, updateRole, deleteRole, getPermissions, getAllRoles };
