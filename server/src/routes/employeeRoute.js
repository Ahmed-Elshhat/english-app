const express = require("express");

const router = express.Router();

// Import authentication service (handles login protection and role-based access)
const AuthService = require("../controllers/authController");

// Import validation middlewares for employee routes
const {
  getEmployeesValidator,
  createEmployeeValidator,
  getEmployeeValidator,
  updateEmployeeValidator,
  deleteEmployeeValidator,
} = require("../utils/validators/employeeValidator");

// Import employee controller functions (business logic for each route)
const {
  getEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  createUserValidatorMiddleware,
} = require("../controllers/employeeController");

// Protect all employee routes and allow access only to users with "admin" role
router.use(AuthService.protect, AuthService.allowedTo("admin"));

// Routes for listing and creating employees
router
  .route("")
  // GET /employees → Get all employees (with validation)
  .get(getEmployeesValidator, getEmployees)
  // POST /employees → Create a new employee (validate input + user creation)
  .post(createEmployeeValidator, createUserValidatorMiddleware, createEmployee);

// Routes for a single employee by ID
router
  .route("/:id")
  // GET /employees/:id → Get a specific employee by ID (with validation)
  .get(getEmployeeValidator, getEmployee)
  // PUT /employees/:id → Update an employee (validate + user data check)
  .put(updateEmployeeValidator, createUserValidatorMiddleware, updateEmployee)
  // DELETE /employees/:id → Delete an employee (with validation)
  .delete(deleteEmployeeValidator, deleteEmployee);

// Export the router to be used in the main app
module.exports = router;
