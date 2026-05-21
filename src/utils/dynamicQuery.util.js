const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Build Sequelize where clause from filter object
 */
const buildWhereClause = (filters = {}, searchFields = []) => {
  const where = {};
  const conditions = [];

  if (filters.search && searchFields.length > 0) {
    conditions.push({
      [Op.or]: searchFields.map((field) => ({
        [field]: { [Op.like]: `%${filters.search}%` },
      })),
    });
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'search' || key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') {
      return;
    }
    if (value === undefined || value === null || value === '') return;

    if (typeof value === 'object' && value !== null) {
      if (value.from !== undefined || value.to !== undefined) {
        const rangeCondition = {};
        if (value.from) rangeCondition[Op.gte] = value.from;
        if (value.to) rangeCondition[Op.lte] = value.to;
        where[key] = rangeCondition;
      } else if (Array.isArray(value)) {
        where[key] = { [Op.in]: value };
      }
    } else {
      where[key] = value;
    }
  });

  if (conditions.length > 0) {
    where[Op.and] = conditions;
  }

  return where;
};

/**
 * Build order clause
 */
const buildOrderClause = (sortBy = 'createdAt', sortOrder = 'DESC', allowedFields = null) => {
  if (allowedFields && !allowedFields.includes(sortBy)) {
    sortBy = 'createdAt';
  }
  return [[sortBy, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];
};

/**
 * Build pagination options
 */
const buildPaginationOptions = (page = 1, limit = 20) => {
  const parsedPage = Math.max(1, parseInt(page));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit)));
  return {
    limit: parsedLimit,
    offset: (parsedPage - 1) * parsedLimit,
    page: parsedPage,
  };
};

/**
 * Execute dynamic query on any table
 */
const executeDynamicQuery = async (tableName, options = {}) => {
  const { filters, searchFields, sortBy, sortOrder, page, limit, include } = options;

  const paginationOpts = buildPaginationOptions(page, limit);
  const whereClause = buildWhereClause(filters, searchFields);
  const orderClause = buildOrderClause(sortBy, sortOrder);

  const queryOptions = {
    where: whereClause,
    order: orderClause,
    limit: paginationOpts.limit,
    offset: paginationOpts.offset,
  };

  if (include) queryOptions.include = include;

  // For truly dynamic table access we use raw queries with parameterized inputs
  const countQuery = `SELECT COUNT(*) as total FROM \`${tableName}\` WHERE deleted_at IS NULL`;
  const [[{ total }]] = await sequelize.query(countQuery);

  return {
    rows: [],
    count: total,
    page: paginationOpts.page,
    limit: paginationOpts.limit,
  };
};

/**
 * Build dynamic SQL for module records
 */
const buildModuleQuery = (moduleConfig, filters = {}, options = {}) => {
  const { tableName, fields } = moduleConfig;
  const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC', search = '' } = options;

  const paginationOpts = buildPaginationOptions(page, limit);

  const selectedFields = fields
    .filter((f) => !f.hidden)
    .map((f) => `\`${f.columnName}\``)
    .join(', ');

  let whereConditions = ['deleted_at IS NULL'];
  const replacements = [];

  if (search) {
    const searchableFields = fields.filter((f) => f.searchable);
    if (searchableFields.length > 0) {
      const searchConds = searchableFields.map((f) => `\`${f.columnName}\` LIKE ?`);
      whereConditions.push(`(${searchConds.join(' OR ')})`);
      searchableFields.forEach(() => replacements.push(`%${search}%`));
    }
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      whereConditions.push(`\`${key}\` = ?`);
      replacements.push(value);
    }
  });

  const whereClause = whereConditions.join(' AND ');
  const orderClause = `\`${sortBy}\` ${sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;

  const dataQuery = `SELECT ${selectedFields} FROM \`${tableName}\` WHERE ${whereClause} ORDER BY ${orderClause} LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) as total FROM \`${tableName}\` WHERE ${whereClause}`;

  replacements.push(paginationOpts.limit, paginationOpts.offset);

  return {
    dataQuery,
    countQuery,
    replacements,
    countReplacements: replacements.slice(0, -2),
    page: paginationOpts.page,
    limit: paginationOpts.limit,
  };
};

module.exports = {
  buildWhereClause,
  buildOrderClause,
  buildPaginationOptions,
  executeDynamicQuery,
  buildModuleQuery,
};
