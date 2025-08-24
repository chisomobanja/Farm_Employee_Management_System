const pool = require('../config/database');
const { handleError } = require('../middleware/errorHandler');

const getAllTasks = async (req, res) => {
  try {
    let query = `
      SELECT t.*, d.name as department_name 
      FROM tasks t 
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
    handleError(res, error, 'Failed to fetch tasks');
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, priority, due_date, department_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    
    // Check department access
    if (req.user.role === 'supervisor' && department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Cannot create task in different department' });
    }
    
    const result = await pool.query(
      'INSERT INTO tasks (title, description, priority, due_date, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, priority, due_date, department_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleError(res, error, 'Failed to create task');
  }
};

module.exports = { getAllTasks, createTask };