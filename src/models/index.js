const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// ─── Core Models ──────────────────────────────────────────────────────────────
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

// ─── Business Models ──────────────────────────────────────────────────────────
const Department = require('./Department.model')(sequelize, DataTypes);
const Employee = require('./Employee.model')(sequelize, DataTypes);
const Customer = require('./Customer.model')(sequelize, DataTypes);
const Lead = require('./Lead.model')(sequelize, DataTypes);
const Vendor = require('./Vendor.model')(sequelize, DataTypes);
const Warehouse = require('./Warehouse.model')(sequelize, DataTypes);

const { PurchaseOrder, PurchaseOrderLine } = require('./PurchaseOrder.model')(sequelize, DataTypes);
const { InventoryItem, InventoryTransaction } = require('./InventoryItem.model')(sequelize, DataTypes);
const { SalesOrder, SalesOrderLine } = require('./SalesOrder.model')(sequelize, DataTypes);
const Invoice = require('./Invoice.model')(sequelize, DataTypes);
const { Project, ProjectTask } = require('./Project.model')(sequelize, DataTypes);
const { ChartOfAccount, JournalEntry, JournalEntryLine } = require('./Finance.model')(sequelize, DataTypes);

// ─── Core Associations ────────────────────────────────────────────────────────

Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
Company.hasMany(Module, { foreignKey: 'company_id', as: 'companyModules' });
Company.hasMany(Setting, { foreignKey: 'company_id', as: 'companySettings' });

User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
User.hasMany(UserActivity, { foreignKey: 'user_id', as: 'activities' });

Role.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
Role.belongsToMany(Permission, { through: 'role_permissions', foreignKey: 'role_id', as: 'permissions' });
Permission.belongsToMany(Role, { through: 'role_permissions', foreignKey: 'permission_id', as: 'roles' });

Module.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Module.hasMany(ModuleField, { foreignKey: 'module_id', as: 'fields' });
Module.hasMany(Menu, { foreignKey: 'module_id', as: 'menus' });
ModuleField.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });

Menu.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
Menu.belongsTo(Menu, { foreignKey: 'parent_id', as: 'parent' });
Menu.hasMany(Menu, { foreignKey: 'parent_id', as: 'children' });
Menu.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

Workflow.belongsTo(Module, { foreignKey: 'module_id', as: 'module' });
Workflow.hasMany(WorkflowStep, { foreignKey: 'workflow_id', as: 'steps' });
WorkflowStep.belongsTo(Workflow, { foreignKey: 'workflow_id', as: 'workflow' });
WorkflowInstance.belongsTo(Workflow, { foreignKey: 'workflow_id', as: 'workflow' });
WorkflowInstance.belongsTo(User, { foreignKey: 'initiated_by', as: 'initiator' });
WorkflowInstance.belongsTo(User, { foreignKey: 'current_approver_id', as: 'currentApprover' });

// ─── HRMS Associations ────────────────────────────────────────────────────────
Department.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });

Employee.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Employee.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── CRM Associations ─────────────────────────────────────────────────────────
Customer.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Customer.hasMany(SalesOrder, { foreignKey: 'customer_id', as: 'salesOrders' });
Customer.hasMany(Lead, { foreignKey: 'converted_customer_id', as: 'convertedLeads' });

Lead.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Lead.belongsTo(Customer, { foreignKey: 'converted_customer_id', as: 'convertedCustomer' });

// ─── Procurement Associations ─────────────────────────────────────────────────
Vendor.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Vendor.hasMany(PurchaseOrder, { foreignKey: 'vendor_id', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

// ─── Inventory Associations ───────────────────────────────────────────────────
Warehouse.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Warehouse.hasMany(InventoryItem, { foreignKey: 'warehouse_id', as: 'items' });
InventoryItem.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });

// ─── Sales Associations ───────────────────────────────────────────────────────
SalesOrder.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
SalesOrder.hasMany(Invoice, { foreignKey: 'sales_order_id', as: 'invoices' });
Invoice.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });
Invoice.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// ─── Finance Associations ─────────────────────────────────────────────────────
ChartOfAccount.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
JournalEntry.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// ─── Project Associations ─────────────────────────────────────────────────────
Project.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

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
  // Business models
  Department,
  Employee,
  Customer,
  Lead,
  Vendor,
  Warehouse,
  PurchaseOrder,
  PurchaseOrderLine,
  InventoryItem,
  InventoryTransaction,
  SalesOrder,
  SalesOrderLine,
  Invoice,
  Project,
  ProjectTask,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
};

module.exports = db;
