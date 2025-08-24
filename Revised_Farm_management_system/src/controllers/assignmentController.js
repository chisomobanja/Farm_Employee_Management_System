const pool = require('../config/database');
const { handleError } = require('../middleware/errorHandler');

const assignTool = async (req, res) => {
  try {
    const { employee_id, tool_id, notes } = req.body;
    
    if (!employee_id || !tool_id) {
      return res.status(400).json({ error: 'Employee ID and Tool ID are required' });
    }
    
    // Check if tool is available and accessible
    let toolQuery = 'SELECT status FROM tools WHERE id = $1';
    let toolParams = [tool_id];
    
    if (req.departmentFilter.department_id) {
      toolQuery += ' AND department_id = $2';
      toolParams.push(req.departmentFilter.department_id);
    }
    
    const toolCheck = await pool.query(toolQuery, toolParams);
    if (toolCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Tool not found or access denied' });
    }
    
    if (toolCheck.rows[0].status !== 'available') {
      return res.status(400).json({ error: 'Tool is not available for assignment' });
    }
    
    // Check if employee exists and is accessible
    let employeeQuery = 'SELECT is_active FROM employees WHERE id = $1';
    let employeeParams = [employee_id];
    
    if (req.departmentFilter.department_id) {
      employeeQuery += ' AND department_id = $2';
      employeeParams.push(req.departmentFilter.department_id);
    }
    
    const employeeCheck = await pool.query(employeeQuery, employeeParams);
    if (employeeCheck.rows.length === 0 || !employeeCheck.rows[0].is_active) {
      return res.status(404).json({ error: 'Employee not found, inactive, or access denied' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create assignment
      const assignmentResult = await client.query(
        'INSERT INTO tool_assignments (employee_id, tool_id, notes) VALUES ($1, $2, $3) RETURNING *',
        [employee_id, tool_id, notes]
      );
      
      // Update tool status
      await client.query('UPDATE tools SET status = $1 WHERE id = $2', ['assigned', tool_id]);
      
      await client.query('COMMIT');
      res.status(201).json(assignmentResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    handleError(res, error, 'Failed to assign tool');
  }
};

const getEmployeeTools = async (req, res) => {
  try {
    const { id } = req.params;
    let query = `
      SELECT t.*, ta.assigned_date, ta.notes, ta.id as assignment_id
      FROM tools t
      JOIN tool_assignments ta ON t.id = ta.tool_id
      JOIN employees e ON ta.employee_id = e.id
      WHERE ta.employee_id = $1 AND ta.returned_date IS NULL
    `;
    let params = [id];
    
    if (req.departmentFilter.department_id) {
      query += ' AND e.department_id = $2';
      params.push(req.departmentFilter.department_id);
    }
    
    query += ' ORDER BY ta.assigned_date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Failed to fetch assigned tools');
  }
};

const returnTool = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get assignment details with department check
      let assignmentQuery = `
        SELECT ta.tool_id, t.department_id
        FROM tool_assignments ta
        JOIN tools t ON ta.tool_id = t.id
        WHERE ta.id = $1 AND ta.returned_date IS NULL
      `;
      let assignmentParams = [id];
      
      if (req.departmentFilter.department_id) {
        assignmentQuery += ' AND t.department_id = $2';
        assignmentParams.push(req.departmentFilter.department_id);
      }
      
      const assignmentResult = await client.query(assignmentQuery, assignmentParams);
      
      if (assignmentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Assignment not found, already returned, or access denied' });
      }
      
      const toolId = assignmentResult.rows[0].tool_id;
      
      // Update assignment
      await client.query(
        'UPDATE tool_assignments SET returned_date = CURRENT_DATE, notes = $1 WHERE id = $2',
        [notes, id]
      );
      
      // Update tool status
      await client.query('UPDATE tools SET status = $1 WHERE id = $2', ['available', toolId]);
      
      await client.query('COMMIT');
      res.json({ message: 'Tool returned successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    handleError(res, error, 'Failed to return tool');
  }
};

const assignTask = async (req, res) => {
  try {
    const { employee_id, task_id, notes } = req.body;
    
    if (!employee_id || !task_id) {
      return res.status(400).json({ error: 'Employee ID and Task ID are required' });
    }
    
    // Check if employee exists and is accessible
    let employeeQuery = 'SELECT is_active FROM employees WHERE id = $1';
    let employeeParams = [employee_id];
    
    if (req.departmentFilter.department_id) {
      employeeQuery += ' AND department_id = $2';
      employeeParams.push(req.departmentFilter.department_id);
    }
    
    const employeeCheck = await pool.query(employeeQuery, employeeParams);
    if (employeeCheck.rows.length === 0 || !employeeCheck.rows[0].is_active) {
      return res.status(404).json({ error: 'Employee not found, inactive, or access denied' });
    }
    
    // Check if task exists and is accessible
    let taskQuery = 'SELECT id FROM tasks WHERE id = $1';
    let taskParams = [task_id];
    
    if (req.departmentFilter.department_id) {
      taskQuery += ' AND department_id = $2';
      taskParams.push(req.departmentFilter.department_id);
    }
    
    const taskCheck = await pool.query(taskQuery, taskParams);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    
    const result = await pool.query(
      'INSERT INTO task_assignments (employee_id, task_id, notes) VALUES ($1, $2, $3) RETURNING *',
      [employee_id, task_id, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    handleError(res, error, 'Failed to assign task');
  }
};

const getEmployeeTasks = async (req, res) => {
  try {
    const { id } = req.params;
    let query = `
      SELECT t.*, ta.assigned_date, ta.notes, ta.id as assignment_id, ta.completed_date
      FROM tasks t
      JOIN task_assignments ta ON t.id = ta.task_id
      JOIN employees e ON ta.employee_id = e.id
      WHERE ta.employee_id = $1
    `;
    let params = [id];
    
    if (req.departmentFilter.department_id) {
      query += ' AND e.department_id = $2';
      params.push(req.departmentFilter.department_id);
    }
    
    query += ' ORDER BY ta.assigned_date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Failed to fetch assigned tasks');
  }
};

const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    let { notes } = req.body;
    
    // If department filter exists, verify access
    if (req.departmentFilter.department_id) {
      const accessCheck = await pool.query(`
        SELECT ta.id FROM task_assignments ta
        JOIN tasks t ON ta.task_id = t.id
        WHERE ta.id = $1 AND t.department_id = $2
      `, [id, req.departmentFilter.department_id]);
      
      if (accessCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Task assignment not found or access denied' });
      }
    }
    
    const result = await pool.query(
      'UPDATE task_assignments SET completed_date = CURRENT_DATE, notes = $1 WHERE id = $2 RETURNING *',
      [notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task assignment not found' });
    }
    
    res.json({ message: 'Task marked as completed', assignment: result.rows[0] });
  } catch (error) {
    handleError(res, error, 'Failed to complete task');
  }
};

module.exports = { 
  assignTool, 
  getEmployeeTools, 
  returnTool, 
  assignTask, 
  getEmployeeTasks, 
  completeTask 
};