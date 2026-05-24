module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    invoiceNumber: { type: DataTypes.STRING(50), allowNull: false, field: 'invoice_number' },
    invoiceType: { type: DataTypes.ENUM('sales', 'purchase'), defaultValue: 'sales', field: 'invoice_type' },
    customerId: { type: DataTypes.UUID, field: 'customer_id' },
    vendorId: { type: DataTypes.UUID, field: 'vendor_id' },
    salesOrderId: { type: DataTypes.UUID, field: 'sales_order_id' },
    purchaseOrderId: { type: DataTypes.UUID, field: 'purchase_order_id' },
    invoiceDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'invoice_date' },
    dueDate: { type: DataTypes.DATEONLY, field: 'due_date' },
    currencyCode: { type: DataTypes.STRING(10), defaultValue: 'USD', field: 'currency_code' },
    subtotal: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'tax_amount' },
    totalAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_amount' },
    paidAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'paid_amount' },
    balanceDue: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'balance_due' },
    status: { type: DataTypes.ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'), defaultValue: 'draft' },
    notes: { type: DataTypes.TEXT },
    createdBy: { type: DataTypes.UUID, field: 'created_by' },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'invoices',
    underscored: true,
    paranoid: true,
  });

  return Invoice;
};
