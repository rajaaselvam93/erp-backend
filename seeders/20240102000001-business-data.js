'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    // Find existing company
    const companies = await queryInterface.sequelize.query(
      'SELECT id FROM companies WHERE slug = ? LIMIT 1',
      { replacements: ['evvo-technologies'], type: 'SELECT' }
    );
    if (!companies.length) return;
    const companyId = companies[0].id;

    // ─── Departments ──────────────────────────────────────────────────────────
    const deptEngId = uuidv4();
    const deptHRId = uuidv4();
    const deptFinId = uuidv4();
    const deptSalesId = uuidv4();
    const deptOpsId = uuidv4();

    await queryInterface.bulkInsert('departments', [
      { id: deptEngId, company_id: companyId, department_name: 'Engineering', department_code: 'ENG', cost_center_code: 'CC-001', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: deptHRId, company_id: companyId, department_name: 'Human Resources', department_code: 'HR', cost_center_code: 'CC-002', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: deptFinId, company_id: companyId, department_name: 'Finance & Accounting', department_code: 'FIN', cost_center_code: 'CC-003', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: deptSalesId, company_id: companyId, department_name: 'Sales & Marketing', department_code: 'SALES', cost_center_code: 'CC-004', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: deptOpsId, company_id: companyId, department_name: 'Operations', department_code: 'OPS', cost_center_code: 'CC-005', is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Designations ─────────────────────────────────────────────────────────
    const desigArchId = uuidv4();
    const desigDevId = uuidv4();
    const desigHRMId = uuidv4();
    const desigCFOId = uuidv4();
    const desigSMId = uuidv4();

    await queryInterface.bulkInsert('designations', [
      { id: desigArchId, company_id: companyId, title: 'Software Architect', department_id: deptEngId, grade: 'L5', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: desigDevId, company_id: companyId, title: 'Software Developer', department_id: deptEngId, grade: 'L3', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: desigHRMId, company_id: companyId, title: 'HR Manager', department_id: deptHRId, grade: 'M2', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: desigCFOId, company_id: companyId, title: 'Chief Financial Officer', department_id: deptFinId, grade: 'C2', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: desigSMId, company_id: companyId, title: 'Sales Manager', department_id: deptSalesId, grade: 'M3', is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Employees — from blueprint sample data ────────────────────────────────
    const emp1Id = uuidv4();
    const emp2Id = uuidv4();
    const emp3Id = uuidv4();
    const emp4Id = uuidv4();
    const emp5Id = uuidv4();

    await queryInterface.bulkInsert('employees', [
      {
        id: emp1Id, company_id: companyId, employee_code: 'EMP001',
        first_name: 'Arun', last_name: 'Kumar',
        email: 'arun.kumar@company.com', phone: '+91-9876543210',
        department_id: deptEngId, designation_id: desigArchId,
        joining_date: '2022-01-15', employment_status: 'active', employment_type: 'full_time',
        gender: 'male', city: 'Chennai', country: 'India',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: emp2Id, company_id: companyId, employee_code: 'EMP002',
        first_name: 'Priya', last_name: 'Sharma',
        email: 'priya.sharma@company.com', phone: '+91-9876543211',
        department_id: deptHRId, designation_id: desigHRMId,
        joining_date: '2021-06-01', employment_status: 'active', employment_type: 'full_time',
        gender: 'female', city: 'Mumbai', country: 'India',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: emp3Id, company_id: companyId, employee_code: 'EMP003',
        first_name: 'Raj', last_name: 'Patel',
        email: 'raj.patel@company.com', phone: '+91-9876543212',
        department_id: deptFinId, designation_id: desigCFOId,
        joining_date: '2020-03-10', employment_status: 'active', employment_type: 'full_time',
        gender: 'male', city: 'Bangalore', country: 'India',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: emp4Id, company_id: companyId, employee_code: 'EMP004',
        first_name: 'Sneha', last_name: 'Reddy',
        email: 'sneha.reddy@company.com', phone: '+91-9876543213',
        department_id: deptSalesId, designation_id: desigSMId,
        joining_date: '2023-02-01', employment_status: 'active', employment_type: 'full_time',
        gender: 'female', city: 'Hyderabad', country: 'India',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: emp5Id, company_id: companyId, employee_code: 'EMP005',
        first_name: 'Vikram', last_name: 'Singh',
        email: 'vikram.singh@company.com', phone: '+91-9876543214',
        department_id: deptEngId, designation_id: desigDevId,
        joining_date: '2023-07-15', employment_status: 'active', employment_type: 'full_time',
        gender: 'male', city: 'Pune', country: 'India',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
    ]);

    // ─── Chart of Accounts ────────────────────────────────────────────────────
    const accCashId = uuidv4();
    const accARId = uuidv4();
    const accAPId = uuidv4();
    const accRevId = uuidv4();
    const accSalaryId = uuidv4();
    const accEquityId = uuidv4();

    await queryInterface.bulkInsert('chart_of_accounts', [
      { id: accCashId, company_id: companyId, account_code: '1001', account_name: 'Cash & Bank', account_type: 'asset', account_subtype: 'current', currency_code: 'USD', is_active: true, balance: 250000.00, created_at: new Date(), updated_at: new Date() },
      { id: accARId, company_id: companyId, account_code: '1100', account_name: 'Accounts Receivable', account_type: 'asset', account_subtype: 'current', currency_code: 'USD', is_active: true, balance: 125000.00, created_at: new Date(), updated_at: new Date() },
      { id: accAPId, company_id: companyId, account_code: '2001', account_name: 'Accounts Payable', account_type: 'liability', account_subtype: 'current', currency_code: 'USD', is_active: true, balance: 75000.00, created_at: new Date(), updated_at: new Date() },
      { id: accRevId, company_id: companyId, account_code: '4001', account_name: 'Sales Revenue', account_type: 'revenue', account_subtype: 'operating', currency_code: 'USD', is_active: true, balance: 500000.00, created_at: new Date(), updated_at: new Date() },
      { id: accSalaryId, company_id: companyId, account_code: '5001', account_name: 'Salary Expense', account_type: 'expense', account_subtype: 'operating', currency_code: 'USD', is_active: true, balance: 150000.00, created_at: new Date(), updated_at: new Date() },
      { id: accEquityId, company_id: companyId, account_code: '3001', account_name: "Owner's Equity", account_type: 'equity', account_subtype: 'permanent', currency_code: 'USD', is_active: true, balance: 300000.00, created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Customers — from blueprint sample data ────────────────────────────────
    const cust1Id = uuidv4();
    const cust2Id = uuidv4();
    const cust3Id = uuidv4();

    await queryInterface.bulkInsert('customers', [
      {
        id: cust1Id, company_id: companyId,
        customer_code: 'CUST1001', customer_name: 'ABC Manufacturing Pvt Ltd',
        email: 'contact@abcmfg.com', phone: '+91-4412345678',
        industry: 'Manufacturing', account_manager_id: emp4Id,
        city: 'Chennai', country: 'India',
        credit_limit: 500000.00, payment_terms: 'Net 30', status: 'active',
        notes: 'Key manufacturing client - Sales Team Chennai',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: cust2Id, company_id: companyId,
        customer_code: 'CUST1002', customer_name: 'Global Tech Solutions Inc',
        email: 'procurement@globaltech.com', phone: '+1-5551234567',
        industry: 'Technology', account_manager_id: emp4Id,
        city: 'San Francisco', country: 'USA',
        credit_limit: 750000.00, payment_terms: 'Net 45', status: 'active',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: cust3Id, company_id: companyId,
        customer_code: 'CUST1003', customer_name: 'Sunrise Retail Group',
        email: 'accounts@sunriseretail.com', phone: '+91-9887654321',
        industry: 'Retail', account_manager_id: emp4Id,
        city: 'Delhi', country: 'India',
        credit_limit: 200000.00, payment_terms: 'Net 15', status: 'active',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
    ]);

    // ─── Leads ────────────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('leads', [
      {
        id: uuidv4(), company_id: companyId,
        lead_source: 'Website', lead_status: 'qualified',
        first_name: 'Ravi', last_name: 'Menon',
        email: 'ravi.menon@prospect.com', phone: '+91-9765432109',
        company_name: 'TechCorp Pvt Ltd', industry: 'Technology',
        assigned_to: emp4Id, expected_revenue: 120000.00, probability: 60,
        expected_close_date: '2026-07-31',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: uuidv4(), company_id: companyId,
        lead_source: 'Referral', lead_status: 'proposal',
        first_name: 'Anita', last_name: 'Desai',
        email: 'anita@designstudio.in', phone: '+91-9654321098',
        company_name: 'Design Studio India', industry: 'Creative',
        assigned_to: emp4Id, expected_revenue: 85000.00, probability: 75,
        expected_close_date: '2026-06-30',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
    ]);

    // ─── Vendors ──────────────────────────────────────────────────────────────
    const vend1Id = uuidv4();
    const vend2Id = uuidv4();

    await queryInterface.bulkInsert('vendors', [
      {
        id: vend1Id, company_id: companyId,
        vendor_code: 'VEND001', vendor_name: 'Global Supplies Ltd',
        email: 'sales@globalsupplies.com', phone: '+1-8005551234',
        tax_registration_no: 'GST-US-001234',
        payment_terms: 'Net 30', currency_code: 'USD',
        city: 'New York', country: 'USA',
        status: 'active', rating: 4,
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: vend2Id, company_id: companyId,
        vendor_code: 'VEND002', vendor_name: 'TechParts India',
        email: 'orders@techparts.in', phone: '+91-4498765432',
        tax_registration_no: 'GST-TN-098765',
        payment_terms: 'Net 15', currency_code: 'INR',
        city: 'Coimbatore', country: 'India',
        status: 'active', rating: 5,
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
    ]);

    // ─── Purchase Orders — from blueprint sample ───────────────────────────────
    const po1Id = uuidv4();
    const po2Id = uuidv4();

    await queryInterface.bulkInsert('purchase_orders', [
      {
        id: po1Id, company_id: companyId,
        po_number: 'PO-2026-001', vendor_id: vend1Id,
        order_date: '2026-01-15', expected_delivery_date: '2026-02-15',
        currency_code: 'USD', subtotal: 225000.00, tax_amount: 25000.00,
        discount_amount: 0, total_amount: 250000.00,
        status: 'approved', notes: 'Urgent procurement for Q1 2026',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: po2Id, company_id: companyId,
        po_number: 'PO-2026-002', vendor_id: vend2Id,
        order_date: '2026-02-01', expected_delivery_date: '2026-03-01',
        currency_code: 'INR', subtotal: 80000.00, tax_amount: 14400.00,
        discount_amount: 0, total_amount: 94400.00,
        status: 'submitted',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('purchase_order_lines', [
      { id: uuidv4(), purchase_order_id: po1Id, item_description: 'Industrial Grade Server Units', item_code: 'SRV-001', quantity: 10, unit_of_measure: 'pcs', unit_price: 22500.00, tax_percent: 11.11, line_total: 225000.00, received_qty: 0, created_at: new Date() },
      { id: uuidv4(), purchase_order_id: po2Id, item_description: 'Electronic Components - Type A', item_code: 'EC-A-100', quantity: 500, unit_of_measure: 'pcs', unit_price: 160.00, tax_percent: 18, line_total: 80000.00, received_qty: 0, created_at: new Date() },
    ]);

    // ─── Warehouse & Inventory ────────────────────────────────────────────────
    const wh1Id = uuidv4();
    await queryInterface.bulkInsert('warehouses', [
      { id: wh1Id, company_id: companyId, warehouse_code: 'WH-CHN-001', warehouse_name: 'Chennai Main Warehouse', location: 'SIPCOT Industrial Park, Chennai', city: 'Chennai', country: 'India', capacity: 10000.00, is_active: true, metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
    ]);

    const item1Id = uuidv4();
    const item2Id = uuidv4();
    const item3Id = uuidv4();

    await queryInterface.bulkInsert('inventory_items', [
      { id: item1Id, company_id: companyId, sku: 'SKU-001', item_name: 'Server Unit Model X', category: 'Hardware', unit_of_measure: 'pcs', unit_price: 25000.00, cost_price: 22500.00, reorder_level: 5, reorder_quantity: 10, current_stock: 15, warehouse_id: wh1Id, is_active: true, is_tracked: true, barcode: 'BC-SKU001', metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
      { id: item2Id, company_id: companyId, sku: 'SKU-002', item_name: 'Network Switch 24-Port', category: 'Networking', unit_of_measure: 'pcs', unit_price: 8500.00, cost_price: 7200.00, reorder_level: 3, reorder_quantity: 5, current_stock: 8, warehouse_id: wh1Id, is_active: true, is_tracked: true, barcode: 'BC-SKU002', metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
      { id: item3Id, company_id: companyId, sku: 'SKU-003', item_name: 'Electronic Component Type A', category: 'Components', unit_of_measure: 'pcs', unit_price: 200.00, cost_price: 160.00, reorder_level: 100, reorder_quantity: 500, current_stock: 350, warehouse_id: wh1Id, is_active: true, is_tracked: true, metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Sales Orders ─────────────────────────────────────────────────────────
    const so1Id = uuidv4();
    const so2Id = uuidv4();

    await queryInterface.bulkInsert('sales_orders', [
      {
        id: so1Id, company_id: companyId,
        order_number: 'SO-2026-001', customer_id: cust1Id,
        order_date: '2026-01-20', expected_delivery_date: '2026-02-20',
        currency_code: 'USD', subtotal: 250000.00, tax_amount: 25000.00,
        total_amount: 275000.00, status: 'confirmed', payment_status: 'unpaid',
        sales_rep_id: emp4Id,
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: so2Id, company_id: companyId,
        order_number: 'SO-2026-002', customer_id: cust2Id,
        order_date: '2026-02-05', expected_delivery_date: '2026-03-05',
        currency_code: 'USD', subtotal: 85000.00, tax_amount: 7650.00,
        total_amount: 92650.00, status: 'processing', payment_status: 'partial',
        sales_rep_id: emp4Id,
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('sales_order_lines', [
      { id: uuidv4(), sales_order_id: so1Id, item_id: item1Id, item_description: 'Server Unit Model X', item_code: 'SKU-001', quantity: 10, unit_of_measure: 'pcs', unit_price: 25000.00, tax_percent: 10, line_total: 250000.00, delivered_qty: 0, created_at: new Date() },
      { id: uuidv4(), sales_order_id: so2Id, item_id: item2Id, item_description: 'Network Switch 24-Port', item_code: 'SKU-002', quantity: 10, unit_of_measure: 'pcs', unit_price: 8500.00, tax_percent: 9, line_total: 85000.00, delivered_qty: 5, created_at: new Date() },
    ]);

    // ─── Invoices ─────────────────────────────────────────────────────────────
    const inv1Id = uuidv4();
    await queryInterface.bulkInsert('invoices', [
      {
        id: inv1Id, company_id: companyId,
        invoice_number: 'INV-2026-001', invoice_type: 'sales',
        customer_id: cust1Id, sales_order_id: so1Id,
        invoice_date: '2026-01-22', due_date: '2026-02-22',
        currency_code: 'USD', subtotal: 250000.00, tax_amount: 25000.00,
        total_amount: 275000.00, paid_amount: 0, balance_due: 275000.00,
        status: 'sent', metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: uuidv4(), company_id: companyId,
        invoice_number: 'INV-2026-002', invoice_type: 'sales',
        customer_id: cust2Id, sales_order_id: so2Id,
        invoice_date: '2026-02-06', due_date: '2026-03-23',
        currency_code: 'USD', subtotal: 85000.00, tax_amount: 7650.00,
        total_amount: 92650.00, paid_amount: 46325.00, balance_due: 46325.00,
        status: 'partial', metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
    ]);

    // ─── Projects ─────────────────────────────────────────────────────────────
    const proj1Id = uuidv4();
    const proj2Id = uuidv4();

    await queryInterface.bulkInsert('projects', [
      {
        id: proj1Id, company_id: companyId,
        project_code: 'PROJ-2026-001', project_name: 'ABC Manufacturing ERP Integration',
        description: 'Full ERP integration project for ABC Manufacturing',
        customer_id: cust1Id, project_manager_id: emp1Id,
        start_date: '2026-01-15', end_date: '2026-06-30',
        budget: 450000.00, actual_cost: 125000.00,
        status: 'active', priority: 'high', progress_percent: 35,
        billing_type: 'milestone',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
      {
        id: proj2Id, company_id: companyId,
        project_code: 'PROJ-2026-002', project_name: 'Internal IT Infrastructure Upgrade',
        description: 'Upgrade of internal server and networking infrastructure',
        project_manager_id: emp1Id,
        start_date: '2026-02-01', end_date: '2026-04-30',
        budget: 120000.00, actual_cost: 45000.00,
        status: 'active', priority: 'medium', progress_percent: 40,
        billing_type: 'fixed',
        metadata: JSON.stringify({}), created_at: new Date(), updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('project_tasks', [
      { id: uuidv4(), project_id: proj1Id, task_name: 'Requirements Gathering & Analysis', description: 'Collect and document all business requirements', assigned_to: emp1Id, start_date: '2026-01-15', due_date: '2026-02-15', estimated_hours: 80, actual_hours: 75, status: 'done', priority: 'high', progress_percent: 100, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), project_id: proj1Id, task_name: 'System Design & Architecture', description: 'Design system architecture and data models', assigned_to: emp1Id, start_date: '2026-02-16', due_date: '2026-03-31', estimated_hours: 120, actual_hours: 50, status: 'in_progress', priority: 'high', progress_percent: 45, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), project_id: proj1Id, task_name: 'Frontend Development', description: 'Build React-based frontend modules', assigned_to: emp5Id, start_date: '2026-03-01', due_date: '2026-05-31', estimated_hours: 200, actual_hours: 0, status: 'todo', priority: 'medium', progress_percent: 0, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), project_id: proj2Id, task_name: 'Server Procurement & Setup', description: 'Procure and setup new server hardware', assigned_to: emp1Id, start_date: '2026-02-01', due_date: '2026-03-15', estimated_hours: 60, actual_hours: 40, status: 'in_progress', priority: 'high', progress_percent: 65, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), project_id: proj2Id, task_name: 'Network Configuration', description: 'Configure network switches and routers', assigned_to: emp5Id, start_date: '2026-03-16', due_date: '2026-04-30', estimated_hours: 40, actual_hours: 0, status: 'todo', priority: 'medium', progress_percent: 0, created_at: new Date(), updated_at: new Date() },
    ]);

    // ─── Journal Entries ──────────────────────────────────────────────────────
    const je1Id = uuidv4();
    await queryInterface.bulkInsert('journal_entries', [
      {
        id: je1Id, company_id: companyId,
        entry_number: 'JE-2026-001', posting_date: '2026-01-31',
        fiscal_year: '2026', reference: 'Monthly Payroll Jan-2026',
        description: 'January 2026 payroll processing',
        currency_code: 'USD', exchange_rate: 1,
        total_debit: 150000.00, total_credit: 150000.00,
        status: 'posted', created_at: new Date(), updated_at: new Date(),
      },
    ]);

    await queryInterface.bulkInsert('journal_entry_lines', [
      { id: uuidv4(), journal_entry_id: je1Id, account_id: accSalaryId, description: 'January 2026 salaries', debit_amount: 150000.00, credit_amount: 0, created_at: new Date() },
      { id: uuidv4(), journal_entry_id: je1Id, account_id: accCashId, description: 'Salary payment from bank', debit_amount: 0, credit_amount: 150000.00, created_at: new Date() },
    ]);

    // ─── Update existing roles to match blueprint role-permission matrix ───────
    // Add approve permission for all modules
    const modules = ['hrm', 'crm', 'finance', 'inventory', 'sales', 'purchase', 'projects', 'reports'];
    const approvePerms = [];
    for (const mod of modules) {
      approvePerms.push({
        id: uuidv4(),
        name: `${mod.charAt(0).toUpperCase() + mod.slice(1)} - Approve`,
        slug: `${mod}.approve`,
        module: mod,
        action: 'approve',
        description: `Can approve ${mod}`,
        is_system: true,
        created_at: new Date(),
      });
    }
    await queryInterface.bulkInsert('permissions', approvePerms).catch(() => {});

    console.log('✅ Business module sample data seeded successfully');
    console.log('   Employees: EMP001-EMP005 | Customers: CUST1001-CUST1003');
    console.log('   Purchase Orders: PO-2026-001, PO-2026-002');
    console.log('   Sales Orders: SO-2026-001, SO-2026-002');
    console.log('   Projects: PROJ-2026-001, PROJ-2026-002');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('journal_entry_lines', null);
    await queryInterface.bulkDelete('journal_entries', null);
    await queryInterface.bulkDelete('project_tasks', null);
    await queryInterface.bulkDelete('projects', null);
    await queryInterface.bulkDelete('invoices', null);
    await queryInterface.bulkDelete('sales_order_lines', null);
    await queryInterface.bulkDelete('sales_orders', null);
    await queryInterface.bulkDelete('purchase_order_lines', null);
    await queryInterface.bulkDelete('purchase_orders', null);
    await queryInterface.bulkDelete('inventory_items', null);
    await queryInterface.bulkDelete('warehouses', null);
    await queryInterface.bulkDelete('vendors', null);
    await queryInterface.bulkDelete('leads', null);
    await queryInterface.bulkDelete('customers', null);
    await queryInterface.bulkDelete('chart_of_accounts', null);
    await queryInterface.bulkDelete('employees', null);
    await queryInterface.bulkDelete('designations', null);
    await queryInterface.bulkDelete('departments', null);
  },
};
