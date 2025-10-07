const express = require("express");

const router = express.Router();

const AuthService = require("../controllers/authController");
const {
  getEmployeesValidator,
  createEmployeeValidator,
  getEmployeeValidator,
  updateEmployeeValidator,
  deleteEmployeeValidator,
} = require("../utils/validators/employeeValidator");
const {
  getEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  createUserValidatorMiddleware,
} = require("../controllers/employeeController");

router.use(AuthService.protect);

router
  .route("")
  .get(AuthService.allowedTo("admin"), getEmployeesValidator, getEmployees)
  .post(
    AuthService.allowedTo("admin"),
    createEmployeeValidator,
    createUserValidatorMiddleware,
    createEmployee
  );

router
  .route("/:id")
  .get(AuthService.allowedTo("admin"), getEmployeeValidator, getEmployee)
  .put(updateEmployeeValidator, createUserValidatorMiddleware, updateEmployee)
  .delete(
    AuthService.allowedTo("admin"),
    deleteEmployeeValidator,
    deleteEmployee
  );

module.exports = router;
