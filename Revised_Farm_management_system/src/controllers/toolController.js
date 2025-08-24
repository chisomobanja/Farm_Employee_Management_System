// ================================
// 11. src/controllers/toolController.js
// ================================
const pool = require('../config/database');
const { handleError } = require('../middleware/errorHandler');

const getAllTools = async (req, res) => {
  try {
    let query = `
      SELECT t.*, d.name as department_name 
      FROM tools t 
      LEFT JOIN departments d ON t.department_id = d.id
    `;
    let params = [];
    
    if (req.departmentFilter.department_id) {
      query += ' WHERE t.department_id = $1';
      params.push(req.departmentFilter.department_id);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Failed to fetch tools');
  }
};

const createTool = async (req, res) => {
  try {
    const { name, type, description, serial_number, purchase_date, department_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tool name is required' });
    }
    
    // Check department access
    if (req.user.role === 'supervisor' && department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Cannot create tool in different department' });
    }
    
    const result = await pool.query(
      'INSERT INTO tools (name, type, description, serial_number, purchase_date, department_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, type, description, serial_number, purchase_date, department_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleError(res, error, 'Failed to create tool');
  }
};

module.exports = { getAllTools, createTool };