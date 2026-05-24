const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/crm.controller');

router.use(authenticate);

router.get('/stats', ctrl.getStats);

// Customers
router.get('/customers', ctrl.getCustomers);
router.post('/customers', ctrl.createCustomer);
router.get('/customers/:id', ctrl.getCustomer);
router.put('/customers/:id', ctrl.updateCustomer);
router.delete('/customers/:id', ctrl.deleteCustomer);

// Leads
router.get('/leads', ctrl.getLeads);
router.post('/leads', ctrl.createLead);
router.get('/leads/:id', ctrl.getLead);
router.put('/leads/:id', ctrl.updateLead);
router.delete('/leads/:id', ctrl.deleteLead);
router.post('/leads/:id/convert', ctrl.convertLead);

module.exports = router;
