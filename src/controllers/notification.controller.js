const notificationService = require('../services/notification.service');
const response = require('../utils/response.util');

const getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await notificationService.getAll(req.userId, { page, limit });
    return response.paginated(res, result.data, result.total, result.page, result.limit);
  } catch (err) {
    next(err);
  }
};

const getUnread = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUnread(req.userId, 10);
    const unreadCount = await notificationService.getUnreadCount(req.userId);
    return response.success(res, { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.userId);
    return response.success(res, null, 'Marked as read');
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.userId);
    return response.success(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.delete(req.params.id, req.userId);
    return response.success(res, null, 'Notification deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, getUnread, markAsRead, markAllAsRead, deleteNotification };
