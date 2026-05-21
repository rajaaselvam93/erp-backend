const { sequelize } = require('../config/database');
const moduleRepo = require('../repositories/module.repository');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger.util');
const XLSX = require('xlsx');

class DynamicService {
  /**
   * Get records for any module by slug
   */
  async getRecords(moduleSlug, companyId, options = {}) {
    const module = await moduleRepo.findBySlug(moduleSlug, companyId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });

    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC', search = '', filters = {} } = options;
    const offset = (page - 1) * limit;

    const fields = module.fields || [];
    // Select all non-hidden columns so the edit form has values for every field.
    // DynamicTable already filters to showInList columns on the frontend side.
    const selectableFields = fields.filter((f) => !f.isHidden);
    const selectFields = selectableFields.length > 0
      ? ['`id`', ...new Set(selectableFields.map((f) => `\`${f.columnName}\``))]
          .join(', ')
      : '*';

    let whereConditions = ['deleted_at IS NULL'];
    const replacements = [];

    if (companyId) {
      whereConditions.push('`company_id` = ?');
      replacements.push(companyId);
    }

    // Apply search across searchable fields
    if (search) {
      const searchableFields = fields.filter((f) => f.isSearchable);
      if (searchableFields.length > 0) {
        const searchConds = searchableFields.map((f) => `\`${f.columnName}\` LIKE ?`);
        whereConditions.push(`(${searchConds.join(' OR ')})`);
        searchableFields.forEach(() => replacements.push(`%${search}%`));
      }
    }

    // Apply column filters
    const moduleFieldMap = {};
    fields.forEach((f) => { moduleFieldMap[f.columnName] = f; });

    Object.entries(filters).forEach(([key, value]) => {
      if (moduleFieldMap[key] && value !== undefined && value !== null && value !== '') {
        whereConditions.push(`\`${key}\` = ?`);
        replacements.push(value);
      }
    });

    const whereClause = whereConditions.join(' AND ');
    const safeSortBy = fields.find((f) => f.columnName === sortBy) ? sortBy : 'created_at';
    const safeOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const countQuery = `SELECT COUNT(*) as total FROM \`${module.tableName}\` WHERE ${whereClause}`;
    const dataQuery = `SELECT ${selectFields} FROM \`${module.tableName}\` WHERE ${whereClause} ORDER BY \`${safeSortBy}\` ${safeOrder} LIMIT ? OFFSET ?`;

