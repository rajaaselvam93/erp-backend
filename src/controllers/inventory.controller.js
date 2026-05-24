const inventoryService = require('../services/inventory.service');
const response = require('../utils/response.util');

const getItems = async (req, res, next) => {
  try {
    const result = await inventoryService.getItems(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getItem = async (req, res, next) => {
  try {
    return response.success(res, await inventoryService.getItem(req.params.id, req.companyId));
  } catch (err) { next(err); }
};

const createItem = async (req, res, next) => {
  try {
    return response.created(res, await inventoryService.createItem(req.body, req.companyId), 'Item created');
  } catch (err) { next(err); }
};

const updateItem = async (req, res, next) => {
  try {
    return response.success(res, await inventoryService.updateItem(req.params.id, req.body, req.companyId), 'Item updated');
  } catch (err) { next(err); }
};

const deleteItem = async (req, res, next) => {
  try {
    await inventoryService.deleteItem(req.params.id, req.companyId);
    return response.success(res, null, 'Item deleted');
  } catch (err) { next(err); }
};

const addTransaction = async (req, res, next) => {
  try {
    return response.created(res, await inventoryService.addTransaction(req.params.id, req.body, req.companyId, req.userId), 'Transaction recorded');
  } catch (err) { next(err); }
};

const getTransactions = async (req, res, next) => {
  try {
    const result = await inventoryService.getTransactions(req.params.id, req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getWarehouses = async (req, res, next) => {
  try {
    return response.success(res, await inventoryService.getWarehouses(req.companyId));
  } catch (err) { next(err); }
};

const createWarehouse = async (req, res, next) => {
  try {
    return response.created(res, await inventoryService.createWarehouse(req.body, req.companyId), 'Warehouse created');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    return response.success(res, await inventoryService.getStats(req.companyId));
  } catch (err) { next(err); }
};

module.exports = { getItems, getItem, createItem, updateItem, deleteItem, addTransaction, getTransactions, getWarehouses, createWarehouse, getStats };
