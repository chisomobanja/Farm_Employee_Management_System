const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireDepartmentAccess } = require('../middleware/departmentAccess');
const { getAllTasks, createTask } = require('../controllers/taskController');

router.use(authenticateToken, requireDepartmentAccess);

router.get('/', getAllTasks);
router.post('/', createTask);

module.exports = router;