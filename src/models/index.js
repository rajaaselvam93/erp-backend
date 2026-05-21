const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import all models
const Company = require('./Company.model')(sequelize, DataTypes);
const Role = require('./Role.model')(sequelize, DataTypes);
const Permission = require('./Permission.model')(sequelize, DataTypes);
const User = require('./User.model')(sequelize, DataTypes);
const Module = require('./Module.model')(sequelize, DataTypes);
const ModuleField = require('./ModuleField.model')(sequelize, DataTypes);
const Menu = require('./Menu.model')(sequelize, DataTypes);
const AuditLog = require('./AuditLog.model')(sequelize, DataTypes);
const Notification = require('./Notification.model')(sequelize, DataTypes);
const Workflow = require('./Workflow.model')(sequelize, DataTypes);
const WorkflowStep = require('./WorkflowStep.model')(sequelize, DataTypes);
const WorkflowInstance = require('./WorkflowInstance.model')(sequelize, DataTypes);
const RefreshToken = require('./RefreshToken.model')(sequelize, DataTypes);
const Setting = require('./Setting.model')(sequelize, DataTypes);
const UserActivity = require('./UserActivity.model')(sequelize, DataTypes);

// ─── Associations ────────────────────────────────────────────────────────────

// Company
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
Company.hasMany(Module, { foreignKey: 'company_id', as: 'companyModules' });
Company.hasMany(Setting, { foreignKey: 'company_id', as: 'companySettings' });

// User
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
User.hasMany(UserActivity, { foreignKey: 'user_id', as: 'activities' });

// Role & Permission
Role.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
Role.belongsToMany(Permission, { through: 'role_permissions', foreignKey: 'role_id', as: 'permissions' });
Permission.belongsToMany(Role, { through: 'role_permissions', foreignKey: 'permission_id', as: 'roles' });

// Module
Module.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Module.hasMany(ModuleField, { foreignKey: 'module_id', as: 'fields' });
Module.hasMany(Menu, { foreignKey: 'module_id', as: 'menus' });
ModuleField.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

// Menu
Menu.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
Menu.belongsTo(Menu, { foreignKey: 'parent_id', as: 'parent' });
Menu.hasMany(Menu, { foreignKey: 'parent_id', as: 'children' });
Menu.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Workflow
Workflow.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
Workflow.hasMany(WorkflowStep, { foreignKey: 'workflow_id', as: 'steps' });
WorkflowStep.belongsTo(Workflow, { foreignKey: 'workflow_id', as: 'workflow' });
WorkflowInstance.belongsTo(Workflow, { foreignKey: 'workflow_id', as: 'workflow' });
WorkflowInstance.belongsTo(User, { foreignKey: 'initiated_by', as: 'initiator' });
WorkflowInstance.belongsTo(User, { foreignKey: 'current_approver_id', as: 'currentApprover' });

const db = {
  sequelize,
  Company,
  Role,
  Permission,
  User,
  Module,
  ModuleField,
  Menu,
  AuditLog,
  Notification,
  Workflow,
  WorkflowStep,
  WorkflowInstance,
  RefreshToken,
  Setting,
  UserActivity,
};

module.exports = db;
