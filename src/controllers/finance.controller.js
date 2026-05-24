const financeService = require('../services/finance.service');
const response = require('../utils/response.util');

const getAccounts = async (req, res, next) => {
  try {
    return response.success(res, await financeService.getAccounts(req.companyId, req.query));
  } catch (err) { next(err); }
};

const createAccount = async (req, res, next) => {
  try {
    return response.created(res, await financeService.createAccount(req.body, req.companyId), 'Account created');
  } catch (err) { next(err); }
};

const updateAccount = async (req, res, next) => {
  try {
    return response.success(res, await financeService.updateAccount(req.params.id, req.body, req.companyId), 'Account updated');
  } catch (err) { next(err); }
};

const deleteAccount = async (req, res, next) => {
  try {
    await financeService.deleteAccount(req.params.id, req.companyId);
    return response.success(res, null, 'Account deleted');
  } catch (err) { next(err); }
};

const getJournalEntries = async (req, res, next) => {
  try {
    const result = await financeService.getJournalEntries(req.companyId, req.query);
    return res.json({ success: true, data: result.data, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.ceil(result.total / result.limit) } });
  } catch (err) { next(err); }
};

const getJournalEntry = async (req, res, next) => {
  try {
    return response.success(res, await financeService.getJournalEntry(req.params.id, req.companyId));
  } catch (err) { next(err); }
};

const createJournalEntry = async (req, res, next) => {
  try {
    return response.created(res, await financeService.createJournalEntry(req.body, req.companyId, req.userId), 'Journal entry created');
  } catch (err) { next(err); }
};

const postJournalEntry = async (req, res, next) => {
  try {
    return response.success(res, await financeService.postJournalEntry(req.params.id, req.companyId, req.userId), 'Journal entry posted');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    return response.success(res, await financeService.getStats(req.companyId));
  } catch (err) { next(err); }
};

module.exports = { getAccounts, createAccount, updateAccount, deleteAccount, getJournalEntries, getJournalEntry, createJournalEntry, postJournalEntry, getStats };
