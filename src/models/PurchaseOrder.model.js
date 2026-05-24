module.exports = (sequelize, DataTypes) => {
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    poNumber: { type: DataTypes.STRING(50), allowNull: false, field: 'po_number' },
    vendorId: { type: DataTypes.UUID, field: 'vendor_id' },
    orderDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'order_date' },
    expectedDeliveryDate: { type: DataTypes.DATEONLY, field: 'expected_delivery_date' },
    deliveryAddress: { type: DataTypes.TEXT, field: 'delivery_address' },
    currencyCode: { type: DataTypes.STRING(10), defaultValue: 'USD', field: 'currency_code' },
    subtotal: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'tax_amount' },
    discountAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'discount_amount' },
    totalAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_amount' },
    status: { type: DataTypes.ENUM('draft', 'submitted', 'approved', 'sent', 'partial', 'received', 'cancelled'), defaultValue: 'draft' },
    notes: { type: DataTypes.TEXT },
    termsConditions: { type: DataTypes.TEXT, field: 'terms_conditions' },
    createdBy: { type: DataTypes.UUID, field: 'created_by' },
    approvedBy: { type: DataTypes.UUID, field: 'approved_by' },
    approvedAt: { type: DataTypes.DATE, field: 'approved_at' },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'purchase_orders',
    underscored: true,
    paranoid: true,
  });

  const PurchaseOrderLine = sequelize.define('PurchaseOrderLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    purchaseOrderId: { type: DataTypes.UUID, allowNull: false, field: 'purchase_order_id' },
    itemDescription: { type: DataTypes.STRING(500), allowNull: false, field: 'item_description' },
    itemCode: { type: DataTypes.STRING(100), field: 'item_code' },
    quantity: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
    unitOfMeasure: { type: DataTypes.STRING(20), field: 'unit_of_measure' },
    unitPrice: { type: DataTypes.DECIMAL(18, 4), allowNull: false, field: 'unit_price' },
    discountPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, field: 'discount_percent' },
    taxPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, field: 'tax_percent' },
    lineTotal: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'line_total' },
    receivedQty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0, field: 'received_qty' },
  }, {
    tableName: 'purchase_order_lines',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  });

  PurchaseOrder.hasMany(PurchaseOrderLine, { foreignKey: 'purchaseOrderId', as: 'lines' });
  PurchaseOrderLine.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });

  return { PurchaseOrder, PurchaseOrderLine };
};
