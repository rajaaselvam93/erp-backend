const { Customer, Lead } = require('../models');
const { Op } = require('sequelize');

class CRMService {
  async getCustomers(companyId, { page = 1, limit = 20, search = '', status = '' } = {}) {
    const where = { companyId };
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { customerName: { [Op.like]: `%${search}%` } },
        { customerCode: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Customer.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getCustomer(id, companyId) {
    const customer = await Customer.findOne({ where: { id, companyId } });
    if (!customer) throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    return customer;
  }

  async createCustomer(data, companyId) {
    const exists = await Customer.findOne({ where: { customerCode: data.customerCode, companyId } });
    if (exists) throw Object.assign(new Error('Customer code already exists'), { statusCode: 409 });
    return Customer.create({ ...data, companyId });
  }

  async updateCustomer(id, data, companyId) {
    const customer = await this.getCustomer(id, companyId);
    await customer.update(data);
    return customer;
  }

  async deleteCustomer(id, companyId) {
    const customer = await this.getCustomer(id, companyId);
    await customer.destroy();
  }

  async getLeads(companyId, { page = 1, limit = 20, search = '', status = '' } = {}) {
    const where = { companyId };
    if (status) where.leadStatus = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Lead.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getLead(id, companyId) {
    const lead = await Lead.findOne({ where: { id, companyId } });
    if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    return lead;
  }

  async createLead(data, companyId) {
    return Lead.create({ ...data, companyId });
  }

  async updateLead(id, data, companyId) {
    const lead = await this.getLead(id, companyId);
    await lead.update(data);
    return lead;
  }

  async deleteLead(id, companyId) {
    const lead = await this.getLead(id, companyId);
    await lead.destroy();
  }

  async convertLead(id, companyId) {
    const lead = await this.getLead(id, companyId);
    if (lead.isConverted) throw Object.assign(new Error('Lead already converted'), { statusCode: 409 });

    const customer = await Customer.create({
      companyId,
      customerCode: `CUST-${Date.now()}`,
      customerName: `${lead.firstName} ${lead.lastName}`.trim() || lead.companyName,
      email: lead.email,
      phone: lead.phone,
      industry: lead.industry,
    });

    await lead.update({ isConverted: true, convertedCustomerId: customer.id });
    return { lead, customer };
  }

  async getStats(companyId) {
    const [totalCustomers, totalLeads, activeLeads, wonLeads, pipeline] = await Promise.all([
      Customer.count({ where: { companyId, status: 'active' } }),
      Lead.count({ where: { companyId } }),
      Lead.count({ where: { companyId, leadStatus: { [Op.in]: ['new', 'contacted', 'qualified', 'proposal', 'negotiation'] } } }),
      Lead.count({ where: { companyId, leadStatus: 'won' } }),
      Lead.sum('expectedRevenue', { where: { companyId, leadStatus: { [Op.in]: ['qualified', 'proposal', 'negotiation'] } } }),
    ]);
    return { totalCustomers, totalLeads, activeLeads, wonLeads, pipelineValue: pipeline || 0 };
  }
}

module.exports = new CRMService();
