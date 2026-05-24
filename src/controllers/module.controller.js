const moduleService = require('../services/module.service');
const response = require('../utils/response.util');
const Joi = require('joi');
const { validate } = require('../middleware/validate.middleware');

const createModuleSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().max(1000).allow('', null),
  icon: Joi.string().max(50).default('database'),
  color: Joi.string().max(20).default('#6366f1'),
  category: Joi.string().valid('core', 'hrm', 'crm', 'finance', 'inventory', 'sales', 'purchase', 'projects', 'support', 'custom').default('custom'),
  isActive: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().default(0),
  settings: Joi.object().default({}),
  listConfig: Joi.object().default({}),
  formConfig: Joi.object().default({}),
});

const fieldSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  columnName: Joi.string().pattern(/^[a-z0-9_]+$/).max(100),
  fieldType: Joi.string().required(),
  label: Joi.string().max(150).allow('', null),
  placeholder: Joi.string().max(255).allow('', null),
  helpText: Joi.string().max(500).allow('', null),
  defaultValue: Joi.any().allow('', null),
  isRequired: Joi.boolean().default(false),
  isUnique: Joi.boolean().default(false),
  isHidden: Joi.boolean().default(false),
  isSearchable: Joi.boolean().default(false),
  isSortable: Joi.boolean().default(true),
  isFilterable: Joi.boolean().default(false),
  showInList: Joi.boolean().default(true),
  showInForm: Joi.boolean().default(true),
  options: Joi.array().items(Joi.object()).default([]),
  validation: Joi.object().default({}),
  relationConfig: Joi.object().allow(null),
  section: Joi.string().max(100).allow('', null),
  colSpan: Joi.number().integer().min(1).max(12).default(1),
  sortOrder: Joi.number().integer().default(0),
  width: Joi.number().integer().default(150),
});

const getModules = async (req, res, next) => {
  try {
    const { page, limit, sortBy, sortOrder, search, category, isActive } = req.query;
    const result = await moduleService.getModules(req.companyId, {
      filters: {
        ...(category && { category }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      page, limit, sortBy, sortOrder, search: search || '',
    });
    return response.paginated(res, result.data, result.total, result.page, result.limit);
  } catch (err) {
    next(err);
  }
};

const getModule = async (req, res, next) => {
  try {
    const mod = await moduleService.getModuleById(req.params.id);
    return response.success(res, mod);
  } catch (err) {
    next(err);
  }
};

const getModuleBySlug = async (req, res, next) => {
  try {
    const mod = await moduleService.getModuleBySlug(req.params.slug, req.companyId);
    return response.success(res, mod);
  } catch (err) {
    next(err);
  }
};

const createModule = [
  validate(createModuleSchema),
  async (req, res, next) => {
    try {
      const mod = await moduleService.createModule(req.body, req.companyId);
      return response.created(res, mod, 'Module created successfully');
    } catch (err) {
      next(err);
    }
  },
];

const updateModule = async (req, res, next) => {
  try {
    const mod = await moduleService.updateModule(req.params.id, req.body);
    return response.success(res, mod, 'Module updated');
  } catch (err) {
    next(err);
  }
};

const deleteModule = async (req, res, next) => {
  try {
    await moduleService.deleteModule(req.params.id);
    return response.success(res, null, 'Module deleted');
  } catch (err) {
    next(err);
  }
};

const addField = [
  validate(fieldSchema),
  async (req, res, next) => {
    try {
      const field = await moduleService.addField(req.params.id, req.body);
      return response.created(res, field, 'Field added successfully');
    } catch (err) {
      next(err);
    }
  },
];

const updateField = async (req, res, next) => {
  try {
    const field = await moduleService.updateField(req.params.fieldId, req.body);
    return response.success(res, field, 'Field updated');
  } catch (err) {
    next(err);
  }
};

const deleteField = async (req, res, next) => {
  try {
    await moduleService.deleteField(req.params.fieldId);
    return response.success(res, null, 'Field deleted');
  } catch (err) {
    next(err);
  }
};

const reorderFields = async (req, res, next) => {
  try {
    await moduleService.reorderFields(req.params.id, req.body.fields);
    return response.success(res, null, 'Fields reordered');
  } catch (err) {
    next(err);
  }
};

const getMenuTree = async (req, res, next) => {
  try {
    const menus = await moduleService.getMenuTree(req.companyId, req.user);
    return response.success(res, menus);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getModules,
  getModule,
  getModuleBySlug,
  createModule,
  updateModule,
  deleteModule,
  addField,
  updateField,
  deleteField,
  reorderFields,
  getMenuTree,
};
