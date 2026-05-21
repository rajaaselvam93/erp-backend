const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {}

  Setting.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: { type: DataTypes.UUID, field: 'company_id', allowNull: true },
      key: { type: DataTypes.STRING(200), allowNull: false },
      value: { type: DataTypes.TEXT },
      type: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'encrypted'),
        defaultValue: 'string',
      },
      group: { type: DataTypes.STRING(100) },
      label: { type: DataTypes.STRING(200) },
      description: { type: DataTypes.TEXT },
      isPublic: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_public' },
      isSystem: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_system' },
    },
    {
      sequelize,
      modelName: 'Setting',
      tableName: 'settings',
      paranoid: false,
      indexes: [
        { fields: ['company_id', 'key'], unique: true },
        { fields: ['group'] },
      ],
    }
  );

  return Setting;
};
