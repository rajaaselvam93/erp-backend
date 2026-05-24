const { SalesOrder, SalesOrderLine, Invoice, Customer } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class SalesService {
  async getSalesOrders(companyId, { page = 1, limit = 20, search = '', status = '', customerId = '' } = {}) {
    const where = { companyId };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (search) where[Op.or] = [{ orderNumber: { [Op.like]: `%${search}%` } }];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await SalesOrder.findAndCountAll({
      where,
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'customerName', 'customerCode'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getSalesOrder(id, companyId) {
    const order = await SalesOrder.findOne({
      where: { id, companyId },
      include: [
        { model: Customer, as: 'customer' },
        { model: SalesOrderLine, as: 'lines' },
      ],
    });
    if (!order) throw Object.assign(new Error('Sales order not found'), { statusCode: 404 });
    return order;
  }

  async createSalesOrder(data, companyId, userId) {
    const { lines = [], ...orderData } = data;
    const order = await SalesOrder.create({ ...orderData, companyId, createdBy: userId });

    if (lines.length > 0) {
      const lineRecords = lines.map((l) => ({
        id: uuidv4(),
        salesOrderId: order.id,
        ...l,
        lineTotal: l.quantity * l.unitPrice * (1 - (l.discountPercent || 0) / 100),
        created_at: new Date(),
      }));
      await SalesOrderLine.bulkCreate(lineRecords);

      const subtotal = lineRecords.reduce((sum, l) => sum + parseFloat(l.lineTotal), 0);
      const taxAmount = subtotal * ((orderData.taxPercent || 0) / 100);
      await order.update({ subtotal, taxAmount, totalAmount: subtotal + taxAmount });
    }

    return this.getSalesOrder(order.id, companyId);
  }

  async updateSalesOrder(id, data, companyId) {
    const order = await SalesOrder.findOne({ where: { id, companyId } });
    if (!order) throw Object.assign(new Error('Sales order not found'), { statusCode: 404 });
    await order.update(data);
    return order;
  }

  async deleteSalesOrder(id, companyId) {
    const order = await SalesOrder.findOne({ where: { id, companyId } });
    if (!order) throw Object.assign(new Error('Sales order not found'), { statusCode: 404 });
    if (!['draft', 'cancelled'].includes(order.status)) throw Object.assign(new Error('Only draft or cancelled orders can be deleted'), { statusCode: 400 });
    await order.destroy();
  }

  async getInvoices(companyId, { page = 1, limit = 20, search = '', status = '' } = {}) {
    const where = { companyId };
    if (status) where.status = status;
    if (search) where[Op.or] = [{ invoiceNumber: { [Op.like]: `%${search}%` } }];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{ model: Customer, as: 'customer', attributes: ['id', 'customerName'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async createInvoice(data, companyId, userId) {
    return Invoice.create({ ...data, companyId, createdBy: userId, balanceDue: data.totalAmount });
  }

  async updateInvoice(id, data, companyId) {
    const invoice = await Invoice.findOne({ where: { id, companyId } });
    if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
    await invoice.update(data);
    return invoice;
  }

  async recordPayment(id, amount, companyId) {
    const invoice = await Invoice.findOne({ where: { id, companyId } });
    if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
    const newPaid = parseFloat(invoice.paidAmount) + parseFloat(amount);
    const balanceDue = parseFloat(invoice.totalAmount) - newPaid;
    const status = balanceDue <= 0 ? 'paid' : 'partial';
    await invoice.update({ paidAmount: newPaid, balanceDue: Math.max(0, balanceDue), status });
    return invoice;
  }

  async getStats(companyId) {
    const [totalOrders, totalRevenue, pendingInvoices, overdueInvoices] = await Promise.all([
      SalesOrder.count({ where: { companyId } }),
      SalesOrder.sum('totalAmount', { where: { companyId, status: { [Op.in]: ['confirmed', 'processing', 'shipped', 'delivered'] } } }),
      Invoice.count({ where: { companyId, status: { [Op.in]: ['sent', 'partial'] } } }),
      Invoice.count({ where: { companyId, status: 'overdue' } }),
    ]);
    return { totalOrders, totalRevenue: totalRevenue || 0, pendingInvoices, overdueInvoices };
  }
}

module.exports = new SalesService();
