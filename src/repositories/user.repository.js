const BaseRepository = require('./base.repository');
const { User, Role, Company, Permission } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        },
        { model: Company, as: 'company' },
      ],
    });
  }

  async findByIdWithRelations(id) {
    return User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
        },
        { model: Company, as: 'company' },
      ],
    });
  }

  async findByCompany(companyId, options = {}) {
    return this.findPaginated({
      ...options,
      additionalWhere: { companyId },
      include: [{ model: Role, as: 'role' }],
      searchFields: ['first_name', 'last_name', 'email', 'employee_id'],
    });
  }

  async updateLastLogin(userId, ipAddress) {
    return User.update(
      {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        loginCount: User.sequelize.literal('login_count + 1'),
      },
      { where: { id: userId } }
    );
  }

  async setPasswordResetToken(userId, token, expires) {
    return User.update(
      { passwordResetToken: token, passwordResetExpires: expires },
      { where: { id: userId } }
    );
  }

  async findByResetToken(token) {
    const { Op } = require('sequelize');
    return User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });
  }
}

module.exports = new UserRepository();
