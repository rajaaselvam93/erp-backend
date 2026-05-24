const procurementService = require('../services/procurement.service');
const response = require('../utils/response.util');

const getVendors = async (req, res, next) => {
  try {
    const result = await procurementService.getVendors(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getVendor = async (req, res, next) => {
  try {
    return response.success(res, await procurementService.getVendor(req.params.id, req.companyId));
  } catch (err) { next(err); }
};

const createVendor = async (req, res, next) => {
  try {
    return response.created(res, await procurementService.createVendor(req.body, req.companyId), 'Vendor created');
  } catch (err) { next(err); }
};

const updateVendor = async (req, res, next) => {
  try {
    return response.success(res, await procurementService.updateVendor(req.params.id, req.body, req.companyId), 'Vendor updated');
  } catch (err) { next(err); }
};

const deleteVendor = async (req, res, next) => {
  try {
    await procurementService.deleteVendor(req.params.id, req.companyId);
    return response.success(res, null, 'Vendor deleted');
  } catch (err) { next(err); }
};

const getPurchaseOrders = async (req, res, next) => {
  try {
    const result = await procurementService.getPurchaseOrders(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getPurchaseOrder = async (req, res, next) => {
  try {
    return response.success(res, await procurementService.getPurchaseOrder(req.params.id, req.companyId));
  } catch (err) { next(err); }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    return response.created(res, await procurementService.createPurchaseOrder(req.body, req.companyId, req.userId), 'Purchase order created');
  } catch (err) { next(err); }
};

const updatePurchaseOrder = async (req, res, next) => {
  try {
    return response.success(res, await procurementService.updatePurchaseOrder(req.params.id, req.body, req.companyId), 'Purchase order updated');
  } catch (err) { next(err); }
};

const approvePurchaseOrder = async (req, res, next) => {
  try {
    return response.success(res, await procurementService.approvePurchaseOrder(req.params.id, req.companyId, req.userId), 'Purchase order approved');
  } catch (err) { next(err); }
};

const deletePurchaseOrder = async (req, res, next) => {
  try {
    await procurementService.deletePurchaseOrder(req.params.id, req.companyId);
    return response.success(res, null, 'Purchase order deleted');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    return response.success(res, await procurementService.getStats(req.companyId));
  } catch (err) { next(err); }
};

module.exports = { getVendors, getVendor, createVendor, updateVendor, deleteVendor, getPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, approvePurchaseOrder, deletePurchaseOrder, getStats };
