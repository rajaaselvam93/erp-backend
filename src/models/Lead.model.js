module.exports = (sequelize, DataTypes) => {
  const Lead = sequelize.define('Lead', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    leadSource: { type: DataTypes.STRING(100), field: 'lead_source' },
    leadStatus: { type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'), defaultValue: 'new', field: 'lead_status' },
    firstName: { type: DataTypes.STRING(100), field: 'first_name' },
    lastName: { type: DataTypes.STRING(100), field: 'last_name' },
    email: { type: DataTypes.STRING(255) },
    phone: { type: DataTypes.STRING(30) },
    companyName: { type: DataTypes.STRING(255), field: 'company_name' },
    industry: { type: DataTypes.STRING(100) },
    assignedTo: { type: DataTypes.UUID, field: 'assigned_to' },
    expectedRevenue: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'expected_revenue' },
    probability: { type: DataTypes.INTEGER, defaultValue: 0 },
    expectedCloseDate: { type: DataTypes.DATEONLY, field: 'expected_close_date' },
    convertedCustomerId: { type: DataTypes.UUID, field: 'converted_customer_id' },
    isConverted: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_converted' },
    notes: { type: DataTypes.TEXT },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'leads',
    underscored: true,
    paranoid: true,
  });

  return Lead;
};
