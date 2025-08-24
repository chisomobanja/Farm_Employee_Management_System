
//this is the main entry point of our code
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');
const employeeRoutes = require('./src/routes/employees');
const toolRoutes = require('./src/routes/tools');
const taskRoutes = require('./src/routes/tasks');
const assignmentRoutes = require('./src/routes/assignments');
const dashboardRoutes = require('./src/routes/dashboard');
const userRoutes = require('./src/routes/users');

// Import middleware
const { handleError } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/tasks', taskRoutes);
//app.use('/api', assignmentRoutes); // tool-assignments, task-assignments
//I commented and changed these two so that i could get from the right 
app.use('/api/assignments', assignmentRoutes);
//app.use('/api', dashboardRoutes); // dashboard, reports
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test/db', require('./src/controllers/authController').testDatabase);

// Global error handler
app.use(handleError);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Farm Management System with Authentication');
  console.log('Default login credentials:');
  console.log('Farm Owner: username=farmowner, password=password123');
  console.log('Plantation Supervisor: username=plantation_supervisor, password=password123');
  console.log('Livestock Supervisor: username=livestock_supervisor, password=password123');
  console.log('Poultry Supervisor: username=poultry_supervisor, password=password123');
  console.log('Fishery Supervisor: username=fishery_supervisor, password=password123');
});

module.exports = app;


































// ================================
// 24. Installation and Setup Instructions
// ================================

/*
SETUP INSTRUCTIONS:

1. Create the project structure:
   mkdir farm-management-api
   cd farm-management-api
   mkdir -p src/{config,middleware,routes,controllers,models,utils}

2. Initialize npm and install dependencies:
   npm init -y
   npm install express cors bcrypt jsonwebtoken pg dotenv
   npm install --save-dev nodemon jest supertest

3. Create all the files with their respective content as shown above

4. Create .env file:
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=farm_management
   DB_PASSWORD=your_db_password
   DB_PORT=5432

5. Update package.json scripts:
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }

6. Run the application:
   npm run dev

BENEFITS OF THIS STRUCTURE:

✅ Separation of Concerns: Each file has a specific responsibility
✅ Maintainability: Easy to find and modify specific functionality
✅ Scalability: Easy to add new features without affecting existing code
✅ Testing: Each controller/middleware can be tested independently
✅ Reusability: Utilities and helpers can be used across the application
✅ Security: Authentication and authorization logic is centralized
✅ Error Handling: Consistent error handling across all routes
✅ Code Organization: Logical grouping of related functionality

FOLDER STRUCTURE EXPLANATION:

- config/: Database and authentication configuration
- middleware/: Reusable middleware functions
- routes/: Route definitions and endpoint mappings
- controllers/: Business logic for handling requests
- models/: Database models and queries (if using ORM)
- utils/: Helper functions and utilities
- server.js: Main application entry point

This structure follows Node.js best practices and makes the codebase much more manageable and professional.
*/



