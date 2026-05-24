module.exports = (sequelize, DataTypes) => {
  const InventoryItem = sequelize.define('InventoryItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    sku: { type: DataTypes.STRING(100), allowNull: false },
    itemName: { type: DataTypes.STRING(255), allowNull: false, field: 'item_name' },
    description: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING(100) },
    unitOfMeasure: { type: DataTypes.STRING(20), defaultValue: 'pcs', field: 'unit_of_measure' },
    unitPrice: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0, field: 'unit_price' },
    costPrice: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0, field: 'cost_price' },
    reorderLevel: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'reorder_level' },
    reorderQuantity: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'reorder_quantity' },
    currentStock: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0, field: 'current_stock' },
    warehouseId: { type: DataTypes.UUID, field: 'warehouse_id' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    isTracked: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_tracked' },
    barcode: { type: DataTypes.STRING(100) },
    image: { type: DataTypes.STRING(500) },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'inventory_items',
    underscored: true,
    paranoid: true,
  });

  const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    itemId: { type: DataTypes.UUID, allowNull: false, field: 'item_id' },
    warehouseId: { type: DataTypes.UUID, field: 'warehouse_id' },
    transactionType: { type: DataTypes.ENUM('receipt', 'issue', 'transfer', 'adjustment', 'return'), allowNull: false, field: 'transaction_type' },
    quantity: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
    unitCost: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0, field: 'unit_cost' },
    referenceType: { type: DataTypes.STRING(50), field: 'reference_type' },
    referenceId: { type: DataTypes.UUID, field: 'reference_id' },
    notes: { type: DataTypes.TEXT },
    createdBy: { type: DataTypes.UUID, field: 'created_by' },
    transactionDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'transaction_date' },
  }, {
    tableName: 'inventory_transactions',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  });

  InventoryItem.hasMany(InventoryTransaction, { foreignKey: 'itemId', as: 'transactions' });
  InventoryTransaction.belongsTo(InventoryItem, { foreignKey: 'itemId', as: 'item' });

  return { InventoryItem, InventoryTransaction };
};
