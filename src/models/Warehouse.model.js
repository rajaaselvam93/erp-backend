module.exports = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define('Warehouse', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    warehouseCode: { type: DataTypes.STRING(50), allowNull: false, field: 'warehouse_code' },
    warehouseName: { type: DataTypes.STRING(255), allowNull: false, field: 'warehouse_name' },
    location: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING(100) },
    country: { type: DataTypes.STRING(100) },
    managerId: { type: DataTypes.UUID, field: 'manager_id' },
    capacity: { type: DataTypes.DECIMAL(18, 2) },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    metadata: { type: DataTypes.JSON, defaultValue: {} },
  }, {
    tableName: 'warehouses',
    underscored: true,
    paranoid: true,
  });

  return Warehouse;
};
