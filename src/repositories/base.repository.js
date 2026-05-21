const { Op } = require('sequelize');
const { buildWhereClause, buildOrderClause, buildPaginationOptions } = require('../utils/dynamicQuery.util');

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    const {
      where = {},
      include = [],
      attributes,
      order = [['createdAt', 'DESC']],
    } = options;
    return this.model.findAll({ where, include, attributes, order });
  }

  async findPaginated(options = {}) {
    const {
      filters = {},
      searchFields = [],
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      include = [],
      attributes,
      additionalWhere = {},
    } = options;

    const paginationOpts = buildPaginationOptions(page, limit);
    const where = {
      ...buildWhereClause(filters, searchFields),
      ...additionalWhere,
    };
    const order = buildOrderClause(sortBy, sortOrder);

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order,
      limit: paginationOpts.limit,
      offset: paginationOpts.offset,
      include,
      attributes,
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      page: paginationOpts.page,
      limit: paginationOpts.limit,
    };
  }

  async findById(id, include = []) {
    return this.model.findByPk(id, { include });
  }

  async findOne(where, include = []) {
    return this.model.findOne({ where, include });
  }

  async create(data) {
    return this.model.create(data);
  }

  async bulkCreate(data, options = {}) {
    return this.model.bulkCreate(data, { validate: true, ...options });
  }

  async update(id, data) {
    const record = await this.model.findByPk(id);
    if (!record) return null;
    return record.update(data);
  }

  async delete(id, hardDelete = false) {
    const record = await this.model.findByPk(id);
    if (!record) return null;
    if (hardDelete) {
      return record.destroy({ force: true });
    }
    return record.destroy();
  }

  async count(where = {}) {
    return this.model.count({ where });
  }

  async exists(where) {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async findOrCreate(where, defaults = {}) {
    const [record, created] = await this.model.findOrCreate({ where, defaults: { ...where, ...defaults } });
    return { record, created };
  }

  async updateOrCreate(where, data) {
    const [record] = await this.model.upsert({ ...where, ...data });
    return record;
  }
}

module.exports = BaseRepository;
