module.exports = (sequelize, DataTypes) => {
  const ChartOfAccount = sequelize.define('ChartOfAccount', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    accountCode: { type: DataTypes.STRING(20), allowNull: false, field: 'account_code' },
    accountName: { type: DataTypes.STRING(255), allowNull: false, field: 'account_name' },
    accountType: { type: DataTypes.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'), allowNull: false, field: 'account_type' },
    accountSubtype: { type: DataTypes.STRING(100), field: 'account_subtype' },
    parentAccountId: { type: DataTypes.UUID, field: 'parent_account_id' },
    description: { type: DataTypes.TEXT },
    currencyCode: { type: DataTypes.STRING(10), defaultValue: 'USD', field: 'currency_code' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    balance: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
  }, {
    tableName: 'chart_of_accounts',
    underscored: true,
    paranoid: true,
  });

  const JournalEntry = sequelize.define('JournalEntry', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, field: 'company_id' },
    entryNumber: { type: DataTypes.STRING(50), allowNull: false, field: 'entry_number' },
    postingDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'posting_date' },
    fiscalYear: { type: DataTypes.STRING(10), field: 'fiscal_year' },
    reference: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.TEXT },
    currencyCode: { type: DataTypes.STRING(10), defaultValue: 'USD', field: 'currency_code' },
    exchangeRate: { type: DataTypes.DECIMAL(10, 6), defaultValue: 1, field: 'exchange_rate' },
    totalDebit: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_debit' },
    totalCredit: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'total_credit' },
    status: { type: DataTypes.ENUM('draft', 'posted', 'reversed'), defaultValue: 'draft' },
    createdBy: { type: DataTypes.UUID, field: 'created_by' },
    postedBy: { type: DataTypes.UUID, field: 'posted_by' },
    postedAt: { type: DataTypes.DATE, field: 'posted_at' },
  }, {
    tableName: 'journal_entries',
    underscored: true,
    paranoid: true,
  });

  const JournalEntryLine = sequelize.define('JournalEntryLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    journalEntryId: { type: DataTypes.UUID, allowNull: false, field: 'journal_entry_id' },
    accountId: { type: DataTypes.UUID, field: 'account_id' },
    description: { type: DataTypes.TEXT },
    debitAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'debit_amount' },
    creditAmount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0, field: 'credit_amount' },
    costCenterId: { type: DataTypes.UUID, field: 'cost_center_id' },
    taxCode: { type: DataTypes.STRING(20), field: 'tax_code' },
  }, {
    tableName: 'journal_entry_lines',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  });

  JournalEntry.hasMany(JournalEntryLine, { foreignKey: 'journalEntryId', as: 'lines' });
  JournalEntryLine.belongsTo(JournalEntry, { foreignKey: 'journalEntryId', as: 'journalEntry' });
  JournalEntryLine.belongsTo(ChartOfAccount, { foreignKey: 'accountId', as: 'account' });

  return { ChartOfAccount, JournalEntry, JournalEntryLine };
};
