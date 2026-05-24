const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/inventory.controller');

router.use(authenticate);

router.get('/stats', ctrl.getStats);

// Warehouses
router.get('/warehouses', ctrl.getWarehouses);
router.post('/warehouses', ctrl.createWarehouse);

// Items
router.get('/items', ctrl.getItems);
router.post('/items', ctrl.createItem);
router.get('/items/:id', ctrl.getItem);
router.put('/items/:id', ctrl.updateItem);
router.delete('/items/:id', ctrl.deleteItem);
router.get('/items/:id/transactions', ctrl.getTransactions);
router.post('/items/:id/transactions', ctrl.addTransaction);

module.exports = router;
