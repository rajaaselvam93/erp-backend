module.exports = (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    vendorCode: { type: DataTypes.STRING(50), allowNull: false, field: 'vendor_code' },
    vendorName: { type: DataTypes.STRING(255), allowNull: false, field: 'vendor_name' },
    email: { type: DataTypes.STRING(255) },
    phone: { type: DataTypes.STRING(30) },
    website: { type: DataTypes.STRING(255) },
    taxRegistrationNo: { type: DataTypes.STRING(100), field: 'tax_registration_no' },
    paymentTerms: { type: DataTypes.STRING(100), defaultValue: 'Net 30', field: 'payment_terms' },
    currencyCode: { type: DataTypes.STRING(10), defaultValue: 'USD', field: 'currency_code' },
    billingAddress: { type: DataTypes.TEXT, field: 'billing_address' },
    city: { type: DataTypes.STRING(100) },
    country: { type: DataTypes.STRING(100) },
    bankDetails: { type: DataTypes.JSON, field: 'bank_details' },
    status: { type: DataTypes.ENUM('active', 'inactive', 'blacklisted'), defaultValue: 'active' },
    rating: { type: DataTypes.INTEGER, defaultValue: 3 },
    notes: { type: DataTypes.TEXT },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'vendors',
    underscored: true,
    paranoid: true,
  });

  return Vendor;
};
