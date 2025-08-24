const pool = require('../config/database');
const { handleError } = require('../middleware/errorHandler');

const getAllEmployees = async (req, res) => {
  try {
    let query = `
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.is_active = true
    `;
    let params = [];
    
    if (req.departmentFilter.department_id) {
      query += ' AND e.department_id = $1';
      params.push(req.departmentFilter.department_id);
    }
    
    query += ' ORDER BY e.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Failed to fetch employees');
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = `
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = $1
    `;
    let params = [id];
    
    if (req.departmentFilter.department_id) {
      query += ' AND e.department_id = $2';
      params.push(req.departmentFilter.department_id);
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found or access denied' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    handleError(res, error, 'Failed to fetch employee');
  }
};

const createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, position, department_id } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }
    
    // Check department access
    if (req.user.role === 'supervisor' && department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Cannot create employee in different department' });
    }
    
    const result = await pool.query(
      'INSERT INTO employees (first_name, last_name, email, phone, position, department_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [first_name, last_name, email, phone, position, department_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    handleError(res, error, 'Failed to create employee');
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let query = 'UPDATE employees SET is_active = false WHERE id = $1';
    let params = [id];
    
    if (req.departmentFilter.department_id) {
      query += ' AND department_id = $2';
      params.push(req.departmentFilter.department_id);
    }
    
    query += ' RETURNING *';
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found or access denied' });
    }
    
    res.json({ message: 'Employee deleted successfully', employee: result.rows[0] });
  } catch (error) {
    handleError(res, error, 'Failed to delete employee');
  }
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, deleteEmployee };