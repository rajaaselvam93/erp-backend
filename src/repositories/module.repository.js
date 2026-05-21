const BaseRepository = require('./base.repository');
const { Module, ModuleField } = require('../models');

class ModuleRepository extends BaseRepository {
  constructor() {
    super(Module);
  }

  async findBySlug(slug, companyId = null) {
    const where = { slug, isActive: true };
    if (companyId) where.companyId = companyId;
    return Module.findOne({
      where,
      include: [{ model: ModuleField, as: 'fields', order: [['sort_order', 'ASC']] }],
    });
  }

  async findWithFields(id) {
    return Module.findByPk(id, {
      include: [
        {
          model: ModuleField,
          as: 'fields',
          order: [['sort_order', 'ASC']],
        },
      ],
    });
  }

  async findActiveModules(companyId = null) {
    const where = { isActive: true };
    if (companyId) where.companyId = companyId;
    return Module.findAll({
      where,
      include: [{ model: ModuleField, as: 'fields', order: [['sort_order', 'ASC']] }],
      order: [['sort_order', 'ASC']],
    });
  }

  async getModuleFields(moduleId) {
    return ModuleField.findAll({
      where: { moduleId },
      order: [['sort_order', 'ASC']],
    });
  }
}

module.exports = new ModuleRepository();
