const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/procurement.controller');

router.use(authenticate);

router.get('/stats', ctrl.getStats);

// Vendors
router.get('/vendors', ctrl.getVendors);
router.post('/vendors', ctrl.createVendor);
router.get('/vendors/:id', ctrl.getVendor);
router.put('/vendors/:id', ctrl.updateVendor);
router.delete('/vendors/:id', ctrl.deleteVendor);

// Purchase Orders — matching blueprint: /api/v1/purchase-orders
router.get('/purchase-orders', ctrl.getPurchaseOrders);
router.post('/purchase-orders', ctrl.createPurchaseOrder);
router.get('/purchase-orders/:id', ctrl.getPurchaseOrder);
router.put('/purchase-orders/:id', ctrl.updatePurchaseOrder);
router.put('/purchase-orders/:id/approve', ctrl.approvePurchaseOrder);
router.delete('/purchase-orders/:id', ctrl.deletePurchaseOrder);

module.exports = router;
