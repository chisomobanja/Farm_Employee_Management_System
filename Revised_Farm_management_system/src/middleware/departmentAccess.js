const requireDepartmentAccess = (req, res, next) => {
  console.log('Department access check for user:', req.user);
  
  const { role, department_id } = req.user;
  
  // Farm owner has access to everything
  if (role === 'farm_owner') {
    req.departmentFilter = {}; // No department filter
    console.log('Farm owner - no department filter applied');
    return next();
  }
  
  // Supervisors only have access to their department
  if (role === 'supervisor' && department_id) {
    req.departmentFilter = { department_id };
    console.log('Supervisor - department filter applied:', req.departmentFilter);
    return next();
  }
  
  console.log('Access denied - insufficient permissions');
  return res.status(403).json({ error: 'Insufficient permissions' });
};

module.exports = { requireDepartmentAccess };
