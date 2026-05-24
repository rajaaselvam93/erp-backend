module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    customerCode: { type: DataTypes.STRING(50), allowNull: false, field: 'customer_code' },
    customerName: { type: DataTypes.STRING(255), allowNull: false, field: 'customer_name' },
    email: { type: DataTypes.STRING(255) },
    phone: { type: DataTypes.STRING(30) },
    website: { type: DataTypes.STRING(255) },
    taxId: { type: DataTypes.STRING(100), field: 'tax_id' },
    industry: { type: DataTypes.STRING(100) },
    accountManagerId: { type: DataTypes.UUID, field: 'account_manager_id' },
    billingAddress: { type: DataTypes.TEXT, field: 'billing_address' },
    shippingAddress: { type: DataTypes.TEXT, field: 'shipping_address' },
    city: { type: DataTypes.STRING(100) },
    country: { type: DataTypes.STRING(100) },
    creditLimit: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'credit_limit' },
    paymentTerms: { type: DataTypes.STRING(50), defaultValue: 'Net 30', field: 'payment_terms' },
    status: { type: DataTypes.ENUM('active', 'inactive', 'prospect'), defaultValue: 'active' },
    notes: { type: DataTypes.TEXT },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'customers',
    underscored: true,
    paranoid: true,
  });

  return Customer;
};
