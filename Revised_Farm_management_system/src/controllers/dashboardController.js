const pool = require('../config/database');
const { handleError } = require('../middleware/errorHandler');

const getDashboard = async (req, res) => {
  try {
    let employeeQuery = 'SELECT COUNT(*) as count FROM employees WHERE is_active = true';
    let toolQuery = 'SELECT COUNT(*) as count FROM tools';
    let taskQuery = 'SELECT COUNT(*) as count FROM tasks WHERE status != $1';
    let assignmentQuery = 'SELECT COUNT(*) as count FROM tool_assignments ta JOIN tools t ON ta.tool_id = t.id WHERE ta.returned_date IS NULL';
    
    let employeeParams = [];
    let toolParams = [];
    let taskParams = ['completed'];
    let assignmentParams = [];
    
    if (req.departmentFilter.department_id) {
      employeeQuery += ' AND department_id = $1';
      toolQuery += ' WHERE department_id = $1';
      taskQuery += ' AND department_id = $2';
      assignmentQuery += ' AND t.department_id = $1';
      
      employeeParams = [req.departmentFilter.department_id];
      toolParams = [req.departmentFilter.department_id];
      taskParams = ['completed', req.departmentFilter.department_id];
      assignmentParams = [req.departmentFilter.department_id];
    }
    
    const [employees, tools, tasks, assignments] = await Promise.all([
      pool.query(employeeQuery, employeeParams),
      pool.query(toolQuery, toolParams),
      pool.query(taskQuery, taskParams),
      pool.query(assignmentQuery, assignmentParams)
    ]);
    
    let dashboardData = {
      total_employees: parseInt(employees.rows[0].count),
      total_tools: parseInt(tools.rows[0].count),
      pending_tasks: parseInt(tasks.rows[0].count),
      active_tool_assignments: parseInt(assignments.rows[0].count)
    };
    
    // If farm owner, add department breakdown
    if (req.user.role === 'farm_owner') {
      const departmentStats = await pool.query(`
        SELECT 
          d.name as department_name,
          COUNT(DISTINCT e.id) as employee_count,
          COUNT(DISTINCT t.id) as tool_count,
          COUNT(DISTINCT tk.id) as task_count
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id AND e.is_active = true
        LEFT JOIN tools t ON d.id = t.department_id
        LEFT JOIN tasks tk ON d.id = tk.department_id AND tk.status != 'completed'
        GROUP BY d.id, d.name
        ORDER BY d.name
      `);
      
      dashboardData.department_breakdown = departmentStats.rows;
    }
    
    res.json(dashboardData);
  } catch (error) {
    handleError(res, error, 'Failed to fetch dashboard data');
  }
};

const getDepartmentReports = async (req, res) => {
  try {
    if (req.user.role !== 'farm_owner') {
      return res.status(403).json({ error: 'Only farm owner can access department reports' });
    }
    
    const departmentReports = await pool.query(`
      SELECT 
        d.id,
        d.name as department_name,
        d.description,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(DISTINCT CASE WHEN e.is_active = true THEN e.id END) as active_employees,
        COUNT(DISTINCT t.id) as total_tools,
        COUNT(DISTINCT CASE WHEN t.status = 'available' THEN t.id END) as available_tools,
        COUNT(DISTINCT CASE WHEN t.status = 'assigned' THEN t.id END) as assigned_tools,
        COUNT(DISTINCT tk.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN tk.status = 'pending' THEN tk.id END) as pending_tasks,
        COUNT(DISTINCT CASE WHEN tk.status = 'completed' THEN tk.id END) as completed_tasks
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      LEFT JOIN tools t ON d.id = t.department_id
      LEFT JOIN tasks tk ON d.id = tk.department_id
      GROUP BY d.id, d.name, d.description
      ORDER BY d.name
    `);
    
    res.json(departmentReports.rows);
  } catch (error) {
    handleError(res, error, 'Failed to fetch department reports');
  }
};

const getDepartments = async (req, res) => {
  try {
    if (req.user.role !== 'farm_owner') {
      return res.status(403).json({ error: 'Only farm owner can view all departments' });
    }
    
    const result = await pool.query('SELECT * FROM departments ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Failed to fetch departments');
  }
};

module.exports = { getDashboard, getDepartmentReports, getDepartments };