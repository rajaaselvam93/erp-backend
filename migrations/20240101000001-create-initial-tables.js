'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Companies
    await queryInterface.createTable('companies', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(200), allowNull: false },
      slug: { type: Sequelize.STRING(100), unique: true, allowNull: false },
      email: { type: Sequelize.STRING(255) },
      phone: { type: Sequelize.STRING(30) },
      website: { type: Sequelize.STRING(255) },
      address: { type: Sequelize.TEXT },
      city: { type: Sequelize.STRING(100) },
      state: { type: Sequelize.STRING(100) },
      country: { type: Sequelize.STRING(100) },
      zip_code: { type: Sequelize.STRING(20) },
      logo: { type: Sequelize.STRING(500) },
      currency: { type: Sequelize.STRING(10), defaultValue: 'USD' },
      timezone: { type: Sequelize.STRING(50), defaultValue: 'UTC' },
      date_format: { type: Sequelize.STRING(20), defaultValue: 'YYYY-MM-DD' },
      fiscal_year_start: { type: Sequelize.STRING(5), defaultValue: '01-01' },
      tax_number: { type: Sequelize.STRING(100) },
      registration_number: { type: Sequelize.STRING(100) },
      industry: { type: Sequelize.STRING(100) },
      size: { type: Sequelize.ENUM('startup', 'small', 'medium', 'large', 'enterprise'), defaultValue: 'small' },
      plan: { type: Sequelize.ENUM('free', 'basic', 'professional', 'enterprise'), defaultValue: 'free' },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      settings: { type: Sequelize.JSON, defaultValue: {} },
      modules: { type: Sequelize.JSON, defaultValue: [] },
      theme: { type: Sequelize.JSON, defaultValue: {} },
      trial_ends_at: { type: Sequelize.DATE },
      subscription_ends_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // Roles
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT },
      is_system: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      level: { type: Sequelize.INTEGER, defaultValue: 10 },
      dashboard_config: { type: Sequelize.JSON, defaultValue: {} },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // Permissions
    await queryInterface.createTable('permissions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      slug: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      module: { type: Sequelize.STRING(100), allowNull: false },
      action: { type: Sequelize.ENUM('create', 'read', 'update', 'delete', 'export', 'import', 'approve', 'custom'), allowNull: false },
      resource: { type: Sequelize.STRING(100) },
      description: { type: Sequelize.TEXT },
      is_system: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Role Permissions (junction)
    await queryInterface.createTable('role_permissions', {
      role_id: { type: Sequelize.UUID, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE' },
      permission_id: { type: Sequelize.UUID, references: { model: 'permissions', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id', 'permission_id'],
      type: 'primary key',
      name: 'role_permissions_pkey',
    });

    // Users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'SET NULL' },
      role_id: { type: Sequelize.UUID, references: { model: 'roles', key: 'id' }, onDelete: 'SET NULL' },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      phone: { type: Sequelize.STRING(30) },
      avatar: { type: Sequelize.STRING(500) },
      employee_id: { type: Sequelize.STRING(50) },
      department: { type: Sequelize.STRING(100) },
      designation: { type: Sequelize.STRING(150) },
      timezone: { type: Sequelize.STRING(50), defaultValue: 'UTC' },
      language: { type: Sequelize.STRING(10), defaultValue: 'en' },
      status: { type: Sequelize.ENUM('active', 'inactive', 'suspended', 'pending'), defaultValue: 'active' },
      is_email_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_two_factor_enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
      two_factor_secret: { type: Sequelize.STRING(255) },
      last_login_at: { type: Sequelize.DATE },
      last_login_ip: { type: Sequelize.STRING(50) },
      login_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      password_changed_at: { type: Sequelize.DATE },
      password_reset_token: { type: Sequelize.STRING(255) },
      password_reset_expires: { type: Sequelize.DATE },
      email_verification_token: { type: Sequelize.STRING(255) },
      preferences: { type: Sequelize.JSON, defaultValue: {} },
      permissions: { type: Sequelize.JSON, defaultValue: [] },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // Modules
    await queryInterface.createTable('modules', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(150), allowNull: false },
      slug: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT },
      icon: { type: Sequelize.STRING(50), defaultValue: 'database' },
      color: { type: Sequelize.STRING(20), defaultValue: '#6366f1' },
      table_name: { type: Sequelize.STRING(100), allowNull: false },
      category: { type: Sequelize.ENUM('core', 'hrm', 'crm', 'finance', 'inventory', 'sales', 'purchase', 'projects', 'support', 'custom'), defaultValue: 'custom' },
      is_system: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_public: { type: Sequelize.BOOLEAN, defaultValue: false },
      version: { type: Sequelize.STRING(20), defaultValue: '1.0.0' },
      api_endpoint: { type: Sequelize.STRING(200) },
      settings: { type: Sequelize.JSON, defaultValue: {} },
      list_config: { type: Sequelize.JSON, defaultValue: {} },
      form_config: { type: Sequelize.JSON, defaultValue: {} },
      dashboard_config: { type: Sequelize.JSON, defaultValue: {} },
      workflow_id: { type: Sequelize.UUID },
      permissions: { type: Sequelize.JSON, defaultValue: {} },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // Module Fields
    await queryInterface.createTable('module_fields', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      module_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'modules', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(100), allowNull: false },
      column_name: { type: Sequelize.STRING(100), allowNull: false },
      field_type: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'text' },
      data_type: { type: Sequelize.STRING(50) },
      label: { type: Sequelize.STRING(150) },
      placeholder: { type: Sequelize.STRING(255) },
      help_text: { type: Sequelize.STRING(500) },
      default_value: { type: Sequelize.TEXT },
      is_required: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_unique: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_read_only: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_hidden: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_searchable: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_sortable: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_filterable: { type: Sequelize.BOOLEAN, defaultValue: false },
      show_in_list: { type: Sequelize.BOOLEAN, defaultValue: true },
      show_in_form: { type: Sequelize.BOOLEAN, defaultValue: true },
      show_in_detail: { type: Sequelize.BOOLEAN, defaultValue: true },
      validation: { type: Sequelize.JSON, defaultValue: {} },
      options: { type: Sequelize.JSON, defaultValue: [] },
      relation_config: { type: Sequelize.JSON },
      formula: { type: Sequelize.TEXT },
      width: { type: Sequelize.INTEGER, defaultValue: 150 },
      section: { type: Sequelize.STRING(100) },
      col_span: { type: Sequelize.INTEGER, defaultValue: 1 },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      styles: { type: Sequelize.JSON, defaultValue: {} },
      conditional_display: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // Menus
    await queryInterface.createTable('menus', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      module_id: { type: Sequelize.UUID, references: { model: 'modules', key: 'id' }, onDelete: 'SET NULL' },
      parent_id: { type: Sequelize.UUID },
      role_id: { type: Sequelize.UUID, references: { model: 'roles', key: 'id' }, onDelete: 'SET NULL' },
      company_id: { type: Sequelize.UUID },
      name: { type: Sequelize.STRING(100), allowNull: false },
      path: { type: Sequelize.STRING(255) },
      icon: { type: Sequelize.STRING(50) },
      badge: { type: Sequelize.STRING(20) },
      badge_color: { type: Sequelize.STRING(20) },
      target: { type: Sequelize.ENUM('_self', '_blank'), defaultValue: '_self' },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_system: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      permissions: { type: Sequelize.JSON, defaultValue: [] },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // Notifications
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      company_id: { type: Sequelize.UUID },
      type: { type: Sequelize.ENUM('info', 'success', 'warning', 'error', 'approval', 'mention', 'system', 'reminder'), defaultValue: 'info' },
      title: { type: Sequelize.STRING(255), allowNull: false },
      message: { type: Sequelize.TEXT },
      icon: { type: Sequelize.STRING(50) },
      color: { type: Sequelize.STRING(20) },
      link: { type: Sequelize.STRING(500) },
      module: { type: Sequelize.STRING(100) },
      resource_id: { type: Sequelize.STRING(100) },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      read_at: { type: Sequelize.DATE },
      channels: { type: Sequelize.JSON, defaultValue: ['in_app'] },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Audit Logs
    await queryInterface.createTable('audit_logs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID },
      company_id: { type: Sequelize.UUID },
      action: { type: Sequelize.ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject', 'custom'), allowNull: false },
      module: { type: Sequelize.STRING(100) },
      resource_id: { type: Sequelize.STRING(100) },
      resource_type: { type: Sequelize.STRING(100) },
      description: { type: Sequelize.TEXT },
      old_values: { type: Sequelize.JSON },
      new_values: { type: Sequelize.JSON },
      ip_address: { type: Sequelize.STRING(50) },
      user_agent: { type: Sequelize.STRING(500) },
      status: { type: Sequelize.ENUM('success', 'failed', 'warning'), defaultValue: 'success' },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Refresh Tokens
    await queryInterface.createTable('refresh_tokens', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token: { type: Sequelize.TEXT, allowNull: false },
      device_info: { type: Sequelize.JSON, defaultValue: {} },
      ip_address: { type: Sequelize.STRING(50) },
      is_revoked: { type: Sequelize.BOOLEAN, defaultValue: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Settings
    await queryInterface.createTable('settings', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      key: { type: Sequelize.STRING(200), allowNull: false },
      value: { type: Sequelize.TEXT },
      type: { type: Sequelize.ENUM('string', 'number', 'boolean', 'json', 'encrypted'), defaultValue: 'string' },
      group: { type: Sequelize.STRING(100) },
      label: { type: Sequelize.STRING(200) },
      description: { type: Sequelize.TEXT },
      is_public: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_system: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Workflows
    await queryInterface.createTable('workflows', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      module_id: { type: Sequelize.UUID },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      trigger: { type: Sequelize.ENUM('on_create', 'on_update', 'on_delete', 'on_status_change', 'manual', 'scheduled'), defaultValue: 'manual' },
      trigger_conditions: { type: Sequelize.JSON, defaultValue: {} },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_parallel: { type: Sequelize.BOOLEAN, defaultValue: false },
      notify_on_complete: { type: Sequelize.BOOLEAN, defaultValue: true },
      notify_on_reject: { type: Sequelize.BOOLEAN, defaultValue: true },
      auto_approve_on_timeout: { type: Sequelize.BOOLEAN, defaultValue: false },
      timeout_hours: { type: Sequelize.INTEGER, defaultValue: 72 },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // Workflow Steps
    await queryInterface.createTable('workflow_steps', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      workflow_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'workflows', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      step_order: { type: Sequelize.INTEGER, allowNull: false },
      step_type: { type: Sequelize.ENUM('approval', 'notification', 'action', 'condition', 'delay'), defaultValue: 'approval' },
      approver_type: { type: Sequelize.ENUM('user', 'role', 'manager', 'department_head', 'dynamic'), defaultValue: 'role' },
      approver_config: { type: Sequelize.JSON, defaultValue: {} },
      require_all_approvers: { type: Sequelize.BOOLEAN, defaultValue: false },
      auto_approve: { type: Sequelize.BOOLEAN, defaultValue: false },
      timeout_hours: { type: Sequelize.INTEGER, defaultValue: 48 },
      on_approve: { type: Sequelize.JSON, defaultValue: {} },
      on_reject: { type: Sequelize.JSON, defaultValue: {} },
      on_timeout: { type: Sequelize.JSON, defaultValue: {} },
      conditions: { type: Sequelize.JSON, defaultValue: [] },
      notify_approver: { type: Sequelize.BOOLEAN, defaultValue: true },
      notify_requester: { type: Sequelize.BOOLEAN, defaultValue: true },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // Workflow Instances
    await queryInterface.createTable('workflow_instances', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      workflow_id: { type: Sequelize.UUID, allowNull: false },
      company_id: { type: Sequelize.UUID },
      resource_id: { type: Sequelize.STRING(100), allowNull: false },
      resource_type: { type: Sequelize.STRING(100), allowNull: false },
      initiated_by: { type: Sequelize.UUID },
      current_step: { type: Sequelize.INTEGER, defaultValue: 1 },
      current_approver_id: { type: Sequelize.UUID },
      status: { type: Sequelize.ENUM('pending', 'in_progress', 'approved', 'rejected', 'cancelled', 'expired'), defaultValue: 'pending' },
      step_history: { type: Sequelize.JSON, defaultValue: [] },
      completed_at: { type: Sequelize.DATE },
      rejected_at: { type: Sequelize.DATE },
      rejection_reason: { type: Sequelize.TEXT },
      comments: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // User Activities
    await queryInterface.createTable('user_activities', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      company_id: { type: Sequelize.UUID },
      type: { type: Sequelize.ENUM('page_view', 'module_access', 'search', 'export', 'login', 'logout', 'api_call'), defaultValue: 'page_view' },
      module: { type: Sequelize.STRING(100) },
      path: { type: Sequelize.STRING(500) },
      duration: { type: Sequelize.INTEGER },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Indexes
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['company_id']);
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('modules', ['company_id', 'slug']);
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['company_id']);
    await queryInterface.addIndex('audit_logs', ['created_at']);
    await queryInterface.addIndex('notifications', ['user_id', 'is_read']);
    await queryInterface.addIndex('refresh_tokens', ['user_id']);
  },

  async down(queryInterface) {
    const tables = [
      'user_activities', 'workflow_instances', 'workflow_steps', 'workflows',
      'settings', 'refresh_tokens', 'audit_logs', 'notifications', 'menus',
      'module_fields', 'modules', 'users', 'role_permissions', 'permissions',
      'roles', 'companies',
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table, { force: true });
    }
  },
};
