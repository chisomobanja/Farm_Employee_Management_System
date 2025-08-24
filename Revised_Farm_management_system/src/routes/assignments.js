const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireDepartmentAccess } = require('../middleware/departmentAccess');
const { 
  assignTool, 
  getEmployeeTools, 
  returnTool, 
  assignTask, 
  getEmployeeTasks, 
  completeTask 
} = require('../controllers/assignmentController');

router.use(authenticateToken, requireDepartmentAccess);

// Tool assignment routes
router.post('/tool-assignments', assignTool);
router.get('/employees/:id/tools', getEmployeeTools);
router.put('/tool-assignments/:id/return', returnTool);

// Task assignment routes
router.post('/task-assignments', assignTask);
router.get('/employees/:id/tasks', getEmployeeTasks);
router.put('/task-assignments/:id/complete', completeTask);

module.exports = router;