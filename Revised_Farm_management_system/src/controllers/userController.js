const pool = require('../config/database');
const { handleError } = require('../middleware/errorHandler');

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'farm_owner') {
      return res.status(403).json({ error: 'Only farm owner can view all users' });
    }
    
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.role, u.is_active, u.last_login, u.created_at,
             d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Failed to fetch users');
  }
};

const updateUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'farm_owner') {
      return res.status(403).json({ error: 'Only farm owner can modify user status' });
    }
    
    const { id } = req.params;
    const { is_active } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, is_active',
      [is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User status updated', user: result.rows[0] });
  } catch (error) {
    handleError(res, error, 'Failed to update user status');
  }
};

module.exports = { getAllUsers, updateUserStatus };