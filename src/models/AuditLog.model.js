const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {}

  AuditLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, field: 'user_id', allowNull: true },
      companyId: { type: DataTypes.UUID, field: 'company_id', allowNull: true },
      action: {
        type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject', 'custom'),
        allowNull: false,
      },
      module: { type: DataTypes.STRING(100) },
      resourceId: { type: DataTypes.STRING(100), field: 'resource_id' },
      resourceType: { type: DataTypes.STRING(100), field: 'resource_type' },
      description: { type: DataTypes.TEXT },
      oldValues: {
        type: DataTypes.JSON,
        field: 'old_values',
        defaultValue: null,
      },
      newValues: {
        type: DataTypes.JSON,
        field: 'new_values',
        defaultValue: null,
      },
      ipAddress: { type: DataTypes.STRING(50), field: 'ip_address' },
      userAgent: { type: DataTypes.STRING(500), field: 'user_agent' },
      status: {
        type: DataTypes.ENUM('success', 'failed', 'warning'),
        defaultValue: 'success',
      },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'AuditLog',
      tableName: 'audit_logs',
      paranoid: false,
      updatedAt: false,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['company_id'] },
        { fields: ['action'] },
        { fields: ['module'] },
        { fields: ['created_at'] },
      ],
    }
  );

  return AuditLog;
};
