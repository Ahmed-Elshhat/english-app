const { check, body } = require("express-validator");
const mongoose = require("mongoose");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");

exports.getQuizzesValidator = [
  validateExactFields(
    [],
    [],
    ["page", "limit", "keyword", "sort", "fields", "keyword", "_id"]
  ),
  check("sort")
    .optional()
    .isIn(["-createdAt", "createdAt"])
    .withMessage("The quiz sort must be either '-createdAt' or 'createdAt'"),
  check("_id")
    .optional()
    .isMongoId()
    .withMessage("The provided ID must be a valid ID"),
  validatorMiddleware,
];

exports.getQuizValidator = [
  validateExactFields([], ["id"], []),
  check("id").isMongoId().withMessage("Invalid quiz ID format"),
  validatorMiddleware,
];

exports.getRandomQuizzesValidator = [
  validateExactFields(["excludeIds"], [], ["quizzesSize"]),

  // excludeIds validation
  check("excludeIds")
    .optional()
    .isArray()
    .withMessage("excludeIds must be an array")
    .bail()
    .custom((arr) => {
      const allValid = arr.every(
        (id) => typeof id === "string" && mongoose.isValidObjectId(id)
      );

      if (!allValid) {
        throw new Error(
          "All excludeIds must be valid MongoDB ObjectId strings"
        );
      }

      return true;
    }),

  // quizzesSize validation
  check("quizzesSize")
    .optional()
    .custom((value) => {
      if (typeof value === "number") return true;

      if (typeof value === "string" && /^\d+$/.test(value)) return true;

      throw new Error(
        "quizzesSize must be a number or a numeric string without spaces or letters"
      );
    }),
  validatorMiddleware,
];

exports.deleteQuizValidator = [
  validateExactFields([], ["id"], []),
  check("id")
    .notEmpty()
    .withMessage("The quiz id is required")
    .isMongoId()
    .withMessage("Invalid quiz ID format"),
  validatorMiddleware,
];
