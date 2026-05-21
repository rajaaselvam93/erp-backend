const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    async comparePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      delete values.twoFactorSecret;
      return values;
    }
  }

  User.init(
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
      roleId: {
        type: DataTypes.UUID,
        field: 'role_id',
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [1, 100] },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: { type: DataTypes.STRING(30) },
      avatar: { type: DataTypes.STRING(500) },
      employeeId: { type: DataTypes.STRING(50) },
      department: { type: DataTypes.STRING(100) },
      designation: { type: DataTypes.STRING(150) },
      timezone: { type: DataTypes.STRING(50), defaultValue: 'UTC' },
      language: { type: DataTypes.STRING(10), defaultValue: 'en' },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
        defaultValue: 'active',
      },
      isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      isTwoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      twoFactorSecret: { type: DataTypes.STRING(255) },
      lastLoginAt: { type: DataTypes.DATE },
      lastLoginIp: { type: DataTypes.STRING(50) },
      loginCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      passwordChangedAt: { type: DataTypes.DATE },
      passwordResetToken: { type: DataTypes.STRING(255) },
      passwordResetExpires: { type: DataTypes.DATE },
      emailVerificationToken: { type: DataTypes.STRING(255) },
      preferences: {
        type: DataTypes.JSON,
        defaultValue: {
          theme: 'light',
          sidebarCollapsed: false,
          notifications: true,
          emailNotifications: true,
          language: 'en',
          dateFormat: 'YYYY-MM-DD',
        },
      },
      permissions: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Additional permissions beyond role permissions',
      },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 12);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 12);
            user.passwordChangedAt = new Date();
          }
        },
      },
      indexes: [
        { fields: ['email'], unique: true },
        { fields: ['company_id'] },
        { fields: ['role_id'] },
        { fields: ['status'] },
        { fields: ['employee_id'] },
      ],
    }
  );

  return User;
};
