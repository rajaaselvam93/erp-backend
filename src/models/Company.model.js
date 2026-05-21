const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {}

  Company.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 200] },
      },
      slug: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING(30) },
      website: { type: DataTypes.STRING(255) },
      address: { type: DataTypes.TEXT },
      city: { type: DataTypes.STRING(100) },
      state: { type: DataTypes.STRING(100) },
      country: { type: DataTypes.STRING(100) },
      zipCode: { type: DataTypes.STRING(20) },
      logo: { type: DataTypes.STRING(500) },
      currency: { type: DataTypes.STRING(10), defaultValue: 'USD' },
      timezone: { type: DataTypes.STRING(50), defaultValue: 'UTC' },
      dateFormat: { type: DataTypes.STRING(20), defaultValue: 'YYYY-MM-DD' },
      fiscalYearStart: { type: DataTypes.STRING(5), defaultValue: '01-01' },
      taxNumber: { type: DataTypes.STRING(100) },
      registrationNumber: { type: DataTypes.STRING(100) },
      industry: { type: DataTypes.STRING(100) },
      size: {
        type: DataTypes.ENUM('startup', 'small', 'medium', 'large', 'enterprise'),
        defaultValue: 'small',
      },
      plan: {
        type: DataTypes.ENUM('free', 'basic', 'professional', 'enterprise'),
        defaultValue: 'free',
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      settings: { type: DataTypes.JSON, defaultValue: {} },
      modules: { type: DataTypes.JSON, defaultValue: [] },
      theme: {
        type: DataTypes.JSON,
        defaultValue: {
          primaryColor: '#6366f1',
          logo: null,
          darkMode: false,
        },
      },
      trialEndsAt: { type: DataTypes.DATE },
      subscriptionEndsAt: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: 'Company',
      tableName: 'companies',
      paranoid: true,
      indexes: [{ fields: ['slug'], unique: true }, { fields: ['is_active'] }],
    }
  );

  return Company;
};
