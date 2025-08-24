// ================================
// 18. src/routes/dashboard.js
// ================================
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireDepartmentAccess } = require('../middleware/departmentAccess');
const { getDashboard, getDepartmentReports, getDepartments } = require('../controllers/dashboardController');

// Apply authentication to all routes
router.use(authenticateToken);

// Dashboard route - the main one
router.get('/', requireDepartmentAccess, getDashboard);

// Other dashboard routes
router.get('/reports/departments', getDepartmentReports);
router.get('/departments', getDepartments);

module.exports = router;