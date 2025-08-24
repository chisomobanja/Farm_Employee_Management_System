const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } = require('../config/auth');
const { handleError } = require('../middleware/errorHandler');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Get user with department info
    const result = await pool.query(`
      SELECT u.*, d.name as department_name 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.username = $1 AND u.is_active = true
    `, [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        department_id: user.department_id 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        department_name: user.department_name
      }
    });
  } catch (error) {
    handleError(res, error, 'Login failed');
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, role, department_id } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, department_id',
      [username, email, password_hash, role, department_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    handleError(res, error, 'Failed to register user');
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.role, u.department_id, u.last_login, u.created_at,
             d.name as department_name
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.id = $1
    `, [req.user.id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    handleError(res, error, 'Failed to fetch profile');
  }
};

const testDatabase = async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Database connection successful', 
      time: result.rows[0].current_time 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
};

module.exports = { login, register, getProfile, testDatabase };