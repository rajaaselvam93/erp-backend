const { InventoryItem, InventoryTransaction, Warehouse } = require('../models');
const { Op } = require('sequelize');

class InventoryService {
  async getItems(companyId, { page = 1, limit = 20, search = '', category = '', warehouseId = '' } = {}) {
    const where = { companyId };
    if (category) where.category = category;
    if (warehouseId) where.warehouseId = warehouseId;
    if (search) {
      where[Op.or] = [
        { itemName: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await InventoryItem.findAndCountAll({
      where,
      include: [{ model: Warehouse, as: 'warehouse', attributes: ['id', 'warehouseName'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getItem(id, companyId) {
    const item = await InventoryItem.findOne({
      where: { id, companyId },
      include: [{ model: Warehouse, as: 'warehouse' }],
    });
    if (!item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });
    return item;
  }

  async createItem(data, companyId) {
    const exists = await InventoryItem.findOne({ where: { sku: data.sku, companyId } });
    if (exists) throw Object.assign(new Error('SKU already exists'), { statusCode: 409 });
    return InventoryItem.create({ ...data, companyId });
  }

  async updateItem(id, data, companyId) {
    const item = await this.getItem(id, companyId);
    await item.update(data);
    return item;
  }

  async deleteItem(id, companyId) {
    const item = await this.getItem(id, companyId);
    await item.destroy();
  }

  async addTransaction(itemId, data, companyId, userId) {
    const item = await this.getItem(itemId, companyId);

    const transaction = await InventoryTransaction.create({
      ...data,
      itemId,
      companyId,
      createdBy: userId,
      transactionDate: data.transactionDate || new Date(),
    });

    // Update stock
    let stockDelta = parseFloat(data.quantity);
    if (['issue', 'transfer'].includes(data.transactionType)) stockDelta = -stockDelta;
    await item.update({ currentStock: parseFloat(item.currentStock) + stockDelta });

    return transaction;
  }

  async getTransactions(itemId, companyId, { page = 1, limit = 20 } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await InventoryTransaction.findAndCountAll({
      where: { itemId, companyId },
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getWarehouses(companyId) {
    return Warehouse.findAll({ where: { companyId, isActive: true }, order: [['warehouseName', 'ASC']] });
  }

  async createWarehouse(data, companyId) {
    return Warehouse.create({ ...data, companyId });
  }

  async getStats(companyId) {
    const [totalItems, lowStock, totalWarehouses, totalValue] = await Promise.all([
      InventoryItem.count({ where: { companyId, isActive: true } }),
      InventoryItem.count({
        where: { companyId, isActive: true, isTracked: true, currentStock: { [Op.lte]: Op.col('reorder_level') } },
      }).catch(() => 0),
      Warehouse.count({ where: { companyId, isActive: true } }),
      InventoryItem.sum('current_stock', { where: { companyId } }),
    ]);
    return { totalItems, lowStock, totalWarehouses, totalStockValue: totalValue || 0 };
  }
}

module.exports = new InventoryService();
