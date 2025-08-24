const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireDepartmentAccess } = require('../middleware/departmentAccess');
const { getAllEmployees, getEmployeeById, createEmployee, deleteEmployee } = require('../controllers/employeeController');

// All employee routes require authentication and department access
router.use(authenticateToken, requireDepartmentAccess);

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;