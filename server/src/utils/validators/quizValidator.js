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

exports.updateQuizValidator = [
  validateExactFields(
    [
      "title",
      "description",
      "videoImage",
      "video",
      "playlistId",
      "seasonNumber",
      "episodeId",
      "videoNumber",
      "flashCards",
      "quizzes",
      "flashCardsImages",
      "quizzesImages",
      "subtitleEn",
      "subtitleAr",
      "deleteFlashCards",
      "deleteQuizzes",
    ],
    ["id"],
    []
  ),
  body("title")
    .optional()
    .isString()
    .withMessage("Quiz title must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Quiz title must be between 3 and 70 characters"),

  body("quizNumber")
    .optional()
    .isNumeric()
    .withMessage("Quiz number must be a number"),

  check("image").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("The quiz image is required");
    }
    return true;
  }),
  // ✅ Questions validation
  body("questions")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Each quiz must have at least one question"),

  body("quizzes.*.questions.*.questionEn")
    .notEmpty()
    .withMessage("English question text is required")
    .isString()
    .withMessage("English question must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("English question must be between 3 and 70 characters"),

  body("quizzes.*.questions.*.questionAr")
    .notEmpty()
    .withMessage("Arabic question text is required")
    .isString()
    .withMessage("Arabic question must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Arabic question must be between 3 and 70 characters"),

  body("quizzes.*.questions.*.word")
    .notEmpty()
    .withMessage("Question word is required")
    .isString()
    .withMessage("Question word must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Question word must be between 2 and 20 characters"),

  body("quizzes.*.questions.*.rightAnswer")
    .notEmpty()
    .withMessage("Right answer is required")
    .isString()
    .withMessage("Right answer must be a string")
    .isLength({ min: 1, max: 1 })
    .withMessage("Right answer must be exactly 1 character"),

  // ✅ Answers validation
  body("quizzes.*.questions.*.answers")
    .isArray({ min: 1 })
    .withMessage("Each question must have at least one answer"),

  body("quizzes.*.questions.*.answers.*.answerEn")
    .notEmpty()
    .withMessage("English answer is required")
    .isString()
    .withMessage("English answer must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("English answer be between 3 and 100 characters"),

  body("quizzes.*.questions.*.answers.*.answerAr")
    .notEmpty()
    .withMessage("Arabic answer is required")
    .isString()
    .withMessage("Arabic answer must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Arabic answer must be between 3 and 100 characters"),

  body("quizzes.*.questions.*.answers.*.character")
    .notEmpty()
    .withMessage("Answer character is required")
    .isString()
    .isLength({ min: 1, max: 1 })
    .withMessage("Answer character must be exactly 1 character"),
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
