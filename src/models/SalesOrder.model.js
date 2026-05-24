module.exports = (sequelize, DataTypes) => {
  const SalesOrder = sequelize.define('SalesOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    orderNumber: { type: DataTypes.STRING(50), allowNull: false, field: 'order_number' },
    customerId: { type: DataTypes.UUID, field: 'customer_id' },
    orderDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'order_date' },
    expectedDeliveryDate: { type: DataTypes.DATEONLY, field: 'expected_delivery_date' },
    shippingAddress: { type: DataTypes.TEXT, field: 'shipping_address' },
    currencyCode: { type: DataTypes.STRING(10), defaultValue: 'USD', field: 'currency_code' },
    subtotal: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'tax_amount' },
    discountAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'discount_amount' },
    totalAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_amount' },
    status: { type: DataTypes.ENUM('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'), defaultValue: 'draft' },
    paymentStatus: { type: DataTypes.ENUM('unpaid', 'partial', 'paid'), defaultValue: 'unpaid', field: 'payment_status' },
    salesRepId: { type: DataTypes.UUID, field: 'sales_rep_id' },
    notes: { type: DataTypes.TEXT },
    createdBy: { type: DataTypes.UUID, field: 'created_by' },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'sales_orders',
    underscored: true,
    paranoid: true,
  });

  const SalesOrderLine = sequelize.define('SalesOrderLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    salesOrderId: { type: DataTypes.UUID, allowNull: false, field: 'sales_order_id' },
    itemId: { type: DataTypes.UUID, field: 'item_id' },
    itemDescription: { type: DataTypes.STRING(500), allowNull: false, field: 'item_description' },
    itemCode: { type: DataTypes.STRING(100), field: 'item_code' },
    quantity: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
    unitOfMeasure: { type: DataTypes.STRING(20), field: 'unit_of_measure' },
    unitPrice: { type: DataTypes.DECIMAL(18, 4), allowNull: false, field: 'unit_price' },
    discountPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, field: 'discount_percent' },
    taxPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0, field: 'tax_percent' },
    lineTotal: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'line_total' },
    deliveredQty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0, field: 'delivered_qty' },
  }, {
    tableName: 'sales_order_lines',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  });

  SalesOrder.hasMany(SalesOrderLine, { foreignKey: 'salesOrderId', as: 'lines' });
  SalesOrderLine.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', as: 'salesOrder' });

  return { SalesOrder, SalesOrderLine };
};
