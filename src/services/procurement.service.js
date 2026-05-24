const { Vendor, PurchaseOrder, PurchaseOrderLine } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class ProcurementService {
  async getVendors(companyId, { page = 1, limit = 20, search = '', status = '' } = {}) {
    const where = { companyId };
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { vendorName: { [Op.like]: `%${search}%` } },
        { vendorCode: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Vendor.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: parseInt(limit), offset });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getVendor(id, companyId) {
    const vendor = await Vendor.findOne({ where: { id, companyId } });
    if (!vendor) throw Object.assign(new Error('Vendor not found'), { statusCode: 404 });
    return vendor;
  }

  async createVendor(data, companyId) {
    const exists = await Vendor.findOne({ where: { vendorCode: data.vendorCode, companyId } });
    if (exists) throw Object.assign(new Error('Vendor code already exists'), { statusCode: 409 });
    return Vendor.create({ ...data, companyId });
  }

  async updateVendor(id, data, companyId) {
    const vendor = await this.getVendor(id, companyId);
    await vendor.update(data);
    return vendor;
  }

  async deleteVendor(id, companyId) {
    const vendor = await this.getVendor(id, companyId);
    await vendor.destroy();
  }

  async getPurchaseOrders(companyId, { page = 1, limit = 20, search = '', status = '', vendorId = '' } = {}) {
    const where = { companyId };
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    if (search) where[Op.or] = [{ poNumber: { [Op.like]: `%${search}%` } }];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where,
      include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'vendorName', 'vendorCode'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getPurchaseOrder(id, companyId) {
    const po = await PurchaseOrder.findOne({
      where: { id, companyId },
      include: [
        { model: Vendor, as: 'vendor' },
        { model: PurchaseOrderLine, as: 'lines' },
      ],
    });
    if (!po) throw Object.assign(new Error('Purchase order not found'), { statusCode: 404 });
    return po;
  }

  async createPurchaseOrder(data, companyId, userId) {
    const { lines = [], ...poData } = data;
    const po = await PurchaseOrder.create({ ...poData, companyId, createdBy: userId });

    if (lines.length > 0) {
      const lineRecords = lines.map((l) => ({
        id: uuidv4(),
        purchaseOrderId: po.id,
        ...l,
        lineTotal: l.quantity * l.unitPrice * (1 - (l.discountPercent || 0) / 100),
        created_at: new Date(),
      }));
      await PurchaseOrderLine.bulkCreate(lineRecords);

      const subtotal = lineRecords.reduce((sum, l) => sum + parseFloat(l.lineTotal), 0);
      const taxAmount = subtotal * ((poData.taxPercent || 0) / 100);
      await po.update({ subtotal, taxAmount, totalAmount: subtotal + taxAmount });
    }

    return this.getPurchaseOrder(po.id, companyId);
  }

  async updatePurchaseOrder(id, data, companyId) {
    const po = await PurchaseOrder.findOne({ where: { id, companyId } });
    if (!po) throw Object.assign(new Error('Purchase order not found'), { statusCode: 404 });
    await po.update(data);
    return po;
  }

  async approvePurchaseOrder(id, companyId, userId) {
    const po = await PurchaseOrder.findOne({ where: { id, companyId } });
    if (!po) throw Object.assign(new Error('Purchase order not found'), { statusCode: 404 });
    if (po.status !== 'submitted') throw Object.assign(new Error('Only submitted POs can be approved'), { statusCode: 400 });
    await po.update({ status: 'approved', approvedBy: userId, approvedAt: new Date() });
    return po;
  }

  async deletePurchaseOrder(id, companyId) {
    const po = await PurchaseOrder.findOne({ where: { id, companyId } });
    if (!po) throw Object.assign(new Error('Purchase order not found'), { statusCode: 404 });
    if (!['draft', 'cancelled'].includes(po.status)) throw Object.assign(new Error('Only draft or cancelled POs can be deleted'), { statusCode: 400 });
    await po.destroy();
  }

  async getStats(companyId) {
    const [totalVendors, totalPOs, pendingPOs, approvedAmount] = await Promise.all([
      Vendor.count({ where: { companyId, status: 'active' } }),
      PurchaseOrder.count({ where: { companyId } }),
      PurchaseOrder.count({ where: { companyId, status: { [Op.in]: ['submitted', 'draft'] } } }),
      PurchaseOrder.sum('totalAmount', { where: { companyId, status: 'approved' } }),
    ]);
    return { totalVendors, totalPOs, pendingPOs, approvedAmount: approvedAmount || 0 };
  }
}

module.exports = new ProcurementService();
