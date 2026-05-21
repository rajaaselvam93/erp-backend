const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserActivity extends Model {}

  UserActivity.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, field: 'user_id', allowNull: false },
      companyId: { type: DataTypes.UUID, field: 'company_id' },
      type: {
        type: DataTypes.ENUM('page_view', 'module_access', 'search', 'export', 'login', 'logout', 'api_call'),
        defaultValue: 'page_view',
      },
      module: { type: DataTypes.STRING(100) },
      path: { type: DataTypes.STRING(500) },
      duration: { type: DataTypes.INTEGER, comment: 'Time spent in ms' },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'UserActivity',
      tableName: 'user_activities',
      paranoid: false,
      updatedAt: false,
      indexes: [{ fields: ['user_id'] }, { fields: ['created_at'] }],
    }
  );

  return UserActivity;
};
