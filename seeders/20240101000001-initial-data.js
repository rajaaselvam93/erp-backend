'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    // ─── Company ──────────────────────────────────────────────────────────────
    const companyId = uuidv4();
    await queryInterface.bulkInsert('companies', [{
      id: companyId,
      name: 'Evvo Technologies',
      slug: 'evvo-technologies',
      email: 'admin@evvoerp.com',
      phone: '+1-555-000-0001',
      website: 'https://evvoerp.com',
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zip_code: '94105',
      currency: 'USD',
      timezone: 'America/New_York',
      industry: 'Technology',
      size: 'medium',
      plan: 'enterprise',
      is_active: true,
      settings: JSON.stringify({}),
      modules: JSON.stringify([]),
      theme: JSON.stringify({ primaryColor: '#6366f1', darkMode: false }),
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    // ─── Roles ────────────────────────────────────────────────────────────────
    const superAdminRoleId = uuidv4();
    const adminRoleId = uuidv4();
    const managerRoleId = uuidv4();
    const employeeRoleId = uuidv4();
    const viewerRoleId = uuidv4();

    await queryInterface.bulkInsert('roles', [
      { id: superAdminRoleId, company_id: null, name: 'Super Admin', slug: 'super-admin', description: 'Full system access', is_system: true, is_active: true, level: 100, dashboard_config: JSON.stringify({}), metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
      { id: adminRoleId, company_id: companyId, name: 'Administrator', slug: 'admin', description: 'Company administrator', is_system: true, is_active: true, level: 90, dashboard_config: JSON.stringify({}), metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
      { id: managerRoleId, company_id: companyId, name: 'Manager', slug: 'manager', description: 'Department manager', is_system: true, is_active: true, level: 50, dashboard_config: JSON.stringify({}), metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
      { id: employeeRoleId, company_id: companyId, name: 'Employee', slug: 'employee', description: 'Regular employee', is_system: true, is_active: true, level: 10, dashboard_config: JSON.stringify({}), metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
      { id: viewerRoleId, company_id: companyId, name: 'Viewer', slug: 'viewer', description: 'Read-only access', is_system: true, is_active: true, level: 5, dashboard_config: JSON.stringify({}), metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Permissions ──────────────────────────────────────────────────────────
    const modules = ['users', 'roles', 'modules', 'companies', 'hrm', 'crm', 'finance', 'inventory', 'sales', 'purchase', 'projects', 'reports'];
    const actions = ['create', 'read', 'update', 'delete', 'export', 'import'];

    const permissions = [];
    const permissionIds = [];

    for (const mod of modules) {
      for (const action of actions) {
        const id = uuidv4();
        permissionIds.push({ id, mod, action });
        permissions.push({
          id,
          name: `${mod.charAt(0).toUpperCase() + mod.slice(1)} - ${action.charAt(0).toUpperCase() + action.slice(1)}`,
          slug: `${mod}.${action}`,
          module: mod,
          action,
          description: `Can ${action} ${mod}`,
          is_system: true,
          created_at: new Date(),
        });
      }
    }
    await queryInterface.bulkInsert('permissions', permissions);

    // Assign all permissions to admin role
    const adminRolePermissions = permissionIds.map(({ id }) => ({
      role_id: adminRoleId,
      permission_id: id,
      created_at: new Date(),
    }));
    await queryInterface.bulkInsert('role_permissions', adminRolePermissions);

    // Assign read permissions to viewer role
    const viewerPerms = permissionIds
      .filter(({ action }) => action === 'read')
      .map(({ id }) => ({
        role_id: viewerRoleId,
        permission_id: id,
        created_at: new Date(),
      }));
    await queryInterface.bulkInsert('role_permissions', viewerPerms);

    // ─── Users ────────────────────────────────────────────────────────────────
    const superAdminId = uuidv4();
    const adminId = uuidv4();

    await queryInterface.bulkInsert('users', [
      {
        id: superAdminId,
        company_id: null,
        role_id: superAdminRoleId,
        first_name: 'Super',
        last_name: 'Admin',
        email: 'superadmin@evvoerp.com',
        password: await bcrypt.hash('SuperAdmin@123', 12),
        status: 'active',
        is_email_verified: true,
        login_count: 0,
        preferences: JSON.stringify({ theme: 'light', language: 'en' }),
        permissions: JSON.stringify(['*']),
        metadata: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: adminId,
        company_id: companyId,
        role_id: adminRoleId,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@evvoerp.com',
        password: await bcrypt.hash('Admin@123', 12),
        department: 'Administration',
        designation: 'System Administrator',
        employee_id: 'EMP001',
        status: 'active',
        is_email_verified: true,
        login_count: 0,
        preferences: JSON.stringify({ theme: 'light', language: 'en' }),
        permissions: JSON.stringify([]),
        metadata: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        company_id: companyId,
        role_id: managerRoleId,
        first_name: 'John',
        last_name: 'Manager',
        email: 'manager@evvoerp.com',
        password: await bcrypt.hash('Manager@123', 12),
        department: 'Operations',
        designation: 'Operations Manager',
        employee_id: 'EMP002',
        status: 'active',
        is_email_verified: true,
        login_count: 0,
        preferences: JSON.stringify({ theme: 'light', language: 'en' }),
        permissions: JSON.stringify([]),
        metadata: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // ─── System Modules ───────────────────────────────────────────────────────
    const systemModules = [
      { name: 'HRMS', slug: 'hrm', icon: 'users', color: '#8b5cf6', category: 'hrm', tableName: 'hrm_employees' },
      { name: 'CRM', slug: 'crm', icon: 'user-heart', color: '#ec4899', category: 'crm', tableName: 'crm_contacts' },
      { name: 'Finance', slug: 'finance', icon: 'dollar-sign', color: '#10b981', category: 'finance', tableName: 'fin_transactions' },
      { name: 'Inventory', slug: 'inventory', icon: 'package', color: '#f59e0b', category: 'inventory', tableName: 'inv_products' },
      { name: 'Sales', slug: 'sales', icon: 'trending-up', color: '#3b82f6', category: 'sales', tableName: 'sales_orders' },
      { name: 'Purchase', slug: 'purchase', icon: 'shopping-cart', color: '#6366f1', category: 'purchase', tableName: 'pur_orders' },
      { name: 'Projects', slug: 'projects', icon: 'clipboard', color: '#f97316', category: 'projects', tableName: 'proj_projects' },
      { name: 'Support', slug: 'support', icon: 'headphones', color: '#ef4444', category: 'support', tableName: 'sup_tickets' },
    ];

    const moduleInserts = systemModules.map((mod, i) => ({
      id: uuidv4(),
      company_id: companyId,
      name: mod.name,
      slug: mod.slug,
      description: `${mod.name} module`,
      icon: mod.icon,
      color: mod.color,
      table_name: mod.tableName,
      category: mod.category,
      is_system: true,
      is_active: true,
      version: '1.0.0',
      api_endpoint: `/api/v1/data/${mod.slug}`,
      settings: JSON.stringify({ allowExport: true, allowImport: true, enableAuditLog: true }),
      list_config: JSON.stringify({ defaultSort: 'created_at', defaultSortOrder: 'DESC' }),
      form_config: JSON.stringify({ layout: 'single-column' }),
      dashboard_config: JSON.stringify({ widgets: [] }),
      permissions: JSON.stringify({}),
      sort_order: i,
      metadata: JSON.stringify({}),
      created_at: new Date(),
      updated_at: new Date(),
    }));
    await queryInterface.bulkInsert('modules', moduleInserts);

    // ─── Default Navigation Menu ──────────────────────────────────────────────
    const menuItems = [
      { name: 'Dashboard', path: '/dashboard', icon: 'layout-dashboard', sortOrder: 0 },
      { name: 'HRMS', path: '/modules/hrm', icon: 'users', sortOrder: 1 },
      { name: 'CRM', path: '/modules/crm', icon: 'user-heart', sortOrder: 2 },
      { name: 'Finance', path: '/modules/finance', icon: 'dollar-sign', sortOrder: 3 },
      { name: 'Inventory', path: '/modules/inventory', icon: 'package', sortOrder: 4 },
      { name: 'Sales', path: '/modules/sales', icon: 'trending-up', sortOrder: 5 },
      { name: 'Purchase', path: '/modules/purchase', icon: 'shopping-cart', sortOrder: 6 },
      { name: 'Projects', path: '/modules/projects', icon: 'clipboard', sortOrder: 7 },
      { name: 'Support', path: '/modules/support', icon: 'headphones', sortOrder: 8 },
      { name: 'Reports', path: '/reports', icon: 'bar-chart', sortOrder: 9 },
      { name: 'Settings', path: '/settings', icon: 'settings', sortOrder: 10 },
    ];

    await queryInterface.bulkInsert('menus', menuItems.map((m) => ({
      id: uuidv4(),
      company_id: companyId,
      name: m.name,
      path: m.path,
      icon: m.icon,
      is_active: true,
      is_system: true,
      is_visible: true,
      sort_order: m.sortOrder,
      permissions: JSON.stringify([]),
      metadata: JSON.stringify({}),
      created_at: new Date(),
      updated_at: new Date(),
    })));

    // ─── Settings ─────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('settings', [
      { id: uuidv4(), company_id: companyId, key: 'company.name', value: 'Evvo Technologies', type: 'string', group: 'company', label: 'Company Name', is_public: true, is_system: true, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), company_id: companyId, key: 'company.currency', value: 'USD', type: 'string', group: 'company', label: 'Currency', is_public: true, is_system: true, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), company_id: companyId, key: 'app.theme', value: 'light', type: 'string', group: 'appearance', label: 'Default Theme', is_public: true, is_system: false, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), company_id: companyId, key: 'app.language', value: 'en', type: 'string', group: 'appearance', label: 'Default Language', is_public: true, is_system: false, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), company_id: null, key: 'system.version', value: '1.0.0', type: 'string', group: 'system', label: 'System Version', is_public: true, is_system: true, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('settings', null);
    await queryInterface.bulkDelete('menus', null);
    await queryInterface.bulkDelete('modules', null);
    await queryInterface.bulkDelete('role_permissions', null);
    await queryInterface.bulkDelete('permissions', null);
    await queryInterface.bulkDelete('users', null);
    await queryInterface.bulkDelete('roles', null);
    await queryInterface.bulkDelete('companies', null);
  },
};
