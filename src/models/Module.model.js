const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Module extends Model {}

  Module.init(
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
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: { type: DataTypes.TEXT },
      icon: { type: DataTypes.STRING(50), defaultValue: 'database' },
      color: { type: DataTypes.STRING(20), defaultValue: '#6366f1' },
      tableName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'MySQL table name for this module',
      },
      category: {
        type: DataTypes.ENUM('core', 'hrm', 'crm', 'finance', 'inventory', 'sales', 'purchase', 'projects', 'support', 'custom'),
        defaultValue: 'custom',
      },
      isSystem: { type: DataTypes.BOOLEAN, defaultValue: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
      version: { type: DataTypes.STRING(20), defaultValue: '1.0.0' },
      apiEndpoint: {
        type: DataTypes.STRING(200),
        comment: 'Auto-generated API base path',
      },
      // Module configuration
      settings: {
        type: DataTypes.JSON,
        defaultValue: {
          allowExport: true,
          allowImport: true,
          allowBulkDelete: false,
          enableWorkflow: false,
          enableAuditLog: true,
          paginationDefault: 20,
          searchEnabled: true,
        },
      },
      // List view configuration
      listConfig: {
        type: DataTypes.JSON,
        defaultValue: {
          columns: [],
          defaultSort: 'createdAt',
          defaultSortOrder: 'DESC',
          rowActions: ['view', 'edit', 'delete'],
          bulkActions: [],
        },
      },
      // Form configuration
      formConfig: {
        type: DataTypes.JSON,
        defaultValue: {
          layout: 'single-column',
          sections: [],
          submitLabel: 'Save',
          cancelLabel: 'Cancel',
        },
      },
      // Dashboard widgets config
      dashboardConfig: {
        type: DataTypes.JSON,
        defaultValue: {
          widgets: [],
          stats: [],
        },
      },
      // Workflow reference
      workflowId: {
        type: DataTypes.UUID,
        field: 'workflow_id',
        allowNull: true,
      },
      // Permissions config
      permissions: {
        type: DataTypes.JSON,
        defaultValue: {
          create: [],
          read: [],
          update: [],
          delete: [],
          export: [],
          import: [],
        },
      },
      sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
      metadata: { type: DataTypes.JSON, defaultValue: {} },
    },
    {
      sequelize,
      modelName: 'Module',
      tableName: 'modules',
      paranoid: true,
      indexes: [
        { fields: ['company_id', 'slug'], unique: true },
        { fields: ['is_active'] },
        { fields: ['category'] },
      ],
    }
  );

  return Module;
};
