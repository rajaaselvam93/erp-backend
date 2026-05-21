const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {}

  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, field: 'user_id', allowNull: false },
      companyId: { type: DataTypes.UUID, field: 'company_id' },
      type: {
        type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'approval', 'mention', 'system', 'reminder'),
        defaultValue: 'info',
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      message: { type: DataTypes.TEXT },
      icon: { type: DataTypes.STRING(50) },
      color: { type: DataTypes.STRING(20) },
      link: { type: DataTypes.STRING(500) },
      module: { type: DataTypes.STRING(100) },
      resourceId: { type: DataTypes.STRING(100), field: 'resource_id' },
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_read' },
      readAt: { type: DataTypes.DATE, field: 'read_at' },
      channels: {
        type: DataTypes.JSON,
        defaultValue: ['in_app'],
        comment: 'in_app, email, sms, whatsapp',
      },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      paranoid: false,
      indexes: [
        { fields: ['user_id', 'is_read'] },
        { fields: ['company_id'] },
        { fields: ['created_at'] },
      ],
    }
  );

  return Notification;
};
