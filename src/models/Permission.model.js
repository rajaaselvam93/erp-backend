const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {}

  Permission.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        comment: 'e.g. users.create, invoices.delete',
      },
      module: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Module this permission belongs to',
      },
      action: {
        type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'custom'),
        allowNull: false,
      },
      resource: {
        type: DataTypes.STRING(100),
        comment: 'Specific resource within module',
      },
      description: { type: DataTypes.TEXT },
      isSystem: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'Permission',
      tableName: 'permissions',
      paranoid: false,
      timestamps: true,
      updatedAt: false,
    }
  );

  return Permission;
};
