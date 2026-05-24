const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/finance.controller');

router.use(authenticate);

router.get('/stats', ctrl.getStats);

// Chart of Accounts
router.get('/accounts', ctrl.getAccounts);
router.post('/accounts', ctrl.createAccount);
router.put('/accounts/:id', ctrl.updateAccount);
router.delete('/accounts/:id', ctrl.deleteAccount);

// Journal Entries
router.get('/journal-entries', ctrl.getJournalEntries);
router.post('/journal-entries', ctrl.createJournalEntry);
router.get('/journal-entries/:id', ctrl.getJournalEntry);
router.put('/journal-entries/:id/post', ctrl.postJournalEntry);

module.exports = router;
