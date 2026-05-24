'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── HRMS ─────────────────────────────────────────────────────────────────

    await queryInterface.createTable('departments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
      department_name: { type: Sequelize.STRING(100), allowNull: false },
      department_code: { type: Sequelize.STRING(20) },
      cost_center_code: { type: Sequelize.STRING(50) },
      manager_id: { type: Sequelize.UUID },
      parent_id: { type: Sequelize.UUID },
      description: { type: Sequelize.TEXT },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('designations', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      title: { type: Sequelize.STRING(150), allowNull: false },
      department_id: { type: Sequelize.UUID },
      grade: { type: Sequelize.STRING(20) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('employees', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
      employee_code: { type: Sequelize.STRING(50), allowNull: false },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(255) },
      phone: { type: Sequelize.STRING(20) },
      department_id: { type: Sequelize.UUID, references: { model: 'departments', key: 'id' }, onDelete: 'SET NULL' },
      designation_id: { type: Sequelize.UUID, references: { model: 'designations', key: 'id' }, onDelete: 'SET NULL' },
      manager_id: { type: Sequelize.UUID },
      user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      joining_date: { type: Sequelize.DATEONLY, allowNull: false },
      employment_status: { type: Sequelize.ENUM('active', 'inactive', 'on_leave', 'terminated'), defaultValue: 'active' },
      employment_type: { type: Sequelize.ENUM('full_time', 'part_time', 'contract', 'intern'), defaultValue: 'full_time' },
      salary_structure_id: { type: Sequelize.UUID },
      date_of_birth: { type: Sequelize.DATEONLY },
      gender: { type: Sequelize.ENUM('male', 'female', 'other') },
      address: { type: Sequelize.TEXT },
      city: { type: Sequelize.STRING(100) },
      state: { type: Sequelize.STRING(100) },
      country: { type: Sequelize.STRING(100) },
      avatar: { type: Sequelize.STRING(500) },
      emergency_contact: { type: Sequelize.JSON },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('leave_requests', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
      leave_type: { type: Sequelize.ENUM('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other'), defaultValue: 'annual' },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      days: { type: Sequelize.DECIMAL(5, 1), defaultValue: 1 },
      reason: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected', 'cancelled'), defaultValue: 'pending' },
      approved_by: { type: Sequelize.UUID },
      approved_at: { type: Sequelize.DATE },
      rejection_reason: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('payroll_records', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      employee_id: { type: Sequelize.UUID, references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
      pay_period: { type: Sequelize.STRING(20), allowNull: false },
      basic_salary: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      allowances: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      deductions: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      tax: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      net_salary: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('draft', 'processed', 'paid'), defaultValue: 'draft' },
      paid_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ─── Finance ───────────────────────────────────────────────────────────────

    await queryInterface.createTable('chart_of_accounts', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
      account_code: { type: Sequelize.STRING(20), allowNull: false },
      account_name: { type: Sequelize.STRING(255), allowNull: false },
      account_type: { type: Sequelize.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'), allowNull: false },
      account_subtype: { type: Sequelize.STRING(100) },
      parent_account_id: { type: Sequelize.UUID },
      description: { type: Sequelize.TEXT },
      currency_code: { type: Sequelize.STRING(10), defaultValue: 'USD' },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      balance: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('journal_entries', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      entry_number: { type: Sequelize.STRING(50), allowNull: false },
      posting_date: { type: Sequelize.DATEONLY, allowNull: false },
      fiscal_year: { type: Sequelize.STRING(10) },
      reference: { type: Sequelize.STRING(100) },
      description: { type: Sequelize.TEXT },
      currency_code: { type: Sequelize.STRING(10), defaultValue: 'USD' },
      exchange_rate: { type: Sequelize.DECIMAL(10, 6), defaultValue: 1 },
      total_debit: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      total_credit: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('draft', 'posted', 'reversed'), defaultValue: 'draft' },
      created_by: { type: Sequelize.UUID },
      posted_by: { type: Sequelize.UUID },
      posted_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('journal_entry_lines', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      journal_entry_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'journal_entries', key: 'id' }, onDelete: 'CASCADE' },
      account_id: { type: Sequelize.UUID, references: { model: 'chart_of_accounts', key: 'id' } },
      description: { type: Sequelize.TEXT },
      debit_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      credit_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      cost_center_id: { type: Sequelize.UUID },
      tax_code: { type: Sequelize.STRING(20) },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ─── CRM ──────────────────────────────────────────────────────────────────

    await queryInterface.createTable('customers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
      customer_code: { type: Sequelize.STRING(50), allowNull: false },
      customer_name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255) },
      phone: { type: Sequelize.STRING(30) },
      website: { type: Sequelize.STRING(255) },
      tax_id: { type: Sequelize.STRING(100) },
      industry: { type: Sequelize.STRING(100) },
      account_manager_id: { type: Sequelize.UUID },
      billing_address: { type: Sequelize.TEXT },
      shipping_address: { type: Sequelize.TEXT },
      city: { type: Sequelize.STRING(100) },
      country: { type: Sequelize.STRING(100) },
      credit_limit: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      payment_terms: { type: Sequelize.STRING(50), defaultValue: 'Net 30' },
      status: { type: Sequelize.ENUM('active', 'inactive', 'prospect'), defaultValue: 'active' },
      notes: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('leads', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      lead_source: { type: Sequelize.STRING(100) },
      lead_status: { type: Sequelize.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'), defaultValue: 'new' },
      first_name: { type: Sequelize.STRING(100) },
      last_name: { type: Sequelize.STRING(100) },
      email: { type: Sequelize.STRING(255) },
      phone: { type: Sequelize.STRING(30) },
      company_name: { type: Sequelize.STRING(255) },
      industry: { type: Sequelize.STRING(100) },
      assigned_to: { type: Sequelize.UUID },
      expected_revenue: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      probability: { type: Sequelize.INTEGER, defaultValue: 0 },
      expected_close_date: { type: Sequelize.DATEONLY },
      converted_customer_id: { type: Sequelize.UUID },
      is_converted: { type: Sequelize.BOOLEAN, defaultValue: false },
      notes: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // ─── Procurement ──────────────────────────────────────────────────────────

    await queryInterface.createTable('vendors', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
      vendor_code: { type: Sequelize.STRING(50), allowNull: false },
      vendor_name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255) },
      phone: { type: Sequelize.STRING(30) },
      website: { type: Sequelize.STRING(255) },
      tax_registration_no: { type: Sequelize.STRING(100) },
      payment_terms: { type: Sequelize.STRING(100), defaultValue: 'Net 30' },
      currency_code: { type: Sequelize.STRING(10), defaultValue: 'USD' },
      billing_address: { type: Sequelize.TEXT },
      city: { type: Sequelize.STRING(100) },
      country: { type: Sequelize.STRING(100) },
      bank_details: { type: Sequelize.JSON },
      status: { type: Sequelize.ENUM('active', 'inactive', 'blacklisted'), defaultValue: 'active' },
      rating: { type: Sequelize.INTEGER, defaultValue: 3 },
      notes: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('purchase_orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      po_number: { type: Sequelize.STRING(50), allowNull: false },
      vendor_id: { type: Sequelize.UUID, references: { model: 'vendors', key: 'id' }, onDelete: 'SET NULL' },
      order_date: { type: Sequelize.DATEONLY, allowNull: false },
      expected_delivery_date: { type: Sequelize.DATEONLY },
      delivery_address: { type: Sequelize.TEXT },
      currency_code: { type: Sequelize.STRING(10), defaultValue: 'USD' },
      subtotal: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      tax_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      discount_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      total_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('draft', 'submitted', 'approved', 'sent', 'partial', 'received', 'cancelled'), defaultValue: 'draft' },
      notes: { type: Sequelize.TEXT },
      terms_conditions: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.UUID },
      approved_by: { type: Sequelize.UUID },
      approved_at: { type: Sequelize.DATE },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('purchase_order_lines', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      purchase_order_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'purchase_orders', key: 'id' }, onDelete: 'CASCADE' },
      item_description: { type: Sequelize.STRING(500), allowNull: false },
      item_code: { type: Sequelize.STRING(100) },
      quantity: { type: Sequelize.DECIMAL(18, 4), allowNull: false },
      unit_of_measure: { type: Sequelize.STRING(20) },
      unit_price: { type: Sequelize.DECIMAL(18, 4), allowNull: false },
      discount_percent: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
      tax_percent: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
      line_total: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      received_qty: { type: Sequelize.DECIMAL(18, 4), defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ─── Inventory ────────────────────────────────────────────────────────────

    await queryInterface.createTable('warehouses', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID, references: { model: 'companies', key: 'id' }, onDelete: 'CASCADE' },
      warehouse_code: { type: Sequelize.STRING(50), allowNull: false },
      warehouse_name: { type: Sequelize.STRING(255), allowNull: false },
      location: { type: Sequelize.TEXT },
      city: { type: Sequelize.STRING(100) },
      country: { type: Sequelize.STRING(100) },
      manager_id: { type: Sequelize.UUID },
      capacity: { type: Sequelize.DECIMAL(18, 2) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('inventory_items', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      sku: { type: Sequelize.STRING(100), allowNull: false },
      item_name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      category: { type: Sequelize.STRING(100) },
      unit_of_measure: { type: Sequelize.STRING(20), defaultValue: 'pcs' },
      unit_price: { type: Sequelize.DECIMAL(18, 4), defaultValue: 0 },
      cost_price: { type: Sequelize.DECIMAL(18, 4), defaultValue: 0 },
      reorder_level: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      reorder_quantity: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      current_stock: { type: Sequelize.DECIMAL(18, 4), defaultValue: 0 },
      warehouse_id: { type: Sequelize.UUID, references: { model: 'warehouses', key: 'id' }, onDelete: 'SET NULL' },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_tracked: { type: Sequelize.BOOLEAN, defaultValue: true },
      barcode: { type: Sequelize.STRING(100) },
      image: { type: Sequelize.STRING(500) },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('inventory_transactions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      item_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'inventory_items', key: 'id' }, onDelete: 'CASCADE' },
      warehouse_id: { type: Sequelize.UUID, references: { model: 'warehouses', key: 'id' } },
      transaction_type: { type: Sequelize.ENUM('receipt', 'issue', 'transfer', 'adjustment', 'return'), allowNull: false },
      quantity: { type: Sequelize.DECIMAL(18, 4), allowNull: false },
      unit_cost: { type: Sequelize.DECIMAL(18, 4), defaultValue: 0 },
      reference_type: { type: Sequelize.STRING(50) },
      reference_id: { type: Sequelize.UUID },
      notes: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.UUID },
      transaction_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ─── Sales ────────────────────────────────────────────────────────────────

    await queryInterface.createTable('sales_orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      order_number: { type: Sequelize.STRING(50), allowNull: false },
      customer_id: { type: Sequelize.UUID, references: { model: 'customers', key: 'id' }, onDelete: 'SET NULL' },
      order_date: { type: Sequelize.DATEONLY, allowNull: false },
      expected_delivery_date: { type: Sequelize.DATEONLY },
      shipping_address: { type: Sequelize.TEXT },
      currency_code: { type: Sequelize.STRING(10), defaultValue: 'USD' },
      subtotal: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      tax_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      discount_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      total_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'), defaultValue: 'draft' },
      payment_status: { type: Sequelize.ENUM('unpaid', 'partial', 'paid'), defaultValue: 'unpaid' },
      sales_rep_id: { type: Sequelize.UUID },
      notes: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.UUID },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('sales_order_lines', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      sales_order_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'sales_orders', key: 'id' }, onDelete: 'CASCADE' },
      item_id: { type: Sequelize.UUID },
      item_description: { type: Sequelize.STRING(500), allowNull: false },
      item_code: { type: Sequelize.STRING(100) },
      quantity: { type: Sequelize.DECIMAL(18, 4), allowNull: false },
      unit_of_measure: { type: Sequelize.STRING(20) },
      unit_price: { type: Sequelize.DECIMAL(18, 4), allowNull: false },
      discount_percent: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
      tax_percent: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
      line_total: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      delivered_qty: { type: Sequelize.DECIMAL(18, 4), defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.createTable('invoices', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      invoice_number: { type: Sequelize.STRING(50), allowNull: false },
      invoice_type: { type: Sequelize.ENUM('sales', 'purchase'), defaultValue: 'sales' },
      customer_id: { type: Sequelize.UUID },
      vendor_id: { type: Sequelize.UUID },
      sales_order_id: { type: Sequelize.UUID },
      purchase_order_id: { type: Sequelize.UUID },
      invoice_date: { type: Sequelize.DATEONLY, allowNull: false },
      due_date: { type: Sequelize.DATEONLY },
      currency_code: { type: Sequelize.STRING(10), defaultValue: 'USD' },
      subtotal: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      tax_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      total_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      paid_amount: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      balance_due: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'), defaultValue: 'draft' },
      notes: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.UUID },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // ─── Manufacturing ────────────────────────────────────────────────────────

    await queryInterface.createTable('bill_of_materials', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      bom_code: { type: Sequelize.STRING(50), allowNull: false },
      product_name: { type: Sequelize.STRING(255), allowNull: false },
      finished_item_id: { type: Sequelize.UUID },
      quantity: { type: Sequelize.DECIMAL(18, 4), defaultValue: 1 },
      unit_of_measure: { type: Sequelize.STRING(20) },
      version: { type: Sequelize.STRING(20), defaultValue: '1.0' },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      description: { type: Sequelize.TEXT },
      components: { type: Sequelize.JSON, defaultValue: [] },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('work_orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      wo_number: { type: Sequelize.STRING(50), allowNull: false },
      bom_id: { type: Sequelize.UUID, references: { model: 'bill_of_materials', key: 'id' }, onDelete: 'SET NULL' },
      product_name: { type: Sequelize.STRING(255), allowNull: false },
      quantity_planned: { type: Sequelize.DECIMAL(18, 4), allowNull: false },
      quantity_produced: { type: Sequelize.DECIMAL(18, 4), defaultValue: 0 },
      planned_start_date: { type: Sequelize.DATEONLY },
      planned_end_date: { type: Sequelize.DATEONLY },
      actual_start_date: { type: Sequelize.DATEONLY },
      actual_end_date: { type: Sequelize.DATEONLY },
      status: { type: Sequelize.ENUM('draft', 'planned', 'in_progress', 'completed', 'cancelled'), defaultValue: 'draft' },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
      assigned_to: { type: Sequelize.UUID },
      notes: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.UUID },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    // ─── Projects ─────────────────────────────────────────────────────────────

    await queryInterface.createTable('projects', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      company_id: { type: Sequelize.UUID },
      project_code: { type: Sequelize.STRING(50), allowNull: false },
      project_name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      customer_id: { type: Sequelize.UUID },
      project_manager_id: { type: Sequelize.UUID },
      start_date: { type: Sequelize.DATEONLY },
      end_date: { type: Sequelize.DATEONLY },
      budget: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      actual_cost: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'), defaultValue: 'planning' },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
      progress_percent: { type: Sequelize.INTEGER, defaultValue: 0 },
      billing_type: { type: Sequelize.ENUM('fixed', 'hourly', 'milestone'), defaultValue: 'fixed' },
      metadata: { type: Sequelize.JSON, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('project_tasks', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      project_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE' },
      parent_task_id: { type: Sequelize.UUID },
      task_name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      assigned_to: { type: Sequelize.UUID },
      start_date: { type: Sequelize.DATEONLY },
      due_date: { type: Sequelize.DATEONLY },
      completed_at: { type: Sequelize.DATE },
      estimated_hours: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      actual_hours: { type: Sequelize.DECIMAL(8, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('todo', 'in_progress', 'review', 'done', 'cancelled'), defaultValue: 'todo' },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
      progress_percent: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE },
    });

    await queryInterface.createTable('time_entries', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      project_id: { type: Sequelize.UUID, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE' },
      task_id: { type: Sequelize.UUID },
      employee_id: { type: Sequelize.UUID },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      hours: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      description: { type: Sequelize.TEXT },
      is_billable: { type: Sequelize.BOOLEAN, defaultValue: true },
      hourly_rate: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // ─── Indexes ──────────────────────────────────────────────────────────────
    await queryInterface.addIndex('employees', ['company_id', 'employee_code']);
    await queryInterface.addIndex('employees', ['department_id']);
    await queryInterface.addIndex('customers', ['company_id', 'customer_code']);
    await queryInterface.addIndex('leads', ['company_id', 'lead_status']);
    await queryInterface.addIndex('vendors', ['company_id', 'vendor_code']);
    await queryInterface.addIndex('purchase_orders', ['company_id', 'po_number']);
    await queryInterface.addIndex('purchase_orders', ['vendor_id', 'status']);
    await queryInterface.addIndex('inventory_items', ['company_id', 'sku']);
    await queryInterface.addIndex('inventory_transactions', ['item_id', 'transaction_date']);
    await queryInterface.addIndex('sales_orders', ['company_id', 'order_number']);
    await queryInterface.addIndex('sales_orders', ['customer_id', 'status']);
    await queryInterface.addIndex('invoices', ['company_id', 'invoice_number']);
    await queryInterface.addIndex('projects', ['company_id', 'status']);
    await queryInterface.addIndex('project_tasks', ['project_id', 'status']);
    await queryInterface.addIndex('journal_entries', ['company_id', 'posting_date']);
  },

  async down(queryInterface) {
    const tables = [
      'time_entries', 'project_tasks', 'projects',
      'work_orders', 'bill_of_materials',
      'invoices', 'sales_order_lines', 'sales_orders',
      'inventory_transactions', 'inventory_items', 'warehouses',
      'purchase_order_lines', 'purchase_orders', 'vendors',
      'leads', 'customers',
      'journal_entry_lines', 'journal_entries', 'chart_of_accounts',
      'payroll_records', 'leave_requests',
      'employees', 'designations', 'departments',
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table, { force: true });
    }
  },
};
