const { check, body } = require("express-validator");
const mongoose = require("mongoose");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");

exports.getFlashCardsValidator = [
  validateExactFields(
    [],
    [],
    ["page", "limit", "keyword", "sort", "fields", "keyword", "_id"]
  ),
  check("sort")
    .optional()
    .isIn(["-createdAt", "createdAt"])
    .withMessage(
      "The flash card sort must be either '-createdAt' or 'createdAt'"
    ),
  check("_id")
    .optional()
    .isMongoId()
    .withMessage("The provided ID must be a valid ID"),
  validatorMiddleware,
];

exports.getFlashCardValidator = [
  validateExactFields([], ["id"], []),
  check("id").isMongoId().withMessage("Invalid flash card ID format"),
  validatorMiddleware,
];

exports.getRandomFlashCardsValidator = [
  validateExactFields(["excludeIds"], [], ["flashCardsSize"]),

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

  // flashCardsSize validation
  check("videosSize")
    .optional()
    .custom((value) => {
      if (typeof value === "number") return true;

      if (typeof value === "string" && /^\d+$/.test(value)) return true;

      throw new Error(
        "flashCardsSize must be a number or a numeric string without spaces or letters"
      );
    }),
  validatorMiddleware,
];

exports.deleteFlashCardValidator = [
  validateExactFields([], ["id"], []),
  check("id")
    .notEmpty()
    .withMessage("The flash card id is required")
    .isMongoId()
    .withMessage("Invalid flash card ID format"),
  validatorMiddleware,
];
