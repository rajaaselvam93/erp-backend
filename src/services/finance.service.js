const { ChartOfAccount, JournalEntry, JournalEntryLine } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class FinanceService {
  async getAccounts(companyId, { search = '', accountType = '' } = {}) {
    const where = { companyId };
    if (accountType) where.accountType = accountType;
    if (search) {
      where[Op.or] = [
        { accountName: { [Op.like]: `%${search}%` } },
        { accountCode: { [Op.like]: `%${search}%` } },
      ];
    }
    return ChartOfAccount.findAll({ where, order: [['accountCode', 'ASC']] });
  }

  async createAccount(data, companyId) {
    const exists = await ChartOfAccount.findOne({ where: { accountCode: data.accountCode, companyId } });
    if (exists) throw Object.assign(new Error('Account code already exists'), { statusCode: 409 });
    return ChartOfAccount.create({ ...data, companyId });
  }

  async updateAccount(id, data, companyId) {
    const account = await ChartOfAccount.findOne({ where: { id, companyId } });
    if (!account) throw Object.assign(new Error('Account not found'), { statusCode: 404 });
    await account.update(data);
    return account;
  }

  async deleteAccount(id, companyId) {
    const account = await ChartOfAccount.findOne({ where: { id, companyId } });
    if (!account) throw Object.assign(new Error('Account not found'), { statusCode: 404 });
    await account.destroy();
  }

  async getJournalEntries(companyId, { page = 1, limit = 20, search = '', status = '', startDate = '', endDate = '' } = {}) {
    const where = { companyId };
    if (status) where.status = status;
    if (search) where[Op.or] = [{ entryNumber: { [Op.like]: `%${search}%` } }, { reference: { [Op.like]: `%${search}%` } }];
    if (startDate) where.postingDate = { [Op.gte]: startDate };
    if (endDate) where.postingDate = { ...where.postingDate, [Op.lte]: endDate };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await JournalEntry.findAndCountAll({
      where,
      order: [['postingDate', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return { data: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getJournalEntry(id, companyId) {
    const entry = await JournalEntry.findOne({
      where: { id, companyId },
      include: [{ model: JournalEntryLine, as: 'lines', include: [{ model: ChartOfAccount, as: 'account' }] }],
    });
    if (!entry) throw Object.assign(new Error('Journal entry not found'), { statusCode: 404 });
    return entry;
  }

  async createJournalEntry(data, companyId, userId) {
    const { lines = [], ...entryData } = data;

    if (lines.length < 2) throw Object.assign(new Error('Journal entry must have at least 2 lines'), { statusCode: 400 });

    const totalDebit = lines.reduce((s, l) => s + parseFloat(l.debitAmount || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + parseFloat(l.creditAmount || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw Object.assign(new Error('Debits must equal credits'), { statusCode: 400 });
    }

    const entry = await JournalEntry.create({
      ...entryData,
      companyId,
      createdBy: userId,
      totalDebit,
      totalCredit,
      fiscalYear: entryData.postingDate ? new Date(entryData.postingDate).getFullYear().toString() : new Date().getFullYear().toString(),
    });

    const lineRecords = lines.map((l) => ({
      id: uuidv4(),
      journalEntryId: entry.id,
      ...l,
      created_at: new Date(),
    }));
    await JournalEntryLine.bulkCreate(lineRecords);

    return this.getJournalEntry(entry.id, companyId);
  }

  async postJournalEntry(id, companyId, userId) {
    const entry = await JournalEntry.findOne({ where: { id, companyId } });
    if (!entry) throw Object.assign(new Error('Journal entry not found'), { statusCode: 404 });
    if (entry.status !== 'draft') throw Object.assign(new Error('Only draft entries can be posted'), { statusCode: 400 });
    await entry.update({ status: 'posted', postedBy: userId, postedAt: new Date() });
    return entry;
  }

  async getStats(companyId) {
    const [totalAccounts, postedEntries, draftEntries, totalRevenue, totalExpenses] = await Promise.all([
      ChartOfAccount.count({ where: { companyId, isActive: true } }),
      JournalEntry.count({ where: { companyId, status: 'posted' } }),
      JournalEntry.count({ where: { companyId, status: 'draft' } }),
      ChartOfAccount.sum('balance', { where: { companyId, accountType: 'revenue' } }),
      ChartOfAccount.sum('balance', { where: { companyId, accountType: 'expense' } }),
    ]);
    return {
      totalAccounts,
      postedEntries,
      draftEntries,
      totalRevenue: totalRevenue || 0,
      totalExpenses: totalExpenses || 0,
      netIncome: (totalRevenue || 0) - (totalExpenses || 0),
    };
  }
}

module.exports = new FinanceService();
