const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");

exports.getPlansValidator = [
  validateExactFields(
    [],
    [],
    ["page", "limit", "keyword", "sort", "fields", "_id"]
  ),
  check("sort")
    .optional()
    .isIn(["-createdAt", "createdAt"])
    .withMessage("The plan sort must be either '-createdAt' or 'createdAt'"),
  validatorMiddleware,
];

exports.getPlanValidator = [
  validateExactFields([], ["id"], []),
  check("id").isMongoId().withMessage("Invalid plan ID format"),
  validatorMiddleware,
];

exports.updatePlanValidator = [
  validateExactFields(["price", "features"], ["id"], []),
  check("id")
    .notEmpty()
    .withMessage("The plan id is required")
    .isMongoId()
    .withMessage("plan playlist ID format"),
  check("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  check("features")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Features must be an array of strings")
    .bail()
    .custom((arr) => arr.every((item) => typeof item === "string"))
    .withMessage("Each feature must be a string"),
  validatorMiddleware,
];
