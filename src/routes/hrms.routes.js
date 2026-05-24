const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/hrms.controller');

router.use(authenticate);

// Stats
router.get('/stats', ctrl.getStats);

// Employees — /api/v1/hrms/employees
router.get('/employees', ctrl.getEmployees);
router.post('/employees', ctrl.createEmployee);
router.get('/employees/:id', ctrl.getEmployee);
router.put('/employees/:id', ctrl.updateEmployee);
router.delete('/employees/:id', ctrl.deleteEmployee);

// Departments — /api/v1/hrms/departments
router.get('/departments', ctrl.getDepartments);
router.post('/departments', ctrl.createDepartment);
router.put('/departments/:id', ctrl.updateDepartment);
router.delete('/departments/:id', ctrl.deleteDepartment);

module.exports = router;
