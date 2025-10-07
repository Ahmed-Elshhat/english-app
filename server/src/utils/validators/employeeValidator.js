const { check, body, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
const { validateExactFields } = require("../validateFields");
const Employee = require("../../models/employeeModel");

exports.getEmployeesValidator = [
  validateExactFields(
    [],
    [],
    ["page", "limit", "keyword", "name", "email", "sort", "_id"]
  ),
  validatorMiddleware,
];

exports.getEmployeeValidator = [
  validateExactFields([], ["id"]),
  param("id").isMongoId().withMessage("Invalid employee id format"),
  validatorMiddleware,
];

exports.createEmployeeValidator = [
  validateExactFields([
    "name",
    "email",
    "password",
    "confirmPassword",
    "startShift",
    "endShift",
  ]),
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 4 })
    .withMessage("Name must be at least 4 characters long"),
  body("email")
    .notEmpty()
    .withMessage("ُEmail is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val, { req }) => {
      let user = await User.findOne({ email: val });
      if (!user) {
        user = await Employee.findOne({ email: val });
      }

      if (user) {
        throw new Error("E-mail already in user");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("Too short password, Must be longer than 6 characters")
    .custom((val, { req }) => {
      if (val !== req.body.confirmPassword) {
        throw new Error("Confirm password does not match");
      }
      return true;
    }),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation required"),
  body("startShift")
    .notEmpty()
    .withMessage("Start shift is required")
    .isString()
    .withMessage("Start shift must be a string"),

  body("endShift")
    .notEmpty()
    .withMessage("End shift is required")
    .isString()
    .withMessage("End shift must be a string"),
  validatorMiddleware,
];

exports.updateEmployeeValidator = [
  validateExactFields(["startShift", "endShift"], ["id"]),
  check("id").isMongoId().withMessage("Invalid user id format"),
  body("startShift")
    .optional()
    .isString()
    .withMessage("Start shift must be a string"),

  body("endShift")
    .optional()
    .isString()
    .withMessage("End shift must be a string"),
  validatorMiddleware,
];

exports.deleteEmployeeValidator = [
  validateExactFields([], ["id"], []),
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];
