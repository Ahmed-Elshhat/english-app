const { check, body, param } = require("express-validator");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
const { validateExactFields } = require("../validateFields");
const Employee = require("../../models/employeeModel");

exports.getUsersValidator = [
  validateExactFields([], [], ["page", "limit", "keyword", "name", "email", "sort", "_id"]),
  validatorMiddleware,
];

exports.getUserValidator = [
  validateExactFields([], ["id"]),
  param("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  validateExactFields([
    "name",
    "email",
    "password",
    "confirmPassword",
    "points",
    "role",
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
  body("points")
    .optional()
    .isInt({ min: 0 })
    .withMessage("points must be an integer greater than or equal to 0"),
  body("role")
    .isString()
    .withMessage("Role must be a string")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'")
    .custom((val, { req }) => {
      if (val === "admin" && req.body.points != null)
        throw new Error("not allowed add pints for admin role");

      return true;
    }),
  validatorMiddleware,
];

exports.updateUserValidator = [
  validateExactFields(["name", "points"], ["id"]),
  check("id").isMongoId().withMessage("Invalid user id format"),
  body("name")
    .optional()
    .isLength({ min: 4 })
    .withMessage("Too short User name, Must be longer than 4 characters"),
  body("points")
    .optional()
    .isInt({ min: 0 })
    .withMessage("points must be an integer greater than or equal to 0"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  validateExactFields([], ["id"], []),
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  validateExactFields(["currentPassword", "passwordConfirm", "password"]),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const currentUser = req.user;
      let user = null;
      if (["user", "admin"].includes(currentUser.role)) {
        user = await User.findById(req.user.id);
      } else if (currentUser.role === "employee") {
        user = await Employee.findById(req.user.id);
      }
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),
  validatorMiddleware,
];

exports.sendChangeEmailVerifyCodeValidator = [
  validateExactFields(["email"]),
  check("email")
    .notEmpty()
    .withMessage("Email required")
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

  validatorMiddleware,
];

exports.verifyChangeEmailCodeValidator = [
  validateExactFields(["resetCode"]),
  check("resetCode")
    .notEmpty()
    .withMessage("reset code required")
    .matches(/^\d{6}$/)
    .withMessage("reset code must be exactly 6 digits"),
  validatorMiddleware,
];
