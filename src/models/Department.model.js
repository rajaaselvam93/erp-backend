module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    departmentName: { type: DataTypes.STRING(100), allowNull: false, field: 'department_name' },
    departmentCode: { type: DataTypes.STRING(20), field: 'department_code' },
    costCenterCode: { type: DataTypes.STRING(50), field: 'cost_center_code' },
    managerId: { type: DataTypes.UUID, field: 'manager_id' },
    parentId: { type: DataTypes.UUID, field: 'parent_id' },
    description: { type: DataTypes.TEXT, field: 'description' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  }, {
    tableName: 'departments',
    underscored: true,
    paranoid: true,
  });

  return Department;
};
