const salesService = require('../services/sales.service');
const response = require('../utils/response.util');

const getSalesOrders = async (req, res, next) => {
  try {
    const result = await salesService.getSalesOrders(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getSalesOrder = async (req, res, next) => {
  try {
    return response.success(res, await salesService.getSalesOrder(req.params.id, req.companyId));
  } catch (err) { next(err); }
};

const createSalesOrder = async (req, res, next) => {
  try {
    return response.created(res, await salesService.createSalesOrder(req.body, req.companyId, req.userId), 'Sales order created');
  } catch (err) { next(err); }
};

const updateSalesOrder = async (req, res, next) => {
  try {
    return response.success(res, await salesService.updateSalesOrder(req.params.id, req.body, req.companyId), 'Sales order updated');
  } catch (err) { next(err); }
};

const deleteSalesOrder = async (req, res, next) => {
  try {
    await salesService.deleteSalesOrder(req.params.id, req.companyId);
    return response.success(res, null, 'Sales order deleted');
  } catch (err) { next(err); }
};

const getInvoices = async (req, res, next) => {
  try {
    const result = await salesService.getInvoices(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const createInvoice = async (req, res, next) => {
  try {
    return response.created(res, await salesService.createInvoice(req.body, req.companyId, req.userId), 'Invoice created');
  } catch (err) { next(err); }
};

const updateInvoice = async (req, res, next) => {
  try {
    return response.success(res, await salesService.updateInvoice(req.params.id, req.body, req.companyId), 'Invoice updated');
  } catch (err) { next(err); }
};

const recordPayment = async (req, res, next) => {
  try {
    return response.success(res, await salesService.recordPayment(req.params.id, req.body.amount, req.companyId), 'Payment recorded');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    return response.success(res, await salesService.getStats(req.companyId));
  } catch (err) { next(err); }
};

module.exports = { getSalesOrders, getSalesOrder, createSalesOrder, updateSalesOrder, deleteSalesOrder, getInvoices, createInvoice, updateInvoice, recordPayment, getStats };
