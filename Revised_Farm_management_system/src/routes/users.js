const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAllUsers, updateUserStatus } = require('../controllers/userController');

router.use(authenticateToken);

router.get('/', getAllUsers);
router.put('/:id/status', updateUserStatus);

module.exports = router;