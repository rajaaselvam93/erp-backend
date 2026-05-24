const { sequelize } = require('../config/database');
const moduleRepo = require('../repositories/module.repository');
const { Module, ModuleField, Menu, Permission, Role } = require('../models');
const logger = require('../utils/logger.util');

class ModuleService {
  /**
   * Get all active modules for a company
   */
  async getModules(companyId, options = {}) {
    return moduleRepo.findPaginated({
      ...options,
      additionalWhere: { ...(companyId ? { companyId } : {}) },
      include: [{ model: ModuleField, as: 'fields', order: [['sort_order', 'ASC']] }],
      searchFields: ['name', 'description', 'slug'],
    });
  }

  async getModuleById(id) {
    const module = await moduleRepo.findWithFields(id);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });
    return module;
  }

  async getModuleBySlug(slug, companyId = null) {
    const module = await moduleRepo.findBySlug(slug, companyId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });
    return module;
  }

  /**
   * Create a new dynamic module with its DB table
   */
  async createModule(data, companyId) {
    const tableName = data.tableName || `mod_${data.slug.replace(/-/g, '_')}`;

    // Check slug uniqueness
    const existing = await Module.findOne({ where: { slug: data.slug, companyId } });
    if (existing) throw Object.assign(new Error('Module with this slug already exists'), { statusCode: 409 });

    // Create the module
    const module = await Module.create({
      ...data,
      companyId,
      tableName,
      apiEndpoint: `/api/v1/${data.slug}`,
    });

    // Create default core fields for the table
    const coreFields = this._getCoreFields(module.id);
    await ModuleField.bulkCreate(coreFields);

    // Create the actual MySQL table
    await this._createModuleTable(tableName, coreFields);

    // Create default permissions
    await this._createModulePermissions(module);

    // Create menu entry
    await Menu.create({
      moduleId: module.id,
      companyId,
      name: module.name,
      path: `/modules/${module.slug}`,
      icon: module.icon,
      sortOrder: data.sortOrder || 0,
    });

    logger.info(`Module created: ${module.name} (table: ${tableName})`);
    return moduleRepo.findWithFields(module.id);
  }

  async updateModule(id, data) {
    const module = await moduleRepo.findById(id);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });
    if (module.isSystem) throw Object.assign(new Error('Cannot modify system module'), { statusCode: 400 });

    await module.update(data);
    return moduleRepo.findWithFields(id);
  }

  async deleteModule(id) {
    const module = await moduleRepo.findById(id);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });
    if (module.isSystem) throw Object.assign(new Error('Cannot delete system module'), { statusCode: 400 });

    // Remove the menu entry so the sidebar stops showing this module
    await Menu.destroy({ where: { moduleId: id } });

    await module.update({ isActive: false });
    await module.destroy();
    logger.info(`Module deleted: ${module.name}`);
  }

  /**
   * Add a field to an existing module and alter the table
   */
  async addField(moduleId, fieldData) {
    const module = await moduleRepo.findById(moduleId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });

    const columnName = fieldData.columnName || this._toSnakeCase(fieldData.name);
    const dataType = fieldData.dataType || this._getDefaultDataType(fieldData.fieldType);

    const field = await ModuleField.create({
      ...fieldData,
      moduleId,
      columnName,
      dataType,
    });

    // Alter the table to add the column
    await this._addColumnToTable(module.tableName, columnName, dataType, fieldData);

    return field;
  }

  async updateField(fieldId, data) {
    const field = await ModuleField.findByPk(fieldId);
    if (!field) throw Object.assign(new Error('Field not found'), { statusCode: 404 });
    return field.update(data);
  }

  async deleteField(fieldId) {
    const field = await ModuleField.findByPk(fieldId);
    if (!field) throw Object.assign(new Error('Field not found'), { statusCode: 404 });

    const module = await moduleRepo.findById(field.moduleId);
    if (module) {
      await this._dropColumnFromTable(module.tableName, field.columnName);
    }

    await field.destroy();
  }

  async reorderFields(moduleId, fieldOrders) {
    const updates = fieldOrders.map(({ id, sortOrder }) =>
      ModuleField.update({ sortOrder }, { where: { id, moduleId } })
    );
    await Promise.all(updates);
  }

  /**
   * Get navigation menu tree for a company, filtered by user's permissions.
   * Admin / super-admin always see every menu.
   */
  async getMenuTree(companyId, user = null) {
    const where = { companyId, isActive: true, parentId: null };
    const menus = await Menu.findAll({
      where,
      include: [
        {
          model: Menu,
          as: 'children',
          where: { isActive: true },
          required: false,
          include: [{ model: Menu, as: 'children', required: false }],
        },
        { model: Module, as: 'module', required: false },
      ],
      order: [['sort_order', 'ASC'], [{ model: Menu, as: 'children' }, 'sort_order', 'ASC']],
    });

    // Admins and super-admins see everything
    const roleSlug = user?.role?.slug;
    if (!user || roleSlug === 'admin' || roleSlug === 'super-admin') {
      return menus;
    }

    // ── Resolve all permission slugs for this user ─────────────────────────────
    // 1. Try pre-loaded role permissions (from authenticate middleware include).
    let rolePermSlugs = (user.role?.permissions || []).map((p) => p.slug);

    // 2. If pre-loaded permissions are missing (nested belongsToMany include can
    //    fail in some Sequelize scenarios), fall back to a direct DB query.
    if (rolePermSlugs.length === 0) {
      const roleId = user.roleId || user.role?.id;
      if (roleId) {
        const roleWithPerms = await Role.findByPk(roleId, {
          include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        });
        rolePermSlugs = (roleWithPerms?.permissions || []).map((p) => p.slug);
      }
    }

    // 3. Extra per-user permissions stored as a JSON array on the user row.
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    const allPermissions = new Set([...rolePermSlugs, ...userPermissions]);

    // Wildcard = full access
    if (allPermissions.has('*')) return menus;

    // Genuinely no permissions — show nothing dynamic
    if (allPermissions.size === 0) return [];

    const permList = [...allPermissions];

    // ── Filter menus ───────────────────────────────────────────────────────────
    // Primary: extract module slug from the menu path (/modules/{slug}).
    // Fallback: use the eager-loaded module's slug (in case path is non-standard).
    return menus.filter((menu) => {
      const pathMatch = menu.path?.match(/^\/modules\/([^/]+)/);
      const moduleSlug = pathMatch?.[1] ?? menu.module?.slug;
      if (!moduleSlug) return false; // manual / orphaned menu — hide
      return permList.some((perm) => perm.startsWith(moduleSlug + '.'));
    });
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  _getCoreFields(moduleId) {
    return [
      { moduleId, name: 'ID', columnName: 'id', fieldType: 'text', dataType: 'VARCHAR(36)', isRequired: true, isReadOnly: true, showInList: false, showInForm: false, sortOrder: -10 },
      { moduleId, name: 'Company', columnName: 'company_id', fieldType: 'text', dataType: 'VARCHAR(36)', isHidden: true, showInList: false, showInForm: false, sortOrder: -9 },
      { moduleId, name: 'Created By', columnName: 'created_by', fieldType: 'lookup', dataType: 'VARCHAR(36)', showInForm: false, isReadOnly: true, sortOrder: -8 },
      { moduleId, name: 'Created At', columnName: 'created_at', fieldType: 'datetime', dataType: 'DATETIME', showInForm: false, isReadOnly: true, isSortable: true, sortOrder: -7 },
      { moduleId, name: 'Updated At', columnName: 'updated_at', fieldType: 'datetime', dataType: 'DATETIME', showInForm: false, isReadOnly: true, sortOrder: -6 },
      { moduleId, name: 'Deleted At', columnName: 'deleted_at', fieldType: 'datetime', dataType: 'DATETIME', isHidden: true, showInList: false, showInForm: false, sortOrder: -5 },
    ];
  }

  async _createModuleTable(tableName, fields = []) {
    const columnDefs = [
      '`id` VARCHAR(36) NOT NULL PRIMARY KEY',
      '`company_id` VARCHAR(36)',
      '`created_by` VARCHAR(36)',
      '`created_at` DATETIME DEFAULT CURRENT_TIMESTAMP',
      '`updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      '`deleted_at` DATETIME DEFAULT NULL',
    ];

    // Add user-defined fields (exclude core ones already added)
    const userFields = fields.filter((f) => !['id', 'company_id', 'created_by', 'created_at', 'updated_at', 'deleted_at'].includes(f.columnName));
    userFields.forEach((f) => {
      const nullable = f.isRequired ? 'NOT NULL' : 'DEFAULT NULL';
      columnDefs.push(`\`${f.columnName}\` ${f.dataType || 'VARCHAR(255)'} ${nullable}`);
    });

    const sql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columnDefs.join(', ')}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
    await sequelize.query(sql);
    logger.info(`Table created: ${tableName}`);
  }

  async _addColumnToTable(tableName, columnName, dataType, options = {}) {
    const nullable = options.isRequired ? 'NOT NULL' : 'DEFAULT NULL';
    const sql = `ALTER TABLE \`${tableName}\` ADD COLUMN IF NOT EXISTS \`${columnName}\` ${dataType} ${nullable}`;
    await sequelize.query(sql);
  }

  async _dropColumnFromTable(tableName, columnName) {
    const sql = `ALTER TABLE \`${tableName}\` DROP COLUMN IF EXISTS \`${columnName}\``;
    await sequelize.query(sql);
  }

  async _createModulePermissions(module) {
    const actions = ['create', 'read', 'update', 'delete', 'export', 'import'];
    const permissions = actions.map((action) => ({
      name: `${module.name} - ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      slug: `${module.slug}.${action}`,
      module: module.slug,
      action,
      description: `Can ${action} ${module.name} records`,
      isSystem: false,
    }));
    await Permission.bulkCreate(permissions, { ignoreDuplicates: true });
  }

  _toSnakeCase(str) {
    return str
      .replace(/\s+/g, '_')
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }

  _getDefaultDataType(fieldType) {
    const typeMap = {
      text: 'VARCHAR(255)',
      textarea: 'TEXT',
      richtext: 'LONGTEXT',
      number: 'INT',
      decimal: 'DECIMAL(15,2)',
      currency: 'DECIMAL(15,2)',
      email: 'VARCHAR(255)',
      phone: 'VARCHAR(30)',
      url: 'VARCHAR(500)',
      password: 'VARCHAR(255)',
      date: 'DATE',
      datetime: 'DATETIME',
      time: 'TIME',
      boolean: 'TINYINT(1) DEFAULT 0',
      select: 'VARCHAR(100)',
      multiselect: 'TEXT',
      radio: 'VARCHAR(100)',
      file: 'VARCHAR(500)',
      image: 'VARCHAR(500)',
      json: 'JSON',
      color: 'VARCHAR(20)',
      rating: 'TINYINT',
      autonumber: 'INT AUTO_INCREMENT',
      relation: 'VARCHAR(36)',
    };
    return typeMap[fieldType] || 'VARCHAR(255)';
  }
}

module.exports = new ModuleService();
