const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {}

  Menu.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      moduleId: { type: DataTypes.UUID, field: 'module_id', allowNull: true },
      parentId: { type: DataTypes.UUID, field: 'parent_id', allowNull: true },
      roleId: { type: DataTypes.UUID, field: 'role_id', allowNull: true },
      companyId: { type: DataTypes.UUID, field: 'company_id', allowNull: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      path: { type: DataTypes.STRING(255) },
      icon: { type: DataTypes.STRING(50) },
      badge: { type: DataTypes.STRING(20) },
      badgeColor: { type: DataTypes.STRING(20) },
      target: { type: DataTypes.ENUM('_self', '_blank'), defaultValue: '_self' },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      isSystem: { type: DataTypes.BOOLEAN, defaultValue: false },
      isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
      sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
      permissions: { type: DataTypes.JSON, defaultValue: [] },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'Menu',
      tableName: 'menus',
      paranoid: true,
      indexes: [
        { fields: ['parent_id'] },
        { fields: ['module_id'] },
        { fields: ['sort_order'] },
      ],
    }
  );

  return Menu;
};
