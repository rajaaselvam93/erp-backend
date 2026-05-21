const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {}

  RefreshToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, field: 'user_id', allowNull: false },
      token: { type: DataTypes.TEXT, allowNull: false },
      deviceInfo: { type: DataTypes.JSON, field: 'device_info', defaultValue: {} },
      ipAddress: { type: DataTypes.STRING(50), field: 'ip_address' },
      isRevoked: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_revoked' },
      expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
    },
    {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      paranoid: false,
      updatedAt: false,
      indexes: [{ fields: ['user_id'] }, { fields: ['expires_at'] }],
    }
  );

  return RefreshToken;
};
