const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {}

  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.UUID,
        field: 'company_id',
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
      },
      slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: { type: DataTypes.TEXT },
      isSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'System roles cannot be deleted',
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
        comment: 'Higher level = more authority (1=lowest, 100=highest)',
      },
      dashboardConfig: { type: DataTypes.JSON, defaultValue: {} },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      paranoid: true,
      indexes: [
        { fields: ['company_id', 'slug'], unique: true },
        { fields: ['is_active'] },
      ],
    }
  );

  return Role;
};
