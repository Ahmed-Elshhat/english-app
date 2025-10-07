const { check, body } = require("express-validator");
const mongoose = require("mongoose");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");
const Video = require("../../models/videoModel");

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

exports.updateFlashCardValidator = [
  validateExactFields(
    [
      "title",
      "description",
      "flashCardNumber",
      "image",
      "word",
      "wordType",
      "example",
      "explain",
      "videoId",
    ],
    ["id"],
    []
  ),
  check("id")
    .notEmpty()
    .withMessage("The flash card id is required")
    .isMongoId()
    .withMessage("Invalid flash card ID format"),
  body("title")
    .optional()
    .isString()
    .withMessage("Flash card title must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Flash card title must be between 3 and 70 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Flash card description must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Flash card description must be between 3 and 70 characters"),
  body("flashCardNumber")
    .optional()
    .isNumeric()
    .withMessage("Flash card number must be a number"),
  check("image").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("The flash card image is required");
    }
    return true;
  }),
  body("word")
    .optional()
    .isString()
    .withMessage("Flash card word must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Flash card word must be between 2 and 20 characters"),
  body("wordType")
    .optional()
    .isString()
    .withMessage("Flash card word type must be a string")
    .isLength({ min: 2, max: 40 })
    .withMessage("Flash card word type must be between 2 and 40 characters"),
  body("example")
    .optional()
    .isString()
    .withMessage("Flash card example must be a string")
    .isLength({ min: 5, max: 200 })
    .withMessage("Flash card example must be between 5 and 200 characters"),
  body("explain")
    .optional()
    .isString()
    .withMessage("Flash card explain must be a string")
    .isLength({ min: 5, max: 200 })
    .withMessage("Flash card explain must be between 5 and 200 characters"),
  body("videoId")
    .optional()
    .isMongoId()
    .withMessage("Invalid video ID format")
    .custom(async (value) => {
      const video = await Video.findById(value);
      if (!video) {
        throw new Error(`Not found video with this id: ${value || ""}`);
      }
      return true;
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
