const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireDepartmentAccess } = require('../middleware/departmentAccess');
const { getAllTools, createTool } = require('../controllers/toolController');

router.use(authenticateToken, requireDepartmentAccess);

router.get('/', getAllTools);
router.post('/', createTool);

module.exports = router;
