const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/sales.controller');

router.use(authenticate);

router.get('/stats', ctrl.getStats);

// Sales Orders
router.get('/orders', ctrl.getSalesOrders);
router.post('/orders', ctrl.createSalesOrder);
router.get('/orders/:id', ctrl.getSalesOrder);
router.put('/orders/:id', ctrl.updateSalesOrder);
router.delete('/orders/:id', ctrl.deleteSalesOrder);

// Invoices
router.get('/invoices', ctrl.getInvoices);
router.post('/invoices', ctrl.createInvoice);
router.put('/invoices/:id', ctrl.updateInvoice);
router.post('/invoices/:id/payment', ctrl.recordPayment);

module.exports = router;
