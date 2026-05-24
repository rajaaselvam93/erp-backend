const { sequelize } = require('../config/database');
const { User, Module, AuditLog } = require('../models');
const response = require('../utils/response.util');
const { Op } = require('sequelize');

const getStats = async (req, res, next) => {
  try {
    const companyId = req.companyId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, totalModules, activeModules, recentActivities] = await Promise.all([
      User.count({ where: { companyId } }),
      User.count({ where: { companyId, status: 'active' } }),
      Module.count({ where: { companyId } }),
      Module.count({ where: { companyId, isActive: true } }),
      AuditLog.count({ where: { companyId, createdAt: { [Op.gte]: thirtyDaysAgo } } }),
    ]);

    // ERP module KPIs — safe fallbacks if tables don't exist yet
    const safeQuery = async (sql, params) => {
      try {
        const [rows] = await sequelize.query(sql, { replacements: params });
        return rows[0]?.value ?? 0;
      } catch { return 0; }
    };

    const [employees, customers, openPOs, activeProjects, revenue, inventory] = await Promise.all([
      safeQuery('SELECT COUNT(*) as value FROM employees WHERE company_id = ? AND deleted_at IS NULL AND employment_status = "active"', [companyId]),
      safeQuery('SELECT COUNT(*) as value FROM customers WHERE company_id = ? AND deleted_at IS NULL AND status = "active"', [companyId]),
      safeQuery('SELECT COUNT(*) as value FROM purchase_orders WHERE company_id = ? AND deleted_at IS NULL AND status IN ("submitted","approved","sent")', [companyId]),
      safeQuery('SELECT COUNT(*) as value FROM projects WHERE company_id = ? AND deleted_at IS NULL AND status = "active"', [companyId]),
      safeQuery('SELECT COALESCE(SUM(total_amount), 0) as value FROM sales_orders WHERE company_id = ? AND deleted_at IS NULL AND status IN ("confirmed","processing","shipped","delivered")', [companyId]),
      safeQuery('SELECT COUNT(*) as value FROM inventory_items WHERE company_id = ? AND deleted_at IS NULL AND is_active = 1', [companyId]),
    ]);

    return response.success(res, {
      users: { total: totalUsers, active: activeUsers },
      modules: { total: totalModules, active: activeModules },
      activity: { last30Days: recentActivities },
      erp: {
        employees: parseInt(employees),
        customers: parseInt(customers),
        openPurchaseOrders: parseInt(openPOs),
        activeProjects: parseInt(activeProjects),
        totalRevenue: parseFloat(revenue),
        inventoryItems: parseInt(inventory),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const { User: UserModel } = require('../models');

    const activities = await AuditLog.findAll({
      where: { companyId: req.companyId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      include: [{ model: UserModel, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }],
    });

    return response.success(res, activities);
  } catch (err) {
    next(err);
  }
};

const getActivityChart = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [results] = await sequelize.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM audit_logs
       WHERE company_id = ? AND created_at >= ?
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      { replacements: [req.companyId, startDate] }
    );

    return response.success(res, results);
  } catch (err) {
    next(err);
  }
};

const getUserGrowth = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const [results] = await sequelize.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
       FROM users
       WHERE company_id = ? AND created_at >= ? AND deleted_at IS NULL
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      { replacements: [req.companyId, startDate] }
    );

    return response.success(res, results);
  } catch (err) {
    next(err);
  }
};

const getModuleUsage = async (req, res, next) => {
  try {
    const [results] = await sequelize.query(
      `SELECT module, COUNT(*) as count
       FROM audit_logs
       WHERE company_id = ? AND module IS NOT NULL
       GROUP BY module
       ORDER BY count DESC
       LIMIT 10`,
      { replacements: [req.companyId] }
    );

    return response.success(res, results);
  } catch (err) {
    next(err);
  }
};

const getWidgetData = async (req, res, next) => {
  try {
    const { widgetType, moduleSlug, field, dateField = 'created_at', days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    if (!moduleSlug) return response.badRequest(res, 'moduleSlug required');

    const { Module: Mod } = require('../models');
    const mod = await Mod.findOne({ where: { slug: moduleSlug, companyId: req.companyId } });
    if (!mod) return response.notFound(res, 'Module not found');

    let sql;
    if (widgetType === 'count') {
      sql = `SELECT COUNT(*) as value FROM \`${mod.tableName}\` WHERE company_id = ? AND deleted_at IS NULL`;
    } else if (widgetType === 'sum' && field) {
      sql = `SELECT SUM(\`${field}\`) as value FROM \`${mod.tableName}\` WHERE company_id = ? AND deleted_at IS NULL`;
    } else if (widgetType === 'chart') {
      sql = `SELECT DATE(\`${dateField}\`) as date, COUNT(*) as count FROM \`${mod.tableName}\` WHERE company_id = ? AND \`${dateField}\` >= ? AND deleted_at IS NULL GROUP BY DATE(\`${dateField}\`) ORDER BY date ASC`;
    } else {
      return response.badRequest(res, 'Invalid widget type');
    }

    const replacements = widgetType === 'chart' ? [req.companyId, startDate] : [req.companyId];
    const [result] = await sequelize.query(sql, { replacements });
    return response.success(res, result);
  } catch (err) {
    next(err);
  }
};

// ERP-level aggregate dashboard
const getERPDashboard = async (req, res, next) => {
  try {
    const companyId = req.companyId;
    const safeQuery = async (sql, params) => {
      try {
        const [rows] = await sequelize.query(sql, { replacements: params });
        return rows;
      } catch { return []; }
    };

    const [revenueByMonth, topCustomers, inventoryAlerts, projectProgress] = await Promise.all([
      safeQuery(
        `SELECT DATE_FORMAT(order_date, '%Y-%m') as month, SUM(total_amount) as revenue
         FROM sales_orders WHERE company_id = ? AND deleted_at IS NULL AND status NOT IN ('draft','cancelled')
         GROUP BY month ORDER BY month DESC LIMIT 6`,
        [companyId]
      ),
      safeQuery(
        `SELECT c.customer_name, SUM(so.total_amount) as total
         FROM sales_orders so JOIN customers c ON c.id = so.customer_id
         WHERE so.company_id = ? AND so.deleted_at IS NULL
         GROUP BY c.id ORDER BY total DESC LIMIT 5`,
        [companyId]
      ),
      safeQuery(
        `SELECT item_name, current_stock, reorder_level FROM inventory_items
         WHERE company_id = ? AND deleted_at IS NULL AND is_tracked = 1 AND current_stock <= reorder_level LIMIT 10`,
        [companyId]
      ),
      safeQuery(
        `SELECT project_name, progress_percent, status, end_date FROM projects
         WHERE company_id = ? AND deleted_at IS NULL AND status = 'active' ORDER BY end_date ASC LIMIT 5`,
        [companyId]
      ),
    ]);

    return response.success(res, { revenueByMonth, topCustomers, inventoryAlerts, projectProgress });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getRecentActivity, getActivityChart, getUserGrowth, getModuleUsage, getWidgetData, getERPDashboard };
