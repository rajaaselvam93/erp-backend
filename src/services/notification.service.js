const { Notification } = require('../models');
const { emitToUser } = require('../config/socket');
const emailService = require('./email.service');
const logger = require('../utils/logger.util');

class NotificationService {
  async create(data) {
    try {
      const notification = await Notification.create(data);

      // Emit real-time notification
      try {
        emitToUser(data.userId, 'notification:new', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          createdAt: notification.createdAt,
        });
      } catch {
        // Socket not initialized, skip
      }

      // Send email if in channels
      const channels = data.channels || ['in_app'];
      if (channels.includes('email') && emailService.isConfigured()) {
        try {
          const { User } = require('../models');
          const user = await User.findByPk(data.userId);
          if (user) {
            await emailService.sendNotification(user.email, data.title, data.message);
          }
        } catch (err) {
          logger.error('Email notification failed:', err);
        }
      }

      return notification;
    } catch (err) {
      logger.error('Failed to create notification:', err);
    }
  }

  async getUnread(userId, limit = 10) {
    return Notification.findAll({
      where: { userId, isRead: false },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  async getAll(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const { rows, count } = await Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async markAsRead(id, userId) {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { id, userId } }
    );
  }

  async markAllAsRead(userId) {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );
  }

  async getUnreadCount(userId) {
    return Notification.count({ where: { userId, isRead: false } });
  }

  async delete(id, userId) {
    await Notification.destroy({ where: { id, userId } });
  }

  async broadcast(companyId, data) {
    const { User } = require('../models');
    const users = await User.findAll({ where: { companyId, status: 'active' }, attributes: ['id'] });
    const notifications = users.map((u) => ({ ...data, userId: u.id }));
    await Notification.bulkCreate(notifications);

    // Emit to company room
    try {
      const { emitToCompany } = require('../config/socket');
      emitToCompany(companyId, 'notification:broadcast', data);
    } catch {
      // socket not ready
    }
  }
}

module.exports = new NotificationService();
