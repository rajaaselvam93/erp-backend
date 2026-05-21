const dynamicService = require('../services/dynamic.service');
const response = require('../utils/response.util');

/**
 * @swagger
 * /data/{module}:
 *   get:
 *     tags: [Dynamic]
 *     summary: Get records for any module
 */
const getRecords = async (req, res, next) => {
  try {
    const { module } = req.params;
    const { page, limit, sortBy, sortOrder, search, ...filters } = req.query;
    const result = await dynamicService.getRecords(module, req.companyId, {
      page, limit, sortBy, sortOrder, search, filters,
    });
    const totalPages = Math.ceil(result.total / result.limit);
    return res.json({
      success: true,
      message: 'Records fetched',
      data: result.data,
      module: result.module,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
        hasNext: result.page < totalPages,
        hasPrev: result.page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getRecord = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    const result = await dynamicService.getRecord(module, id, req.companyId);
    return response.success(res, result);
  } catch (err) {
    next(err);
  }
};

const createRecord = async (req, res, next) => {
  try {
    const { module } = req.params;
    const result = await dynamicService.createRecord(module, req.body, req.companyId, req.userId);
    return response.created(res, result, 'Record created successfully');
  } catch (err) {
    if (err.statusCode === 422) {
      return response.validationError(res, err.errors, err.message);
    }
    next(err);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    const result = await dynamicService.updateRecord(module, id, req.body, req.companyId);
    return response.success(res, result, 'Record updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    await dynamicService.deleteRecord(module, id, req.companyId);
    return response.success(res, null, 'Record deleted successfully');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/{module_name} — update a record with id supplied in request body
const patchRecord = async (req, res, next) => {
  try {
    const { module } = req.params;
    const { id, ...data } = req.body;
    if (!id) return response.badRequest(res, 'Record id is required in request body');
    const result = await dynamicService.updateRecord(module, id, data, req.companyId);
    return response.success(res, result, 'Record updated successfully');
  } catch (err) {
    next(err);
  }
};

const bulkDelete = async (req, res, next) => {
  try {
    const { module } = req.params;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return response.badRequest(res, 'ids array required');
    }
    const result = await dynamicService.bulkDelete(module, ids, req.companyId);
    return response.success(res, result, 'Records deleted');
  } catch (err) {
    next(err);
  }
};

const exportRecords = async (req, res, next) => {
  try {
    const { module } = req.params;
    const format = req.query.format || 'xlsx';
    const exportData = await dynamicService.exportRecords(module, req.companyId, format);

    res.setHeader('Content-Type', exportData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
    res.send(exportData.buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecords, getRecord, createRecord, updateRecord, patchRecord, deleteRecord, bulkDelete, exportRecords };
