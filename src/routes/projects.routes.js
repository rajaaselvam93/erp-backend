const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/project.controller');

router.use(authenticate);

router.get('/stats', ctrl.getStats);

// Projects
router.get('/', ctrl.getProjects);
router.post('/', ctrl.createProject);
router.get('/:id', ctrl.getProject);
router.put('/:id', ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);

// Tasks
router.get('/:id/tasks', ctrl.getTasks);
router.post('/:id/tasks', ctrl.createTask);
router.put('/:id/tasks/:taskId', ctrl.updateTask);
router.delete('/:id/tasks/:taskId', ctrl.deleteTask);

module.exports = router;
