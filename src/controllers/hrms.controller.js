const hrmsService = require('../services/hrms.service');
const response = require('../utils/response.util');

const getEmployees = async (req, res, next) => {
  try {
    const result = await hrmsService.getEmployees(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getEmployee = async (req, res, next) => {
  try {
    const data = await hrmsService.getEmployee(req.params.id, req.companyId);
    return response.success(res, data);
  } catch (err) { next(err); }
};

const createEmployee = async (req, res, next) => {
  try {
    const data = await hrmsService.createEmployee(req.body, req.companyId);
    return response.created(res, data, 'Employee created');
  } catch (err) { next(err); }
};

const updateEmployee = async (req, res, next) => {
  try {
    const data = await hrmsService.updateEmployee(req.params.id, req.body, req.companyId);
    return response.success(res, data, 'Employee updated');
  } catch (err) { next(err); }
};

const deleteEmployee = async (req, res, next) => {
  try {
    await hrmsService.deleteEmployee(req.params.id, req.companyId);
    return response.success(res, null, 'Employee deleted');
  } catch (err) { next(err); }
};

const getDepartments = async (req, res, next) => {
  try {
    const data = await hrmsService.getDepartments(req.companyId);
    return response.success(res, data);
  } catch (err) { next(err); }
};

const createDepartment = async (req, res, next) => {
  try {
    const data = await hrmsService.createDepartment(req.body, req.companyId);
    return response.created(res, data, 'Department created');
  } catch (err) { next(err); }
};

const updateDepartment = async (req, res, next) => {
  try {
    const data = await hrmsService.updateDepartment(req.params.id, req.body, req.companyId);
    return response.success(res, data, 'Department updated');
  } catch (err) { next(err); }
};

const deleteDepartment = async (req, res, next) => {
  try {
    await hrmsService.deleteDepartment(req.params.id, req.companyId);
    return response.success(res, null, 'Department deleted');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const data = await hrmsService.getStats(req.companyId);
    return response.success(res, data);
  } catch (err) { next(err); }
};

module.exports = { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getDepartments, createDepartment, updateDepartment, deleteDepartment, getStats };
