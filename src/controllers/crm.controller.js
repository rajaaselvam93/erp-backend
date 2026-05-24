const crmService = require('../services/crm.service');
const response = require('../utils/response.util');

const getCustomers = async (req, res, next) => {
  try {
    const result = await crmService.getCustomers(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getCustomer = async (req, res, next) => {
  try {
    return response.success(res, await crmService.getCustomer(req.params.id, req.companyId));
  } catch (err) { next(err); }
};

const createCustomer = async (req, res, next) => {
  try {
    return response.created(res, await crmService.createCustomer(req.body, req.companyId), 'Customer created');
  } catch (err) { next(err); }
};

const updateCustomer = async (req, res, next) => {
  try {
    return response.success(res, await crmService.updateCustomer(req.params.id, req.body, req.companyId), 'Customer updated');
  } catch (err) { next(err); }
};

const deleteCustomer = async (req, res, next) => {
  try {
    await crmService.deleteCustomer(req.params.id, req.companyId);
    return response.success(res, null, 'Customer deleted');
  } catch (err) { next(err); }
};

const getLeads = async (req, res, next) => {
  try {
    const result = await crmService.getLeads(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getLead = async (req, res, next) => {
  try {
    return response.success(res, await crmService.getLead(req.params.id, req.companyId));
  } catch (err) { next(err); }
};

const createLead = async (req, res, next) => {
  try {
    return response.created(res, await crmService.createLead(req.body, req.companyId), 'Lead created');
  } catch (err) { next(err); }
};

const updateLead = async (req, res, next) => {
  try {
    return response.success(res, await crmService.updateLead(req.params.id, req.body, req.companyId), 'Lead updated');
  } catch (err) { next(err); }
};

const deleteLead = async (req, res, next) => {
  try {
    await crmService.deleteLead(req.params.id, req.companyId);
    return response.success(res, null, 'Lead deleted');
  } catch (err) { next(err); }
};

const convertLead = async (req, res, next) => {
  try {
    return response.success(res, await crmService.convertLead(req.params.id, req.companyId), 'Lead converted to customer');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    return response.success(res, await crmService.getStats(req.companyId));
  } catch (err) { next(err); }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, getLeads, getLead, createLead, updateLead, deleteLead, convertLead, getStats };
