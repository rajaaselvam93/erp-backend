const userRepo = require('../repositories/user.repository');
const { User, Role } = require('../models');
const notificationService = require('./notification.service');

class UserService {
  async getUsers(companyId, options = {}) {
    return userRepo.findByCompany(companyId, options);
  }

  async getUserById(id) {
    const user = await userRepo.findByIdWithRelations(id);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  }

  async createUser(data, companyId) {
    // Check email uniqueness
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
    }

    // Validate role
    if (data.roleId) {
      const role = await Role.findByPk(data.roleId);
      if (!role) {
        throw Object.assign(new Error('Role not found'), { statusCode: 400 });
      }
    }

    const user = await userRepo.create({
      ...data,
      email: data.email.toLowerCase(),
      companyId,
    });

    await notificationService.create({
      userId: user.id,
      companyId,
      type: 'success',
      title: 'Welcome to Evvo ERP!',
      message: 'Your account has been created successfully.',
    });

    return userRepo.findByIdWithRelations(user.id);
  }

  async updateUser(id, data, requesterId) {
    const user = await userRepo.findById(id);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    // Prevent email conflicts
    if (data.email && data.email !== user.email) {
      const existing = await userRepo.findByEmail(data.email);
      if (existing) {
        throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
      }
    }

    // Don't allow password update through this service
    const { password, ...updateData } = data;
    if (updateData.email) updateData.email = updateData.email.toLowerCase();

    await user.update(updateData);
    return userRepo.findByIdWithRelations(id);
  }

  async deleteUser(id, requesterId) {
    if (id === requesterId) {
      throw Object.assign(new Error('Cannot delete your own account'), { statusCode: 400 });
    }

    const user = await userRepo.findById(id);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    if (user.role?.isSystem) {
      throw Object.assign(new Error('Cannot delete system users'), { statusCode: 400 });
    }

    await userRepo.delete(id);
  }

  async updatePreferences(userId, preferences) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    const mergedPrefs = { ...user.preferences, ...preferences };
    await user.update({ preferences: mergedPrefs });
    return mergedPrefs;
  }

  async updateAvatar(userId, avatarPath) {
    return userRepo.update(userId, { avatar: avatarPath });
  }

  async getUserStats(companyId) {
    const total = await User.count({ where: { companyId } });
    const active = await User.count({ where: { companyId, status: 'active' } });
    const inactive = await User.count({ where: { companyId, status: 'inactive' } });
    return { total, active, inactive };
  }
}

module.exports = new UserService();