    // Sequelize 6 with type:'SELECT' returns the results array directly (not [results, metadata])
    const countRows = await sequelize.query(countQuery, { replacements, type: 'SELECT' });
    const total = countRows[0]?.total ?? 0;

    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, parseInt(limit), parseInt(offset)],
      type: 'SELECT',
    });

    return {
      data: rows,
      total: parseInt(total),
      page: parseInt(page),
      limit: parseInt(limit),
      module: {
        id: module.id,
        name: module.name,
        slug: module.slug,
        fields: fields,
        settings: module.settings,
        listConfig: module.listConfig,
      },
    };
  }

  /**
   * Get a single record
   */
  async getRecord(moduleSlug, id, companyId) {
    const module = await moduleRepo.findBySlug(moduleSlug, companyId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });

    const whereClause = companyId ? '`id` = ? AND `company_id` = ? AND `deleted_at` IS NULL' : '`id` = ? AND `deleted_at` IS NULL';
    const replacements = companyId ? [id, companyId] : [id];

    const rows = await sequelize.query(
      `SELECT * FROM \`${module.tableName}\` WHERE ${whereClause} LIMIT 1`,
      { replacements, type: 'SELECT' }
    );

    if (!rows || rows.length === 0) {
      throw Object.assign(new Error('Record not found'), { statusCode: 404 });
    }

    return {
      data: rows[0],
      module: {
        id: module.id,
        name: module.name,
        slug: module.slug,
        fields: module.fields,
        formConfig: module.formConfig,
      },
    };
  }

  /**
   * Create a record in a module's table
   */
  async createRecord(moduleSlug, data, companyId, userId) {
    const module = await moduleRepo.findBySlug(moduleSlug, companyId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });

    // Validate required fields
    this._validateData(module.fields, data);

    const id = uuidv4();
    const recordData = {
      id,
      company_id: companyId,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
      ...this._sanitizeData(module.fields, data),
    };

    const columns = Object.keys(recordData).map((c) => `\`${c}\``).join(', ');
    const placeholders = Object.keys(recordData).map(() => '?').join(', ');
    const values = Object.values(recordData);

    await sequelize.query(
      `INSERT INTO \`${module.tableName}\` (${columns}) VALUES (${placeholders})`,
      { replacements: values }
    );

    return this.getRecord(moduleSlug, id, companyId);
  }

  /**
   * Update a record
   */
  async updateRecord(moduleSlug, id, data, companyId) {
    const module = await moduleRepo.findBySlug(moduleSlug, companyId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });

    const sanitized = this._sanitizeData(module.fields, data);
    sanitized.updated_at = new Date();

    const setClauses = Object.keys(sanitized).map((c) => `\`${c}\` = ?`).join(', ');
    const values = [...Object.values(sanitized), id];

    const whereClause = companyId ? '`id` = ? AND `company_id` = ?' : '`id` = ?';
    if (companyId) values.push(companyId);

    await sequelize.query(
      `UPDATE \`${module.tableName}\` SET ${setClauses} WHERE ${whereClause} AND \`deleted_at\` IS NULL`,
      { replacements: values }
    );

    return this.getRecord(moduleSlug, id, companyId);
  }

  /**
   * Soft delete a record
   */
  async deleteRecord(moduleSlug, id, companyId) {
    const module = await moduleRepo.findBySlug(moduleSlug, companyId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });

    const whereClause = companyId ? '`id` = ? AND `company_id` = ?' : '`id` = ?';
    const replacements = companyId ? [new Date(), id, companyId] : [new Date(), id];

    await sequelize.query(
      `UPDATE \`${module.tableName}\` SET \`deleted_at\` = ? WHERE ${whereClause}`,
      { replacements }
    );
  }

  /**
   * Bulk operations
   */
  async bulkDelete(moduleSlug, ids, companyId) {
    const module = await moduleRepo.findBySlug(moduleSlug, companyId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });

    const placeholders = ids.map(() => '?').join(', ');
    const replacements = [new Date(), ...ids];
    if (companyId) replacements.push(companyId);

    const whereClause = companyId
      ? `\`id\` IN (${placeholders}) AND \`company_id\` = ?`
      : `\`id\` IN (${placeholders})`;

    await sequelize.query(
      `UPDATE \`${module.tableName}\` SET \`deleted_at\` = ? WHERE ${whereClause}`,
      { replacements }
    );

    return { deleted: ids.length };
  }

  /**
   * Export records to Excel/CSV
   */
  async exportRecords(moduleSlug, companyId, format = 'xlsx') {
    const module = await moduleRepo.findBySlug(moduleSlug, companyId);
    if (!module) throw Object.assign(new Error('Module not found'), { statusCode: 404 });

    const rows = await sequelize.query(
      `SELECT * FROM \`${module.tableName}\` WHERE deleted_at IS NULL ${companyId ? 'AND company_id = ?' : ''} ORDER BY created_at DESC`,
      { replacements: companyId ? [companyId] : [], type: 'SELECT' }
    );

    const exportFields = module.fields.filter((f) => !f.isHidden && f.showInList);
    const headers = exportFields.map((f) => f.label || f.name);

    const data = rows.map((row) =>
      exportFields.reduce((acc, f) => {
        acc[f.label || f.name] = row[f.columnName];
        return acc;
      }, {})
    );

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, module.name);

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: format === 'csv' ? 'csv' : 'xlsx' });
    return {
      buffer,
      filename: `${module.slug}-export-${Date.now()}.${format}`,
      mimeType: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _validateData(fields, data) {
    const requiredFields = fields.filter((f) => f.isRequired && f.showInForm && !f.isReadOnly);
    const errors = [];

    requiredFields.forEach((f) => {
      if (data[f.columnName] === undefined || data[f.columnName] === null || data[f.columnName] === '') {
        errors.push({ field: f.columnName, message: `${f.name} is required` });
      }
    });

    if (errors.length > 0) {
      throw Object.assign(new Error('Validation failed'), { statusCode: 422, errors });
    }
  }

  _sanitizeData(fields, data) {
    const coreFields = ['id', 'company_id', 'created_by', 'created_at', 'updated_at', 'deleted_at'];
    const allowedColumns = fields
      .filter((f) => !f.isReadOnly && f.showInForm && !coreFields.includes(f.columnName))
      .map((f) => f.columnName);

    const sanitized = {};
    allowedColumns.forEach((col) => {
      if (data[col] !== undefined) {
        sanitized[col] = data[col];
      }
    });
    return sanitized;
  }
}

module.exports = new DynamicService();
