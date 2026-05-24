const { Employee, Department, User } = require('../models');
const { Op } = require('sequelize');

class HRMSService {
  async getEmployees(companyId, { page = 1, limit = 20, search = '', status = '', departmentId = '' } = {}) {
    const where = { companyId };
    if (status) where.employmentStatus = status;
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { employeeCode: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Employee.findAndCountAll({
      where,
      include: [{ model: Department, as: 'department', attributes: ['id', 'departmentName'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getEmployee(id, companyId) {
    const employee = await Employee.findOne({
      where: { id, companyId },
      include: [{ model: Department, as: 'department' }],
    });
    if (!employee) throw Object.assign(new Error('Employee not found'), { statusCode: 404 });
    return employee;
  }

  async createEmployee(data, companyId) {
    const exists = await Employee.findOne({ where: { employeeCode: data.employeeCode, companyId } });
    if (exists) throw Object.assign(new Error('Employee code already exists'), { statusCode: 409 });
    return Employee.create({ ...data, companyId });
  }

  async updateEmployee(id, data, companyId) {
    const employee = await this.getEmployee(id, companyId);
    await employee.update(data);
    return employee.reload({ include: [{ model: Department, as: 'department' }] });
  }

  async deleteEmployee(id, companyId) {
    const employee = await this.getEmployee(id, companyId);
    await employee.destroy();
  }

  async getDepartments(companyId) {
    return Department.findAll({ where: { companyId, isActive: true }, order: [['departmentName', 'ASC']] });
  }

  async createDepartment(data, companyId) {
    return Department.create({ ...data, companyId });
  }

  async updateDepartment(id, data, companyId) {
    const dept = await Department.findOne({ where: { id, companyId } });
    if (!dept) throw Object.assign(new Error('Department not found'), { statusCode: 404 });
    await dept.update(data);
    return dept;
  }

  async deleteDepartment(id, companyId) {
    const dept = await Department.findOne({ where: { id, companyId } });
    if (!dept) throw Object.assign(new Error('Department not found'), { statusCode: 404 });
    await dept.destroy();
  }

  async getStats(companyId) {
    const [total, active, onLeave, departments] = await Promise.all([
      Employee.count({ where: { companyId } }),
      Employee.count({ where: { companyId, employmentStatus: 'active' } }),
      Employee.count({ where: { companyId, employmentStatus: 'on_leave' } }),
      Department.count({ where: { companyId, isActive: true } }),
    ]);
    return { totalEmployees: total, activeEmployees: active, onLeave, departments };
  }
}

module.exports = new HRMSService();
